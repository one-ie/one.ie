---
title: Buy in ChatGPT - FAQ
description: Frequently asked questions covering technical, business, integration, and pricing topics
category: Buy in ChatGPT
order: 8
tags:
  - faq
  - questions
  - answers
---

# Frequently Asked Questions

## Technical Questions

### What is the difference between ACP and regular Stripe?

**99% the same, one line different.**

Regular Stripe uses `payment_method`:

```typescript
stripe.paymentIntents.create({
  amount: 5900,
  currency: 'usd',
  payment_method: 'pm_card_visa',  // Regular Stripe
});
```

Buy in ChatGPT uses `shared_payment_granted_token`:

```typescript
stripe.paymentIntents.create({
  amount: 5900,
  currency: 'usd',
  shared_payment_granted_token: spt,  // ONE LINE DIFFERENT
});
```

Everything else - webhooks, refunds, reporting - is identical.

### Do I need a special Stripe account?

No! Your existing Stripe account works. Shared Payment Tokens (SPT) are available to all Stripe accounts at no extra cost.

### What languages/frameworks are supported?

**Any language that can:**
- Serve HTTP/HTTPS endpoints (REST API)
- Make HTTP requests to Stripe
- Parse/generate JSON

**Examples:**
- Node.js / TypeScript
- Python (FastAPI, Django)
- Ruby (Rails)
- PHP (Laravel)
- Go
- Java (Spring)

We provide TypeScript examples, but the protocol is language-agnostic.

### Can I use this with my existing e-commerce platform?

**Yes!** ACP works alongside your existing store:

- **Shopify:** Add ACP endpoints, keep Shopify admin
- **WooCommerce:** Install plugin (coming soon)
- **Custom platform:** Add 5 API endpoints

Customers can buy through ChatGPT OR your website - both work.

### How do I test without ChatGPT?

**Two ways:**

**1. Stripe Test Helpers:**

```bash
# Create test SPT
curl -X POST https://api.stripe.com/v1/test_helpers/shared_payment_granted_tokens \
  -u sk_test_xxxxxxxxxxxxxxxxxxxxx: \
  -d amount=5900 \
  -d currency=usd \
  -d payment_method=pm_card_visa
```

**2. Use our mock ChatGPT simulator:**

```bash
# Coming soon
npm install @one/acp-simulator
acp-simulate checkout --product product-1
```

### What happens if my API goes down?

ChatGPT handles gracefully:

1. Retries request (3 times with exponential backoff)
2. Falls back to "View on website" link
3. Shows user-friendly error: "Store temporarily unavailable"

Your uptime SLA = Customer experience.

**Recommendation:** 99.9% uptime (use Cloudflare Workers + Convex for auto-scaling).

### Can I customize the checkout flow?

**Yes and No:**

**What you CAN customize:**
- Product catalog (your data)
- Shipping options (your rates)
- Tax calculation (your logic)
- Order fulfillment (your process)
- Email confirmations (your design)

**What you CANNOT customize:**
- ChatGPT UI (controlled by OpenAI)
- Payment interface (controlled by Stripe)
- Conversation flow (controlled by ChatGPT)

Think of it as: **You control commerce, ChatGPT controls conversation.**

### How do refunds work?

**Exactly like regular Stripe:**

```typescript
// Refund via Stripe Dashboard
// OR
const refund = await stripe.refunds.create({
  payment_intent: 'pi_1234567890',
  amount: 5900,  // Full or partial
});
```

Customer sees refund in 5-10 business days (bank-dependent).

ChatGPT doesn't handle refunds - you process through Stripe as normal.

---

## Business Questions

### Why 33% conversion vs 2.1%?

**Traditional e-commerce fails at three points:**

1. **Discovery:** Customer doesn't know what to buy (98% leave)
2. **Decision:** Customer unsure if product fits needs (60% abandon cart)
3. **Checkout:** Complex forms create friction (30% abandon)

**Buy in ChatGPT fixes all three:**

1. **AI Consultation:** "What should I buy?" → Personalized recommendation
2. **Expert Guidance:** "Will this work for me?" → AI explains why it fits
3. **Instant Checkout:** Zero forms, payment pre-authorized, done in 60 seconds

**Result:** 33% of conversations → purchases (15.7x better than 2.1%)

### What products work best?

**Ideal Products:**

**High-consideration purchases:**
- Electronics ($100+)
- Fashion and beauty
- Home goods and furniture
- Professional tools
- Gifts (recipient-specific needs)
- Online courses
- SaaS subscriptions

**Consultation-heavy products:**
- Technical specifications matter
- Multiple options to choose from
- Personalization is valuable
- "Which one is right for me?"

