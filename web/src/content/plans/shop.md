---
title: "E-Commerce Frontend Store v1.0.0"
description: "Frontend-only ecommerce storefront with Stripe checkout, product catalog, shopping cart"
feature: "ecommerce-frontend"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Events"]
assignedSpecialist: "Engineering Director"
totalCycles: 28
completedCycles: 0
createdAt: 2025-11-08
draft: false
status: "Optimized - Ready to Start"
---

# ONE Platform: E-Commerce Frontend Store v1.0.0

**Focus:** Frontend-only ecommerce storefront with Stripe.js checkout (no backend needed)
**Type:** Optimized frontend implementation (Astro + React 19 + Tailwind v4 + Stripe.js)
**Integration:** Stripe.js for client-side payments, localStorage for cart persistence
**Process:** `Optimized 28-cycle sequence (Quick Wins First)`
**Timeline:** 2-3 specialist days to working MVP, 4-5 days to full launch
**Target:** Customers can browse and buy products within 10 cycles

---

## Cycle Budget (28 Total)

**Quick Wins First Philosophy:** Working shop with purchasable products in 10 cycles.

```
Cycles 1-10:  MVP Launch (Product listing → First sale)
Cycles 11-18: Enhanced UX (Cart, Checkout polish, Mobile optimization)
Cycles 19-24: Complete Features (Account pages, Static pages, Email)
Cycles 25-28: Deploy & Monitor (Cloudflare Pages, Analytics, Testing)
```

**Key Milestones:**
- **Cycle 3:** Product listing page live with 3-5 products
- **Cycle 8:** First product purchasable via Stripe.js
- **Cycle 10:** MVP deployed - customers can browse and buy
- **Cycle 18:** Full shopping experience complete
- **Cycle 28:** Production-ready with monitoring

---

## Quick Wins (Cycles 1-10): Working Shop in 10 Cycles

**Goal:** Ship a working ecommerce store where customers can buy products.

**What Success Looks Like at Cycle 10:**
- ✅ Homepage with 3-5 featured products
- ✅ Product listing page with filters
- ✅ Product detail pages with "Buy Now" button
- ✅ Stripe.js checkout (direct to payment, no cart)
- ✅ Order confirmation page
- ✅ Deployed to Cloudflare Pages
- ✅ First test purchase completed

**Stack:**
- Frontend: Astro 5 + React 19 + Tailwind v4
- Payments: Stripe.js (client-side only)
- Storage: localStorage for cart (optional)
- Content: Astro content collections (markdown)
- Deploy: Cloudflare Pages (automated)

---

## PHASE 1: MVP LAUNCH (Cycles 1-10)

**Purpose:** Ship working shop with purchasable products (no backend needed)

### Cycle 1: Setup Product Content Collection
- [ ] **Create content collection schema** (`src/content/config.ts`)
  - Product type with: id, name, description, price, images[], category
  - Simple validation with Zod
- [ ] **Add 3-5 starter products** (markdown files)
  - Product 1: T-shirt ($29.99)
  - Product 2: Hoodie ($49.99)
  - Product 3: Hat ($19.99)
  - Each with 1-2 images, description, price
- [ ] **Generate types** (`bunx astro sync`)

**Outcome:** Product data ready to display

### Cycle 2: Build Homepage with Product Grid
- [ ] **Create simple layout** (`src/layouts/ShopLayout.astro`)
  - Header with logo + "Shop" link
  - Footer with copyright
  - Main content area
- [ ] **Build homepage** (`src/pages/index.astro`)
  - Hero section with headline "Shop Our Store"
  - Product grid showing all products
  - Use getCollection to fetch products
- [ ] **Create ProductCard component** (`src/components/ProductCard.astro`)
  - Product image
  - Product name
  - Price
  - "View Details" link

**Outcome:** Homepage displays products

### Cycle 3: Create Product Detail Pages
- [ ] **Build product detail page** (`src/pages/products/[slug].astro`)
  - Dynamic route for each product
  - Fetch product data with getEntry
  - Display: image, name, description, price
