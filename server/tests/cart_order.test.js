import "dotenv/config";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Customer Cart & Orders API Tests", () => {
  let server;
  let baseUrl;
  let customerAToken = "";
  let customerBToken = "";
  let customerAId = "";
  let customerBId = "";
  let testCategoryId = "";
  let testSubcategoryId = "";
  let testProductId = "";
  let testVariantId = "";
  let testAddressId = "";

  const userA = {
    name: "Customer Alpha",
    email: "alpha_cart_test@example.com",
    password: "Password123!",
    phone: "9876543210",
  };

  const userB = {
    name: "Customer Beta",
    email: "beta_cart_test@example.com",
    password: "Password123!",
    phone: "9876543211",
  };

  const cleanTestEntities = async () => {
    const users = await prisma.user.findMany({
      where: { email: { in: [userA.email, userB.email] } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      const userOrders = await prisma.order.findMany({
        where: { userId: { in: userIds } },
        select: { id: true },
      });
      const orderIds = userOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        await prisma.returnRequest.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
      await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    if (testProductId) {
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    } else {
      await prisma.productVariant.deleteMany({ where: { sku: { startsWith: "CT-JKT" } } });
      await prisma.product.deleteMany({ where: { slug: { startsWith: "cart-test" } } });
    }

    if (testSubcategoryId) {
      await prisma.subcategory.deleteMany({ where: { id: testSubcategoryId } });
    } else {
      await prisma.subcategory.deleteMany({ where: { slug: { startsWith: "cart-test" } } });
    }

    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    } else {
      await prisma.category.deleteMany({ where: { slug: { startsWith: "cart-test" } } });
    }
  };

  before(async () => {
    // Clean up any existing test entities
    await cleanTestEntities();

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // 1. Register User A
    const resA = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userA),
    });
    const bodyA = await resA.json();
    customerAToken = bodyA.data.accessToken;
    customerAId = bodyA.data.user.id;

    // 2. Register User B
    const resB = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userB),
    });
    const bodyB = await resB.json();
    customerBToken = bodyB.data.accessToken;
    customerBId = bodyB.data.user.id;

    // 3. Create test catalog data
    const category = await prisma.category.create({
      data: {
        name: "Cart Test Category",
        slug: `cart-test-cat-${Date.now()}`,
      },
    });
    testCategoryId = category.id;

    const subcategory = await prisma.subcategory.create({
      data: {
        name: "Cart Test Subcategory",
        slug: `cart-test-subcat-${Date.now()}`,
        categoryId: category.id,
      },
    });
    testSubcategoryId = subcategory.id;

    const product = await prisma.product.create({
      data: {
        name: "Cart Test Linen Shirt",
        slug: `cart-test-linen-shirt-${Date.now()}`,
        basePrice: 1999.0,
        discountPrice: 1499.0,
        subcategoryId: subcategory.id,
        variants: {
          create: [
            {
              sku: `CT-SHIRT-M-NAVY-${Date.now()}`,
              size: "M",
              color: "Navy",
              stock: 5,
              isActive: true,
            },
          ],
        },
      },
      include: { variants: true },
    });
    testProductId = product.id;
    testVariantId = product.variants[0].id;

    // 4. Create Address for User A
    const address = await prisma.address.create({
      data: {
        userId: customerAId,
        name: "Alpha Recipient",
        phone: "9876543210",
        address: "100 Fashion Street, Suite 4B",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
        isDefault: true,
      },
    });
    testAddressId = address.id;
  });

  after(async () => {
    // Clean up orders, cart, addresses, catalog & users
    await cleanTestUsers();

    if (testProductId) {
      await prisma.cartItem.deleteMany({ where: { variantId: testVariantId } });
      await prisma.orderItem.deleteMany({ where: { variantId: testVariantId } });
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    }
    if (testSubcategoryId) {
      await prisma.subcategory.deleteMany({ where: { id: testSubcategoryId } });
    }
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await prisma.$disconnect();
  });

  // ==========================================
  // CART TESTS
  // ==========================================
  describe("Cart Endpoints", () => {
    it("should reject unauthenticated cart access", async () => {
      const res = await fetch(`${baseUrl}/api/cart`);
      assert.equal(res.status, 401);
    });

    it("should return empty cart for new customer", async () => {
      const res = await fetch(`${baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.cart.items.length, 0);
      assert.equal(body.data.cart.totalItems, 0);
      assert.equal(body.data.cart.subtotal, 0);
    });

    it("should add an item to the cart", async () => {
      const res = await fetch(`${baseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          variantId: testVariantId,
          quantity: 2,
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.cart.items.length, 1);
      assert.equal(body.data.cart.items[0].quantity, 2);
      assert.equal(body.data.cart.items[0].price, 1499);
      assert.equal(body.data.cart.items[0].subtotal, 2998);
      assert.equal(body.data.cart.totalItems, 2);
    });

    it("should update quantity if the same variant is added again", async () => {
      const res = await fetch(`${baseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          variantId: testVariantId,
          quantity: 1,
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.cart.items[0].quantity, 3);
      assert.equal(body.data.cart.totalItems, 3);
    });

    it("should reject adding more quantity than available stock", async () => {
      // Stock is 5, currently 3 in cart. Adding 3 more = 6 > 5
      const res = await fetch(`${baseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          variantId: testVariantId,
          quantity: 3,
        }),
      });
      const body = await res.json();
      assert.equal(res.status, 400);
      assert.match(body.message, /exceeds available stock/i);
    });

    it("should update cart item quantity via PATCH", async () => {
      // Get cart to find item ID
      const cartRes = await fetch(`${baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const cartBody = await cartRes.json();
      const itemId = cartBody.data.cart.items[0].id;

      const res = await fetch(`${baseUrl}/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({ quantity: 2 }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.cart.items[0].quantity, 2);
      assert.equal(body.data.cart.totalItems, 2);
    });

    it("should reject updating cart item quantity beyond stock", async () => {
      const cartRes = await fetch(`${baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const cartBody = await cartRes.json();
      const itemId = cartBody.data.cart.items[0].id;

      const res = await fetch(`${baseUrl}/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({ quantity: 10 }),
      });
      assert.equal(res.status, 400);
    });

    it("should reject updating another customer's cart item", async () => {
      const cartRes = await fetch(`${baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const cartBody = await cartRes.json();
      const itemId = cartBody.data.cart.items[0].id;

      // User B tries to update User A's item
      const res = await fetch(`${baseUrl}/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerBToken}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      assert.equal(res.status, 404);
    });
  });

  // ==========================================
  // ORDER TESTS
  // ==========================================
  describe("Order Endpoints & Atomic Transactions", () => {
    it("should reject order creation if customer cart is empty", async () => {
      // User B has empty cart
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerBToken}`,
        },
        body: JSON.stringify({ addressId: testAddressId, paymentMethod: "COD" }),
      });
      const body = await res.json();
      assert.equal(res.status, 400);
      assert.match(body.message, /empty/i);
    });

    it("should reject order creation if address does not belong to customer", async () => {
      // User B tries to order with User A's address
      // First put 1 item in User B cart
      await fetch(`${baseUrl}/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerBToken}`,
        },
        body: JSON.stringify({
          variantId: testVariantId,
          quantity: 1,
        }),
      });

      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerBToken}`,
        },
        body: JSON.stringify({ addressId: testAddressId, paymentMethod: "COD" }), // User A's address
      });
      assert.equal(res.status, 404);

      // Clean User B's cart
      await fetch(`${baseUrl}/api/cart`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${customerBToken}` },
      });
    });

    it("should successfully place order atomically, decrement stock, snapshot data, and clear cart", async () => {
      // User A currently has 2 units in cart. Available stock is 5.
      const initialVariant = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      assert.equal(initialVariant.stock, 5);

      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({ addressId: testAddressId, paymentMethod: "COD" }),
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data.order.id);
      assert.ok(body.data.order.orderNumber.startsWith("WH-"));
      assert.equal(body.data.order.status, "PENDING");
      assert.equal(body.data.order.subtotal, 2998); // 1499 * 2
      assert.equal(body.data.order.shippingAddress.name, "Alpha Recipient");
      assert.equal(body.data.order.items.length, 1);
      assert.equal(body.data.order.items[0].productName, "Cart Test Linen Shirt");
      assert.equal(body.data.order.items[0].unitPrice, 1499);
      assert.equal(body.data.order.items[0].quantity, 2);

      // Verify stock was decremented from 5 to 3
      const updatedVariant = await prisma.productVariant.findUnique({
        where: { id: testVariantId },
      });
      assert.equal(updatedVariant.stock, 3);

      // Verify User A cart was cleared
      const cartRes = await fetch(`${baseUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const cartBody = await cartRes.json();
      assert.equal(cartBody.data.cart.items.length, 0);
      assert.equal(cartBody.data.cart.totalItems, 0);
    });

    it("should fetch customer order history", async () => {
      const res = await fetch(`${baseUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.orders.length, 1);
      assert.equal(body.data.orders[0].items.length, 1);
    });

    it("should fetch customer order detail by ID", async () => {
      const ordersRes = await fetch(`${baseUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const ordersBody = await ordersRes.json();
      const orderId = ordersBody.data.orders[0].id;

      const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.order.id, orderId);
      assert.equal(body.data.order.shippingAddress.city, "Mumbai");
    });

    it("should prevent Customer B from accessing Customer A's order", async () => {
      const ordersRes = await fetch(`${baseUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const ordersBody = await ordersRes.json();
      const orderId = ordersBody.data.orders[0].id;

      const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${customerBToken}` },
      });
      assert.equal(res.status, 404);
    });
  });

  after(async () => {
    try {
      await cleanTestEntities();
    } finally {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    }
  });
});
