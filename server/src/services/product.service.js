import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";
import cloudinaryService from "./cloudinary.service.js";
import { validateImageBuffer } from "../utils/imageValidator.js";

/**
 * Helper to compute effective price for a product or variant
 */
export const formatProductPrices = (product) => {
  const base = Number(product.basePrice);
  const discount = product.discountPrice ? Number(product.discountPrice) : null;
  const effectivePrice = discount !== null ? discount : base;

  const formattedVariants = product.variants
    ? product.variants.map((v) => {
        const variantCustomPrice = v.price ? Number(v.price) : null;
        return {
          ...v,
          price: variantCustomPrice,
          effectivePrice: variantCustomPrice !== null ? variantCustomPrice : effectivePrice,
        };
      })
    : [];

  return {
    ...product,
    basePrice: base,
    discountPrice: discount,
    effectivePrice,
    variants: formattedVariants,
  };
};

/**
 * Admin: Create a product with variants inside a transaction
 */
export const createProduct = async ({
  subcategoryId,
  name,
  slug,
  description,
  brand,
  basePrice,
  discountPrice,
  isActive = true,
  variants,
}) => {
  // 1. Check parent subcategory
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    include: { category: true },
  });

  if (!subcategory || !subcategory.isActive || !subcategory.category.isActive) {
    throw new ApiError(404, "Parent subcategory or category not found or is currently inactive");
  }

  // 2. Generate slug
  const finalSlug = slug ? slugify(slug) : slugify(name);
  if (!finalSlug) {
    throw new ApiError(400, "Unable to generate a valid slug for this product");
  }

  // 3. Verify slug uniqueness
  const existingProduct = await prisma.product.findUnique({
    where: { slug: finalSlug },
  });

  if (existingProduct) {
    throw new ApiError(409, "A product with this slug already exists");
  }

  // 4. Validate variants uniqueness within the request
  const skus = new Set();
  const sizeColorPairs = new Set();

  for (const v of variants) {
    if (v.stock < 0) {
      throw new ApiError(400, `Stock cannot be negative for variant SKU: ${v.sku}`);
    }

    const normalizedSku = v.sku.trim().toUpperCase();
    if (skus.has(normalizedSku)) {
      throw new ApiError(400, `Duplicate SKU in request: ${normalizedSku}`);
    }
    skus.add(normalizedSku);

    const pairKey = `${v.size.trim().toLowerCase()}__${v.color.trim().toLowerCase()}`;
    if (sizeColorPairs.has(pairKey)) {
      throw new ApiError(
        400,
        `Duplicate variant size/color combination in request: Size "${v.size}" and Color "${v.color}"`
      );
    }
    sizeColorPairs.add(pairKey);
  }

  // 5. Verify SKUs don't already exist in database
  const duplicateSkuInDb = await prisma.productVariant.findFirst({
    where: { sku: { in: Array.from(skus) } },
  });

  if (duplicateSkuInDb) {
    throw new ApiError(409, `A variant with SKU "${duplicateSkuInDb.sku}" already exists in the catalog`);
  }

  // 6. Execute atomic creation in transaction
  const createdProduct = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        subcategoryId,
        name,
        slug: finalSlug,
        description: description || null,
        brand: brand || null,
        basePrice,
        discountPrice: discountPrice || null,
        isActive,
      },
    });

    const variantData = variants.map((v) => ({
      productId: product.id,
      sku: v.sku.trim().toUpperCase(),
      size: v.size.trim(),
      color: v.color.trim(),
      price: v.price || null,
      stock: v.stock,
      isActive: v.isActive !== undefined ? v.isActive : true,
    }));

    await tx.productVariant.createMany({
      data: variantData,
    });

    return await tx.product.findUnique({
      where: { id: product.id },
      include: {
        subcategory: {
          include: { category: true },
        },
        variants: true,
        images: true,
      },
    });
  });

  return formatProductPrices(createdProduct);
};

/**
 * Admin: List products with pagination and filters
 */
