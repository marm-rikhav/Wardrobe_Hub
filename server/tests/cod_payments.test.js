import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Phase 7: Cash on Delivery (COD) Payments Tests", () => {
  let server;
  let baseUrl;
  let customerToken = "";
  let customerUserId = "";
  let adminToken = "";
  let adminUserId = "";

  let testCategoryId = "";
  let testSubcategoryId = "";
  let testProductId = "";
  let testVariantId = "";
  let testAddressId = "";

  const customerUser = {
    name: "COD Customer",
    email: `cod_cust_${Date.now()}@example.com`,
    password: "Password123!",
    phone: "9876543201",
  };

  const adminUser = {
    name: "COD Admin",
    email: `cod_admin_${Date.now()}@example.com`,
    password: "AdminPassword123!",
    phone: "9876543202",
  };

  const cleanEntities = async () => {
    const users = await prisma.user.findMany({
      where: { email: { in: [customerUser.email, adminUser.email] } },
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
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
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
      body: JSON.stringify(customerUser),
    });
    const bodyCust = await resCust.json();
    customerToken = bodyCust.data.accessToken;
    customerUserId = bodyCust.data.user.id;

    // 2. Register admin and promote in database
    const resAdm = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminUser),
    });
    const bodyAdm = await resAdm.json();
    adminUserId = bodyAdm.data.user.id;

    await prisma.user.update({
      where: { id: adminUserId },
      data: { role: "ADMIN" },
    });

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminUser.email,
        password: adminUser.password,
      }),
    });
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.accessToken;

    // 3. Create catalog product and variant with stock 10
    const category = await prisma.category.create({
      data: {
        name: `COD Category ${Date.now()}`,
        slug: `cod-cat-${Date.now()}`,
      },
    });
    testCategoryId = category.id;

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId: testCategoryId,
        name: `COD Subcategory ${Date.now()}`,
        slug: `cod-subcat-${Date.now()}`,
      },
    });
    testSubcategoryId = subcategory.id;

    const product = await prisma.product.create({
      data: {
        subcategoryId: testSubcategoryId,
        name: "Classic Oxford Cotton Shirt",
        slug: `classic-oxford-cotton-${Date.now()}`,
        brand: "Wardrobe Hub",
        basePrice: 2000.0,
        discountPrice: 1500.0,
      },
    });
    testProductId = product.id;

    const variant = await prisma.productVariant.create({
      data: {
        productId: testProductId,
        sku: `COD-OXFORD-M-${Date.now()}`,
        size: "M",
        color: "Sky Blue",
        stock: 10,
        isActive: true,
      },
    });
    testVariantId = variant.id;

    // 4. Create address for customer
    const address = await prisma.address.create({
      data: {
        userId: customerUserId,
        name: "Rahul Sharma",
        phone: "9876543201",
        address: "123 Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400051",
        country: "India",
        isDefault: true,
      },
    });
    testAddressId = address.id;
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
    await prisma.$disconnect();
  });

  // ========================================================
  // Test 1 — Successful COD order
  // ========================================================
  it("Test 1 — Successful COD order: creates order, COD payment record, pending status, deducts stock, clears cart", async () => {
    // Add 2 items to customer cart (Stock is 10)
    const addRes = await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: testVariantId, quantity: 2 }),
    });
    assert.equal(addRes.status, 200);

    // Place order with Cash on Delivery
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "COD",
      }),
    });

    assert.equal(orderRes.status, 201);
    const body = await orderRes.json();
    assert.equal(body.success, true);
    const order = body.data.order;

    // Verify order fields
    assert.ok(order.id);
    assert.ok(order.orderNumber.startsWith("WH-"));
    assert.equal(order.status, "PENDING");
    assert.equal(order.paymentMethod, "COD");
    assert.equal(order.paymentStatus, "PENDING");
    assert.equal(order.subtotal, 3000); // 1500 * 2
    assert.equal(order.total, 3000);
    assert.equal(order.items.length, 1);
    assert.equal(order.items[0].productName, "Classic Oxford Cotton Shirt");
    assert.equal(order.items[0].unitPrice, 1500);
    assert.equal(order.items[0].quantity, 2);

    // Verify COD payment record in payments table
    const payments = await prisma.payment.findMany({
      where: { orderId: order.id },
    });
    assert.equal(payments.length, 1);
    assert.equal(payments[0].gateway, "COD");
    assert.equal(payments[0].gatewayTxnId, null);
    assert.equal(Number(payments[0].amount), 3000);
    assert.equal(payments[0].status, "PENDING");

    // Verify stock reduced from 10 to 8
    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(updatedVariant.stock, 8);

    // Verify customer cart was cleared
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    assert.equal(cartBody.data.cart.items.length, 0);

    // Customer can view order details
    const getRes = await fetch(`${baseUrl}/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.data.order.paymentMethod, "COD");
    assert.equal(getBody.data.order.paymentStatus, "PENDING");
  });

  // ========================================================
  // Test 2 — Insufficient stock
  // ========================================================
  it("Test 2 — Insufficient stock: rejects order if quantity exceeds stock, leaves stock and cart unchanged", async () => {
    // Current stock is 8. Try adding 15 to cart.
    // Adding to cart validates stock, but let's test if stock reduced after add to cart:
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: testVariantId, quantity: 5 }),
    });

    // Artificially change DB stock to 3 to simulate another buyer claiming stock
    await prisma.productVariant.update({
      where: { id: testVariantId },
      data: { stock: 3 },
    });

    // Customer attempts to checkout 5 units when only 3 exist
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "COD",
      }),
    });

    assert.equal(orderRes.status, 400);
    const orderBody = await orderRes.json();
    assert.match(orderBody.message, /insufficient stock/i);

    // Verify stock remained unchanged at 3
    const variantAfter = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(variantAfter.stock, 3);

    // Cart remains intact
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cartBody = await cartRes.json();
    assert.equal(cartBody.data.cart.items.length, 1);

    // Reset stock to 10 and clear cart
    await prisma.productVariant.update({
      where: { id: testVariantId },
      data: { stock: 10 },
    });
    await fetch(`${baseUrl}/api/cart`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
  });

  // ========================================================
  // Test 3 — Empty cart
  // ========================================================
  it("Test 3 — Empty cart: rejects order creation when cart has no items", async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "COD",
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /empty/i);
  });

  // ========================================================
  // Test 4 — Invalid payment method
  // ========================================================
  it("Test 4 — Invalid payment method: rejects any payment method other than COD", async () => {
    // Add 1 item to cart
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: testVariantId, quantity: 1 }),
    });

    // Test with RAZORPAY
    const resRazorpay = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "RAZORPAY",
      }),
    });
    assert.equal(resRazorpay.status, 400);

    // Test with STRIPE
    const resStripe = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "STRIPE",
      }),
    });
    assert.equal(resStripe.status, 400);

    // Clean cart
    await fetch(`${baseUrl}/api/cart`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${customerToken}` },
    });
  });

  // ========================================================
  // Test 5 — Order cancellation
  // ========================================================
  it("Test 5 — Order cancellation: stock is restored and payment status is updated to CANCELLED", async () => {
    // Stock before = 10
    await prisma.productVariant.update({
      where: { id: testVariantId },
      data: { stock: 10 },
    });

    // Add 2 items to cart
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: testVariantId, quantity: 2 }),
    });

    // Place order
    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "COD",
      }),
    });
    const orderBody = await orderRes.json();
    const createdOrderId = orderBody.data.order.id;

    // Verify stock after order = 8
    const stockAfterOrder = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(stockAfterOrder.stock, 8);

    // Cancel order as customer
    const cancelRes = await fetch(`${baseUrl}/api/orders/${createdOrderId}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });
    assert.equal(cancelRes.status, 200);
    const cancelBody = await cancelRes.json();
    assert.equal(cancelBody.data.order.status, "CANCELLED");
    assert.equal(cancelBody.data.order.paymentStatus, "CANCELLED");

    // Stock must be restored to 10
    const stockAfterCancel = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(stockAfterCancel.stock, 10);

    // Payment record status must be CANCELLED
    const payment = await prisma.payment.findFirst({
      where: { orderId: createdOrderId },
    });
    assert.equal(payment.status, "CANCELLED");
  });

  // ========================================================
  // Test 6 — Duplicate cancellation
  // ========================================================
  it("Test 6 — Duplicate cancellation: second cancellation attempt is rejected and stock remains 10 (not 12)", async () => {
    // Re-query stock before duplicate cancel attempt
    const stockBefore = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(stockBefore.stock, 10);

    // Get the cancelled order from previous test
    const ordersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const ordersBody = await ordersRes.json();
    const cancelledOrder = ordersBody.data.orders.find((o) => o.status === "CANCELLED");
    assert.ok(cancelledOrder);

    // Attempt second cancellation
    const duplicateCancelRes = await fetch(`${baseUrl}/api/orders/${cancelledOrder.id}/cancel`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    assert.equal(duplicateCancelRes.status, 400);
    const body = await duplicateCancelRes.json();
    assert.match(body.message, /already cancelled/i);

    // Stock must remain 10 (it must NOT become 12)
    const stockAfter = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    assert.equal(stockAfter.stock, 10);
  });

  // ========================================================
  // Test 7 — Unauthorized payment update
  // ========================================================
  it("Test 7 — Unauthorized payment update: customer cannot modify payment status (403)", async () => {
    // Create an active COD order
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: testVariantId, quantity: 1 }),
    });

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        addressId: testAddressId,
        paymentMethod: "COD",
      }),
    });
    const orderBody = await orderRes.json();
    const orderId = orderBody.data.order.id;

    // Customer attempts to hit admin payment status endpoint
    const patchRes = await fetch(`${baseUrl}/api/admin/orders/${orderId}/payment-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ paymentStatus: "PAID" }),
    });

    assert.equal(patchRes.status, 403);

    // Verify payment status in DB remains PENDING
    const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
    assert.equal(dbOrder.paymentStatus, "PENDING");
  });

  // ========================================================
  // Test 8 — Admin payment update
  // ========================================================
  it("Test 8 — Admin payment update: authorized admin marks COD order payment as PAID", async () => {
    // Get the pending order from previous test
    const ordersRes = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const ordersBody = await ordersRes.json();
    const pendingOrder = ordersBody.data.orders.find((o) => o.status === "PENDING" && o.paymentStatus === "PENDING");
    assert.ok(pendingOrder);

    // Admin updates payment status to PAID
    const updateRes = await fetch(`${baseUrl}/api/admin/orders/${pendingOrder.id}/payment-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ paymentStatus: "PAID" }),
    });

    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.data.order.paymentMethod, "COD");
    assert.equal(updateBody.data.order.paymentStatus, "PAID");

    // Verify in database
    const dbOrder = await prisma.order.findUnique({
      where: { id: pendingOrder.id },
    });
    assert.equal(dbOrder.paymentStatus, "PAID");

    // Verify payment record in payments table is also PAID
    const dbPayment = await prisma.payment.findFirst({
      where: { orderId: pendingOrder.id },
    });
    assert.equal(dbPayment.status, "PAID");
  });

  // ========================================================
  // Test 9 — Concurrent stock safety
  // ========================================================
  it("Test 9 — Concurrent stock safety: prevents overselling and negative stock under concurrent requests", async () => {
    // Create a new variant with exactly 1 unit of stock
    const limitedVariant = await prisma.productVariant.create({
      data: {
        productId: testProductId,
        sku: `CONCURRENT-1UNIT-${Date.now()}`,
        size: "S",
        color: "Black",
        stock: 1,
        isActive: true,
      },
    });

    // Create user 2 for concurrent order attempt
    const concurrentUser = {
      name: "Concurrent Customer",
      email: `concurrent_${Date.now()}@example.com`,
      password: "Password123!",
      phone: "9876543299",
    };

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(concurrentUser),
    });
    const regBody = await regRes.json();
    const concurrentToken = regBody.data.accessToken;

    const concurrentAddress = await prisma.address.create({
      data: {
        userId: regBody.data.user.id,
        name: "Concurrent Customer",
        phone: "9876543299",
        address: "456 Tech Park",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
        country: "India",
      },
    });

    // Both users add 1 unit to cart
    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ variantId: limitedVariant.id, quantity: 1 }),
    });

    await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${concurrentToken}`,
      },
      body: JSON.stringify({ variantId: limitedVariant.id, quantity: 1 }),
    });

    // Fire both order creation requests concurrently
    const [res1, res2] = await Promise.all([
      fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          addressId: testAddressId,
          paymentMethod: "COD",
        }),
      }),
      fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${concurrentToken}`,
        },
        body: JSON.stringify({
          addressId: concurrentAddress.id,
          paymentMethod: "COD",
        }),
      }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // Exactly one should succeed (201) and one should fail (400)
    assert.deepEqual(statuses, [201, 400]);

    // Check final stock in DB is exactly 0, never negative
    const finalVariant = await prisma.productVariant.findUnique({
      where: { id: limitedVariant.id },
    });
    assert.equal(finalVariant.stock, 0);

    // Cleanup concurrent user and variant
    const ordersWithVariant = await prisma.orderItem.findMany({
      where: { variantId: limitedVariant.id },
      select: { orderId: true },
    });
    const orderIds = ordersWithVariant.map((o) => o.orderId);
    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    await prisma.cartItem.deleteMany({ where: { variantId: limitedVariant.id } });
    await prisma.cartItem.deleteMany({ where: { cart: { userId: regBody.data.user.id } } });
    await prisma.cart.deleteMany({ where: { userId: regBody.data.user.id } });
    await prisma.address.deleteMany({ where: { userId: regBody.data.user.id } });
    await prisma.user.deleteMany({ where: { id: regBody.data.user.id } });
    await prisma.productVariant.delete({ where: { id: limitedVariant.id } });
  });
});
