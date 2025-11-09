# Product Landing Page Template

This page (`product-landing.astro`) is designed as a **dynamic template** that can generate beautiful landing pages for any product.

## How It Works

### 1. Fetch Product from DummyJSON

```typescript
// Fetch any product by ID
const response = await fetch('https://dummyjson.com/products/1');
const productData = await response.json();
```

### 2. Use Template Helpers

Import the helper functions to generate dynamic content:

```typescript
import {
  getOriginalPrice,
  getTrustBadges,
  getProductFeatures,
  getProductSpecs,
  getCTAText,
  hasFragranceNotes,
  generateReviews,
} from '@/lib/productTemplateHelpers';

// Transform DummyJSON data
const product = {
  title: productData.title,
  description: productData.description,
  price: productData.price,
  originalPrice: getOriginalPrice(productData.price, productData.discountPercentage),
  rating: productData.rating,
  reviewCount: 89, // or fetch from API
  stock: productData.stock,
  category: productData.category,
  brand: productData.brand,
  images: productData.images,
};

const specs = getProductSpecs(productData);
const features = getProductFeatures(productData);
const trustBadges = getTrustBadges(productData.category);
const reviews = generateReviews(productData);
const cta = getCTAText(productData.category);
```

### 3. Conditional Sections

Some sections are category-specific:

```astro
---
const showFragranceNotes = hasFragranceNotes(product.category);
---

{showFragranceNotes && (
  <FragranceNotes
    topNotes={fragranceNotes.topNotes}
    middleNotes={fragranceNotes.middleNotes}
    baseNotes={fragranceNotes.baseNotes}
  />
)}
```

## Supported Product Categories

The template automatically adapts for:

- **Fragrances** - Includes fragrance notes, luxury features
- **Smartphones** - Tech specs, display/camera features
- **Laptops** - Performance specs, tech features
- **Clothing** - Size exchange, fit information
- **Furniture** - Dimensions, material details
- **Beauty** - Ingredients, skin type info
- **Groceries** - Fresh guarantee, nutritional info

## Dynamic Content Generation

### Trust Badges
Automatically selects appropriate badges based on product category:
- Fragrances → Free Shipping, 90-Day Returns, 3-Year Warranty
- Electronics → Free Shipping, 2-Year Warranty, Tech Support
- Clothing → Free Shipping, 60-Day Returns, Size Exchange

### Product Features
Generates 3 compelling features with images:
- Uses product images from DummyJSON
- Category-specific descriptions
- Fallback to generic quality/value features

### Specifications
Auto-generates relevant specs:
- Brand, Category, Stock Status, SKU (all products)
- Category-specific specs (volume for fragrances, RAM for laptops, etc.)

### Reviews
Generates authentic-sounding reviews:
- Uses product data to create relevant feedback
- Random but realistic author names
- Recent dates (current/last month)

## Example Usage

### Create Landing Page for a T-Shirt

```typescript
// 1. Fetch t-shirt from DummyJSON
const res = await fetch('https://dummyjson.com/products/category/mens-shirts');
const data = await res.json();
const tshirt = data.products[0];

// 2. Use helpers to generate content
const product = {
  title: tshirt.title,
  description: tshirt.description,
  price: tshirt.price,
  originalPrice: getOriginalPrice(tshirt.price, tshirt.discountPercentage),
  rating: tshirt.rating,
  reviewCount: 89,
  stock: tshirt.stock,
  category: 'mens-shirts',
  brand: tshirt.brand,
  images: tshirt.images,
};

const trustBadges = getTrustBadges('mens-shirts');
// → ['Free Shipping', '60-Day Returns', 'Size Exchange']

const features = getProductFeatures(product);
// → [
//   { title: 'Premium Quality', description: '...', image: '...' },
//   { title: 'Exceptional Value', description: '...', image: '...' },
//   { title: 'Reliable Performance', description: '...', image: '...' }
// ]

const cta = getCTAText('mens-shirts');
// → { title: 'Ready to elevate your style?', subtitle: '...' }
```

### Create Landing Page for a Smartphone

```typescript
const res = await fetch('https://dummyjson.com/products/category/smartphones');
const data = await res.json();
const phone = data.products[0];

// Helpers automatically adapt:
const trustBadges = getTrustBadges('smartphones');
// → ['Free Shipping', '2-Year Warranty', '30-Day Returns']

const features = getProductFeatures(phone);
// → [
//   { title: 'Cutting-Edge Performance', description: '...', image: '...' },
//   { title: 'Stunning Display', description: '...', image: '...' },
//   { title: 'Professional Camera', description: '...', image: '...' }
// ]

const specs = getProductSpecs(phone);
// → [
//   { label: 'Brand', value: 'Apple' },
//   { label: 'Category', value: 'Smartphones' },
//   { label: 'Display', value: '6.1" Super Retina' },  // Auto-added
//   { label: 'Storage', value: '128GB' },              // Auto-added
//   { label: 'Stock Status', value: '7 units available' },
//   { label: 'SKU', value: 'SMARTPHONES-1' }
// ]
```

## Template Components

All components are designed to work with any product:

