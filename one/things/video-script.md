---
title: Video Script - ONE Platform Demo
dimension: things
category: video-script-ontology.md
tags: 6-dimensions, plain-english-dsl, product-demo, ontology
related_dimensions: connections, events, groups, knowledge, people
scope: global
created: 2025-11-03
updated: 2025-11-17
version: 2.0.0
ai_context: |-
  This document is part of the things dimension in the video-script-ontology category.
  Location: one/things/video-script.md
  Purpose: Demo script showing how to build enterprise-ready apps with ONE Platform
  Related dimensions: connections, events, groups, knowledge, people
  For AI agents: Read this to understand the ONE Platform demo flow.
---

# Video Script: ONE Demo

## Opening Hook (15 seconds)

"Bring your ideas to life with your voice or with chat.

Create a page selling the top 10 coolest products that I will buy when I am a billionaire. 
Search the web and create a products.json for our database containing links to the products and links to all the product images and logo and icon. 
Now in ONE let's paste this 
AI Chat


Build enterprise-ready web apps and deploy to Cloudflare's edge at 360 global locations.

Build anything—web pages, blogs, ecommerce stores, e-learning, or apps with AI agents."

100% free forever. Free license. Free hosting. Sub-second page loads. 100% Google Lighthouse score.


---

## Part 1: The Foundation (30 seconds)

### Every System Needs a Coherent Model of Reality

"Every intelligent system needs a coherent model of reality.

The ONE Ontology simplifies everything to **6 dimensions**:

1. **Groups** - Multi-tenant containers
2. **People** - Authorization and roles
3. **Things** - All entities (66+ types)
4. **Connections** - All relationships (25+ types)
5. **Events** - Complete audit trail (67+ types)
6. **Knowledge** - Vectors and semantics

No custom tables. No schema fragmentation. Just map your features to these 6 dimensions."

---

## Part 2: Write What You Want, The System Builds It (45 seconds)

### Plain English DSL Example

"Here's how simple it is:

**Example: Build a SaaS Landing Page**

```
WEBSITE: SaaS Landing Page

CREATE page at /
  ADD hero section with CTA button
  ADD features grid (3 columns)
  ADD pricing table (3 tiers)
  ADD testimonials carousel
  ADD FAQ accordion
  ADD footer with links

STYLE: Modern, clean, primary color blue
DEPLOY: To Cloudflare Pages
```

That's it.

The system builds the entire website from this—Astro pages, React components, responsive layout—and deploys it globally on Cloudflare's edge.

Sub-second page loads. 100% Lighthouse score. Production-ready."

---

## Part 3: Real Example - Sell Any Product (60 seconds)

### Template-Driven Development

"Let's refine this to build a page that sells **any product**.

**Step 1: Start with a Template**

We already have a production-ready template at:
`web/src/pages/shop/product-landing.astro`

This template includes:
- Product gallery with image zoom
- Pricing and variants
- Reviews section
- Urgency banners
- Mobile-optimized
- Dark mode support

**Step 2: Add Stripe Checkout**

Just paste your Stripe API keys:

```bash
# web/.env.local
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

Done. Payments work.

**Step 3: Upgrade with Chat**

Want to add AI chat to help customers?

```
ADD chat widget to product page
  CONNECT to OpenAI
  TRAIN on product details
  ENABLE voice input
