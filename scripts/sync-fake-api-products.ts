#!/usr/bin/env bun

/**
 * Sync Products from Escuelajs Fake Store API
 * Fetches products and generates Astro content collection markdown files
 */

import * as fs from "fs";
import * as path from "path";

interface APIProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
  };
  images: string[];
  creationAt: string;
  updatedAt: string;
}

interface ContentProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  collections?: string[];
  variants?: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    inStock: boolean;
    options: Record<string, string>;
  }>;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

const API_BASE = "https://api.escuelajs.co/api/v1";
const PRODUCTS_DIR = path.join(process.cwd(), "web/src/content/products");
const CATEGORIES_DIR = path.join(process.cwd(), "web/src/content/categories");

// Ensure directories exist
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Fetch products from API
async function fetchProducts(limit: number = 30): Promise<APIProduct[]> {
  console.log(`📥 Fetching ${limit} products from API...`);
  const response = await fetch(`${API_BASE}/products?limit=${limit}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status} ${response.statusText}`
    );
  }

  const products: APIProduct[] = await response.json();
  console.log(`✅ Fetched ${products.length} products`);
  return products;
}

// Convert API product to content product with variants
function convertProduct(apiProduct: APIProduct): ContentProduct {
  const slug = apiProduct.slug;

  // Create variants based on typical e-commerce patterns
  // For example: color, size combinations
  const variants = generateVariants(apiProduct);

  // Categorize as featured/new based on API data
  const isFeatured = apiProduct.price > 100 || apiProduct.id % 3 === 0;
  const isNew = new Date(apiProduct.creationAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  const contentProduct: ContentProduct = {
    name: apiProduct.title,
    description: apiProduct.description,
    price: apiProduct.price,
    images: apiProduct.images,
    category: apiProduct.category.slug,
    collections: determineCollections(apiProduct, isNew, isFeatured),
    variants: variants,
    inStock: Math.random() > 0.1, // 90% chance in stock
    featured: isFeatured,
    tags: generateTags(apiProduct),
    metadata: {
      apiId: apiProduct.id,
      externalSlug: slug,
      category: apiProduct.category.name,
      fetchedAt: new Date().toISOString(),
    },
  };

  return contentProduct;
}

// Generate product variants (color, size combinations)
function generateVariants(product: APIProduct): ContentProduct["variants"] {
  const colors = ["Black", "White", "Navy", "Gray"];
  const sizes = ["XS", "S", "M", "L", "XL"];

  // For certain product types, generate realistic variants
  const isClothing =
    product.category.slug === "pacha" ||
    product.title.toLowerCase().includes("shirt") ||
    product.title.toLowerCase().includes("joggers") ||
    product.title.toLowerCase().includes("shorts") ||
    product.title.toLowerCase().includes("cap");

  if (!isClothing) {
    // For non-clothing items, create 2-3 variants (e.g., storage, color options)
    return [
      {
        id: `${product.slug}-default`,
        name: "Default",
        sku: `SKU-${product.id}-001`,
        price: product.price,
        inStock: true,
        options: { color: "Standard" },
      },
      {
        id: `${product.slug}-premium`,
        name: "Premium Edition",
        sku: `SKU-${product.id}-002`,
        price: Math.round(product.price * 1.2),
        inStock: true,
        options: { color: "Premium" },
      },
    ];
  }

  // For clothing, generate color/size combinations (subset)
  const variants = [];
  const selectedColors = colors.slice(0, 2);
  const selectedSizes = sizes.slice(1, 3); // S, M

  for (const color of selectedColors) {
    for (const size of selectedSizes) {
      variants.push({
        id: `${product.slug}-${color.toLowerCase()}-${size.toLowerCase()}`,
        name: `${color} - Size ${size}`,
        sku: `SKU-${product.id}-${color}-${size}`,
        price: product.price,
        inStock: Math.random() > 0.15, // 85% chance in stock
        options: { color, size },
      });
    }
  }

  return variants;
}

// Determine which collections a product belongs to
function determineCollections(
  product: APIProduct,
  isNew: boolean,
  isFeatured: boolean
): string[] {
  const collections: string[] = [];

  if (isNew) collections.push("new-arrivals");
  if (isFeatured && product.price > 50) collections.push("bestsellers");
  if (product.price < 50) collections.push("sale");

  return collections.length > 0 ? collections : ["featured"];
}

// Generate relevant tags
function generateTags(product: APIProduct): string[] {
  const tags = new Set<string>();

  // Add category as tag
  tags.add(product.category.slug);

  // Add price-based tags
  if (product.price < 50) tags.add("affordable");
  if (product.price > 100) tags.add("premium");

  // Add keyword-based tags from title
  const title = product.title.toLowerCase();
  if (title.includes("classic")) tags.add("classic");
  if (title.includes("comfort")) tags.add("comfort");
  if (title.includes("wireless")) tags.add("wireless");
  if (title.includes("sports") || title.includes("athletic")) tags.add("sports");
  if (title.includes("gaming")) tags.add("gaming");
  if (title.includes("audio")) tags.add("audio");
  if (title.includes("headphones") || title.includes("earbuds")) tags.add("audio");
  if (title.includes("jacket") || title.includes("coat")) tags.add("outerwear");
  if (title.includes("shoes") || title.includes("sneakers")) tags.add("footwear");

  return Array.from(tags);
}

// Escape YAML string values safely
function escapeYamlString(str: string): string {
  // Remove or replace problematic characters
  return str
    .replace(/'/g, "")  // Remove single quotes
    .replace(/"/g, "")  // Remove double quotes
    .replace(/\\/g, ""); // Remove backslashes
}

// Generate markdown frontmatter
function generateFrontmatter(product: ContentProduct): string {
  let frontmatter = "---\n";
  frontmatter += `name: "${escapeYamlString(product.name)}"\n`;
  frontmatter += `description: "${escapeYamlString(product.description.substring(0, 150))}..."\n`;
  frontmatter += `price: ${product.price}\n`;

  frontmatter += "images:\n";
  for (const image of product.images.slice(0, 3)) {
    frontmatter += `  - "${image}"\n`;
  }

  frontmatter += `category: "${product.category}"\n`;

  if (product.collections && product.collections.length > 0) {
    frontmatter += `collections: [${product.collections.map((c) => `"${c}"`).join(", ")}]\n`;
  }

  if (product.variants && product.variants.length > 0) {
    frontmatter += "variants:\n";
    for (const variant of product.variants) {
      frontmatter += `  - id: "${variant.id}"\n`;
      frontmatter += `    name: "${escapeYamlString(variant.name)}"\n`;
      frontmatter += `    sku: "${variant.sku}"\n`;
      frontmatter += `    price: ${variant.price}\n`;
      frontmatter += `    inStock: ${variant.inStock}\n`;
      frontmatter += "    options:\n";
      for (const [key, value] of Object.entries(variant.options)) {
        frontmatter += `      ${key}: "${value}"\n`;
      }
    }
  }

  frontmatter += `inStock: ${product.inStock}\n`;
  frontmatter += `featured: ${product.featured}\n`;

  if (product.tags && product.tags.length > 0) {
    frontmatter += `tags: [${product.tags.map((t) => `"${t}"`).join(", ")}]\n`;
  }

  frontmatter += "metadata:\n";
  for (const [key, value] of Object.entries(product.metadata)) {
    if (typeof value === "string") {
      frontmatter += `  ${key}: "${escapeYamlString(value)}"\n`;
    } else {
      frontmatter += `  ${key}: ${JSON.stringify(value)}\n`;
    }
  }

  frontmatter += "---\n\n";
  return frontmatter;
}

// Generate markdown content body
function generateBody(product: ContentProduct, slug: string): string {
  let body = "";

  body += `## ${product.name}\n\n`;
  body += `${product.description}\n\n`;

  if (product.variants && product.variants.length > 0) {
    body += "### Available Variants\n\n";
    for (const variant of product.variants) {
      body += `- **${variant.name}** (SKU: ${variant.sku})\n`;
      body += `  - Price: $${variant.price}\n`;
      body += `  - Stock: ${variant.inStock ? "In Stock" : "Out of Stock"}\n`;
    }
    body += "\n";
  }

  body += "### Product Details\n\n";
  body += `**Category:** ${product.category}\n\n`;
  body += `**Price:** $${product.price}\n\n`;

  if (product.tags && product.tags.length > 0) {
    body += `**Tags:** ${product.tags.join(", ")}\n\n`;
  }

  body += "### Features\n\n";
  body += `- ${product.name}\n`;
  body += `- Quality crafted product\n`;
  body += `- From Escuelajs Fake Store API\n`;
  body += `- Available in multiple variants\n`;

  return body;
}

// Create product markdown file
async function createProductFile(product: APIProduct): Promise<string> {
  const slug = product.slug.toLowerCase().replace(/\s+/g, "-");
  const filename = `${slug}.md`;
  const filepath = path.join(PRODUCTS_DIR, filename);

  // Skip if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`⏭️  Skipping ${filename} (already exists)`);
    return filename;
  }

  const contentProduct = convertProduct(product);
  const frontmatter = generateFrontmatter(contentProduct);
  const body = generateBody(contentProduct, slug);

  const markdown = frontmatter + body;

  fs.writeFileSync(filepath, markdown, "utf-8");
  console.log(`✨ Created ${filename}`);

  return filename;
}

// Create/update categories collection
async function syncCategories(): Promise<void> {
  console.log("\n📁 Syncing categories...");

  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    console.error("Failed to fetch categories");
    return;
  }

  interface APICategory {
    id: number;
    name: string;
    slug: string;
    image: string;
  }

  const categories: APICategory[] = await response.json();

  for (const category of categories) {
    const categorySlug = category.slug.toLowerCase().replace(/\s+/g, "-");
    const filename = `${categorySlug}.md`;
    const filepath = path.join(CATEGORIES_DIR, filename);

    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      continue;
    }

    const content = `---
name: '${category.name}'
slug: '${categorySlug}'
description: 'Shop our ${category.name} collection with quality products'
image: '${category.image}'
---

## ${category.name}

Explore our curated collection of ${category.name.toLowerCase()} products. Each item is carefully selected for quality and value.
`;

    fs.writeFileSync(filepath, content, "utf-8");
    console.log(`✨ Created category: ${filename}`);
  }
}

// Main function
async function main(): Promise<void> {
  try {
    console.log("🚀 Starting product sync from Escuelajs API...\n");

    ensureDir(PRODUCTS_DIR);
    ensureDir(CATEGORIES_DIR);

    // Fetch and create products
    const products = await fetchProducts(25);
    const createdFiles: string[] = [];

    for (const product of products) {
      const filename = await createProductFile(product);
      createdFiles.push(filename);
    }

    console.log(`\n✅ Created ${createdFiles.length} product files`);

    // Sync categories
    await syncCategories();

    console.log("\n🎉 Product sync complete!");
    console.log(`📂 Products saved to: ${PRODUCTS_DIR}`);
    console.log(`📂 Categories saved to: ${CATEGORIES_DIR}`);
    console.log("\n💡 Next steps:");
    console.log("  1. Run: bun run build (to validate schema)");
    console.log("  2. Visit: http://localhost:4321/shop (to view products)");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