1. **ProductHeader** - Works with any product name
2. **ProductGallery** - Handles any number of images
3. **InlineUrgencyBanner** - Displays stock + countdown
4. **FeaturesWithImages** - Adapts to any product category
5. **ProductSpecs** - Dynamic spec display
6. **ValueProposition** - Generic trust builders
7. **ReviewsSection** - Shows generated reviews
8. **ProductFAQ** - E-commerce FAQs for all products
9. **StickyBuyBar** - Bottom purchase bar
10. **RecentPurchaseToast** - Social proof popups

## Extending the Template

### Add New Category

```typescript
// In productTemplateHelpers.ts

// 1. Add trust badges
const categoryMap: Record<string, string[]> = {
  // ... existing categories
  'jewelry': ['Free Shipping', 'Lifetime Warranty', '60-Day Returns'],
};

// 2. Add category features
const categoryFeatures: Record<string, Array<{ title: string; description: string }>> = {
  // ... existing categories
  'jewelry': [
    { title: 'Exquisite Craftsmanship', description: '...' },
    { title: 'Premium Materials', description: '...' },
    { title: 'Timeless Design', description: '...' },
  ],
};

// 3. Add specs (optional)
const categorySpecs: Record<string, Array<{ label: string; value: string }>> = {
  // ... existing categories
  'jewelry': [
    { label: 'Material', value: '18K Gold' },
    { label: 'Stone', value: 'Diamond' },
  ],
};

// 4. Add CTA
const ctaMap: Record<string, { title: string; subtitle: string }> = {
  // ... existing categories
  'jewelry': {
    title: 'Ready to shine?',
    subtitle: 'Elevate every moment with timeless elegance.',
  },
};
```

## Best Practices

1. **Always fetch real product data** - Don't hardcode
2. **Use helper functions** - They handle edge cases
3. **Test with different categories** - Ensure adaptability
4. **Provide fallbacks** - Handle missing data gracefully
5. **Keep it generic** - Avoid product-specific language

## DummyJSON API Reference

- All products: `https://dummyjson.com/products`
- Single product: `https://dummyjson.com/products/1`
- By category: `https://dummyjson.com/products/category/smartphones`
- Categories list: `https://dummyjson.com/products/categories`

## Stripe Payment Integration

The `product-landing-stripe.astro` template includes full Stripe Checkout integration for secure payment processing.

### Setup Requirements

1. **Get Stripe API Keys**
   - Sign up at [stripe.com](https://stripe.com)
   - Get test keys from Dashboard → Developers → API Keys
   - See full setup guide: `/content/docs/develop/stripe.md`

2. **Configure Environment Variables**
   ```bash
   # web/.env.local
   PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Install Stripe SDK**
   ```bash
   bun add stripe
   ```

### How It Works

#### Product Page (product-landing-stripe.astro)

```astro
---
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

// Handle checkout session creation
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const quantity = Number(formData.get('quantity')) || 1;
  const email = formData.get('email')?.toString();

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          description: product.description,
          images: [product.images[0]],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: quantity,
    }],
    mode: 'payment',
    success_url: `${Astro.url.origin}/thankyou-product?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${Astro.url.origin}/shop/product-landing-stripe`,
    customer_email: email,
  });

  // Redirect to Stripe Checkout
  return Astro.redirect(session.url);
}
---
```

#### Thank You Page (thankyou-product.astro)

```astro
---
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const sessionId = Astro.url.searchParams.get('session_id');

// Retrieve session to get payment details
const session = await stripe.checkout.sessions.retrieve(sessionId, {
  expand: ['line_items']
});

// Display order confirmation
const { name, email } = session.customer_details || {};
const totalAmount = (session.amount_total || 0) / 100;
---
```

### Testing Payments

Use Stripe test cards during development:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

**Test card details:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Security Features

- ✅ Server-side session creation (no secret keys in browser)
- ✅ Server-side quantity validation (prevent price manipulation)
- ✅ Email receipt from Stripe
- ✅ PCI compliance handled by Stripe
- ✅ Fraud detection included

### Ontology Integration

Payments map to the 6-dimension ontology:

```typescript
// Event dimension - product_purchased
{
  type: "product_purchased",
  groupId: "org_acme",
  actorId: "customer_john",
  thingId: "product_coco_noir",
  properties: {
    stripeSessionId: "cs_test_abc123",
    amount: 129.99,
    currency: "usd",
    customerEmail: "john@example.com"
  }
}

// Connection dimension - purchased
{
  type: "purchased",
  fromId: "customer_john",
  toId: "product_coco_noir",
  groupId: "org_acme",
  properties: {
    purchaseDate: 1704067200000,
    stripeSessionId: "cs_test_abc123"
  }
}
```

## Future Enhancements

- [ ] AI-generated product descriptions
- [ ] Dynamic color schemes based on product images
- [ ] Video support for product demos
- [ ] Size guides for clothing
- [ ] Nutritional info for groceries
- [ ] Live inventory sync
- [ ] Subscription billing support
- [ ] Webhook integration for real-time payment events
- [ ] Multi-currency support
