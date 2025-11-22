---
title: Cycle 88 - Refund Processing Implementation
dimension: events
category: deployment
tags: payments, refunds, stripe, cycle-088
related_dimensions: things, connections, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document records the implementation of Cycle 88: Refund Processing.
  Location: one/events/cycle-088-refund-processing.md
  Purpose: Documents refund system implementation
  Related dimensions: things (payments), connections (refund relations), events (refund_processed)
  For AI agents: Read this to understand refund processing implementation.
---

# Cycle 88: Refund Processing Implementation

**Status:** Complete
**Date:** 2025-11-22
**Lead:** Backend Specialist Agent

---

## Overview

Implemented a complete refund processing system with full/partial refund support, dispute handling, and analytics tracking using the 6-dimension ontology.

## Implementation Summary

### 1. Backend Service Layer (Effect.ts)

**File:** `/backend/convex/services/payments/refunds.ts`

**Features:**
- Full and partial refund creation
- Refund validation and status tracking
- Dispute evidence submission
- Refund analytics calculation

**Key Functions:**
```typescript
RefundService.createRefund()        // Create full or partial refund
RefundService.validateRefundRequest() // Validate refund is possible
RefundService.updateDisputeEvidence() // Submit dispute evidence
RefundService.calculateRefundAnalytics() // Calculate refund metrics
```

**Error Types:**
- `RefundError` - Refund operation failures
- `DisputeError` - Dispute handling failures
- `RefundAnalyticsError` - Analytics calculation failures

### 2. Backend Mutations

**File:** `/backend/convex/mutations/payments.ts`

**New Mutations:**

1. **`processRefund`** - Process full or partial refund
   - Validates payment belongs to user's group
   - Validates refund amount (if partial)
   - Creates refund thing in database
   - Updates original payment with refund status
   - Creates connection between refund and payment
   - Logs `refund_processed` event

2. **`getRefundStatus`** - Check refund status
   - Retrieves latest status from Stripe
   - Updates database if status changed
   - Logs status change events

3. **`handleDispute`** - Submit dispute evidence
   - Validates payment access
   - Submits evidence to Stripe
   - Updates payment with dispute info
   - Logs dispute response event

### 3. Backend Queries

**File:** `/backend/convex/queries/payments.ts`

**New Queries:**

1. **`listPaymentRefunds`** - List refunds for a payment
   - Returns all refunds linked to specific payment
   - Includes refund status and amounts

2. **`getRefundAnalytics`** - Get refund analytics
   - Total refunds and amounts
   - Refund rate calculation
   - Refunds grouped by reason
   - Partial vs full refund breakdown

3. **`listOrganizationRefunds`** - List all refunds for org
   - Returns all refunds for organization
   - Enriched with original payment data
   - Sorted by date (newest first)

### 4. Frontend Components

**File:** `/web/src/components/payments/RefundModal.tsx`

**Features:**
- Full refund option
- Partial refund with amount validation
- Refund reason dropdown (4 options)
- Optional notes field
- Real-time validation
- Success/error feedback

**Refund Reasons:**
- `requested_by_customer` - Customer Request
- `duplicate` - Duplicate Payment
- `fraudulent` - Fraudulent
- `other` - Other

### 5. Frontend Page

**File:** `/web/src/pages/orders/[orderId]/refund.astro`

**Features:**
- Refund analytics dashboard (4 cards)
- Refund reasons breakdown chart
- Recent refunds table
- Status badges (succeeded, pending, failed)
- Currency formatting
- Date formatting

**Analytics Cards:**
1. Total Refunds (full vs partial count)
2. Refunded Amount (% of total revenue)
3. Refund Rate (% of orders)
4. Average Refund (per transaction)

### 6. Schema Updates

**File:** `/backend/convex/schema.ts`

**New Event Types:**
- `refund_processed` - Logged when refund is created
- `dispute_evidence_submitted` - Logged when dispute evidence submitted

**Thing Type:** `payment` (reused for refunds)
- Refunds stored as payment things with `stripeRefundId` property
- Original payments updated with refund status

**Connection Type:** `references`
- Links refund thing to original payment thing
- Metadata includes `connectionType: "refund_for_payment"`

---

## 6-Dimension Ontology Mapping

### Dimension 1: Groups (Multi-Tenant Isolation)
- All refunds scoped by `groupId`
- Mutations validate group access
- Queries filter by user's group

### Dimension 2: People (Authorization)
- Refunds processed by authenticated user (actorId)
- Role-based access control (future: org_owner only)

### Dimension 3: Things (Entities)
- **Payment Things:** Original payments
- **Refund Things:** Refunds as payment type with `stripeRefundId`
- Properties track: amount, currency, reason, status, notes

### Dimension 4: Connections (Relationships)
- **references** connection: Refund → Original Payment
- Metadata includes refund amount and reason

### Dimension 5: Events (Audit Trail)
- `refund_processed` - Full refund lifecycle tracking
- `dispute_evidence_submitted` - Dispute handling
- `entity_updated` - Refund status changes

### Dimension 6: Knowledge (Analytics)
- Refund rate calculations
- Reason-based grouping
- Partial vs full refund metrics
- Average refund amount tracking

---

## API Endpoints

### Mutations
```typescript
// Process refund (full or partial)
api.mutations.payments.processRefund({
  paymentId: Id<"things">,
  amount?: number,        // Optional for partial (in cents)
  reason?: RefundReason,
  notes?: string
})

// Get refund status
api.mutations.payments.getRefundStatus({
  refundId: Id<"things">
})

// Handle dispute
api.mutations.payments.handleDispute({
  paymentId: Id<"things">,
  disputeId: string,
  evidence: {
    customerName?: string,
    customerEmailAddress?: string,
    productDescription?: string,
    refundPolicy?: string,
    // ... more evidence fields
  }
})
```

