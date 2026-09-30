import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import {
  sendEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
} from "../src/services/email.service.js";

describe("Phase 8: Admin Dashboard, Customers, Security & Email Tests", () => {
  let server;
  let baseUrl;
  let adminToken = "";
  let customerToken = "";

  const adminEmail = "phase8_admin@example.com";
  const customerEmail = "phase8_customer@example.com";

  const cleanup = async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, customerEmail] } },
    });
  };

  before(async () => {
    await cleanup();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;

    const passwordHash = await bcrypt.hash("TestPass123!", 10);

    // Create Admin
    await prisma.user.create({
      data: {
        name: "Phase8 Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    // Create Customer
    await prisma.user.create({
      data: {
        name: "Phase8 Customer",
        email: customerEmail,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    // Login Admin
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "TestPass123!" }),
    });
    const adminBody = await adminLoginRes.json();
    adminToken = adminBody.data.accessToken;

    // Login Customer
    const custLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerEmail, password: "TestPass123!" }),
    });
    const custBody = await custLoginRes.json();
    customerToken = custBody.data.accessToken;
  });

  after(async () => {
    try {
      await cleanup();
    } finally {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    }
  });

  // ==========================================
  // 1. SECURITY HEADERS (Helmet & CORS)
  // ==========================================
  describe("Security Headers", () => {
    it("should include security headers from Helmet", async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      assert.ok(res.headers.get("x-content-type-options"), "Should have X-Content-Type-Options header");
      assert.ok(res.headers.get("cross-origin-resource-policy"), "Should have Cross-Origin-Resource-Policy header");
    });
  });

  // ==========================================
  // 2. ADMIN DASHBOARD STATS
  // ==========================================
  describe("Admin Dashboard Stats", () => {
    it("should reject unauthenticated requests to dashboard stats", async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard/stats`);
      assert.equal(res.status, 401);
    });

    it("should reject customer requests to dashboard stats", async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 403);
    });

    it("should return valid aggregated dashboard metrics for admin", async () => {
      const res = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(typeof body.data.totalOrders === "number");
      assert.ok(typeof body.data.totalRevenue === "number");
      assert.ok(typeof body.data.lowStockCount === "number");
      assert.ok(Array.isArray(body.data.lowStockVariants));
      assert.ok(Array.isArray(body.data.recentOrders));
    });
  });

  // ==========================================
  // 3. ADMIN CUSTOMERS API
  // ==========================================
  describe("Admin Customers API", () => {
    it("should reject unauthenticated requests to customers list", async () => {
      const res = await fetch(`${baseUrl}/api/admin/customers`);
      assert.equal(res.status, 401);
    });

    it("should reject customer requests to customers list", async () => {
      const res = await fetch(`${baseUrl}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 403);
    });

    it("should return customer list with safe fields (no password hash)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.customers));
      assert.ok(body.data.customers.length >= 1);

      const customer = body.data.customers.find((c) => c.email === customerEmail);
      assert.ok(customer, "Created test customer must be in customer list");
      assert.equal(customer.password, undefined);
      assert.equal(customer.passwordHash, undefined);
      assert.equal(customer.role, "CUSTOMER");
      assert.ok(typeof customer.totalOrders === "number");
    });

    it("should filter customers by search query", async () => {
      const res = await fetch(`${baseUrl}/api/admin/customers?search=Phase8`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(body.data.customers.some((c) => c.email === customerEmail));
    });
  });

  // ==========================================
  // 4. EMAIL SERVICE RESILIENCE
  // ==========================================
  describe("Email Service Resilience", () => {
    it("sendEmail should gracefully skip when SMTP is not configured without throwing", async () => {
      const result = await sendEmail({
        to: "recipient@example.com",
        subject: "Test Notification",
        text: "Testing email service resilience",
      });
      assert.ok(result);
      // Either skipped or succeeded depending on env, but must NOT throw
      assert.ok(result.skipped !== undefined || result.success !== undefined);
    });

    it("order email helpers should execute safely without throwing", async () => {
      const mockOrder = {
        orderNumber: "TEST-ORD-01",
        total: 1299,
        shipName: "Jane Doe",
        shipPhone: "9876543210",
        shipAddress: "123 Test St",
        shipCity: "Mumbai",
        shipState: "Maharashtra",
        shipPostalCode: "400001",
        items: [
          { productName: "Test Shirt", size: "M", color: "Blue", quantity: 1, unitPrice: 1299, subtotal: 1299 },
        ],
      };

      const resConfirmed = await sendOrderConfirmedEmail(mockOrder, "customer@example.com");
      assert.ok(resConfirmed);

      const resShipped = await sendOrderShippedEmail(mockOrder, "customer@example.com");
      assert.ok(resShipped);

      const resDelivered = await sendOrderDeliveredEmail(mockOrder, "customer@example.com");
      assert.ok(resDelivered);

      const resCancelled = await sendOrderCancelledEmail(mockOrder, "customer@example.com");
      assert.ok(resCancelled);
    });
  });
});
