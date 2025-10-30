#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, '../web/src/content/products');

// Categorization mapping - intelligently categorize by product name
const categorizeProduct = (name) => {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('boot') ||
      nameLower.includes('sandal') || nameLower.includes('pump') || nameLower.includes('loafer') ||
      nameLower.includes('cleats') || nameLower.includes('heel')) {
    return 'shoes';
  }

  if (nameLower.includes('laptop') || nameLower.includes('phone') || nameLower.includes('watch') ||
      nameLower.includes('headphone') || nameLower.includes('mouse') || nameLower.includes('toaster') ||
      nameLower.includes('controller') || nameLower.includes('earbud') || nameLower.includes('smartwatch') ||
      nameLower.includes('bicycle')) {
    return 'electronics';
  }

  if (nameLower.includes('table') || nameLower.includes('chair') || nameLower.includes('sofa') ||
      nameLower.includes('couch') || nameLower.includes('armchair') || nameLower.includes('workstation')) {
    return 'furniture';
  }

  // Default to miscellaneous for clothing, accessories, etc
  return 'miscellaneous';
};

// Collection assignment logic
const assignCollections = (name, index, total) => {
  const collections = [];
  const nameLower = name.toLowerCase();

  // First 10 products are new arrivals
  if (index < 10) {
    collections.push('new-arrivals');
  }

  // Products with specific keywords
  if (nameLower.includes('bestseller') || nameLower.includes('popular') || nameLower.includes('classic') ||
      nameLower.includes('elegant') || nameLower.includes('premium')) {
    collections.push('bestsellers');
  }

  // Every 4th-5th product gets sale tag for variety
  if (index % 5 === 2 || index % 5 === 3) {
    collections.push('sale');
  }

  // Ensure we have at least one collection
  if (collections.length === 0) {
    collections.push('bestsellers');
  }

  return collections;
};

// Read all product files
const files = fs.readdirSync(productsDir)
  .filter(f => f.endsWith('.md'));

console.log(`Found ${files.length} product files`);

let updated = 0;
const productSlugs = {};

files.forEach((file, index) => {
  const filePath = path.join(productsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Extract slug from filename (without .md)
  const slug = file.replace('.md', '');

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`⚠️  ${file}: No frontmatter found`);
    return;
  }

  let frontmatter = frontmatterMatch[1];
  const originalFrontmatter = frontmatter;

  // Extract name for categorization
  const nameMatch = frontmatter.match(/^name:\s*"([^"]+)"/m);
  if (!nameMatch) {
    console.log(`⚠️  ${file}: No name found`);
    return;
  }

  const name = nameMatch[1];
  const category = categorizeProduct(name);
  const collections = assignCollections(name, index, files.length);

  // Update category (lowercase)
  frontmatter = frontmatter.replace(/^category:\s*["'].*?["']/m, `category: "${category}"`);
  if (!frontmatter.includes('category:')) {
    // Add category after name
    frontmatter = frontmatter.replace(
      /^(name:\s*"[^"]+"\n)/m,
      `$1category: "${category}"\n`
    );
  }

  // Update collections
  const collectionsYaml = collections
    .map(c => `  - "${c}"`)
    .join('\n');

  frontmatter = frontmatter.replace(
    /^collections:[\s\S]*?(?=\n[a-z]|\n\n|$)/m,
    `collections:\n${collectionsYaml}`
  );
  if (!frontmatter.includes('collections:')) {
    // Add collections after category
    frontmatter = frontmatter.replace(
      /^(category:\s*"[^"]+"\n)/m,
      `$1collections:\n${collectionsYaml}\n`
    );
  }

  // Ensure featured is set
  if (!frontmatter.includes('featured:')) {
    frontmatter = frontmatter.replace(
      /^(collections:[\s\S]*?)\n/m,
      `$1\nfeatured: ${index < 6 ? 'true' : 'false'}\n`
    );
  }

  // Build new content
  const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatter}\n---`);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ ${slug}`);
    console.log(`   Category: ${category}`);
    console.log(`   Collections: ${collections.join(', ')}`);
    updated++;

    productSlugs[slug] = {
      name,
      category,
      collections,
    };
  }
});

console.log(`\n✨ Updated ${updated} products\n`);

// Now update collections files
console.log('Updating collection files...\n');

const collectionsDir = path.join(__dirname, '../web/src/content/collections');

// Get product slugs from the products we found
const allProductSlugs = files.map(f => f.replace('.md', ''));

// Update new-arrivals collection (first 10 products)
const newArrivalsPath = path.join(collectionsDir, 'new-arrivals.md');
if (fs.existsSync(newArrivalsPath)) {
  let content = fs.readFileSync(newArrivalsPath, 'utf-8');
  const newArrivalsProducts = allProductSlugs.slice(0, 10);
  const productsYaml = newArrivalsProducts
    .map(slug => `  - "${slug}"`)
    .join('\n');

  content = content.replace(
    /^products:[\s\S]*?(?=\n\n---|^---)/m,
    `products:\n${productsYaml}`
  );

  fs.writeFileSync(newArrivalsPath, content);
  console.log(`✅ new-arrivals.md: ${newArrivalsProducts.length} products`);
}

// Update bestsellers collection (products with "classic", "elegant", etc + some variety)
const bestsellersPath = path.join(collectionsDir, 'bestsellers.md');
if (fs.existsSync(bestsellersPath)) {
  let content = fs.readFileSync(bestsellersPath, 'utf-8');
  const bestsellersProducts = allProductSlugs.filter((slug, index) => {
    const file = path.join(productsDir, `${slug}.md`);
    const fileContent = fs.readFileSync(file, 'utf-8');
    const nameMatch = fileContent.match(/^name:\s*"([^"]+)"/m);
    if (!nameMatch) return false;
    const name = nameMatch[1].toLowerCase();
    return name.includes('classic') || name.includes('elegant') || name.includes('premium') || index % 4 === 0;
  }).slice(0, 12);

  const productsYaml = bestsellersProducts
    .map(slug => `  - "${slug}"`)
    .join('\n');

  content = content.replace(
    /^products:[\s\S]*?(?=\n\n---|^---)/m,
    `products:\n${productsYaml}`
  );

  fs.writeFileSync(bestsellersPath, content);
  console.log(`✅ bestsellers.md: ${bestsellersProducts.length} products`);
}

// Update sale collection (products that should have discounts)
const salePath = path.join(collectionsDir, 'sale.md');
if (fs.existsSync(salePath)) {
  let content = fs.readFileSync(salePath, 'utf-8');
  // Every 5th product for sale variety
  const saleProducts = allProductSlugs.filter((_, index) => index % 5 === 2 || index % 5 === 3).slice(0, 10);

  if (saleProducts.length === 0) {
    // Fallback: use products 15-25
    saleProducts.push(...allProductSlugs.slice(15, 25));
  }

  const productsYaml = saleProducts
    .map(slug => `  - "${slug}"`)
    .join('\n');

  content = content.replace(
    /^products:[\s\S]*?(?=\n\n---|^---)/m,
    `products:\n${productsYaml}`
  );

  fs.writeFileSync(salePath, content);
  console.log(`✅ sale.md: ${saleProducts.length} products`);
}

console.log('\n🎉 All collections updated successfully!');
