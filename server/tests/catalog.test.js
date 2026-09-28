import "dotenv/config";
import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import zlib from "node:zlib";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";
import { generateAccessToken } from "../src/utils/jwt.js";
import cloudinaryService from "../src/services/cloudinary.service.js";

// Helpers to generate valid test images
function createTestPng(width = 1200, height = 1500) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  const ihdrChunk = makeChunk("IHDR", ihdrData);
  const rowLen = 1 + width * 3;
  const rawData = Buffer.alloc(rowLen * height, 0x80);
  for (let y = 0; y < height; y++) rawData[y * rowLen] = 0;
  const idatChunk = makeChunk("IDAT", zlib.deflateSync(rawData));
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createTestJpg(width = 1200, height = 1500) {
  const app0Payload = Buffer.alloc(14, 0);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
    app0Payload,
    Buffer.from([
      0xff, 0xc0,
      0x00, 0x11,
      0x08,
      (height >> 8) & 0xff, height & 0xff,
      (width >> 8) & 0xff, width & 0xff,
      0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
      0xff, 0xd9
    ])
  ]);
}

function createTestWebp(width = 1200, height = 1500) {
  const buf = Buffer.alloc(30);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(22, 4);
  buf.write("WEBP", 8);
  buf.write("VP8X", 12);
  buf.writeUInt32LE(10, 16);
  buf[20] = 0x00;
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

describe("Catalog Backend Tests (Admin & Public)", () => {
  let server;
  let baseUrl;
  let adminToken;
  let customerToken;

  let createdCategoryId;
  let createdCategorySlug;
  let createdSubcategoryId;
  let createdSubcategorySlug;
  let createdProductId;
  let createdProductSlug;

  const adminEmail = "catalog_admin@example.com";
  const customerEmail = "catalog_customer@example.com";

  before(async () => {
    // 1. Clean up any previous test catalog data
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, customerEmail] } },
    });

    // 2. Create Admin and Customer users
    const passwordHash = await bcrypt.hash("Password123!", 10);
    const adminUser = await prisma.user.create({
      data: {
        name: "Catalog Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });

    const customerUser = await prisma.user.create({
      data: {
        name: "Catalog Customer",
        email: customerEmail,
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
      },
    });

    adminToken = generateAccessToken({ userId: adminUser.id, role: adminUser.role });
    customerToken = generateAccessToken({ userId: customerUser.id, role: customerUser.role });

    // 3. Mock Cloudinary upload to simulate successful upload and return folder path
    mock.method(cloudinaryService, "uploadImageStream", async (buffer, folder) => {
      const publicId = `${folder}/test_asset_${Date.now()}`;
      return {
        secureUrl: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`,
        publicId,
      };
    });

    // 4. Start ephemeral test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    // Cleanup
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, customerEmail] } },
    });

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await prisma.$disconnect();
  });

  // ==========================================
  // 1. CATEGORY TESTS
  // ==========================================
  describe("Category Management", () => {
    it("Admin can create a new category (POST /api/admin/categories)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Men's Apparel",
          slug: "mens-apparel",
          imageUrl: "https://example.com/mens.jpg",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.data.category.name, "Men's Apparel");
      assert.equal(body.data.category.slug, "mens-apparel");

      createdCategoryId = body.data.category.id;
      createdCategorySlug = body.data.category.slug;
    });

    it("Rejects duplicate category name or slug (409 Conflict)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Men's Apparel",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 409);
      assert.equal(body.success, false);
    });

    it("CUSTOMER cannot create a category (403 Forbidden)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          name: "Kids",
        }),
      });

      assert.equal(res.status, 403);
    });

    it("Public can list active categories (GET /api/categories)", async () => {
      const res = await fetch(`${baseUrl}/api/categories`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data.categories));
      assert.ok(body.data.categories.some((c) => c.id === createdCategoryId));
    });

    it("Admin can update category (PUT /api/admin/categories/:id)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/categories/${createdCategoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Men's Wear",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.category.name, "Men's Wear");
      createdCategorySlug = body.data.category.slug;
    });
  });

  // ==========================================
  // 2. SUBCATEGORY TESTS
  // ==========================================
  describe("Subcategory Management", () => {
    it("Admin can create a subcategory under a valid category (POST /api/admin/subcategories)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          categoryId: createdCategoryId,
          name: "Shirts",
          slug: "mens-shirts",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.data.subcategory.name, "Shirts");
      assert.equal(body.data.subcategory.categoryId, createdCategoryId);

      createdSubcategoryId = body.data.subcategory.id;
      createdSubcategorySlug = body.data.subcategory.slug;
    });

    it("Rejects duplicate subcategory name in the same category (409 Conflict)", async () => {
      const res = await fetch(`${baseUrl}/api/admin/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          categoryId: createdCategoryId,
          name: "Shirts",
          slug: "different-slug",
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 409);
      assert.equal(body.success, false);
    });

    it("Public can list active subcategories (GET /api/subcategories)", async () => {
      const res = await fetch(`${baseUrl}/api/subcategories?category=${createdCategorySlug}`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(body.data.subcategories.some((s) => s.id === createdSubcategoryId));
    });
  });

  // ==========================================
  // 3. PRODUCT & VARIANT TESTS
  // ==========================================
  describe("Product & Variant Management", () => {
    it("Admin can create a product with multiple variants atomically (POST /api/admin/products)", async () => {
      const productPayload = {
        subcategoryId: createdSubcategoryId,
        name: "Classic Oxford Cotton Shirt",
        slug: "classic-oxford-cotton-shirt",
        description: "Premium cotton shirt with button-down collar.",
        brand: "Wardrobe Hub",
        basePrice: 1499,
        discountPrice: 1199,
        variants: [
          {
            sku: "OXF-WHT-M",
            size: "M",
            color: "White",
            price: 1199,
            stock: 15,
          },
          {
            sku: "OXF-WHT-L",
            size: "L",
            color: "White",
            price: 1199,
            stock: 10,
          },
          {
            sku: "OXF-BLU-M",
            size: "M",
            color: "Navy Blue",
            stock: 8, // Uses product effective price
          },
        ],
      };

      const res = await fetch(`${baseUrl}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(productPayload),
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.equal(body.data.product.name, productPayload.name);
      assert.equal(body.data.product.variants.length, 3);
      assert.equal(body.data.product.effectivePrice, 1199);

      createdProductId = body.data.product.id;
      createdProductSlug = body.data.product.slug;
    });

    it("Rejects product creation with negative variant stock (400 Bad Request)", async () => {
      const invalidPayload = {
        subcategoryId: createdSubcategoryId,
        name: "Negative Stock Shirt",
        basePrice: 999,
        variants: [
          {
            sku: "NEG-STK-01",
            size: "M",
            color: "Black",
            stock: -5,
          },
        ],
      };

      const res = await fetch(`${baseUrl}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(invalidPayload),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
    });

    it("Rejects product creation with duplicate variant (size + color) in payload (400 Bad Request)", async () => {
      const duplicateVariantPayload = {
        subcategoryId: createdSubcategoryId,
        name: "Duplicate Variant Shirt",
        basePrice: 999,
        variants: [
          { sku: "DUP-1", size: "M", color: "Red", stock: 5 },
          { sku: "DUP-2", size: "M", color: "Red", stock: 10 },
        ],
      };

      const res = await fetch(`${baseUrl}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(duplicateVariantPayload),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.ok(body.message.includes("Duplicate variant size/color combination"));
    });

    it("Rejects product creation with duplicate SKU (409 Conflict)", async () => {
      const duplicateSkuPayload = {
        subcategoryId: createdSubcategoryId,
        name: "Duplicate SKU Shirt",
        basePrice: 999,
        variants: [
          { sku: "OXF-WHT-M", size: "XL", color: "Green", stock: 5 }, // OXF-WHT-M already used
        ],
      };

      const res = await fetch(`${baseUrl}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(duplicateSkuPayload),
      });

      const body = await res.json();
      assert.equal(res.status, 409);
      assert.ok(body.message.includes("already exists in the catalog"));
    });

    it("Rejects product when discountPrice > basePrice (400 Bad Request)", async () => {
      const badPricePayload = {
        subcategoryId: createdSubcategoryId,
        name: "Overpriced Discount Shirt",
        basePrice: 500,
        discountPrice: 1000, // Invalid
        variants: [{ sku: "BAD-PRC-1", size: "S", color: "Blue", stock: 5 }],
      };

      const res = await fetch(`${baseUrl}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(badPricePayload),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
    });

    it("Admin can update product details and variants (PUT /api/admin/products/:id)", async () => {
      const updatePayload = {
        description: "Updated description for Oxford shirt.",
        variants: [
          {
            sku: "OXF-BLK-XL",
            size: "XL",
            color: "Black",
            price: 1299,
            stock: 20,
          },
        ],
      };

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.data.product.description, "Updated description for Oxford shirt.");
      assert.equal(body.data.product.variants.length, 4); // 3 original + 1 newly added
    });
  });

  // ==========================================
  // 4. PRODUCT IMAGE MANAGEMENT (FINAL REQUIREMENTS)
  // ==========================================
  describe("Product Image Management (Final Requirements)", () => {
    it("1. Valid JPG under 2 MB uploads successfully (POST /api/admin/products/:productId/images)", async () => {
      const jpgBuf = createTestJpg(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([jpgBuf], { type: "image/jpeg" }), "shirt.jpg");
      form.append("color", "White");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data.image.imageUrl.includes(`wardrobe-hub/products/${createdProductId}`));
      assert.equal(body.data.image.productId, createdProductId);
    });

    it("2. Valid JPEG under 2 MB uploads successfully", async () => {
      const jpegBuf = createTestJpg(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([jpegBuf], { type: "image/jpeg" }), "shirt-side.jpeg");
      form.append("color", "Blue");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data.image.imageUrl.includes(`wardrobe-hub/products/${createdProductId}`));
    });

    it("3. Valid PNG under 2 MB uploads successfully", async () => {
      const pngBuf = createTestPng(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([pngBuf], { type: "image/png" }), "shirt-back.png");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data.image.imageUrl.includes(`wardrobe-hub/products/${createdProductId}`));
    });

    it("4. Valid WebP under 2 MB uploads successfully", async () => {
      const webpBuf = createTestWebp(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([webpBuf], { type: "image/webp" }), "shirt-detail.webp");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 201);
      assert.equal(body.success, true);
      assert.ok(body.data.image.imageUrl.includes(`wardrobe-hub/products/${createdProductId}`));
    });

    it("5. Rejects image larger than 2 MB (400 Bad Request)", async () => {
      // 2.5 MB buffer
      const largeBuf = Buffer.alloc(2.5 * 1024 * 1024, 0);
      const form = new FormData();
      form.append("image", new Blob([largeBuf], { type: "image/jpeg" }), "too-large.jpg");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
      assert.ok(body.message.includes("2 MB"));
    });

    it("6. Rejects unsupported file type (e.g. text/plain or gif) (400 Bad Request)", async () => {
      const fakeText = Buffer.from("this is a text file, not an image");
      const form = new FormData();
      form.append("image", new Blob([fakeText], { type: "text/plain" }), "test.txt");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
      assert.ok(body.message.includes("Unsupported file format"));
    });

    it("7. Rejects invalid aspect ratio (1:1 square instead of ~4:5) (400 Bad Request)", async () => {
      const squarePng = createTestPng(1000, 1000); // 1:1 ratio
      const form = new FormData();
      form.append("image", new Blob([squarePng], { type: "image/png" }), "square.png");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
      assert.ok(body.message.includes("aspect ratio"));
    });

    it("8. Uploads 5th image successfully, then rejects the 6th image (400 Bad Request)", async () => {
      // Upload 5th image (we already successfully uploaded 4 above)
      const fifthPng = createTestPng(1200, 1500);
      const form5 = new FormData();
      form5.append("image", new Blob([fifthPng], { type: "image/png" }), "fifth.png");

      const res5 = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form5,
      });
      assert.equal(res5.status, 201);

      // Attempt to upload 6th image -> must be rejected before Cloudinary upload
      const sixthPng = createTestPng(1200, 1500);
      const form6 = new FormData();
      form6.append("image", new Blob([sixthPng], { type: "image/png" }), "sixth.png");

      const res6 = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form6,
      });

      const body6 = await res6.json();
      assert.equal(res6.status, 400);
      assert.equal(body6.success, false);
      assert.equal(body6.message, "A product can have a maximum of 5 images.");
    });

    it("9. Rejects image upload for non-existent product (404 Not Found)", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const pngBuf = createTestPng(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([pngBuf], { type: "image/png" }), "image.png");

      const res = await fetch(`${baseUrl}/api/admin/products/${nonExistentId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 404);
      assert.equal(body.success, false);
      assert.equal(body.message, "Product not found");
    });

    it("10. Non-admin user cannot upload product images (403 Forbidden)", async () => {
      const pngBuf = createTestPng(1200, 1500);
      const form = new FormData();
      form.append("image", new Blob([pngBuf], { type: "image/png" }), "image.png");

      const res = await fetch(`${baseUrl}/api/admin/products/${createdProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${customerToken}` },
        body: form,
      });

      const body = await res.json();
      assert.equal(res.status, 403);
      assert.equal(body.success, false);
    });
  });

  // ==========================================
  // 5. PUBLIC PRODUCT LISTING, SEARCH, FILTERS & PAGINATION
  // ==========================================
  describe("Public Product Catalog", () => {
    it("Public can get product listing with pagination (GET /api/products)", async () => {
      const res = await fetch(`${baseUrl}/api/products?page=1&limit=10`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(body.data.products));
      assert.equal(body.data.pagination.page, 1);
      assert.equal(body.data.pagination.limit, 10);
      assert.ok(body.data.pagination.total >= 1);
    });

    it("Search works across product name and brand (GET /api/products?search=oxford)", async () => {
      const res = await fetch(`${baseUrl}/api/products?search=oxford`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(body.data.products.some((p) => p.id === createdProductId));
    });

    it("Filter by variant size works (GET /api/products?size=M)", async () => {
      const res = await fetch(`${baseUrl}/api/products?size=M`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(body.data.products.some((p) => p.id === createdProductId));
    });

    it("Filter by non-existent size returns empty array (GET /api/products?size=XXXL)", async () => {
      const res = await fetch(`${baseUrl}/api/products?size=XXXL`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.products.length, 0);
    });

    it("Filter by price range works (GET /api/products?minPrice=1000&maxPrice=1300)", async () => {
      const res = await fetch(`${baseUrl}/api/products?minPrice=1000&maxPrice=1300`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.ok(body.data.products.some((p) => p.id === createdProductId));
    });

    it("Public can fetch product detail by slug (GET /api/products/:slug)", async () => {
      const res = await fetch(`${baseUrl}/api/products/${createdProductSlug}`);
      const body = await res.json();

      assert.equal(res.status, 200);
      assert.equal(body.data.product.slug, createdProductSlug);
      assert.ok(body.data.product.variants.length > 0);
      assert.ok(body.data.product.subcategory.category);
    });

    it("Soft-deleted product is hidden from public listing (DELETE /api/admin/products/:id)", async () => {
      // 1. Admin soft deletes product
      const delRes = await fetch(`${baseUrl}/api/admin/products/${createdProductId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(delRes.status, 200);

      // 2. Public product detail returns 404
      const publicDetailRes = await fetch(`${baseUrl}/api/products/${createdProductSlug}`);
      assert.equal(publicDetailRes.status, 404);

      // 3. Public product list does not contain deactivated product
      const publicListRes = await fetch(`${baseUrl}/api/products`);
      const publicListBody = await publicListRes.json();
      assert.ok(!publicListBody.data.products.some((p) => p.id === createdProductId));
    });
  });
});