**Not Ideal:**

- Commodity products (customer knows exactly what they want)
- Ultra-low-margin items (<$10)
- Age-restricted (alcohol, tobacco)
- Prescription drugs

### How much revenue increase can I expect?

**Conservative estimates:**

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Conversion rate | 2.1% | 33% | **+15.7x** |
| Average order value | $50 | $62.50 | **+25%** |
| Revenue per 1000 visitors | $1,050 | $20,625 | **+19.6x** |

**Example:**
- 10,000 monthly visitors
- Before: $10,500/month revenue
- After: $206,250/month revenue
- **Increase: $195,750/month**

**Real-world factors:**
- Your current conversion rate
- Product catalog quality
- Product pricing
- Target audience
- Marketing channels

### What are the costs?

**Stripe Fees:**
- 2.9% + $0.30 per transaction (standard Stripe rates)
- No additional ACP fees
- Volume discounts available (contact Stripe)

**Platform Costs:**
- ONE Platform: Free (open source)
- Hosting: $5-50/month (Cloudflare + Convex free tiers work)
- API: Free (no per-request fees)

**Total Cost Example:**

- 100 sales/month @ $50 average
- Revenue: $5,000
- Stripe fees: $175 (3.5% effective)
- Hosting: $10
- **Total cost: $185 (3.7% of revenue)**

**ROI:**
- Traditional e-commerce: $5,000 revenue from 238,095 visitors (2.1% conversion)
- Buy in ChatGPT: $5,000 revenue from 15,152 visitors (33% conversion)
- **94% reduction in customer acquisition cost**

### Do I need to build a chatbot?

**No!** ChatGPT is the chatbot. You just provide:

1. Product catalog (JSON feed)
2. 5 API endpoints (checkout flow)
3. Stripe integration (payment processing)

ChatGPT handles:
- Natural language understanding
- Product recommendations
- Conversation flow
- Payment collection
- Order confirmation

**You focus on:** Products, fulfillment, customer service.

### Can I use this on my website?

**Yes!** ACP works in multiple contexts:

**ChatGPT (Primary):**
- Customer chats in ChatGPT
- Buys without leaving conversation

**Your Website (Embeddable):**
```astro
<CommerceWidget
  client:only="react"
  category="products"
/>
```

**Mobile App:**
- Integrate ChatGPT SDK
- Same API endpoints work

**Voice (Coming Soon):**
- "Hey Siri, find me a padel racket"
- Uses same ACP protocol

### What about customer data and privacy?

**Data Flow:**

1. **Customer → ChatGPT:** Name, address, payment (Stripe SPT)
2. **ChatGPT → Your API:** Name, address, SPT (encrypted HTTPS)
3. **Your API → Stripe:** SPT (single-use, amount-scoped)
4. **You Store:** Order details (NOT payment methods)

**Privacy Guarantees:**

- You NEVER see raw card numbers (PCI-compliant by default)
- SPTs are single-use and expire after 15 minutes
- Customer data encrypted in transit (HTTPS)
- GDPR-compliant (customer controls data in ChatGPT)

**Your Responsibility:**

- Secure order data in your database
- Provide privacy policy (required for checkout)
- Honor data deletion requests (GDPR)
- Encrypt sensitive data at rest

---

## Integration Questions

### How long does integration take?

**Timeline:**

- **Quick Start:** 15 minutes (basic product feed + mock checkout)
- **Full Integration:** 2-4 hours (real products + Stripe + webhooks)
- **Production Ready:** 1-2 days (testing + legal docs + monitoring)
- **Custom Features:** 1-2 weeks (advanced shipping/tax, multi-currency, etc.)

**Factors:**

- Existing platform complexity
- Product catalog size
- Custom business logic
- Team experience with APIs

### What technical skills are required?

**Minimum:**

- Basic API development (REST endpoints)
- Environment configuration (.env files)
- Command line basics (curl, git)
- JSON understanding

**Helpful but not required:**

- TypeScript/JavaScript
- React (for custom UI)
- Database queries (SQL/NoSQL)
- Stripe integration experience

**Can hire developer:** Most freelancers can integrate in 4-8 hours ($200-800).

### Do I need to migrate my existing data?

**No!** ACP reads from your existing database:

```typescript
// Keep your existing database
const products = await db.query.products.findMany();

// Transform to ACP format
const feed = {
  products: products.map(p => ({
    id: p.id,
    title: p.name,
    price: `${p.price} USD`,
    // ... other fields
  })),
};
```

**No data migration required.**

### Can I use a different payment processor?

**Technically yes, but:**

