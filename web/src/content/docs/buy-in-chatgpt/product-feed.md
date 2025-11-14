---
title: Buy in ChatGPT - Product Feed
description: Complete Product Feed specification with 80+ fields, format options, caching strategy, and best practices
category: Buy in ChatGPT
order: 6
tags:
  - product-feed
  - catalog
  - openai
  - specification
---

# Product Feed Specification

The Product Feed is how ChatGPT discovers and understands your products. It's a JSON/CSV/XML endpoint that provides complete product information with 80+ fields optimized for AI agents.

## Overview

**What it is:**
A structured data feed containing your complete product catalog with AI-optimized fields.

**Why it matters:**
ChatGPT reads this feed to answer customer questions and make intelligent recommendations.

**How it works:**
ChatGPT periodically fetches your feed (cached for 15 min) and uses semantic understanding to match products to customer needs.

## Quick Start

### Minimal Working Example

```typescript
// pages/api/commerce/feed.json.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const feed = {
    meta: {
      generated_at: new Date().toISOString(),
      total_products: 1,
      format: 'json',
      version: '1.0.0',
      merchant: {
        name: 'My Store',
        id: 'merchant_123',
        url: 'https://mystore.com',
      },
    },
    products: [
      {
        // OpenAI flags (required)
        enable_search: true,
        enable_checkout: true,

        // Basic info (required)
        id: 'product-1',
        title: 'Example Product',
        description: 'A great product for...',
        link: 'https://mystore.com/products/product-1',

        // Media (required)
        image_link: 'https://mystore.com/images/product-1.jpg',

        // Pricing (required)
        price: '49.99 USD',

        // Availability (required)
        availability: 'in_stock',
        inventory_quantity: 100,

        // Category (required)
        product_category: 'Category > Subcategory',

        // Weight (required)
        weight: '1lb',

        // Merchant (required)
        seller_name: 'My Store',
        seller_url: 'https://mystore.com',

        // Returns (required)
        return_policy: 'https://mystore.com/returns',
        return_window: 30,
      },
    ],
  };

  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900', // 15-minute cache
    },
  });
};
```

**Test it:**

```bash
curl https://mystore.com/api/commerce/feed.json | jq .
```

## 80+ Field Reference

### OpenAI Flags (2 fields)

Control product discoverability and purchasability.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enable_search` | boolean | Yes | Allow ChatGPT to surface product in search |
| `enable_checkout` | boolean | Yes | Allow direct purchase via ACP |

**Example:**

```typescript
{
  enable_search: true,     // Product appears in ChatGPT search
  enable_checkout: true,   // Customer can buy via ChatGPT
}
```

**Use Cases:**

- Out of stock: `enable_search: false, enable_checkout: false`
- Coming soon: `enable_search: true, enable_checkout: false`
- Active: `enable_search: true, enable_checkout: true`

### Basic Product Data (6 fields)

Core product information.

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | 100 | Unique merchant product ID |
| `gtin` | string | No | 14 | Universal product ID (UPC/ISBN) |
| `mpn` | string | No | 70 | Manufacturer part number |
| `title` | string | Yes | 150 | Product name (avoid ALL-CAPS) |
| `description` | string | Yes | 5,000 | Full description (plain text) |
| `link` | string | Yes | - | Product detail page URL (HTTPS preferred) |

**Example:**

```typescript
{
  id: 'racket-warrior-black',
  gtin: '012345678905',        // UPC barcode
  mpn: 'METH-WAR-BLK-2024',    // Manufacturer SKU
  title: 'StarVie Metheora Warrior Padel Racket',
  description: 'Professional-grade padel racket with soft carbon-fiber core for maximum control and comfort. Perfect for aggressive players with arm sensitivity.',
  link: 'https://mystore.com/products/starv ie-metheora-warrior',
}
```

**Best Practices:**

- **ID:** Use SKU or slug (letters, numbers, hyphens only)
- **GTIN:** Include if you have it (helps with product matching)
- **Title:** Front-load important keywords ("StarVie Metheora" not "Racket: StarVie")
- **Description:** Write for humans, not SEO (ChatGPT understands natural language)

### Item Information (11 fields)

Physical product details.

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `condition` | string | No | new, refurbished, used | Product condition |
| `product_category` | string | Yes | - | Category path (use ">" separator) |
| `brand` | string | No | 70 chars | Manufacturer brand |
| `material` | string | No | 100 chars | Primary materials |
| `dimensions` | string | No | - | Overall size (e.g., "12x8x5 in") |
| `length` | string | No | - | Length with unit |
| `width` | string | No | - | Width with unit |
| `height` | string | No | - | Height with unit |
| `weight` | string | Yes | - | Weight with unit |
| `age_group` | string | No | newborn, infant, toddler, kids, adult | Target demographic |

**Example:**

```typescript
{
  condition: 'new',
  product_category: 'Sports > Racket Sports > Padel > Rackets',
  brand: 'StarVie',
  material: 'Carbon fiber, EVA foam',
  dimensions: '18x10x1.5 in',
  weight: '365g',
  age_group: 'adult',
}
```

**Category Structure:**

```
Sports
  ├─ Racket Sports
  │   ├─ Padel
  │   │   ├─ Rackets
  │   │   ├─ Balls
  │   │   └─ Accessories
  │   ├─ Tennis
  │   └─ Squash
  ├─ Team Sports
  └─ Water Sports
