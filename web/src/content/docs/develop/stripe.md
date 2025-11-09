---
title: Stripe Payments
description: Quick setup guide for Stripe Checkout in ONE Platform
section: Develop
order: 4
tags:
  - stripe
  - payments
---

# Stripe Payments - Quick Start

## 1. Get Your API Keys

1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle **Test mode** ON (top right)
3. Navigate to **Developers → API Keys**
4. Copy both keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## 2. Add to Environment

Create `web/.env.local`:

```bash
# Stripe Test Keys
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** Never commit `.env.local` to git. No quotes around values.

## 3. Test Your Integration

### Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔐 3D Secure |
| `4000 0000 0000 9995` | ❌ Declined |

**All test cards:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

### Test Flow

1. Start dev server: `bun run dev`
2. Visit `/shop/product-landing`
3. Click "Buy Now"
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify redirect to thank you page

View test payments: [Dashboard → Payments](https://dashboard.stripe.com/test/payments)

## 4. Test vs Live Mode

| Type | When to use | How payments work | Test cards |
|------|-------------|-------------------|------------|
| **Test Mode** | Development and testing | Simulated - no real money processed | ✅ Use test cards only |
| **Live Mode** | Production - real customers | Real - card networks process actual payments | ✅ Accept real cards |

## 5. Go Live

### Production Checklist

1. **Get Live Keys:**
   - Toggle Test mode **OFF** in [Stripe Dashboard](https://dashboard.stripe.com)
   - Copy live keys (`pk_live_`, `sk_live_`)

2. **Update Environment:**
   ```bash
   # Production .env
   PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   PUBLIC_BASE_URL=https://yourdomain.com
   ```

3. **Verify Settings:**
   - [ ] HTTPS enabled (required)
   - [ ] Business name configured
   - [ ] Email receipts enabled
   - [ ] Stripe account verified
   - [ ] Test with real card (small amount)

4. **Deploy:**
   ```bash
   bun run build
   # Deploy to production
   ```

### Stripe Fees

- **2.9% + $0.30** per successful card charge
- No setup fees, monthly fees, or hidden costs

## Security Rules

1. ✅ **NEVER** commit secret keys to git
2. ✅ **ALWAYS** use HTTPS in production
3. ✅ **ALWAYS** validate on server-side
4. ✅ **ALWAYS** verify session on success page

## Help

- **Test Cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Dashboard:** [dashboard.stripe.com](https://dashboard.stripe.com)
- **Support:** [support.stripe.com](https://support.stripe.com)

---

**Ready in 5 minutes. Secure by default. Powered by Stripe.**