- Stripe Shared Payment Tokens are Stripe-specific
- ChatGPT currently only supports Stripe SPT
- Other processors coming later (PayPal, Square, etc.)

**For now:** Stripe is required for ChatGPT Instant Checkout.

**Alternative:** Use "View on website" fallback for non-Stripe payments.

### How do I handle multiple currencies?

**Option 1: Single Currency (Simple)**

```typescript
{
  price: '49.99 USD',  // All products in USD
  currency: 'usd',
}
```

Stripe handles currency conversion automatically.

**Option 2: Multi-Currency (Advanced)**

```typescript
{
  price: customer.currency === 'EUR' ? '45.99 EUR' : '49.99 USD',
  currency: customer.currency.toLowerCase(),
}
```

Or use `geo_price` field:

```typescript
{
  geo_price: [
    'US:49.99 USD',
    'GB:39.99 GBP',
    'EU:45.99 EUR',
  ],
}
```

ChatGPT detects customer location and shows local price.

### Can I offer subscriptions?

**Yes!** Use Stripe Subscriptions:

```typescript
// Product feed
{
  id: 'subscription-pro',
  title: 'Pro Plan Subscription',
  price: '29.99 USD',  // Per month
  custom_variant1_category: 'Billing',
  custom_variant1_option: 'Monthly',
}

// Create subscription instead of one-time payment
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_monthly_pro' }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

**Recurring billing handled by Stripe.**

---

## Pricing Questions

### Is there a per-transaction fee for ACP?

**No!** ACP is a free protocol. You only pay:

- Stripe's standard fees (2.9% + $0.30)
- Your hosting costs
- No ACP-specific fees
- No ChatGPT fees (for commerce)

### What are Stripe's fees?

**Standard Rates:**

- **Card payments:** 2.9% + $0.30 per transaction
- **International cards:** +1% extra
- **Currency conversion:** +1% extra

**Volume Discounts:**

- High volume? Contact Stripe for custom rates
- Typically available at $1M+ annual processing

**No Monthly Fees:**

- No setup fee
- No monthly minimums
- No hidden costs

### Are there any hidden costs?

**No hidden costs, but consider:**

**Direct Costs:**
- Stripe fees: 2.9% + $0.30 per transaction
- Hosting: $5-50/month (free tiers available)
- Domain: $12/year
- SSL certificate: Free (Let's Encrypt)

**Indirect Costs:**
- Development time: 2-4 hours for basic integration
- Maintenance: ~1 hour/month
- Customer support: Email/phone for order issues

**Savings:**
- No shopping cart abandonment recovery tools ($50-200/month)
- No complex checkout optimization ($100-500/month)
- No chatbot development ($5,000-50,000)
- Lower customer acquisition cost (15.7x better conversion)

### How does pricing compare to traditional e-commerce?

**Traditional E-commerce Stack:**

- Platform: $30-300/month (Shopify, BigCommerce)
- Payment processor: 2.9% + $0.30
- Abandoned cart recovery: $50-200/month
- Live chat: $50-100/month
- Email marketing: $50-300/month
- **Total: $180-900/month + 2.9% per transaction**

**Buy in ChatGPT:**

- Platform: $0 (open source)
- Payment processor: 2.9% + $0.30 (Stripe)
- Hosting: $5-50/month
- **Total: $5-50/month + 2.9% per transaction**

**Savings: $175-850/month + 15.7x higher conversion**

### Can I offer discounts and promotions?

**Yes!** Multiple ways:

**1. Sale Pricing:**

```typescript
{
  price: '49.99 USD',
  sale_price: '39.99 USD',  // 20% off
}
```

**2. Promo Codes:**

```typescript
// Customer enters code in ChatGPT
// Your API validates and applies discount
const discount = validatePromoCode(code);
lineItems.discount = discount;
```

**3. Bundle Pricing:**

```typescript
// "Buy 2, get 10% off"
if (quantity >= 2) {
  discount = subtotal * 0.10;
}
```

**4. Stripe Coupons:**

```typescript
const coupon = await stripe.coupons.create({
  percent_off: 20,
  duration: 'once',
});
```

---

## Support Questions

### Where can I get help?

**Documentation:**
- This FAQ
- [Integration Guide](/docs/buy-in-chatgpt/integration-guide)
- [API Reference](/docs/buy-in-chatgpt/api-reference)
- [Troubleshooting](/docs/buy-in-chatgpt/troubleshooting)

**Stripe Support:**
- Dashboard: [dashboard.stripe.com/support](https://dashboard.stripe.com/support)
- Docs: [docs.stripe.com/agentic-commerce](https://docs.stripe.com/agentic-commerce)

**Community:**
- GitHub Issues: Report bugs
- Discord: Ask questions (coming soon)
- Stack Overflow: Tag `agentic-commerce`

### How do I report a bug?

**GitHub Issues:**

1. Go to repository
2. Click "Issues" → "New Issue"
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error messages
   - Environment (OS, Node version, etc.)

**Security Issues:**

Email security@one.ie (do NOT post publicly)

### Is there a staging environment?

**Yes!** Use Stripe test mode:

1. Toggle "Test mode" in Stripe Dashboard
2. Use test API keys (sk_test_...)
3. Test with test cards (4242 4242 4242 4242)
4. All webhooks/events work in test mode

**No separate staging needed** - test mode IS staging.

### How do I migrate from test to production?

**Checklist:**

1. **Get live Stripe keys:**
   - Toggle test mode OFF
   - Copy pk_live_ and sk_live_ keys

2. **Update environment:**
   ```bash
   PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Register production webhook:**
   - URL: https://yourdomain.com/api/webhooks/stripe
   - Copy signing secret

