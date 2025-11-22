---
title: Refund System Usage Guide
dimension: knowledge
category: guides
tags: payments, refunds, stripe, howto
related_dimensions: things, connections, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document provides a usage guide for the refund system.
  Location: one/knowledge/refund-system-guide.md
  Purpose: Explains how to process refunds and handle disputes
  Related dimensions: things (payments), connections (refund links), events (refund_processed)
  For AI agents: Read this to understand how to use the refund system.
---

# Refund System Usage Guide

**Version:** 1.0.0
**Cycle:** 88
**Status:** Complete

---

## Overview

The ONE Platform refund system provides complete refund processing capabilities through Stripe, including full refunds, partial refunds, and dispute handling.

---

## Processing Refunds

### Full Refund

**Use case:** Customer requests complete refund of their purchase.

**Steps:**
1. Navigate to the payment in your admin panel
2. Click "Refund" button
3. Select "Full Refund" from dropdown
4. Choose refund reason:
   - **Requested by Customer** - Customer asked for refund
   - **Duplicate Payment** - Payment was processed twice
   - **Fraudulent** - Suspected fraud
   - **Other** - Any other reason
5. Add optional notes for your records
6. Click "Refund [amount]" button
7. Refund processes immediately

**What happens:**
- Stripe immediately processes the refund
- Original payment status changes to "refunded"
- Refund appears in your refunds list
- Customer receives refund in 5-10 business days
- `refund_processed` event is logged

### Partial Refund

**Use case:** Refund only part of the payment amount.

**Steps:**
1. Navigate to the payment in your admin panel
2. Click "Refund" button
3. Select "Partial Refund" from dropdown
4. Enter refund amount (must be less than payment amount)
5. Choose refund reason
6. Add optional notes
7. Click "Refund [amount]" button

**Validation:**
- Amount must be greater than $0.01
- Amount must be less than or equal to payment amount
- Amount must be less than or equal to available refund amount
- Multiple partial refunds allowed (up to full payment amount)

**What happens:**
- Stripe processes partial refund
- Original payment tracks total refunded amount
- Payment remains "active" until fully refunded
- Can process additional partial refunds later

---

## Viewing Refunds

### Refund Management Page

**URL:** `/orders/[orderId]/refund`

**Features:**
- **Analytics Dashboard:** 4 metric cards showing refund statistics
- **Refund Reasons Chart:** Breakdown by reason type
- **Recent Refunds Table:** All refunds with details

### Analytics Cards

1. **Total Refunds**
   - Shows total number of refunds
   - Breakdown: full vs partial refunds

2. **Refunded Amount**
   - Total amount refunded
   - Percentage of total revenue

3. **Refund Rate**
   - Percentage of orders refunded
   - Number of refunded orders vs total orders

4. **Average Refund**
   - Average refund amount per transaction

---

## Handling Disputes

### When Stripe Notifies of Dispute

**What is a dispute?**
A dispute (chargeback) occurs when a customer contacts their bank to reverse a payment, claiming it was unauthorized or fraudulent.

**Steps to respond:**
1. Receive dispute notification from Stripe webhook
2. Navigate to the disputed payment
3. Click "Submit Evidence" button
4. Fill out evidence form:
   - **Customer Name:** Full name of customer
   - **Customer Email:** Email used for purchase
   - **Customer IP Address:** IP at time of purchase
   - **Product Description:** Detailed description of what was purchased
   - **Refund Policy:** Your refund policy terms
   - **Cancellation Policy:** Your cancellation terms
   - **Customer Communication:** Emails or messages with customer
5. Click "Submit Evidence"
6. Wait for Stripe/bank to review

**Timeline:**
- Evidence submission deadline: Typically 7-21 days from dispute creation
- Review period: 60-75 days
- Outcome: Win (funds returned) or Lose (customer keeps refund + dispute fee)

