# Store & Product Sync Guide

## 🛍️ Catalog Status

**Products:** 50+ items synced from Escuelajs Fake Store API
**Categories:** 7 categories populated
**Status:** ✅ Ready to display

### Product Distribution by Category

| Category | Count | Types |
|----------|-------|-------|
| **Pacha** | 7 | Clothing (shirts, joggers, shorts, caps) |
| **Electronics** | 10+ | Gaming, audio, gadgets, computers |
| **Furniture** | 4 | Sofas, chairs, tables, desks |
| **Shoes** | 9+ | Sneakers, heels, boots, sandals |
| **Miscellaneous** | 8+ | Luggage, sunglasses, perfume, accessories |

## 📁 File Structure

### Products Content Collection
```
web/src/content/products/
├── classic-black-baseball-cap.md         # Clothing example
├── sleek-modern-laptop-with-...md        # Electronics example
├── sleek-modern-leather-sofa.md          # Furniture example
├── futuristic-holographic-soccer-...md   # Shoes example
├── radiant-citrus-eau-de-parfum.md       # Accessories example
└── [45 more products]
```

**Total:** 50 product files with full metadata

### Categories Content Collection
```
web/src/content/categories/
├── pacha.md
├── electronics.md
├── furniture.md
├── shoes.md
├── miscellaneous.md
├── string.md
└── category-b.md
```

## 🔄 Sync Script

**Location:** `scripts/sync-fake-api-products.ts`