4. **Test with real card:**
   - Small amount ($1)
   - Verify webhook received
   - Refund test transaction

5. **Go live:**
   - Update ChatGPT with production API URL
   - Monitor logs for 24 hours

### What SLA do you offer?

**ONE Platform (Open Source):**
- No formal SLA
- Community support
- GitHub issues
- Best-effort response

**For Enterprise:**
- Contact us for dedicated support
- Custom SLAs available
- 24/7 on-call support
- Guaranteed response times

---

## Future Questions

### Will other AI platforms support ACP?

**Likely yes:**

- **Claude:** Anthropic exploring commerce
- **Gemini:** Google has commerce history
- **Meta AI:** Instagram Shopping integration possible

**ACP is an open standard** - any AI can implement it.

### What features are coming?

**2025 Roadmap:**

- Voice commerce (Siri, Alexa integration)
- Image recognition ("Find me this product")
- Multi-language support
- Subscription management
- B2B commerce features
- Advanced analytics

### Can I sell digital products?

**Yes!** Same flow, different fulfillment:

```typescript
// Digital product
{
  id: 'ebook-pdf',
  title: 'Complete Guide to Padel',
  price: '19.99 USD',
  fulfillment_options: [
    {
      type: 'digital',  // ← Digital delivery
      id: 'instant_download',
      title: 'Instant Download',
      subtitle: 'Available immediately',
      subtotal: 0,  // No shipping cost
      delivery_estimate: new Date().toISOString(),  // Now
    }
  ],
}

// After payment, send download link
await sendEmail({
  to: buyer.email,
  subject: 'Your download is ready',
  body: `Download: https://yourdomain.com/downloads/${orderId}`,
});
```

### Can I use this for B2B sales?

**Yes!** Add B2B-specific fields:

```typescript
{
  // B2B product
  id: 'enterprise-license',
  title: 'Enterprise Software License',
  price: '5000.00 USD',

  // B2B specific
  custom_variant1_category: 'Users',
  custom_variant1_option: '100 seats',
  custom_variant2_category: 'Billing',
  custom_variant2_option: 'Annual',

  // B2B buyer info
  buyer: {
    company_name: 'Acme Corp',
    tax_id: 'US123456789',
    email: 'procurement@acme.com',
  },
}
```

**Additional features:**
- Net 30 payment terms
- Purchase orders
- Bulk pricing
- Custom contracts

---

## Quick Answers

**Q: Does this work with Shopify?**
A: Yes! Add ACP endpoints alongside Shopify.

**Q: Can customers pay with Apple Pay?**
A: Yes! Stripe SPT supports all payment methods.

**Q: Is this PCI compliant?**
A: Yes! You never handle card data (Stripe does).

**Q: What if customer changes mind?**
A: Standard refunds via Stripe Dashboard.

**Q: Does this work internationally?**
A: Yes! 135+ currencies, automatic currency conversion.

**Q: Can I customize the ChatGPT conversation?**
A: No, but you control product data and business logic.

**Q: Is there a mobile app?**
A: ChatGPT mobile app supports checkout.

**Q: What about taxes?**
A: You calculate (Stripe Tax integration supported).

**Q: How do I track conversions?**
A: Every purchase includes sessionId and source.

**Q: Can I A/B test?**
A: Yes! Vary product descriptions, pricing, images.

---

**Still have questions?** Check our [Integration Guide](/docs/buy-in-chatgpt/integration-guide) or [Troubleshooting](/docs/buy-in-chatgpt/troubleshooting) docs.
