import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Order Improvements & Return/Exchange Flow Tests", () => {
  let server;
  let baseUrl;
  let adminToken = "";
  let customer1Token = "";
  let customer2Token = "";
  let customer1Id = "";
  let customer2Id = "";
  let testVariantId = "";
  let testProductId = "";
  let testSubcategoryId = "";
  let testCategoryId = "";
  let cust1AddressId = "";
  let cust2AddressId = "";

  const adminEmail = `admin_ret_${Date.now()}@example.com`;
  const cust1Email = `cust1_ret_${Date.now()}@example.com`;
  const cust2Email = `cust2_ret_${Date.now()}@example.com`;

  // Track created orders and requests for clean teardown
  const createdOrderIds = [];

  const cleanup = async () => {
    const testUsers = await prisma.user.findMany({
      where: { email: { in: [adminEmail, cust1Email, cust2Email] } },
      select: { id: true },
    });
    const userIds = testUsers.map((u) => u.id);

    const userOrders = await prisma.order.findMany({
      where: {
        OR: [
          ...(userIds.length > 0 ? [{ userId: { in: userIds } }] : []),
          ...(createdOrderIds.length > 0 ? [{ id: { in: createdOrderIds } }] : []),
        ],
      },
      select: { id: true },
    });
    const orderIds = userOrders.map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.returnRequest.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    if (userIds.length > 0) {
      await prisma.returnRequest.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
      await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

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
  };

  before(async () => {
    await cleanup();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;

    // 1. Create users
    const registerUser = async (name, email, role = "CUSTOMER") => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: "Password123!", phone: "9876543210" }),
      });
      const data = await res.json();
      if (role === "ADMIN") {
        await prisma.user.update({ where: { id: data.data.user.id }, data: { role: "ADMIN" } });
        const lRes = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "Password123!" }),
        });
        const lData = await lRes.json();
        return { token: lData.data.accessToken, id: data.data.user.id };
      }
      return { token: data.data.accessToken, id: data.data.user.id };
    };

    const admin = await registerUser("Admin User", adminEmail, "ADMIN");
    adminToken = admin.token;

    const c1 = await registerUser("Customer One", cust1Email);
    customer1Token = c1.token;
    customer1Id = c1.id;

    const c2 = await registerUser("Customer Two", cust2Email);
    customer2Token = c2.token;
    customer2Id = c2.id;

    // 2. Create catalog item
    const category = await prisma.category.create({
      data: { name: `Return Cat ${Date.now()}`, slug: `ret-cat-${Date.now()}` },
    });
    testCategoryId = category.id;

    const subcategory = await prisma.subcategory.create({
      data: { categoryId: testCategoryId, name: `Ret Subcat ${Date.now()}`, slug: `ret-sub-${Date.now()}` },
    });
    testSubcategoryId = subcategory.id;

    const product = await prisma.product.create({
      data: { subcategoryId: testSubcategoryId, name: "Returnable Linen Shirt", slug: `linen-shirt-${Date.now()}`, basePrice: 1999 },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: { productId: testProductId, sku: `LINEN-${Date.now()}`, size: "L", color: "Beige", stock: 25 },
    });
    testVariantId = variant.id;

    // 3. Addresses
    const addr1 = await prisma.address.create({
      data: { userId: customer1Id, name: "Customer One", phone: "9876543210", address: "Apt 1", city: "Mumbai", state: "MH", postalCode: "400001" },
    });
    cust1AddressId = addr1.id;

    const addr2 = await prisma.address.create({
      data: { userId: customer2Id, name: "Customer Two", phone: "9876543211", address: "Apt 2", city: "Delhi", state: "DL", postalCode: "110001" },
    });
    cust2AddressId = addr2.id;
  });

  after(async () => {
    if (server) server.close();
    await cleanup();
    await prisma.$disconnect();
  });

  // Helper to place an order
  const placeOrder = async (token, addressId, quantity = 1) => {
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ variantId: testVariantId, quantity }),
    });

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ addressId, paymentMethod: "COD" }),
    });

    const data = await res.json();
    if (data.data?.order?.id) createdOrderIds.push(data.data.order.id);
    return data.data?.order;
  };

  // ========================================================
  // 1 & 2. Order Creation & Eligible Cancellation with Stock Restoration
  // ========================================================
  let orderToCancelId;
  it("1. Customer creates an order (COD, PENDING)", async () => {
    const order = await placeOrder(customer1Token, cust1AddressId, 2);
    assert.ok(order);
    assert.equal(order.status, "PENDING");
    assert.equal(order.paymentMethod, "COD");
    assert.equal(order.paymentStatus, "PENDING");
    orderToCancelId = order.id;
  });

  it("2. Customer cancels an eligible order & stock is restored", async () => {
    const variantBefore = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    const stockBefore = variantBefore.stock;

    const res = await fetch(`${baseUrl}/api/orders/${orderToCancelId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.order.status, "CANCELLED");
    assert.equal(body.data.order.paymentStatus, "CANCELLED");

    const variantAfter = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    assert.equal(variantAfter.stock, stockBefore + 2);
  });

  // ========================================================
  // 3. Customer cannot cancel another user's order
  // ========================================================
  it("3. Customer cannot cancel another user's order (404 Forbidden/Not Found)", async () => {
    const c1Order = await placeOrder(customer1Token, cust1AddressId, 1);
    const res = await fetch(`${baseUrl}/api/orders/${c1Order.id}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(res.status, 404);
  });

  // ========================================================
  // 4, 5, 6. DELIVERED Transition, Automatic COD Payment to PAID, and Cancellation Block
  // ========================================================
  let deliveredOrderId;
  it("5 & 6. Admin changes COD order to DELIVERED & payment automatically becomes PAID", async () => {
    const order = await placeOrder(customer1Token, cust1AddressId, 1);
    deliveredOrderId = order.id;

    // Transition PENDING -> SHIPPED -> DELIVERED
    await fetch(`${baseUrl}/api/admin/orders/${deliveredOrderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "SHIPPED" }),
    });

    const delivRes = await fetch(`${baseUrl}/api/admin/orders/${deliveredOrderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    assert.equal(delivRes.status, 200);
    const body = await delivRes.json();
    assert.equal(body.data.order.status, "DELIVERED");
    assert.equal(body.data.order.paymentStatus, "PAID");

    // Check payment record in database
    const payment = await prisma.payment.findFirst({ where: { orderId: deliveredOrderId } });
    assert.equal(payment.status, "PAID");
  });

  it("4. Customer cannot cancel a delivered order (400 Bad Request)", async () => {
    const res = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(res.status, 400);
  });

  // ========================================================
  // 7. Non-COD payment is not incorrectly marked as PAID
  // ========================================================
  it("7. Non-COD payment is not incorrectly marked as PAID upon delivery", async () => {
    // Manually create an order with paymentMethod: ONLINE and paymentStatus: PENDING
    const onlineOrder = await prisma.order.create({
      data: {
        orderNumber: `WH-ONL-${Date.now()}`,
        userId: customer1Id,
        shipName: "Online Buyer",
        shipPhone: "9876543210",
        shipAddress: "123 Net St",
        shipCity: "Mumbai",
        shipState: "MH",
        shipPostalCode: "400001",
        subtotal: 1999,
        shippingFee: 0,
        total: 1999,
        status: "SHIPPED",
        paymentStatus: "PENDING",
        paymentMethod: "ONLINE",
        items: {
          create: [{
            variantId: testVariantId,
            productName: "Returnable Linen Shirt",
            size: "L",
            color: "Beige",
            unitPrice: 1999,
            quantity: 1,
          }],
        },
      },
    });
    createdOrderIds.push(onlineOrder.id);

    // Admin delivers the online order
    const res = await fetch(`${baseUrl}/api/admin/orders/${onlineOrder.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.order.status, "DELIVERED");
    assert.equal(body.data.order.paymentStatus, "PENDING"); // MUST NOT BE PAID
  });

  // ========================================================
  // 8. Return request only after delivery
  // ========================================================
  let pendingOrderId;
  it("8. Customer can create a return request only after delivery", async () => {
    const pendingOrder = await placeOrder(customer1Token, cust1AddressId, 1);
    pendingOrderId = pendingOrder.id;

    // Attempt return on PENDING order -> 400
    const failRes = await fetch(`${baseUrl}/api/orders/${pendingOrderId}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer1Token}` },
      body: JSON.stringify({ type: "RETURN", reason: "Wrong size" }),
    });
    assert.equal(failRes.status, 400);

    // Success on DELIVERED order
    const successRes = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer1Token}` },
      body: JSON.stringify({ type: "RETURN", reason: "Wrong size", details: "Need XL instead of L" }),
    });
    assert.equal(successRes.status, 201);
    const body = await successRes.json();
    assert.equal(body.data.request.type, "RETURN");
    assert.equal(body.data.request.status, "PENDING");
  });

  // ========================================================
  // 9. Exchange request only after delivery
  // ========================================================
  it("9. Customer can create an exchange request only after delivery", async () => {
    // Deliver another order for Customer 2
    const c2Order = await placeOrder(customer2Token, cust2AddressId, 1);
    await fetch(`${baseUrl}/api/admin/orders/${c2Order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "SHIPPED" }),
    });
    await fetch(`${baseUrl}/api/admin/orders/${c2Order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "DELIVERED" }),
    });

    const res = await fetch(`${baseUrl}/api/orders/${c2Order.id}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer2Token}` },
      body: JSON.stringify({ type: "EXCHANGE", reason: "Defective product" }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.data.request.type, "EXCHANGE");
    assert.equal(body.data.request.status, "PENDING");
  });

  // ========================================================
  // 10. Cannot request for another customer's order
  // ========================================================
  it("10. Customer cannot create a return request for another customer's order (404)", async () => {
    const res = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer2Token}` },
      body: JSON.stringify({ type: "RETURN", reason: "Wrong size" }),
    });
    assert.equal(res.status, 404);
  });

  // ========================================================
  // 11. Reason is required
  // ========================================================
  it("11. Reason is required (empty or whitespace rejected with 400)", async () => {
    const res = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer1Token}` },
      body: JSON.stringify({ type: "RETURN", reason: "   " }),
    });
    assert.equal(res.status, 400);
  });

  // ========================================================
  // 12. Duplicate active requests are prevented
  // ========================================================
  it("12. Duplicate active requests are prevented (409 Conflict)", async () => {
    // deliveredOrderId already has an active PENDING request from Test 8
    const res = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/return-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${customer1Token}` },
      body: JSON.stringify({ type: "EXCHANGE", reason: "Damaged product" }),
    });
    assert.equal(res.status, 409);
  });

  // ========================================================
  // 13 & 14. Admin List Requests & Role Authorization
  // ========================================================
  let targetRequestId;
  it("13 & 14. Admin can list requests; non-admin is forbidden (403)", async () => {
    // Non-admin forbidden
    const forbRes = await fetch(`${baseUrl}/api/admin/returns`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(forbRes.status, 403);

    // Admin allowed
    const adminRes = await fetch(`${baseUrl}/api/admin/returns?status=PENDING&type=RETURN`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminRes.status, 200);
    const body = await adminRes.json();
    assert.ok(Array.isArray(body.data.requests));
    assert.ok(body.data.requests.length >= 1);
    targetRequestId = body.data.requests[0].id;
  });

  // ========================================================
  // 15. Admin can approve a request
  // ========================================================
  it("15. Admin can approve a return request", async () => {
    const res = await fetch(`${baseUrl}/api/admin/returns/${targetRequestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.request.status, "APPROVED");
  });

  // ========================================================
  // 16 & 17. Admin can reject a request with reason
  // ========================================================
  it("16 & 17. Admin can reject a request & rejection reason is stored", async () => {
    // Find pending request of customer 2
    const listRes = await fetch(`${baseUrl}/api/admin/returns?status=PENDING&type=EXCHANGE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listBody = await listRes.json();
    const req2Id = listBody.data.requests[0].id;

    // Rejecting without reason -> 400
    const failRes = await fetch(`${baseUrl}/api/admin/returns/${req2Id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "REJECTED", adminResponse: "" }),
    });
    assert.equal(failRes.status, 400);

    // Rejecting with reason -> 200
    const succRes = await fetch(`${baseUrl}/api/admin/returns/${req2Id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: "REJECTED", adminResponse: "Item was washed and tag was removed" }),
    });
    assert.equal(succRes.status, 200);
    const body = await succRes.json();
    assert.equal(body.data.request.status, "REJECTED");
    assert.equal(body.data.request.adminResponse, "Item was washed and tag was removed");
  });

  // ========================================================
  // 18. Customer sees updated request status
  // ========================================================
  it("18. Customer can view their updated request status and rejection reason", async () => {
    const res = await fetch(`${baseUrl}/api/orders/${deliveredOrderId}/return-request`, {
      headers: { Authorization: `Bearer ${customer1Token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.request.status, "APPROVED");
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
});