### Features
- ✅ Fetches products from [Escuelajs Fake Store API](https://api.escuelajs.co/api/v1/products)
- ✅ Generates Astro content collection markdown files
- ✅ Creates realistic product variants (color/size combos)
- ✅ Auto-categorizes products
- ✅ Generates relevant tags
- ✅ Syncs category information
- ✅ Handles YAML escaping properly

### Run Script
```bash
bun run scripts/sync-fake-api-products.ts
```

### What It Does
1. Fetches 50 products from API
2. Generates product variants (2-4 per item)
3. Creates markdown files with frontmatter
4. Populates categories
5. Validates YAML format

## 📦 Product Structure

Each product file contains:

### Frontmatter (YAML)
```yaml
name: "Product Name"
description: "Product description..."
price: 59.99
images:
  - "https://..."
  - "https://..."
category: "electronics"
collections: ["new-arrivals", "bestsellers"]
variants:
  - id: "variant-id"
    name: "Variant Name"
    sku: "SKU-001"
    price: 59.99
    inStock: true
    options:
      color: "Black"
      size: "M"
inStock: true
featured: true/false
tags: ["electronics", "affordable"]
metadata:
  apiId: 1
  category: "Electronics"
  fetchedAt: "2025-10-30T..."
```

### Body (Markdown)
- Product description
- Available variants
- Product details
- Features and specifications

## 🎨 Product Features

### Smart Defaults
- **Featured:** Products over $100 or with random selection
- **New Arrivals:** Recent API entries
- **On Sale:** Products under $50
- **Stock Status:** 90% default in-stock
- **Variants:** Color/size combos for clothing, color options for electronics

### Tags
Auto-generated from product data:
- Category-based (electronics, shoes, furniture)
- Price-based (affordable, premium)
- Keyword-based (classic, comfort, wireless, gaming, sports)

## 🛒 Shop Pages

### Available Pages
- **Shop Homepage:** `/shop` - Featured products & collections
- **Products Listing:** `/products` - All products with filters
- **Product Detail:** `/products/[slug]` - Full product page
- **Collections:** `/collections/[slug]` - Curated product lists
- **Cart:** `/cart` - Shopping cart
- **Checkout:** `/checkout` - Order processing

### Components (45+)
- ProductCard, ProductGallery, ProductSearch
- AddToCartButton, VariantSelector, PriceDisplay
- FilterSidebar, SortDropdown, PriceRangeSlider
- Wishlist, ReviewStars, TrustBadges

## 🔍 Search & Filter

Products support:
- **Full-text search** by name/description
- **Category filter** (7 categories)
- **Collection filter** (new-arrivals, bestsellers, sale)
- **Price range** filter
- **Tag-based** filtering
- **In-stock** only filter
- **Featured** products view

## 📊 Data Integration

### Three-Tier Architecture
```
API (Escuelajs)
    ↓
Content Collections (Markdown)
    ↓
Astro Types (Zod validated)
    ↓
ProductService (Business logic)
    ↓
React Components & Pages
```

### Current Status
- ✅ Frontend: 100% complete (pages, components, styling)
- ✅ Content Layer: 100% complete (50 products + 7 categories)
- ⏳ Backend: Partial (Convex schema ready, mutations/queries pending)

## 💡 How to Use

### View Products in Browser
```bash
cd web/
bun run dev

# Visit: http://localhost:4321/shop
```

### Add More Products
```bash
bun run scripts/sync-fake-api-products.ts
```

### Update Specific Product
Edit the markdown file directly, e.g.:
```bash
vim web/src/content/products/classic-black-baseball-cap.md
```

### Create New Collection
Add to `web/src/content/collections/my-collection.md`:
```yaml
---
name: "My Collection"
description: "Collection description"
featured: true
---

Collection content...
```

## 🚀 Next Steps

### Backend Integration (Pending)
- [ ] Create `digital_product` thing type in Convex schema
- [ ] Implement product mutations (create, update, delete)
- [ ] Implement product queries (get, list, search)
- [ ] Add ecommerce service layer
- [ ] Connect to payment processor (Stripe)

### Content Enhancement
- [ ] Add local product images (reduce Unsplash dependency)
- [ ] Create product upload functionality
- [ ] Implement inventory management
- [ ] Add customer reviews system

### Features to Add
- [ ] Product recommendations
- [ ] Wishlist functionality
- [ ] Price tracking & alerts
- [ ] Customer reviews & ratings
- [ ] Product comparison tool

## 📚 Key Files

| File | Purpose |
|------|---------|
| `scripts/sync-fake-api-products.ts` | API sync script |
| `web/src/content/config.ts` | Content collection schemas |
| `web/src/types/products.ts` | Product type definitions |
| `web/src/lib/ecommerce.ts` | Query helpers (349 lines) |
| `web/src/pages/shop.astro` | Shop homepage (821 lines) |
| `web/src/pages/products/index.astro` | Products listing |
| `web/src/pages/products/[slug].astro` | Product detail page |
| `web/src/services/ProductService.ts` | Business logic (319 lines) |

## 🎯 API Integration Points

### API Source
- **Base:** https://api.escuelajs.co/api/v1
- **Products:** `/products?limit=50`
- **Categories:** `/categories`

### Data Mapper
The sync script maps API fields to content schema:
- `title` → `name`
- `price` → `price`
- `description` → `description`
- `images` → `images` array
- `category.slug` → `category`
- `id` → metadata.apiId

## ✨ Example Products

### 🎽 Clothing
- Classic Comfort Fit Joggers - $250
- Classic White Crew Neck T-Shirt - $39
- Classic Black Baseball Cap - $58
- Classic High-Waisted Athletic Shorts - $43

### 💻 Electronics
- Sleek Modern Laptop with Ambient Lighting - $43
- Sleek White & Orange Wireless Gaming Controller - $69
- Sleek Wireless Headphone & Inked Earbud Set - $44
- Sleek Smartwatch with Vibrant Display - $21

### 🛋️ Furniture
- Sleek Modern Leather Sofa - $262
- Mid-Century Modern Wooden Dining Table - $242
- Modern Elegance Teal Armchair - $159
- Modern Ergonomic Office Chair - $173

### 👟 Shoes
- Futuristic Holographic Soccer Cleats - $61
- Rainbow Glitter High Heels - $231
- Chic Summer Denim Espadrille Sandals - $205
- Vibrant Pink Classic Sneakers - $191

## 🔧 Troubleshooting

### Products Not Showing
```bash
# Validate content schema
bunx astro check

# Regenerate types
bunx astro sync
```

### YAML Parsing Error
Check frontmatter quotes - should use double quotes ("):
```yaml
name: "Product Name"  # ✅ Correct
name: 'Product Name'  # ❌ Incorrect
```

### Missing Images
Products use Imgur URLs. If images don't load:
1. Check image URLs are valid
2. Verify internet connection
3. Consider downloading images locally

## 📈 Statistics

- **Total Products:** 50
- **Product Variants:** 100+
- **Total SKUs:** 150+
- **Categories:** 7
- **Collections:** 3 (new-arrivals, bestsellers, sale)
- **Average Price:** $120
- **Price Range:** $21 - $262

---

**Last Updated:** 2025-10-30
**API Source:** Escuelajs Fake Store API
**Sync Script:** `scripts/sync-fake-api-products.ts`

For questions about product data, see the sync script comments and examples in `web/src/content/products/`.
