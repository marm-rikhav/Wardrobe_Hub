import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";
import cloudinaryService from "./cloudinary.service.js";
import { validateImageBuffer } from "../utils/imageValidator.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val) => Boolean(val && UUID_REGEX.test(val));

const buildTokenCondition = (token) => {
  const clean = token.replace(/['’]s$/i, "").trim();
  const terms = [token];
  if (clean && clean.toLowerCase() !== token.toLowerCase()) {
    terms.push(clean);
  }

  const orList = [];
  for (const t of terms) {
    orList.push(
      { name: { contains: t, mode: "insensitive" } },
      { brand: { contains: t, mode: "insensitive" } },
      { description: { contains: t, mode: "insensitive" } },
      { subcategory: { name: { contains: t, mode: "insensitive" } } },
      { subcategory: { category: { name: { contains: t, mode: "insensitive" } } } },
      { variants: { some: { color: { contains: t, mode: "insensitive" }, isActive: true } } }
    );
  }
  return { OR: orList };
};

const buildSearchFilter = (search) => {
  const trimmed = search?.trim();
  if (!trimmed) {
    return null;
  }
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }
  return tokens.map((token) => buildTokenCondition(token));
};

/**
 * Helper to compute effective price for a product or variant
 */
export const formatProductPrices = (product) => {
  const base = Number(product.basePrice);
  const discount = product.discountPrice ? Number(product.discountPrice) : null;
  const effectivePrice = discount ?? base;

  const formattedVariants = product.variants
    ? product.variants.map((v) => {
        const variantCustomPrice = v.price ? Number(v.price) : null;
        return {
          ...v,
          price: variantCustomPrice,
          effectivePrice: variantCustomPrice ?? effectivePrice,
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

  if (!subcategory?.isActive || !subcategory?.category?.isActive) {
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
      isActive: v.isActive ?? true,
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
  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 20;
  const skip = (numericPage - 1) * numericLimit;

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

  if (search?.trim()) {
    const adminSearchConditions = buildSearchFilter(search);
    if (adminSearchConditions?.length > 0) {
      where.AND = adminSearchConditions;
    }
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: numericLimit,
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
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit) || 1,
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
 * Validate variant stock value
 */
const validateVariantStock = (v) => {
  if (v.stock !== undefined && v.stock < 0) {
    throw new ApiError(400, `Stock cannot be negative for variant SKU: ${v.sku || v.id}`);
  }
};

/**
 * Validate SKU uniqueness when modifying an existing variant
 */
const validateExistingVariantSku = async (tx, variantId, sku, currentSku) => {
  const normalizedSku = sku ? sku.toUpperCase() : null;
  if (!normalizedSku || normalizedSku === currentSku) {
    return;
  }
  const skuConflict = await tx.productVariant.findFirst({
    where: { id: { not: variantId }, sku: normalizedSku },
  });
  if (skuConflict) {
    throw new ApiError(409, `SKU "${sku}" is already in use by another variant`);
  }
};

/**
 * Update an existing variant within a transaction
 */
const updateExistingVariant = async (tx, productId, v) => {
  const existingVariant = await tx.productVariant.findFirst({
    where: { id: v.id, productId },
  });

  if (!existingVariant) {
    throw new ApiError(404, `Variant with ID "${v.id}" not found on this product`);
  }

  await validateExistingVariantSku(tx, v.id, v.sku, existingVariant.sku);

  await tx.productVariant.update({
    where: { id: v.id },
    data: {
      sku: v.sku ? v.sku.toUpperCase() : undefined,
      size: v.size || undefined,
      color: v.color || undefined,
      price: v.price,
      stock: v.stock,
      isActive: v.isActive,
    },
  });
};

/**
 * Create a new variant for a product within a transaction
 */
const createNewVariant = async (tx, productId, v) => {
  const normalizedSku = v.sku.trim().toUpperCase();
  const skuConflict = await tx.productVariant.findUnique({
    where: { sku: normalizedSku },
  });
  if (skuConflict) {
    throw new ApiError(409, `SKU "${normalizedSku}" is already in use`);
  }

  const pairConflict = await tx.productVariant.findFirst({
    where: {
      productId,
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
      productId,
      sku: normalizedSku,
      size: v.size.trim(),
      color: v.color.trim(),
      price: v.price || null,
      stock: v.stock || 0,
      isActive: v.isActive ?? true,
    },
  });
};

/**
 * Process all variants for a product update
 */
const processVariantsUpdate = async (tx, productId, variants) => {
  if (!Array.isArray(variants)) {
    return;
  }

  for (const v of variants) {
    validateVariantStock(v);
    if (v.id) {
      await updateExistingVariant(tx, productId, v);
    } else {
      await createNewVariant(tx, productId, v);
    }
  }
};

/**
 * Update scalar attributes of a product
 */
const updateProductScalars = async (tx, id, updateData, finalSlug) => {
  return await tx.product.update({
    where: { id },
    data: {
      subcategoryId: updateData.subcategoryId || undefined,
      name: updateData.name || undefined,
      slug: finalSlug,
      description: updateData.description,
      brand: updateData.brand,
      basePrice: updateData.basePrice || undefined,
      discountPrice: updateData.discountPrice,
      isActive: updateData.isActive,
    },
  });
};

/**
 * Fetch updated product with full relation tree
 */
const fetchUpdatedProduct = async (tx, id) => {
  return await tx.product.findUnique({
    where: { id },
    include: {
      subcategory: { include: { category: true } },
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
};

/**
 * Validate subcategory change if requested
 */
const validateSubcategoryChange = async (targetSubcategoryId, currentSubcategoryId) => {
  if (!targetSubcategoryId || targetSubcategoryId === currentSubcategoryId) {
    return;
  }
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: targetSubcategoryId },
    include: { category: true },
  });
  if (!subcategory?.isActive || !subcategory?.category?.isActive) {
    throw new ApiError(404, "Target subcategory not found or is currently inactive");
  }
};

/**
 * Determine final slug for product update
 */
const resolveProductSlug = (existingProduct, updateData) => {
  if (updateData.slug) {
    return slugify(updateData.slug);
  }
  if (updateData.name && updateData.name !== existingProduct.name) {
    return slugify(updateData.name);
  }
  return existingProduct.slug;
};

/**
 * Ensure slug uniqueness when product slug changes
 */
const validateSlugUniqueness = async (productId, newSlug, currentSlug) => {
  if (newSlug === currentSlug) {
    return;
  }
  const slugExists = await prisma.product.findFirst({
    where: { id: { not: productId }, slug: newSlug },
  });
  if (slugExists) {
    throw new ApiError(409, "A product with this slug already exists");
  }
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

  await validateSubcategoryChange(updateData.subcategoryId, existingProduct.subcategoryId);

  const finalSlug = resolveProductSlug(existingProduct, updateData);
  await validateSlugUniqueness(id, finalSlug, existingProduct.slug);

  return await prisma.$transaction(async (tx) => {
    await updateProductScalars(tx, id, updateData, finalSlug);
    await processVariantsUpdate(tx, id, updateData.variants);
    const updated = await fetchUpdatedProduct(tx, id);
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
  if (!isUuid(productId)) {
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
      sortOrder: Number(sortOrder ?? existingImageCount),
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

const SORT_MAPPINGS = {
  price_asc: { basePrice: "asc" },
  price_desc: { basePrice: "desc" },
};

const buildProductOrderBy = (sort) => {
  return SORT_MAPPINGS[sort] || { createdAt: "desc" };
};


const applyCategoryFilter = (where, category) => {
  if (!category) {
    return;
  }
  where.subcategory = {
    ...where.subcategory,
    category: {
      isActive: true,
      ...(isUuid(category) ? { id: category } : { slug: category }),
    },
  };
};

const applySubcategoryFilter = (where, subcategory) => {
  if (!subcategory) {
    return;
  }
  where.subcategory = {
    ...where.subcategory,
    ...(isUuid(subcategory) ? { id: subcategory } : { slug: subcategory }),
  };
};

const applyVariantFilters = (where, size, color) => {
  if (!size && !color) {
    return;
  }
  const variantConditions = { isActive: true };
  if (size) {
    variantConditions.size = { equals: size, mode: "insensitive" };
  }
  if (color) {
    variantConditions.color = { equals: color, mode: "insensitive" };
  }
  where.variants = { some: variantConditions };
};

const buildPriceRange = (minPrice, maxPrice) => {
  if (minPrice === undefined && maxPrice === undefined) {
    return null;
  }
  const priceRange = {};
  if (minPrice !== undefined) {
    priceRange.gte = minPrice;
  }
  if (maxPrice !== undefined) {
    priceRange.lte = maxPrice;
  }
  return priceRange;
};

const buildPriceConditions = (priceRange) => {
  if (!priceRange) {
    return null;
  }
  return [
    { discountPrice: { not: null, ...priceRange } },
    { discountPrice: null, basePrice: priceRange },
    {
      variants: {
        some: {
          isActive: true,
          price: priceRange,
        },
      },
    },
  ];
};

const combineFilters = (where, searchConditions, priceConditions) => {
  const andClauses = [];
  if (searchConditions?.length > 0) {
    andClauses.push(...searchConditions);
  }
  if (priceConditions) {
    andClauses.push({ OR: priceConditions });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }
};

const buildPublicProductsWhere = ({
  search,
  category,
  subcategory,
  size,
  color,
  minPrice,
  maxPrice,
}) => {
  const where = {
    isActive: true,
    subcategory: {
      isActive: true,
      category: {
        isActive: true,
      },
    },
  };

  applyCategoryFilter(where, category);
  applySubcategoryFilter(where, subcategory);
  applyVariantFilters(where, size, color);

  const searchConditions = buildSearchFilter(search);
  const priceRange = buildPriceRange(minPrice, maxPrice);
  const priceConditions = buildPriceConditions(priceRange);
  combineFilters(where, searchConditions, priceConditions);

  return where;
};

const buildPagination = (page, limit, total) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    hasNextPage: pageNum * limitNum < total,
    hasPrevPage: pageNum > 1,
  };
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
  const where = buildPublicProductsWhere({
    search,
    category,
    subcategory,
    size,
    color,
    minPrice,
    maxPrice,
  });
  const orderBy = buildProductOrderBy(sort);

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
    pagination: buildPagination(page, limit, total),
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