**Best practices:**
- Submit evidence ASAP (don't wait for deadline)
- Include all relevant documentation
- Be factual and concise
- Include screenshots of emails, receipts, delivery confirmation

---

## API Reference

### Process Refund

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const processRefund = useMutation(api.mutations.payments.processRefund);

// Full refund
await processRefund({
  paymentId: "payment_123",
  reason: "requested_by_customer",
  notes: "Customer requested refund via email"
});

// Partial refund (amount in cents)
await processRefund({
  paymentId: "payment_123",
  amount: 2500, // $25.00
  reason: "requested_by_customer",
  notes: "Partial refund for damaged item"
});
```

### List Refunds

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// List refunds for specific payment
const paymentRefunds = useQuery(
  api.queries.payments.listPaymentRefunds,
  { paymentId: "payment_123" }
);

// List all organization refunds
const allRefunds = useQuery(
  api.queries.payments.listOrganizationRefunds,
  { status: "published", limit: 50 }
);

// Get refund analytics
const analytics = useQuery(
  api.queries.payments.getRefundAnalytics,
  {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
    endDate: Date.now()
  }
);
```

### Handle Dispute

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const handleDispute = useMutation(api.mutations.payments.handleDispute);

await handleDispute({
  paymentId: "payment_123",
  disputeId: "dp_abc123",
  evidence: {
    customerName: "John Doe",
    customerEmailAddress: "john@example.com",
    customerPurchaseIp: "192.168.1.1",
    productDescription: "Premium Course Access",
    refundPolicy: "30-day money back guarantee",
    customerCommunication: "Email confirming purchase and access"
  }
});
```

---

## Refund Reasons

### Available Reasons

1. **Requested by Customer** (`requested_by_customer`)
   - Most common reason
   - Customer asked for refund
   - Use when customer is unhappy or changed mind

2. **Duplicate Payment** (`duplicate`)
   - Payment was processed twice
   - Technical error or customer mistake
   - Use when obvious duplicate exists

3. **Fraudulent** (`fraudulent`)
   - Suspected fraud or unauthorized transaction
   - Use when payment appears suspicious
   - Helps Stripe detect fraud patterns

4. **Other** (`other`)
   - Any reason not covered above
   - Use notes field to provide details

---

## Best Practices

### Refund Processing

1. **Review Before Refunding**
   - Check payment status (must be "succeeded")
   - Verify refund amount is correct
   - Ensure payment hasn't already been refunded

2. **Add Notes**
   - Always add notes for your records
   - Include customer request reference
   - Note any special circumstances

3. **Communicate with Customer**
   - Let customer know refund has been processed
   - Explain 5-10 business day timeline
   - Provide refund reference number

4. **Monitor Refund Rate**
   - Track refund rate in analytics dashboard
   - Investigate if refund rate exceeds 5-10%
   - Identify patterns (specific products, time periods)

### Dispute Prevention

1. **Clear Product Descriptions**
   - Be specific about what customer receives
   - Include screenshots and examples
   - Set clear expectations

2. **Good Customer Service**
   - Respond to customer inquiries quickly
   - Offer refund before customer disputes
   - Keep communication records

3. **Recognize Customers**
   - Use Stripe's fraud detection
   - Require email verification
   - Track suspicious patterns

4. **Clear Policies**
   - Post refund policy prominently
   - Include cancellation terms
   - Make policies easy to find

---

## Troubleshooting

### "Payment has already been fully refunded"
- Payment cannot be refunded more than once (full refund)
- Check if refund was already processed
- Review refund history for this payment

### "Refund amount exceeds available amount"
- Partial refund amount too high
- Check total already refunded
- Calculate: payment amount - total refunded = available amount

### "Cannot refund payment with status: [status]"
- Payment must be in "succeeded" status
- Check payment status in Stripe
- Ensure payment wasn't already refunded or failed

### "Refund failed - contact support"
- Stripe API error
- Check Stripe dashboard for details
- Verify Stripe account is active
- Contact Stripe support if needed

---

## Related Documentation

- **Cycle 88 Implementation:** `/one/events/cycle-088-refund-processing.md`
- **Payment Processing:** `/one/events/cycle-087-payment-processing.md`
- **Stripe Integration:** `/backend/convex/services/payments/stripe.ts`
- **Refund Service:** `/backend/convex/services/payments/refunds.ts`

---

## Support

For refund system issues:
1. Check troubleshooting section above
2. Review Stripe dashboard for errors
3. Check event logs for `refund_processed` events
4. Contact platform support with payment ID

---

**Last Updated:** 2025-11-22
**Maintained By:** Backend Specialist Agent
