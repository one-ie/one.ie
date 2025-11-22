# Shop Page Templates

This directory contains ready-to-use templates for creating e-commerce product pages with various features.

## 📦 Available Templates

### 1. `product-with-related-cart.astro`

**Full-featured e-commerce product page with shopping cart and related products.**

#### Features Included

✅ **Product Gallery** - Image zoom, thumbnails, multiple images
✅ **Reviews Section** - Customer reviews with star ratings
✅ **Urgency Banners** - Stock countdown, limited-time offers
✅ **Stripe Checkout** - Ready-to-use payment integration
✅ **Related Products** - "You might also like" section
✅ **Shopping Cart** - Add to cart with persistent cart drawer
✅ **Cart Drawer** - Slides out from right, shows items & totals
✅ **Mobile Optimized** - Responsive design for all screen sizes
✅ **Dark Mode** - Full dark mode support
✅ **SEO Optimized** - Meta tags, Open Graph, structured data

#### Quick Start

```bash
# 1. Copy template to your product page
cp src/templates/shop/product-with-related-cart.astro src/pages/shop/my-product/index.astro

# 2. Edit the file and update these sections:
# - Product data (name, price, description, images)
# - Related products
# - Reviews
# - Specs/features

# 3. (Optional) Add Stripe keys to .env for payments
echo "STRIPE_SECRET_KEY=sk_test_..." >> .env
echo "STRIPE_PUBLIC_KEY=pk_test_..." >> .env
```

#### What to Customize

**1. Product Data** (lines ~95-112)
```javascript
const product = {
  title: "Your Product Name",
  category: "Your Category",
  brand: "Your Brand",
  rating: 4.8,
  reviewCount: 247,
  price: 99.99,
  originalPrice: 149.99, // Optional
  stock: 12,
  description: "Your product description...",
  images: [
    "https://your-image-1.jpg",
    "https://your-image-2.jpg",
    "https://your-image-3.jpg",
  ],
};
```

**2. Specifications** (lines ~114-122)
```javascript
const specs = [
  { label: "Brand", value: "Your Brand" },
  { label: "Type", value: "Product Type" },
  { label: "Material", value: "Materials Used" },
  // Add more specs...
];
```

**3. Features** (lines ~124-143)
```javascript
const featuresWithImages = [
  {
    title: "Feature 1 Title",
    description: "Feature 1 description...",
    image: product.images[0],
  },
  // Add more features...
];
```

**4. Reviews** (lines ~147-165)
```javascript
const reviews = [
  {
    author: "Customer Name",
    rating: 5,
    text: "Review text...",
    date: "January 2025",
  },
  // Add more reviews...
];
```

**5. Related Products** (lines ~169-197)
```javascript
const relatedProducts = [
  {
    id: "product-slug",
    name: "Product Name",
    slug: "product-slug",
    price: 99.99,
    image: "https://product-image.jpg",
    category: "Category",
    rating: 4.6,
  },
  // Add 2-3 related products...
];
```

#### Stripe Integration (Optional)

**Setup:**
1. Get Stripe API keys from https://dashboard.stripe.com/apikeys
2. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   ```
3. Update Stripe product data (lines ~76-81):
   ```javascript
   const productPrice = 899.99;
   const productTitle = "Your Product Name";
   const productDescription = "Your description...";
   const productImage = "https://your-image.jpg";
   ```

**How it works:**
- Buy button opens dialog with email/quantity form
- Submits to Stripe Checkout
- Redirects to thank you page on success
- Handles errors gracefully

**Without Stripe:**
- Template works fine without Stripe keys
- Buy button will show "Stripe not configured" message
- Cart functionality still works (add to cart drawer)

#### Components Used

This template uses these reusable components:

- `ProductGallery` - Image zoom and gallery navigation
- `ProductHeader` - Title, price, buy dialog
- `InlineUrgencyBanner` - Stock/countdown banners
- `ReviewsSection` - Customer reviews display
- `RelatedProducts` - Related products grid with cart
- `GlobalCartDrawer` - Shopping cart sidebar
- `StickyBuyBar` - Fixed buy button on scroll
- `StickyCartButton` - Mobile cart button
- `ProductFAQ` - Accordion FAQ section
- `ValueProposition` - Trust badges section
- `ThemeToggle` - Dark/light mode switch

All components are in `/src/components/shop/`

## 🎨 Design System

Templates follow the ONE Platform design system:

**Colors:**
- Black/white borders with 2-4px thickness
- Dark mode support (`.dark` class)
- Minimal color palette

**Typography:**
- Font weights: light (300), medium (500), bold (700)
- Tracking: `0.2em` to `0.3em` for uppercase
- Sizes: `text-xs` to `text-6xl`

**Layout:**
- Max width: `max-w-7xl` (1280px)
- Grid: `grid-cols-1 md:grid-cols-3` (responsive)
- Spacing: `gap-4` to `gap-20` (multiples of 4)

**Borders:**
- All borders: `border-black dark:border-white`
- Thickness: `border-2` or `border-4` for sections
- No rounded corners (sharp, brutalist aesthetic)

## 🛒 Shopping Cart Features

All templates include the shopping cart system:

**Cart Store** (`/src/stores/cart.ts`):
- Nanostores for reactive state
- localStorage persistence
- Computed totals (count, subtotal, total)
- Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`