export const getAllProductsAdmin = async ({ page = 1, limit = 20, search, subcategoryId, categoryId, isActive }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (isActive !== undefined) {
    where.isActive = isActive === "true" || isActive === true;
  }

  if (subcategoryId) {
    where.subcategoryId = subcategoryId;
  }

  if (categoryId) {
    where.subcategory = { categoryId };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subcategory: {
          include: { category: true },
        },
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
  ]);

  return {
    products: products.map(formatProductPrices),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Admin: Get product by ID
 */
export const getProductByIdAdmin = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      subcategory: {
        include: { category: true },
      },
      variants: {
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return formatProductPrices(product);
};

/**
 * Admin: Update product details and/or variants atomically
 */
export const updateProduct = async (id, updateData) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  // Validate subcategory if changed
  if (updateData.subcategoryId && updateData.subcategoryId !== existingProduct.subcategoryId) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: updateData.subcategoryId },
      include: { category: true },
    });
    if (!subcategory || !subcategory.isActive || !subcategory.category.isActive) {
      throw new ApiError(404, "Target subcategory not found or is currently inactive");
    }
  }

  // Handle slug change
  let finalSlug = existingProduct.slug;
  if (updateData.slug) {
    finalSlug = slugify(updateData.slug);
  } else if (updateData.name && updateData.name !== existingProduct.name) {
    finalSlug = slugify(updateData.name);
  }

  if (finalSlug !== existingProduct.slug) {
    const slugExists = await prisma.product.findFirst({
      where: { id: { not: id }, slug: finalSlug },
    });
    if (slugExists) {
      throw new ApiError(409, "A product with this slug already exists");
    }
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Update product scalar fields
    await tx.product.update({
      where: { id },
      data: {
        subcategoryId: updateData.subcategoryId || undefined,
        name: updateData.name || undefined,
        slug: finalSlug,
        description: updateData.description !== undefined ? updateData.description : undefined,
        brand: updateData.brand !== undefined ? updateData.brand : undefined,
        basePrice: updateData.basePrice || undefined,
        discountPrice: updateData.discountPrice !== undefined ? updateData.discountPrice : undefined,
        isActive: updateData.isActive !== undefined ? updateData.isActive : undefined,
      },
    });

    // 2. Handle variants if provided
    if (Array.isArray(updateData.variants)) {
      for (const v of updateData.variants) {
        if (v.stock !== undefined && v.stock < 0) {
          throw new ApiError(400, `Stock cannot be negative for variant SKU: ${v.sku || v.id}`);
        }

        if (v.id) {
          // Update existing variant
          const existingVariant = await tx.productVariant.findFirst({
            where: { id: v.id, productId: id },
          });

          if (!existingVariant) {
            throw new ApiError(404, `Variant with ID "${v.id}" not found on this product`);
          }

          // Check SKU uniqueness if changed
          if (v.sku && v.sku.toUpperCase() !== existingVariant.sku) {
            const skuConflict = await tx.productVariant.findFirst({
              where: { id: { not: v.id }, sku: v.sku.toUpperCase() },
            });
            if (skuConflict) {
              throw new ApiError(409, `SKU "${v.sku}" is already in use by another variant`);
            }
          }

          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku ? v.sku.toUpperCase() : undefined,
              size: v.size || undefined,
              color: v.color || undefined,
              price: v.price !== undefined ? v.price : undefined,
              stock: v.stock !== undefined ? v.stock : undefined,
              isActive: v.isActive !== undefined ? v.isActive : undefined,
            },
          });
        } else {
          // Create new variant for this product
          const normalizedSku = v.sku.trim().toUpperCase();
          const skuConflict = await tx.productVariant.findUnique({
            where: { sku: normalizedSku },
          });
          if (skuConflict) {
            throw new ApiError(409, `SKU "${normalizedSku}" is already in use`);
          }

          const pairConflict = await tx.productVariant.findFirst({
            where: {
              productId: id,
              size: v.size.trim(),
              color: v.color.trim(),
            },
          });
          if (pairConflict) {
            throw new ApiError(
              409,
              `Variant with size "${v.size}" and color "${v.color}" already exists for this product`
            );
          }

          await tx.productVariant.create({
            data: {
              productId: id,
              sku: normalizedSku,
              size: v.size.trim(),
              color: v.color.trim(),
              price: v.price || null,
              stock: v.stock || 0,
              isActive: v.isActive !== undefined ? v.isActive : true,
            },
          });
        }
      }
    }

    const updated = await tx.product.findUnique({
      where: { id },
      include: {
        subcategory: { include: { category: true } },
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    return formatProductPrices(updated);
  });
};

/**
 * Admin: Soft delete product (sets isActive to false on product and variants)
 */
export const deleteProduct = async (id) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new ApiError(404, "Product not found");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.productVariant.updateMany({
      where: { productId: id },
      data: { isActive: false },
    });

    return await tx.product.update({
      where: { id },
      data: { isActive: false },
    });
  });
};