- [ ] **Add "Buy Now" button** (static for now)
  - Large primary button
  - Links to checkout page with product ID
- [ ] **Basic styling with Tailwind v4**
  - Responsive layout (mobile-first)
  - Clean typography

**Outcome:** Product listing page complete (Milestone reached!)

### Cycle 4: Setup Stripe.js Integration
- [ ] **Install Stripe.js** (`bun add @stripe/stripe-js`)
- [ ] **Create Stripe publishable key** (test mode)
  - Sign up at stripe.com
  - Get test publishable key
  - Add to .env: `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] **Create StripeProvider component** (`src/components/StripeProvider.tsx`)
  - Wraps Stripe Elements
  - Loads Stripe.js client-side
- [ ] **Test Stripe connection**
  - Verify key loads in browser console

**Outcome:** Stripe.js ready for checkout

### Cycle 5: Build Simple Checkout Form
- [ ] **Create checkout page** (`src/pages/checkout.astro`)
  - Get product from URL params
  - Display product summary (image, name, price)
- [ ] **Add customer info form** (React component with `client:load`)
  - Name, Email, Address fields
  - Basic validation (required fields)
- [ ] **Calculate total**
  - Product price + fixed shipping ($5.00)
  - Display total prominently

**Outcome:** Checkout form ready for payment

### Cycle 6: Integrate Stripe Payment Elements
- [ ] **Create payment form component** (`src/components/CheckoutForm.tsx`)
  - Use Stripe CardElement
  - Handle form submission
  - Show loading state during payment
- [ ] **Connect to checkout page**
  - Wrap in StripeProvider
  - Pass product + customer data
- [ ] **Handle payment success/error**
  - Redirect to confirmation on success
  - Show error message on failure

**Outcome:** Payment form functional

### Cycle 7: Create API Route for Stripe Payment Intent
- [ ] **Create payment API endpoint** (`src/pages/api/create-payment-intent.ts`)
  - Server-side function (SSR)
  - Takes product ID + amount
  - Creates Stripe PaymentIntent
  - Returns client_secret
- [ ] **Install Stripe Node SDK** (`bun add stripe`)
- [ ] **Add secret key to .env** (`STRIPE_SECRET_KEY`)
- [ ] **Test with Stripe dashboard**
  - Verify payment intents appear

**Outcome:** Payment backend ready

### Cycle 8: Complete End-to-End Purchase Flow
- [ ] **Test full purchase flow**
  - Browse products → Select product → Checkout → Pay → Confirm
  - Use Stripe test card: 4242 4242 4242 4242
- [ ] **Create order confirmation page** (`src/pages/order-confirmation.astro`)
  - Display order number (random ID)
  - Show purchased items
  - Thank you message
  - "Continue Shopping" button
- [ ] **Add error handling**
  - Payment failed → Show error + retry
  - Invalid form → Highlight fields
- [ ] **Fix any bugs discovered**

**Outcome:** First product purchasable! (Milestone reached!)

### Cycle 9: Mobile Optimization & Polish
- [ ] **Test on mobile devices**
  - iPhone (Safari)
  - Android (Chrome)
  - Tablet (iPad)
- [ ] **Fix mobile UX issues**
  - Touch targets 44px minimum
  - Form inputs zoom-friendly
  - Sticky checkout button on mobile
- [ ] **Optimize images**
  - Convert to WebP
  - Add responsive sizes
  - Lazy loading below fold
- [ ] **Test performance**
  - Run Lighthouse (target: 90+ score)
  - Fix Core Web Vitals issues

**Outcome:** Mobile-optimized shopping experience

### Cycle 10: Deploy MVP to Cloudflare Pages
- [ ] **Setup Cloudflare Pages project**
  - Connect to GitHub repo
  - Configure build: `bun run build`
  - Set output directory: `dist`
- [ ] **Add environment variables**
  - `PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
- [ ] **Deploy and test**
  - Push to main branch → auto-deploy
  - Test live URL
  - Complete test purchase on production
- [ ] **Setup custom domain** (optional)
  - Configure DNS
  - Enable HTTPS