**Cart Drawer** (`GlobalCartDrawer`):
- Slides out from right on add to cart
- Shows all items with quantities
- Update/remove items inline
- Shows subtotal and total
- Checkout button (redirects to `/checkout`)

**Cart Persistence:**
- Survives page refreshes
- Survives navigation
- Cleared only when user explicitly clears cart

**Usage in Templates:**
```astro
---
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { GlobalCartDrawer } from "@/components/shop/GlobalCartDrawer";

const relatedProducts = [...];
---

<!-- Related products with add to cart buttons -->
<RelatedProducts products={relatedProducts} client:load />

<!-- Cart drawer (required for cart functionality) -->
<GlobalCartDrawer client:load />
```

## 📂 File Structure

```
web/src/
├── templates/shop/
│   ├── README.md (this file)
│   └── product-with-related-cart.astro (full e-commerce template)
├── pages/shop/
│   └── [your-product]/
│       └── index.astro (copy template here)
├── components/shop/
│   ├── ProductGallery.tsx
│   ├── RelatedProducts.tsx
│   ├── GlobalCartDrawer.tsx
│   └── ... (other shop components)
└── stores/
    └── cart.ts (shopping cart state)
```

## 🚀 Development Workflow

**1. Create New Product Page:**
```bash
# Copy template
cp src/templates/shop/product-with-related-cart.astro src/pages/shop/coffee-mug/index.astro

# Edit product data
code src/pages/shop/coffee-mug/index.astro
```

**2. Start Dev Server:**
```bash
cd web/
bun run dev
```

**3. View Page:**
```
http://localhost:4321/shop/coffee-mug
```

**4. Test Features:**
- [ ] Product images load correctly
- [ ] Reviews display properly
- [ ] Add to cart opens drawer
- [ ] Related products show correctly
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] (Optional) Stripe checkout works

## 🎯 Common Use Cases

### Use Case 1: Single Product Landing Page

**Template:** `product-with-related-cart.astro`

**Perfect for:**
- Physical products (electronics, apparel, accessories)
- Digital products (courses, ebooks, software)
- Premium items ($50+)
- Products with variants or specifications

**Setup time:** ~10 minutes

### Use Case 2: Product with Upsells

**Template:** `product-with-related-cart.astro`

**Perfect for:**
- Main product + accessories
- Bundles and packages
- Cross-sell opportunities

**Customization:**
- Update `relatedProducts` with complementary items
- Adjust prices for bundle discounts

### Use Case 3: Pre-order or Limited Stock

**Template:** `product-with-related-cart.astro`

**Perfect for:**
- Limited edition items
- Pre-launch products
- Flash sales

**Customization:**
- Set `stock` to actual quantity
- `InlineUrgencyBanner` shows countdown
- Update urgency message

## 📖 Further Reading

**Design System:** `/web/src/pages/design.astro`
**Shop Components:** `/web/src/components/shop/`
**Cart Store:** `/web/src/stores/cart.ts`
**Stripe Integration:** https://stripe.com/docs/checkout
**ONE Platform Docs:** `/one/knowledge/`

## 🤝 Contributing Templates

Created a great product page? Save it as a template!

**Template Naming Convention:**
```
product-[feature1]-[feature2].astro

Examples:
- product-with-related-cart.astro
- product-simple-stripe.astro
- product-subscription-recurring.astro
```

**Template Header:**
```javascript
/**
 * Template Name
 *
 * FEATURES INCLUDED:
 * ✅ Feature 1
 * ✅ Feature 2
 *
 * HOW TO USE:
 * 1. Step 1
 * 2. Step 2
 *
 * CUSTOMIZATION POINTS:
 * - Point 1
 * - Point 2
 */
```

## 💡 Tips & Tricks

**Image Optimization:**
- Use Unsplash for placeholder images
- Format: `?w=800&auto=format&fit=crop`
- WebP for production

**Performance:**
- Keep related products to 3-4 items
- Use `client:load` for interactive components
- Use `client:visible` for below-fold content

**SEO:**
- Update `<ShopLayout title="...">` with product name
- Add product description meta tag
- Use descriptive alt text for images

**Accessibility:**
- All images have alt text
- Buttons have aria-labels
- Keyboard navigation works
- Color contrast meets WCAG AA

---

**Happy building! 🎉**