```

Use `>` to separate levels: `"Sports > Racket Sports > Padel > Rackets"`

### Media (4 fields)

Visual product representation.

| Field | Type | Required | Format | Description |
|-------|------|----------|--------|-------------|
| `image_link` | string | Yes | JPEG/PNG, HTTPS | Main product image |
| `additional_image_link` | array | No | JPEG/PNG, HTTPS | Extra images (comma-separated) |
| `video_link` | string | No | MP4/MOV, HTTPS | Product video URL |
| `model_3d_link` | string | No | GLB/GLTF | 3D model URL |

**Example:**

```typescript
{
  image_link: 'https://mystore.com/images/racket-warrior-main.jpg',
  additional_image_link: [
    'https://mystore.com/images/racket-warrior-side.jpg',
    'https://mystore.com/images/racket-warrior-detail.jpg',
    'https://mystore.com/images/racket-warrior-lifestyle.jpg',
  ],
  video_link: 'https://mystore.com/videos/racket-warrior-demo.mp4',
  model_3d_link: null,  // Future: 3D AR preview
}
```

**Image Requirements:**

- **Format:** JPEG or PNG
- **Size:** Minimum 800x800px, recommended 1200x1200px
- **Aspect Ratio:** Square (1:1) or product-only
- **Background:** White or transparent preferred
- **HTTPS:** Required for security
- **CDN:** Use CDN for faster loading

### Price & Promotions (7 fields)

Pricing and discount information.

| Field | Type | Required | Format | Description |
|-------|------|----------|--------|-------------|
| `price` | string | Yes | "99.99 USD" | Regular price with ISO 4217 code |
| `sale_price` | string | No | "79.99 USD" | Discounted price (must be ≤ price) |
| `sale_price_effective_date` | string | No | ISO 8601 range | Sale window |
| `unit_pricing_measure` | string | No | - | Unit measure for comparison |
| `base_measure` | string | No | - | Base measure for pricing |
| `pricing_trend` | string | No | 80 chars | Price trend message |

**Example:**

```typescript
{
  price: '139.00 USD',
  sale_price: '119.00 USD',           // 14% off
  sale_price_effective_date: '2025-01-14T00:00:00Z/2025-01-31T23:59:59Z',
  pricing_trend: 'Price dropped 14% this month',
}
```

**Price Format:**

```
✓ "139.00 USD"
✓ "99.99 EUR"
✓ "149.95 GBP"

✗ "$139.00"       // No currency symbol
✗ "139 USD"       // Include decimals
✗ "USD 139.00"    // Currency after amount
```

**Sale Pricing:**

- Sale price must be **less than or equal** to regular price
- Effective date uses ISO 8601 interval format
- ChatGPT highlights deals automatically

### Availability & Inventory (6 fields)

Stock and fulfillment status.

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `availability` | string | Yes | in_stock, out_of_stock, preorder | Product availability |
| `availability_date` | string | No | ISO 8601 | Available date if preorder |
| `inventory_quantity` | number | Yes | >= 0 | Stock count |
| `expiration_date` | string | No | ISO 8601 | Remove product after date |
| `pickup_method` | string | No | in_store, reserve, not_supported | Pickup options |
| `pickup_sla` | string | No | - | Pickup time (e.g., "2 hours") |

**Example:**

```typescript
{
  availability: 'in_stock',
  inventory_quantity: 25,
  pickup_method: 'not_supported',
}
```

**Availability States:**

- **in_stock:** Product available for immediate purchase
- **out_of_stock:** Temporarily unavailable (set `enable_checkout: false`)
- **preorder:** Available for order, ships later (include `availability_date`)

**Inventory Management:**

```typescript
// Update inventory in real-time
products[0].inventory_quantity = 23;  // After purchase