**Outcome:** MVP DEPLOYED - Customers can buy products! (Milestone reached!)

---

## PHASE 2: ENHANCED UX (Cycles 11-18)

**Purpose:** Add shopping cart, product filters, and polish the shopping experience

### Cycle 11: Add Shopping Cart with localStorage
- [ ] **Create cart store** (`src/stores/cart.ts`)
  - Use nanostores for reactive state
  - Functions: addItem, removeItem, updateQuantity, clear
  - Persist to localStorage
- [ ] **Create CartDrawer component** (`src/components/CartDrawer.tsx`)
  - Slide-out panel (right side)
  - Show cart items with images
  - Quantity controls
  - Remove button
  - Subtotal
  - "Checkout" button
- [ ] **Add cart icon to header**
  - Show item count badge
  - Click opens drawer

**Outcome:** Cart functionality complete

### Cycle 12: Update Checkout to Use Cart
- [ ] **Modify checkout flow**
  - Load items from cart store (not URL params)
  - Support multiple products
  - Calculate total from all items + shipping
- [ ] **Update CheckoutForm component**
  - Show cart summary sidebar
  - Display all items being purchased
- [ ] **Clear cart on successful payment**
  - Empty cart after order confirmation

**Outcome:** Multi-product checkout working

### Cycle 13: Add Product Filtering & Search
- [ ] **Create products listing page** (`src/pages/products/index.astro`)
  - Show all products in grid
  - Category filter (sidebar on desktop, drawer on mobile)
  - Price range filter
  - Sort options (price, name, newest)
- [ ] **Create FilterSidebar component** (`src/components/FilterSidebar.tsx`)
  - Category checkboxes
  - Price range slider
  - Clear filters button
- [ ] **Add search functionality**
  - Search bar in header
  - Filter products by name/description
  - Show result count

**Outcome:** Product discovery enhanced

### Cycle 14: Enhance Product Detail Pages
- [ ] **Add image gallery** (`src/components/ProductGallery.tsx`)
  - Multiple product images
  - Thumbnail navigation
  - Zoom on click
- [ ] **Add variant selectors** (if applicable)
  - Size dropdown
  - Color swatches
  - Update price based on variant
- [ ] **Add "Add to Cart" button**
  - Replace "Buy Now" with cart action
  - Show success toast on add
- [ ] **Add product recommendations**
  - "Related Products" section
  - Show 3-4 similar items

**Outcome:** Rich product pages

### Cycle 15: Add Cart Page
- [ ] **Create standalone cart page** (`src/pages/cart.astro`)
  - Full-page cart view
  - All cart items with images
  - Quantity controls per item
  - Remove item buttons
  - Update totals in real-time
- [ ] **Add empty cart state**
  - "Your cart is empty" message
  - Featured products grid
  - "Start Shopping" button
- [ ] **Add discount code input**
  - Text input for promo codes
  - Apply button
  - Show discount in total

**Outcome:** Dedicated cart page complete

### Cycle 16: Polish Checkout Experience
- [ ] **Add progress indicator**
  - Show steps: Cart → Info → Payment → Confirm
  - Highlight current step
- [ ] **Add shipping calculator**
  - Calculate shipping based on address
  - Show options: Standard ($5), Express ($15)
  - Update total dynamically
- [ ] **Improve form validation**
  - Real-time field validation
  - Show error messages inline
  - Disable submit until valid
- [ ] **Add order summary sidebar**
  - Sticky sidebar on desktop
  - Show items, subtotal, shipping, total

**Outcome:** Professional checkout experience

### Cycle 17: Add Order History (Client-Side)
- [ ] **Create orders store** (`src/stores/orders.ts`)
  - Save completed orders to localStorage
  - Track order number, date, items, total
- [ ] **Create orders page** (`src/pages/account/orders.astro`)
  - List all past orders
  - Order number, date, total
  - "View Details" link per order
- [ ] **Create order detail page** (`src/pages/account/orders/[id].astro`)
  - Full order information
  - Items purchased
  - Shipping address
  - Payment details (masked)

**Outcome:** Order history tracking