```

The system adds a ChatGPT-style interface that knows your product inside and out."

---

## Part 4: The Competitive Advantage (45 seconds)

### Why ONE Platform is Different

**Traditional Development:**
- Write 500+ lines of code
- Configure 10+ services
- Debug for hours
- Deploy manually
- Hope it scales

**ONE Platform:**
- Write what you want in plain English
- System generates production code
- Deploys to Cloudflare's edge automatically
- Scales infinitely
- 100% free forever

**The Secret:** The 6-Dimension Ontology

Every feature—products, users, orders, chat, agents—maps to the same 6 dimensions.

No custom tables. No schema migrations. No refactoring.

Just add more Things, Connections, and Events."

---

## Part 5: Build Anything (30 seconds)

### Use Cases

"What can you build?

**E-commerce:**
- Product pages with Stripe
- Shopping cart
- Customer reviews
- Inventory management

**E-learning:**
- Course marketplace
- Student enrollment
- Progress tracking
- Certificates

**SaaS:**
- Landing pages
- Pricing tables
- User dashboards
- Subscription management

**AI Agents:**
- Customer support bots
- Content generation
- Research assistants
- Workflow automation

All using the same 6-dimension ontology."

---

## Part 6: Get Started (15 seconds)

### Call to Action

"Ready to build?

Visit **one.ie** to get started.

100% free forever.
No credit card required.
Deploy to production in minutes.

Bring your ideas to life with ONE Platform."

---

## Key Soundbites (for social/clips)

- "Write what you want. The system builds it."
- "100% free forever. Free license. Free hosting. Sub-second page loads."
- "Every system needs a coherent model of reality. ONE gives you 6 dimensions."
- "From plain English to production in minutes."
- "Template-driven development. Copy, customize, deploy."
- "Add Stripe with 2 lines of config. Add chat with 1 command."
- "Build anything: e-commerce, e-learning, SaaS, AI agents."
- "Scale from friend circles to global enterprises without changing your schema."

---

## Demo Flow (for screen recording)

### Part A: Landing Page Demo (2 minutes)

1. **Show the DSL input:**
   ```
   CREATE page at /
     ADD hero with CTA
     ADD features grid (3 columns)
     ADD pricing table
     ADD testimonials
   DEPLOY: Cloudflare Pages
   ```

2. **Show the generated code:**
   - Astro page structure
   - React components
   - Tailwind styling
   - Responsive layout

3. **Show the live site:**
   - Desktop view
   - Mobile view
   - Lighthouse score: 100/100
   - Load time: <1 second

### Part B: Product Page Demo (3 minutes)

1. **Show the template:**
   - Navigate to `web/src/pages/shop/product-landing.astro`
   - Highlight key sections

2. **Customize for a product:**
   - Change product name, price, images
   - Update description
   - Add variants (colors, sizes)

3. **Add Stripe:**
   - Show `.env.local` configuration
   - Test checkout flow
   - Show successful payment

4. **Add chat upgrade:**
   - Run command to add chat widget
   - Show chat interface
   - Demo voice input
   - Show product-aware responses

### Part C: Deployment Demo (1 minute)

1. **Deploy command:**
   ```bash
   bunx astro build
   wrangler pages deploy dist
   ```

2. **Show live URL:**
   - Global CDN distribution
   - Edge network locations
   - Performance metrics

3. **Show cost:**
   - **$0.00** - 100% free forever

---

## Visual Assets to Include

### Diagrams
- 6-dimension ontology diagram
- Data flow: Groups → People → Things → Connections → Events → Knowledge
- Template structure: Base → Customize → Deploy

### Code Examples
- Plain English DSL input
- Generated Astro code
- Stripe configuration
- Chat widget integration

### Metrics
- Lighthouse score: 100/100
- Page load: <1 second
- Lines of code: 0 (template-driven)
- Cost: $0.00 (free forever)

### Screenshots
- Product landing page (desktop + mobile)
- Chat interface
- Stripe checkout flow
- Cloudflare deployment dashboard

---

## Implementation Notes

**Video formats:**
1. **30-second teaser** (Opening Hook + Call to Action)
2. **3-minute product demo** (Parts 1-3 + Call to Action)
3. **10-minute deep dive** (All parts + full demo flow)
4. **15-minute tutorial** (Step-by-step with code walkthrough)

**Tone:**
- Confident but not arrogant
- Technical but accessible
- Fast-paced but clear
- Feature benefits over technical details

**Key message:**
"From idea to production-ready app in minutes, not weeks. 100% free forever."