### Queries
```typescript
// List refunds for payment
api.queries.payments.listPaymentRefunds({
  paymentId: Id<"things">
})

// Get refund analytics
api.queries.payments.getRefundAnalytics({
  startDate?: number,
  endDate?: number
})

// List all organization refunds
api.queries.payments.listOrganizationRefunds({
  status?: string,
  limit?: number
})
```

---

## Data Flow

### Full Refund Flow
1. User clicks "Refund" on payment
2. RefundModal opens with payment details
3. User selects "Full Refund" and reason
4. Frontend calls `processRefund` mutation (no amount)
5. Backend validates payment access
6. Backend creates Stripe refund (full amount)
7. Backend creates refund thing
8. Backend updates original payment (`fullyRefunded: true`)
9. Backend creates connection (refund → payment)
10. Backend logs `refund_processed` event
11. Frontend shows success message

### Partial Refund Flow
1. User clicks "Refund" on payment
2. RefundModal opens with payment details
3. User selects "Partial Refund" and enters amount
4. Frontend validates amount <= payment amount
5. Frontend calls `processRefund` mutation (with amount in cents)
6. Backend validates payment access and amount
7. Backend creates Stripe refund (partial amount)
8. Backend creates refund thing (`isPartialRefund: true`)
9. Backend updates original payment (`totalRefunded` += amount)
10. Backend creates connection (refund → payment)
11. Backend logs `refund_processed` event
12. Frontend shows success message

### Dispute Flow
1. Stripe notifies webhook of dispute
2. Admin navigates to payment details
3. Admin clicks "Submit Evidence"
4. Frontend calls `handleDispute` mutation
5. Backend validates payment access
6. Backend submits evidence to Stripe
7. Backend updates payment with dispute status
8. Backend logs `dispute_evidence_submitted` event
9. Stripe reviews evidence and resolves dispute

---

## Validation Rules

### Refund Validation
- Payment must be in "succeeded" status
- Payment must not be fully refunded
- Partial amount must be > 0
- Partial amount must be <= payment amount
- Partial amount must be <= available refund amount

### Group Validation
- Payment must belong to user's group
- Refund thing inherits payment's groupId
- All queries filter by user's group

---

## Event Metadata Structure

### refund_processed
```typescript
{
  protocol: "stripe",
  originalPaymentId: Id<"things">,
  stripeRefundId: string,
  amount: number,
  currency: string,
  reason: RefundReason,
  isPartial: boolean,
  fullyRefunded: boolean,
  groupId: Id<"groups">
}
```

### dispute_evidence_submitted
```typescript
{
  protocol: "stripe",
  eventType: "dispute_evidence_submitted",
  disputeId: string,
  disputeStatus: string,
  groupId: Id<"groups">
}
```

---

## Testing Checklist

- [x] Full refund processing
- [x] Partial refund processing
- [x] Refund amount validation
- [x] Refund reason selection
- [x] Refund status tracking
- [x] Dispute evidence submission
- [x] Refund analytics calculation
- [x] Multi-tenant isolation
- [x] Event logging
- [x] Connection creation
- [x] Currency formatting
- [x] Date formatting

---

## Future Enhancements

1. **Automatic Refund Approval**
   - Set refund amount thresholds
   - Auto-approve small refunds
   - Require approval for large refunds

2. **Refund Templates**
   - Pre-defined refund reasons with templates
   - Custom refund policies per product
   - Automated refund eligibility checks

3. **Advanced Dispute Handling**
   - Upload dispute evidence files
   - Track dispute resolution timeline
   - Automatic evidence compilation

4. **Refund Analytics**
   - Refund trends over time
   - Product-specific refund rates
   - Customer refund history
   - Fraud detection patterns

5. **Webhook Enhancements**
   - Handle `charge.refunded` webhook
   - Handle `charge.dispute.created` webhook
   - Handle `charge.dispute.closed` webhook

---

## Files Created/Modified

### Created
1. `/backend/convex/services/payments/refunds.ts` - Refund service layer
2. `/web/src/components/payments/RefundModal.tsx` - Refund modal component
3. `/web/src/pages/orders/[orderId]/refund.astro` - Refund management page
4. `/one/events/cycle-088-refund-processing.md` - This document

### Modified
1. `/backend/convex/mutations/payments.ts` - Added refund mutations
2. `/backend/convex/queries/payments.ts` - Added refund queries
3. `/backend/convex/schema.ts` - Added refund event types

---

## Lessons Learned

1. **Refund vs Payment Things**
   - Initially considered separate `refund` thing type
   - Decided to reuse `payment` type with `stripeRefundId` property
   - Simplifies queries and maintains payment/refund relationship

2. **Partial Refund Tracking**
   - Track `totalRefunded` on original payment
   - Track `isPartialRefund` flag on refund thing
   - Enables multiple partial refunds per payment

3. **Refund Reasons**
   - Limited to 4 Stripe-compatible reasons
   - Added `notes` field for additional context
   - Enables analytics and fraud detection

4. **Effect.ts Validation**
   - `validateRefundRequest` checks payment status and available amount
   - Prevents duplicate refunds and over-refunding
   - Returns clear error messages for users

5. **Connection Type**
   - Used `references` relationship type (existing)
   - Added `connectionType: "refund_for_payment"` in metadata
   - Enables filtering refund connections from other references

---

## Related Cycles

- **Cycle 87:** Payment Processing (prerequisite)
- **Cycle 89:** Analytics Dashboard (next)

---

**Implementation Complete:** 2025-11-22
**Backend Specialist Agent:** Pattern convergence achieved. Refund system follows 6-dimension ontology.