// Low stock warning
if (product.inventory_quantity < 5) {
  product.availability = 'in_stock';  // Still available
  // ChatGPT will mention "Only 3 left!"
}

// Out of stock
if (product.inventory_quantity === 0) {
  product.availability = 'out_of_stock';
  product.enable_checkout = false;
}
```

### Variants (11 fields)

Product variations (size, color, etc.).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `item_group_id` | string | No | Variant group ID (max 70 chars) |
| `item_group_title` | string | No | Group title (max 150 chars) |
| `color` | string | No | Variant color (max 40 chars) |
| `size` | string | No | Variant size (max 20 chars) |
| `size_system` | string | No | 2-letter country code (US, UK, EU) |
| `gender` | string | No | male, female, unisex |
| `offer_id` | string | No | Unique offer ID |
| `custom_variant1_category` | string | No | Custom dimension name |
| `custom_variant1_option` | string | No | Custom dimension value |
| `custom_variant2_category` | string | No | Custom dimension 2 name |
| `custom_variant2_option` | string | No | Custom dimension 2 value |

**Example (T-Shirt Variants):**

```typescript
// Parent group
{
  item_group_id: 'tshirt-basic',
  item_group_title: 'Basic T-Shirt',
  // ... other parent fields
}

// Variant 1: Small, Black
{
  id: 'tshirt-basic-s-black',
  item_group_id: 'tshirt-basic',
  color: 'Black',
  size: 'S',
  size_system: 'US',
  gender: 'unisex',
  // ... other fields
}

// Variant 2: Medium, Black
{
  id: 'tshirt-basic-m-black',
  item_group_id: 'tshirt-basic',
  color: 'Black',
  size: 'M',
  size_system: 'US',
  gender: 'unisex',
  // ... other fields
}

// Variant 3: Small, White
{
  id: 'tshirt-basic-s-white',
  item_group_id: 'tshirt-basic',
  color: 'White',
  size: 'S',
  size_system: 'US',
  gender: 'unisex',
  // ... other fields
}
```

**Custom Variants (Beyond Color/Size):**

```typescript
// Example: Coffee beans
{
  custom_variant1_category: 'Roast',
  custom_variant1_option: 'Medium',
  custom_variant2_category: 'Grind',
  custom_variant2_option: 'Whole Bean',
}

// Example: Subscription service
{
  custom_variant1_category: 'Billing',
  custom_variant1_option: 'Monthly',
  custom_variant2_category: 'Tier',
  custom_variant2_option: 'Pro',
}
```

### Fulfillment (2 fields)

Shipping and delivery information.

| Field | Type | Required | Format | Description |
|-------|------|----------|--------|-------------|
| `shipping` | array | No | country:region:service:price | Shipping options |
| `delivery_estimate` | string | No | ISO 8601 | Estimated arrival date |

**Example:**

```typescript
{
  shipping: [
    'US:CA:Standard:5.00 USD',
    'US:CA:Express:15.00 USD',
    'US:NY:Standard:7.00 USD',
    'US:NY:Express:18.00 USD',
  ],
  delivery_estimate: '2025-01-21T00:00:00Z',
}
```

**Shipping Format:**

```
country : region : service_class : price

US : CA : Standard : 5.00 USD
│    │     │          └─ Price with currency
│    │     └─ Shipping method
│    └─ State/region code
└─ Country code (ISO 3166-1 alpha-2)
```

### Merchant Info (5 fields)

Seller information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seller_name` | string | Yes | Merchant name (max 70 chars) |
| `seller_url` | string | Yes | Merchant homepage (HTTPS preferred) |
| `seller_privacy_policy` | string | Conditional | Privacy policy URL (required if `enable_checkout: true`) |
| `seller_tos` | string | Conditional | Terms of service URL (required if `enable_checkout: true`) |

