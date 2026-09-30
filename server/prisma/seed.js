import prisma from "../src/lib/prisma.js";
import { slugify } from "../src/utils/slugify.js";

async function main() {
  console.log("Seeding database...");

  // 1. Categories
  const categoriesData = [
    {
      name: "Men",
      slug: "men",
      imageUrl: null,
      subcategories: ["Shirts", "Jeans", "Wallets", "Watches"],
    },
    {
      name: "Women",
      slug: "women",
      imageUrl: null,
      subcategories: ["Shirts", "Jeans", "Wallets", "Watches"],
    },
    {
      name: "Kids",
      slug: "kids",
      imageUrl: null,
      subcategories: ["Shirts", "Jeans", "Wallets", "Watches"],
    },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl, isActive: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        isActive: true,
      },
    });

    for (const subName of cat.subcategories) {
      const subSlug = slugify(`${cat.slug}-${subName}`);
      await prisma.subcategory.upsert({
        where: { slug: subSlug },
        update: { name: subName, categoryId: category.id, isActive: true },
        create: {
          name: subName,
          slug: subSlug,
          categoryId: category.id,
          isActive: true,
        },
      });
    }
  }

  // 2. Fetch created subcategories to attach products
  const menShirts = await prisma.subcategory.findFirst({ where: { slug: "men-shirts" } });
  const menTshirts = await prisma.subcategory.findFirst({ where: { slug: "men-t-shirts" } });
  const womenDresses = await prisma.subcategory.findFirst({ where: { slug: "women-dresses" } });
  const womenTops = await prisma.subcategory.findFirst({ where: { slug: "women-tops" } });
  const kidsBoys = await prisma.subcategory.findFirst({ where: { slug: "kids-boys-clothing" } });

  const productsData = [
    {
      subcategoryId: menShirts.id,
      name: "Classic Oxford Cotton Shirt",
      slug: "classic-oxford-cotton-shirt",
      description: "Tailored from premium long-staple cotton, this classic Oxford shirt provides effortless breathability and timeless sophistication. Features a structured button-down collar and durable pearl-finish buttons.",
      brand: "Wardrobe Hub Heritage",
      basePrice: 2499,
      discountPrice: 1999,
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", color: "White", sortOrder: 0 },
        { imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80", color: "Navy Blue", sortOrder: 1 },
      ],
      variants: [
        { sku: "OXF-WHT-S", size: "S", color: "White", stock: 12 },
        { sku: "OXF-WHT-M", size: "M", color: "White", stock: 15 },
        { sku: "OXF-WHT-L", size: "L", color: "White", stock: 8 },
        { sku: "OXF-BLU-S", size: "S", color: "Navy Blue", stock: 6 },
        { sku: "OXF-BLU-M", size: "M", color: "Navy Blue", stock: 2 },
        { sku: "OXF-BLU-L", size: "L", color: "Navy Blue", stock: 0 },
      ],
    },
    {
      subcategoryId: menTshirts.id,
      name: "Heavyweight Pima Cotton Tee",
      slug: "heavyweight-pima-cotton-tee",
      description: "A luxurious everyday essential built with 240 GSM organic Pima cotton for a weighty drape and zero transparency. Pre-shrunk for consistent fit wash after wash.",
      brand: "Wardrobe Hub Studio",
      basePrice: 1299,
      discountPrice: 999,
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", color: "Black", sortOrder: 0 },
        { imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80", color: "Beige", sortOrder: 1 },
      ],
      variants: [
        { sku: "PIMA-BLK-M", size: "M", color: "Black", stock: 20 },
        { sku: "PIMA-BLK-L", size: "L", color: "Black", stock: 14 },
        { sku: "PIMA-BEI-M", size: "M", color: "Beige", stock: 10 },
        { sku: "PIMA-BEI-L", size: "L", color: "Beige", stock: 3 },
      ],
    },
    {
      subcategoryId: womenDresses.id,
      name: "Linen Blend Midi Wrap Dress",
      slug: "linen-blend-midi-wrap-dress",
      description: "Artfully designed in an airy linen-viscose blend that drapes elegantly. Adjustable waist tie and subtle V-neckline create a flattering silhouette for both daytime outings and evening gatherings.",
      brand: "Wardrobe Hub Studio",
      basePrice: 3499,
      discountPrice: 2899,
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", color: "Beige", sortOrder: 0 },
        { imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80", color: "Olive Green", sortOrder: 1 },
      ],
      variants: [
        { sku: "DRS-BEI-XS", size: "XS", color: "Beige", stock: 5 },
        { sku: "DRS-BEI-S", size: "S", color: "Beige", stock: 10 },
        { sku: "DRS-BEI-M", size: "M", color: "Beige", stock: 7 },
        { sku: "DRS-OLV-S", size: "S", color: "Olive Green", stock: 8 },
        { sku: "DRS-OLV-M", size: "M", color: "Olive Green", stock: 4 },
      ],
    },
    {
      subcategoryId: womenTops.id,
      name: "Silk-Touch Ribbed Knit Top",
      slug: "silk-touch-ribbed-knit-top",
      description: "A refined crewneck top featuring fine ribbing and an ultra-soft modal blend. Perfect for layering under tailored blazers or styling with high-rise denim.",
      brand: "Wardrobe Hub Atelier",
      basePrice: 1899,
      discountPrice: null,
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", color: "Cream", sortOrder: 0 },
        { imageUrl: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80", color: "Black", sortOrder: 1 },
      ],
      variants: [
        { sku: "RIB-CRM-S", size: "S", color: "Cream", stock: 15 },
        { sku: "RIB-CRM-M", size: "M", color: "Cream", stock: 11 },
        { sku: "RIB-BLK-S", size: "S", color: "Black", stock: 9 },
        { sku: "RIB-BLK-M", size: "M", color: "Black", stock: 1 },
      ],
    },
    {
      subcategoryId: kidsBoys.id,
      name: "Organic Cotton Utility Overshirt",
      slug: "organic-cotton-utility-overshirt",
      description: "Durable and soft 100% organic cotton twill overshirt with patch chest pockets and reinforced elbow patches. Designed for active play and easy care.",
      brand: "Wardrobe Hub Junior",
      basePrice: 1599,
      discountPrice: 1299,
      images: [
        { imageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80", color: "Khaki", sortOrder: 0 },
      ],
      variants: [
        { sku: "KID-KHK-4Y", size: "4Y", color: "Khaki", stock: 7 },
        { sku: "KID-KHK-6Y", size: "6Y", color: "Khaki", stock: 10 },
        { sku: "KID-KHK-8Y", size: "8Y", color: "Khaki", stock: 5 },
      ],
    },
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          subcategoryId: prod.subcategoryId,
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          brand: prod.brand,
          basePrice: prod.basePrice,
          discountPrice: prod.discountPrice,
          isActive: true,
          variants: {
            create: prod.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock,
              isActive: true,
            })),
          },
          images: {
            create: prod.images.map((img) => ({
              imageUrl: img.imageUrl,
              color: img.color,
              sortOrder: img.sortOrder,
            })),
          },
        },
      });
      console.log(`Created product: ${created.name}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