### Cycle 18: Final UX Polish
- [ ] **Add loading states**
  - Skeleton loaders for products
  - Spinner during checkout
  - Progress bar for payment
- [ ] **Add toast notifications**
  - "Added to cart" success
  - "Payment successful" confirmation
  - Error messages
- [ ] **Add animations**
  - Smooth transitions
  - Cart drawer slide-in
  - Button hover effects
- [ ] **Cross-browser testing**
  - Test Chrome, Safari, Firefox, Edge
  - Fix any browser-specific issues

**Outcome:** Full shopping experience complete (Milestone reached!)

---

## PHASE 3: COMPLETE FEATURES (Cycles 19-24)

**Purpose:** Add static pages, email confirmations, and final features

### Cycle 19: Create Static Pages
- [ ] **About page** (`src/pages/about.astro`)
  - Company story
  - Mission statement
  - Team section
- [ ] **Contact page** (`src/pages/contact.astro`)
  - Contact form
  - Email/phone
  - Social links
- [ ] **FAQ page** (`src/pages/faq.astro`)
  - Accordion of common questions
  - Organized by category

**Outcome:** Static pages complete

### Cycle 20: Create Policy Pages
- [ ] **Shipping & Returns** (`src/pages/shipping.astro`)
  - Shipping policy
  - Return window (30 days)
  - Refund process
- [ ] **Privacy Policy** (`src/pages/privacy.astro`)
  - Data collection policy
  - Cookie usage
  - GDPR compliance
- [ ] **Terms of Service** (`src/pages/terms.astro`)
  - Legal terms
  - Purchase conditions

**Outcome:** Legal pages complete

### Cycle 21: Add Email Confirmations
- [ ] **Setup email service** (Resend or similar)
  - Create account
  - Get API key
  - Add to environment variables
- [ ] **Create order confirmation email template**
  - HTML email template
  - Order details
  - Items purchased
  - Total amount
- [ ] **Send email after purchase**
  - Trigger from payment success
  - Include order number
  - Add tracking info placeholder

**Outcome:** Email confirmations working

### Cycle 22: Add Product Reviews (Client-Side)
- [ ] **Create reviews store** (`src/stores/reviews.ts`)
  - localStorage-based reviews
  - Add, list reviews per product
- [ ] **Add review form to product pages**
  - Star rating selector
  - Review text textarea
  - Reviewer name
  - Submit button
- [ ] **Display reviews on product pages**
  - Show all reviews
  - Average rating
  - Sort by newest/highest rating

**Outcome:** Product reviews functional

### Cycle 23: Add Wishlist Feature
- [ ] **Create wishlist store** (`src/stores/wishlist.ts`)
  - localStorage-based wishlist
  - Add/remove items
  - Persist across sessions
- [ ] **Add wishlist button to products**
  - Heart icon on product cards
  - Toggle add/remove
  - Show count in header
- [ ] **Create wishlist page** (`src/pages/wishlist.astro`)
  - Grid of wishlisted products
  - "Add to Cart" button per item
  - "Remove from Wishlist" option

**Outcome:** Wishlist complete

### Cycle 24: Add Analytics Tracking
- [ ] **Setup analytics service** (Plausible or Google Analytics)
  - Create account
  - Add tracking script
- [ ] **Track key events**
  - Page views
  - Product views
  - Add to cart
  - Checkout started
  - Purchase completed
- [ ] **Create analytics dashboard**
  - View key metrics
  - Track conversion rate
  - Monitor top products

**Outcome:** Analytics tracking complete

---

## PHASE 4: DEPLOY & MONITOR (Cycles 25-28)

**Purpose:** Production deployment, testing, and monitoring

### Cycle 25: Production Deployment
- [ ] **Final production build**
  - Run `bun run build`
  - Test locally
  - Fix any build errors
- [ ] **Deploy to Cloudflare Pages**
  - Push to main branch
  - Verify auto-deploy
  - Test live site
- [ ] **Configure custom domain**
  - Point DNS to Cloudflare
  - Enable SSL certificate
  - Test HTTPS

**Outcome:** Production site live