**Example:**

```typescript
{
  seller_name: 'ONE Platform',
  seller_url: 'https://one.ie',
  seller_privacy_policy: 'https://one.ie/privacy',
  seller_tos: 'https://one.ie/terms',
}
```

### Returns (2 fields)

Return policy information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `return_policy` | string | Yes | Return policy URL (HTTPS preferred) |
| `return_window` | number | Yes | Days allowed for return (positive integer) |

**Example:**

```typescript
{
  return_policy: 'https://one.ie/returns',
  return_window: 30,  // 30-day returns
}
```

### Performance Signals (2 fields)

Popularity and quality metrics.

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `popularity_score` | number | No | 0-5 | Popularity indicator |
| `return_rate` | number | No | 0-100 | Return rate percentage |

**Example:**

```typescript
{
  popularity_score: 4.5,  // Very popular
  return_rate: 5,         // 5% return rate (excellent)
}
```

**How ChatGPT Uses These:**

- High popularity score = "This is a best-seller!"
- Low return rate = "Customers love this product"
- Combination = Confidence in recommendation

### Compliance (3 fields)

Warning and restriction information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `warning` | string | No | Product disclaimers |
| `warning_url` | string | No | Warning details URL |
| `age_restriction` | number | No | Minimum purchase age |

**Example:**

```typescript
{
  warning: 'California Proposition 65 Warning',
  warning_url: 'https://www.p65warnings.ca.gov/',
  age_restriction: 21,  // Must be 21+ to purchase
}
```

### Reviews and Q&A (7 fields)

Social proof and customer feedback.

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| `product_review_count` | number | No | >= 0 | Number of product reviews |
| `product_review_rating` | number | No | 0-5 | Average review score |
| `store_review_count` | number | No | >= 0 | Number of store reviews |
| `store_review_rating` | number | No | 0-5 | Average store rating |
| `q_and_a` | string | No | - | FAQ content |
| `raw_review_data` | string | No | - | Raw review payload |

**Example:**

```typescript
{
  product_review_count: 127,
  product_review_rating: 4.9,
  store_review_count: 1543,
  store_review_rating: 4.8,
  q_and_a: 'Q: Is this good for beginners? A: Yes, the soft core makes it very forgiving.',
}
```

**How ChatGPT Uses Reviews:**

```
Customer: Is this racket good?
ChatGPT: Absolutely! It has a 4.9-star rating from 127 reviews.
         Customers particularly love the soft core and control.
```

### Related Products (2 fields)

Product relationships and recommendations.

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `related_product_id` | array | No | - | Associated product IDs |
| `relationship_type` | string | No | part_of_set, required_part, often_bought_with, substitute, different_brand, accessory | Relationship type |

**Example:**

```typescript
{
  related_product_id: ['racket-grip-tape', 'padel-balls-3pack', 'racket-bag'],
  relationship_type: 'often_bought_with',
}
```

**Relationship Types:**

- **often_bought_with:** "Customers also purchased..."
- **substitute:** "Similar alternative products..."
- **accessory:** "Compatible accessories..."
- **part_of_set:** "Other items in this collection..."
- **required_part:** "Required to use this product..."
- **different_brand:** "Same product, different brand..."

## Format Options

### JSON Format (Recommended)

**Endpoint:** `/api/commerce/feed.json`

**Content-Type:** `application/json`

**Advantages:**
- Native JavaScript support
- Smallest file size
- Fastest parsing
- Best for APIs

**Example:**

See "Quick Start" section above.

### CSV Format

**Endpoint:** `/api/commerce/feed.csv`

**Content-Type:** `text/csv`

**Advantages:**
- Human-readable
- Excel-compatible
- Easy to generate from databases

**Example:**

```csv
id,title,price,availability,image_link,weight
product-1,"Example Product","49.99 USD",in_stock,https://...,1lb
product-2,"Another Product","79.99 USD",in_stock,https://...,2lb
```

**Implementation:**

```typescript
export const GET: APIRoute = async () => {
  const products = await getAllProducts();

  const csv = [
    // Header
    'id,title,price,availability,image_link,weight',
    // Rows
    ...products.map(p =>
      `${p.id},"${p.title}","${p.price}",${p.availability},${p.image_link},${p.weight}`
    ),
  ].join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Cache-Control': 'public, max-age=900',
    },
  });
};
```

