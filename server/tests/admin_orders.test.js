import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Admin Orders API Tests", () => {
  let server;
  let baseUrl;
  let adminToken = "";
  let customerToken = "";
  let adminUserId = "";
  let customerUserId = "";
  let testCategoryId = "";
  let testSubcategoryId = "";
  let testProductId = "";
  let testVariantId = "";
  let testAddressId = "";
  let testOrderId = "";

  const adminUserData = {
    name: "Admin Tester",
    email: "admin_orders_test@example.com",
    password: "AdminPassword123!",
    phone: "9876543299",
  };

  const customerUserData = {
    name: "Customer Tester",
    email: "customer_orders_test@example.com",
    password: "CustomerPassword123!",
    phone: "9876543288",
  };

  const cleanEntities = async () => {
    const users = await prisma.user.findMany({
      where: { email: { in: [adminUserData.email, customerUserData.email] } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      const orders = await prisma.order.findMany({
        where: { userId: { in: userIds } },
        select: { id: true },
      });
      const orderIds = orders.map((o) => o.id);

      if (orderIds.length > 0) {
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
      await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  };

  before(async () => {
    await cleanEntities();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // 1. Register customer
    const resCust = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerUserData),
    });
    const bodyCust = await resCust.json();
    customerToken = bodyCust.data.accessToken;
    customerUserId = bodyCust.data.user.id;

    // 2. Register admin and promote in database
    const resAdm = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminUserData),
    });
    const bodyAdm = await resAdm.json();
    adminUserId = bodyAdm.data.user.id;

    // Promote to ADMIN role
    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: "ADMIN" },
    });

    // Login admin to receive access token with role=ADMIN
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminUserData.email,
        password: adminUserData.password,
      }),
    });
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.accessToken;

    // 3. Create test catalog entity
    const category = await prisma.category.create({
      data: {
        name: "Admin Order Category",
        slug: `adm-order-cat-${Date.now()}`,
      },
    });
    testCategoryId = category.id;

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId: testCategoryId,
        name: "Admin Order Subcategory",
        slug: `adm-order-subcat-${Date.now()}`,
      },
    });
    testSubcategoryId = subcategory.id;

    const product = await prisma.product.create({
      data: {
        subcategoryId: testSubcategoryId,
        name: "Admin Order Formal Shirt",
        slug: `adm-order-shirt-${Date.now()}`,
        brand: "Wardrobe Hub",
        basePrice: 2499,
      },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        productId: testProductId,
        sku: `ADM-ORD-${Date.now()}`,
        size: "L",
        color: "White",
        stock: 10,
      },
    });
    testVariantId = variant.id;

    // 4. Create address for customer
    const address = await prisma.address.create({
      data: {
        userId: customerUserId,
        name: "Jane Smith",
        phone: "9876543288",
        address: "456 Fashion Ave, Suite 10",
        city: "Bangalore",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
        isDefault: true,
      },
    });
    testAddressId = address.id;

    // 5. Add to cart & place customer order to start in PENDING state
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        variantId: testVariantId,
        quantity: 2,
      }),
    });

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ addressId: testAddressId, paymentMethod: "COD" }),
    });
    const orderBody = await orderRes.json();
    testOrderId = orderBody.data.order.id;
    assert.ok(testOrderId);
    assert.equal(orderBody.data.order.status, "PENDING");
  });

  after(async () => {
    if (server) {
      server.close();
    }
    await cleanEntities();
    if (testProductId) {
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (testSubcategoryId) {
      await prisma.subcategory.deleteMany({ where: { id: testSubcategoryId } });
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }
  });

  // ========================================================
  // 1. ADMIN AUTHORIZATION TESTS
  // ========================================================
  describe("Admin Authorization", () => {
    it("should reject unauthenticated request to /api/admin/orders (401)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`);
      assert.equal(res.status, 401);
    });

    it("should forbid customer from accessing /api/admin/orders (403)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 403);
    });

    it("should allow admin to access /api/admin/orders (200)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.orders));
    });
  });

  // ========================================================
  // 2. ORDER LIST & STATUS FILTERING TESTS
  // ========================================================
  describe("Order List & Status Filtering", () => {
    it("should fetch all orders with required admin fields", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      const found = body.data.orders.find((o) => o.id === testOrderId);
      assert.ok(found);
      assert.equal(found.status, "PENDING");
      assert.ok(found.orderNumber);
      assert.equal(found.total, 4998); // 2499 * 2
      assert.equal(found.itemCount, 2);
      assert.ok(found.customer);
      assert.equal(found.customer.email, customerUserData.email);
      assert.equal(found.customer.name, customerUserData.name);
    });

    it("should filter orders by status=PENDING", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders?status=PENDING`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      const matches = body.data.orders.filter((o) => o.status !== "PENDING");
      assert.equal(matches.length, 0);
      const found = body.data.orders.find((o) => o.id === testOrderId);
      assert.ok(found);
    });

    it("should filter orders by status=SHIPPED and return none for testOrderId", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders?status=SHIPPED`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      const found = body.data.orders.find((o) => o.id === testOrderId);
      assert.equal(found, undefined);
    });

    it("should reject invalid status filter value with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders?status=UNKNOWN_STATUS`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 400);
    });
  });

  // ========================================================
  // 3. ADMIN ORDER DETAIL TESTS
  // ========================================================
  describe("Admin Order Detail", () => {
    it("should forbid customer from accessing /api/admin/orders/:id (403)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 403);
    });

    it("should reject invalid order ID format with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/not-a-valid-uuid`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 400);
    });

    it("should return 404 for non-existent order UUID", async () => {
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const res = await fetch(`${baseUrl}/api/admin/orders/${fakeUuid}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 404);
    });

    it("should fetch full historical order details and snapshots for admin", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      const order = body.data.order;

      assert.equal(order.id, testOrderId);
      assert.equal(order.status, "PENDING");
      assert.equal(order.customer.name, customerUserData.name);
      assert.equal(order.customer.email, customerUserData.email);
      assert.equal(order.shippingAddress.name, "Jane Smith");
      assert.equal(order.shippingAddress.city, "Bangalore");
      assert.equal(order.shippingAddress.state, "Karnataka");

      // Verify item snapshots
      assert.equal(order.items.length, 1);
      const item = order.items[0];
      assert.equal(item.productName, "Admin Order Formal Shirt");
      assert.equal(item.size, "L");
      assert.equal(item.color, "White");
      assert.equal(item.unitPrice, 2499);
      assert.equal(item.quantity, 2);
      assert.equal(item.subtotal, 4998);
    });
  });

  // ========================================================
  // 4. STATUS TRANSITIONS & STOCK INTEGRITY TESTS
  // ========================================================
  describe("Status Transitions & Stock Integrity", () => {
    it("should forbid customer from updating order status (403)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      assert.equal(res.status, 403);
    });

    it("should reject invalid status string with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "INVALID_STATUS" }),
      });
      assert.equal(res.status, 400);
    });

    it("should reject invalid backward transition (PENDING to DELIVERED) with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "DELIVERED" }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /cannot transition/i);
    });

    it("should allow valid transition PENDING -> SHIPPED without modifying stock", async () => {
      // 1. Record stock before transition
      const variantBefore = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      const stockBefore = variantBefore.stock;

      // 2. Perform status transition
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.order.status, "SHIPPED");

      // 3. Verify in database
      const dbOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
      });
      assert.equal(dbOrder.status, "SHIPPED");

      // 4. Verify stock did NOT change
      const variantAfter = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      assert.equal(variantAfter.stock, stockBefore);
    });

    it("should allow valid transition SHIPPED -> DELIVERED without modifying stock", async () => {
      // 1. Record stock before transition
      const variantBefore = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      const stockBefore = variantBefore.stock;

      // 2. Perform status transition
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "DELIVERED" }),
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.order.status, "DELIVERED");

      // 3. Verify in database
      const dbOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
      });
      assert.equal(dbOrder.status, "DELIVERED");

      // 4. Verify stock did NOT change
      const variantAfter = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      assert.equal(variantAfter.stock, stockBefore);
    });

    it("should reject invalid backward transition (DELIVERED -> SHIPPED) with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.match(body.message, /cannot transition/i);

      // Verify DB remained DELIVERED
      const dbOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
      });
      assert.equal(dbOrder.status, "DELIVERED");
    });

    it("should reject invalid backward transition (DELIVERED -> PENDING) with 400 Bad Request", async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "PENDING" }),
      });
      assert.equal(res.status, 400);
    });
  });
});