### Cycle 26: Testing & QA
- [ ] **Complete purchase test**
  - Test all payment flows
  - Verify email confirmations
  - Check order history
- [ ] **Cross-device testing**
  - Mobile (iOS, Android)
  - Tablet (iPad, Android)
  - Desktop (Windows, Mac)
- [ ] **Performance testing**
  - Run Lighthouse audits
  - Check Core Web Vitals
  - Optimize any slow pages
- [ ] **Security testing**
  - Test Stripe security
  - Verify HTTPS everywhere
  - Check for XSS vulnerabilities

**Outcome:** QA complete

### Cycle 27: SEO & Accessibility
- [ ] **Add meta tags**
  - Page titles
  - Meta descriptions
  - Open Graph tags
  - Twitter cards
- [ ] **Create sitemap.xml**
  - List all pages
  - Submit to Google Search Console
- [ ] **Accessibility audit**
  - Test with screen reader
  - Check keyboard navigation
  - Fix WCAG 2.1 AA issues
- [ ] **Add robots.txt**
  - Allow all pages
  - Link to sitemap

**Outcome:** SEO & accessibility optimized

### Cycle 28: Monitoring & Documentation
- [ ] **Setup error monitoring** (Sentry or similar)
  - Track JavaScript errors
  - Monitor payment failures
  - Set up alerts
- [ ] **Setup uptime monitoring** (UptimeRobot or similar)
  - Monitor site availability
  - Alert on downtime
- [ ] **Create deployment documentation**
  - Deployment process
  - Environment variables
  - Troubleshooting guide
- [ ] **Create user documentation**
  - How to add products
  - How to update content
  - How to manage orders

**Outcome:** PRODUCTION-READY WITH MONITORING! (Project Complete!)

---

## SUCCESS CRITERIA

E-commerce store is complete when:

- ✅ Homepage displays products beautifully
- ✅ Product pages show detailed information
- ✅ Shopping cart persists across sessions
- ✅ Checkout flow is smooth and intuitive
- ✅ Stripe payments process successfully
- ✅ Order confirmations sent via email
- ✅ Mobile responsive on all devices
- ✅ Lighthouse score 90+ on all pages
- ✅ Deployed to Cloudflare Pages with custom domain
- ✅ Analytics tracking key metrics
- ✅ Error monitoring active
- ✅ First real purchase completed

---

## TECHNOLOGY STACK

**Frontend:**
- Astro 5.14+ (Static site generation + SSR)
- React 19 (Islands for interactive components)
- Tailwind CSS v4 (CSS-based configuration)
- nanostores (State management)

**Payments:**
- Stripe.js (Client-side)
- Stripe Node SDK (Server-side API routes)

**Storage:**
- localStorage (Cart, wishlist, orders)
- Content Collections (Product data)

**Deployment:**
- Cloudflare Pages (Global CDN)
- GitHub (Version control + CI/CD)

**Monitoring:**
- Plausible/Google Analytics (Web analytics)
- Sentry (Error tracking)
- UptimeRobot (Uptime monitoring)

---

## WHAT'S DIFFERENT (Optimized vs Original)

**Original Plan (100 cycles):**
- ❌ Backend integration required
- ❌ Complex multi-step checkout (7 steps)
- ❌ First purchase at Cycle 45
- ❌ MVP at Cycle 60-70
- ❌ Required Convex database setup
- ❌ Authentication system needed

**Optimized Plan (28 cycles):**
- ✅ Frontend-only with Stripe.js
- ✅ Simple checkout (1-2 steps)
- ✅ First purchase at Cycle 8
- ✅ MVP deployed at Cycle 10
- ✅ localStorage for all data
- ✅ No authentication needed initially

**Time Savings:**
- Original: 8-10 specialist days to first purchase
- Optimized: 1-2 specialist days to first purchase
- **5x faster to revenue!**

---

**Last Updated:** 2025-11-08 (Complete rewrite with optimized planning paradigm)
**Philosophy:** Quick wins first, working product in 10 cycles, production-ready in 28 cycles
**Next Step:** Begin Cycle 1 - Setup Product Content Collection