### XML Format

**Endpoint:** `/api/commerce/feed.xml`

**Content-Type:** `application/xml`

**Advantages:**
- Industry standard (Google Shopping XML)
- Schema validation
- Namespace support

**Example:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>My Store Product Feed</title>
  <updated>2025-01-14T12:00:00Z</updated>
  <entry>
    <id>product-1</id>
    <title>Example Product</title>
    <g:price>49.99 USD</g:price>
    <g:availability>in_stock</g:availability>
    <!-- ... more fields -->
  </entry>
</feed>
```

## Caching Strategy

### Recommended Cache Duration

**15 minutes** balances freshness vs performance:

```typescript
headers: {
  'Cache-Control': 'public, max-age=900', // 15 minutes = 900 seconds
}
```

**Why 15 minutes?**

- **Inventory updates:** Fresh enough for most stock changes
- **Price changes:** Quick reflection of sales/discounts
- **CDN efficiency:** Reduces origin server load by 96%
- **ChatGPT polling:** Aligns with typical AI agent refresh rates

### Cache Headers

```typescript
// Production
headers: {
  'Cache-Control': 'public, max-age=900, s-maxage=900',
  'ETag': generateETag(products),
  'Last-Modified': new Date().toUTCString(),
}

// Development (no cache)
headers: {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
}
```

### CDN Configuration

**Cloudflare example:**

```typescript
// Cache everything for 15 min
export const config = {
  runtime: 'edge',
  cache: {
    sMaxAge: 900,
  },
};
```

**Cache Purging:**

```bash
# Purge when inventory/prices change
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -d '{"files":["https://yourdomain.com/api/commerce/feed.json"]}'
```

## Update Frequency

### Real-Time Updates

Ideal for high-volume stores:

```typescript
// Update feed immediately after inventory change
export async function onProductUpdate(productId: string) {
  // 1. Update database
  await db.update(productId, { inventory: newQuantity });

  // 2. Purge feed cache
  await purgeCDNCache('/api/commerce/feed.json');

  // 3. Notify ChatGPT (webhook)
  await notifyChatGPT({ type: 'catalog_updated' });
}
```

### Scheduled Updates

Better for most stores:

```bash
# Cron job: Update feed every 15 min
*/15 * * * * curl https://yourdomain.com/api/commerce/regenerate-feed
```

```typescript
// pages/api/commerce/regenerate-feed.ts
export const POST: APIRoute = async () => {
  // Regenerate feed from database
  const products = await db.query.products.findMany();

  // Update cache
  await cache.set('product-feed', products, { ttl: 900 });

  // Purge CDN
  await purgeCDNCache('/api/commerce/feed.json');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
```

## Best Practices

### Performance

1. **Use CDN:** Serve feed from edge (Cloudflare, Fastly)
2. **Enable Compression:** Gzip/Brotli reduces size by 70%
3. **Paginate Large Catalogs:** Split 10,000+ products into pages
4. **Index Database Queries:** Fast product lookups
5. **Cache Aggressively:** 15-minute cache = 96% fewer DB hits

### Data Quality

1. **Validate All Fields:** Use TypeScript types
2. **Test with Real Data:** Not just placeholders
3. **Monitor Feed Health:** Track errors and warnings
4. **Update Regularly:** Stale data = poor recommendations
5. **Include All Available Fields:** More data = better AI understanding

### SEO & Discoverability

1. **Front-Load Keywords in Title:** "StarVie Metheora" not "Racket: StarVie"
2. **Write Natural Descriptions:** ChatGPT understands context
3. **Include Detailed Attributes:** AI extracts features automatically
4. **Add High-Quality Images:** Visual recognition coming soon
5. **Provide Complete Data:** Missing fields = missed opportunities

### Security

1. **Use HTTPS:** Required for production
2. **Rate Limit Endpoint:** Prevent abuse
3. **Validate Requests:** Check User-Agent
4. **Monitor Access:** Track unusual patterns
5. **Audit Data:** No sensitive information in feed

---

**Next:** [Troubleshooting](/docs/buy-in-chatgpt/troubleshooting) for common issues and solutions.