/**
 * Admin: Upload image to Cloudinary and link to product
 *
 * Requirements:
 * - Validate product exists
 * - Validate image buffer (max 2 MB, supported format JPG/PNG/WebP, ~4:5 aspect ratio)
 * - Enforce maximum 5 images per product (reject before uploading to Cloudinary)
 * - Cloudinary folder: wardrobe-hub/products/{productId}
 */
export const uploadProductImage = async (productId, fileBuffer, { color, sortOrder } = {}) => {
  // 1. Validate UUID format
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
  if (!isUuid) {
    throw new ApiError(404, "Product not found");
  }

  // 2. Validate product exists in database
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Validate image buffer (format, size, 4:5 aspect ratio) BEFORE Cloudinary or DB
  validateImageBuffer(fileBuffer);

  // 4. Check existing image count: maximum 5 images per product
  const existingImageCount = await prisma.productImage.count({
    where: { productId },
  });

  if (existingImageCount >= 5) {
    throw new ApiError(400, "A product can have a maximum of 5 images.");
  }

  // 5. Upload buffer to Cloudinary in folder wardrobe-hub/products/{productId}
  const folder = `wardrobe-hub/products/${productId}`;
  const uploadResult = await cloudinaryService.uploadImageStream(fileBuffer, folder);

  // 6. Save in PostgreSQL product_images table
  return await prisma.productImage.create({
    data: {
      productId,
      imageUrl: uploadResult.secureUrl,
      color: color || null,
      sortOrder: sortOrder !== undefined && sortOrder !== null ? Number(sortOrder) : existingImageCount,
    },
  });
};

/**
 * Admin: Delete product image
 */
export const deleteProductImage = async (productId, imageId) => {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
  });

  if (!image) {
    throw new ApiError(404, "Product image not found");
  }

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  return { message: "Image deleted successfully" };
};

/**
 * Public: List active products with search, multi-filters, sorting, and pagination
 */
export const getPublicProducts = async ({
  search,
  category,
  subcategory,
  size,
  color,
  minPrice,
  maxPrice,
  sort = "newest",
  page = 1,
  limit = 20,
}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Base requirement: Only active products under active subcategories & categories
  const where = {
    isActive: true,
    subcategory: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
  };

  // 1. Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // 2. Category filter
  if (category) {
    const isCategoryUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
    where.subcategory = {
      ...where.subcategory,
      category: {
        isActive: true,
        ...(isCategoryUuid ? { id: category } : { slug: category }),
      },
    };
  }

  // 3. Subcategory filter
  if (subcategory) {
    const isSubcategoryUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subcategory);
    where.subcategory = {
      ...where.subcategory,
      ...(isSubcategoryUuid ? { id: subcategory } : { slug: subcategory }),
    };
  }

  // 4. Variant filters (size / color)
  const variantConditions = { isActive: true };
  let hasVariantFilter = false;

  if (size) {
    variantConditions.size = { equals: size, mode: "insensitive" };
    hasVariantFilter = true;
  }

  if (color) {
    variantConditions.color = { equals: color, mode: "insensitive" };
    hasVariantFilter = true;
  }

  if (hasVariantFilter) {
    where.variants = {
      some: variantConditions,
    };
  }

  // 5. Price filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange = {};
    if (minPrice !== undefined) priceRange.gte = minPrice;
    if (maxPrice !== undefined) priceRange.lte = maxPrice;

    const priceConditions = [
      // Product has discountPrice in range
      { discountPrice: { not: null, ...priceRange } },
      // Product has no discountPrice, but basePrice in range
      { discountPrice: null, basePrice: priceRange },
      // Product has active variant with custom price in range
      {
        variants: {
          some: {
            isActive: true,
            price: priceRange,
          },
        },
      },
    ];

    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: priceConditions }];
      delete where.OR;
    } else {
      where.OR = priceConditions;
    }
  }

  // 6. Sorting
  let orderBy = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { basePrice: "desc" };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        subcategory: {
          include: { category: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: [{ color: "asc" }, { size: "asc" }],
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  ]);

  return {
    products: products.map(formatProductPrices),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Public: Get active product detail by slug
 */
export const getPublicProductBySlug = async (slug) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      subcategory: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
    },
    include: {
      subcategory: {
        include: { category: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: [{ color: "asc" }, { size: "asc" }],
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found or is no longer available");
  }

  return formatProductPrices(product);
};

export default {
  createProduct,
  getAllProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  getPublicProducts,
  getPublicProductBySlug,
};
