# ACP Compliance Review: Implementation vs Stripe Official Spec

**Date:** 2025-11-14
**Status:** Under Review
**Implementation:** OpenAI-based spec
**Target:** Stripe official ACP spec

## Executive Summary

Our implementation follows the **OpenAI Agentic Checkout specification** which differs slightly from **Stripe's official ACP specification**. This document outlines the differences and provides recommendations.

## Endpoint Comparison

### Current Implementation (OpenAI Spec)
```
POST   /api/checkout_sessions           - Create
POST   /api/checkout_sessions/[id]      - Update (⚠️ uses POST)
GET    /api/checkout_sessions/[id]      - Retrieve
POST   /api/checkout_sessions/[id]/complete - Complete
POST   /api/checkout_sessions/[id]/cancel   - Cancel
```

### Stripe Official Spec
```
POST   /checkouts           - Create
PUT    /checkouts/:id       - Update (⚠️ uses PUT)
GET    /checkouts/:id       - Retrieve
POST   /checkouts/:id/complete - Complete
POST   /checkouts/:id/cancel   - Cancel
```

## Key Differences

### 1. Endpoint Paths
- **Implemented:** `/checkout_sessions`
- **Stripe Spec:** `/checkouts`
- **Impact:** Medium - Affects API routing
- **Recommendation:** Support both paths for compatibility

### 2. Update HTTP Method
- **Implemented:** `POST /checkout_sessions/[id]`
- **Stripe Spec:** `PUT /checkouts/:id`
- **Impact:** Medium - RESTful semantics
- **Recommendation:** Support both POST and PUT methods

### 3. Field Naming - Buyer
- **Implemented:**
  ```typescript
  {
    first_name: string
    last_name: string
    email: string
    phone_number?: string
  }
  ```
- **Stripe Spec:**
  ```typescript
  {
    fore_name: string    // ⚠️ Different
    sur_name: string     // ⚠️ Different
    email: string
    phone_number?: string
  }
  ```
- **Impact:** HIGH - Data contract mismatch
- **Recommendation:** Accept both formats, normalize internally

### 4. Field Spelling - Fulfillment
- **Implemented:** American spelling `fulfillment_address`, `fulfillment_options`
- **Stripe Spec:** British spelling `fulfilment_address`, `fulfilment_options`
- **Impact:** HIGH - Data contract mismatch
- **Recommendation:** Accept both spellings, normalize internally

### 5. Data Structure Differences

#### LineItem.item
- **Implemented:**
  ```typescript
  item: {
    id: string
    quantity: number
  }
  ```
- **Stripe Spec:** Same ✅

#### FulfillmentOption.carrier_info
- **Implemented:** `carrier_info: string`
- **Stripe Spec:** `carrier: string`
- **Impact:** Medium
- **Recommendation:** Support both field names

#### Message Types
- **Implemented:** `InfoMessage` with basic structure
- **Stripe Spec:** Detailed `InfoMessage` and `ErrorMessage` with `param` field (RFC 9535 JSONPath)
- **Impact:** Medium - Enhanced error reporting
- **Recommendation:** Add `param` field to error responses

## Compliance Matrix

| Feature | Implemented | Spec Compliant | Status |
|---------|-------------|----------------|--------|
| Create checkout | ✅ | ⚠️ Path differs | Partial |
| Update checkout | ✅ | ⚠️ Method differs | Partial |
| Retrieve checkout | ✅ | ⚠️ Path differs | Partial |
| Complete checkout | ✅ | ⚠️ Path differs | Partial |
| Cancel checkout | ✅ | ⚠️ Path differs | Partial |
| Buyer data | ✅ | ⚠️ Field names differ | Partial |
| Line items | ✅ | ✅ | Full |
| Fulfillment options | ✅ | ⚠️ Spelling differs | Partial |
| Payment provider | ✅ | ✅ | Full |
| Totals array | ✅ | ✅ | Full |
| Messages | ✅ | ⚠️ Missing param field | Partial |
| Links | ✅ | ✅ | Full |
| Order object | ✅ | ✅ | Full |
| SPT integration | ✅ | ✅ | Full |
| Error handling | ✅ | ⚠️ Missing param field | Partial |
| Idempotency | ✅ | ✅ | Full |
| HTTPS/Auth | ✅ | ✅ | Full |

## Critical Mismatches

### 🔴 HIGH PRIORITY

1. **Buyer field names** (`first_name` vs `fore_name`, `last_name` vs `sur_name`)
   - ChatGPT agents will send `fore_name`/`sur_name`
   - Our code expects `first_name`/`last_name`
   - **Fix:** Accept both, map to internal format

2. **Fulfillment spelling** (`fulfillment` vs `fulfilment`)
   - Stripe spec uses British spelling
   - Our code uses American spelling
   - **Fix:** Accept both spellings in requests

3. **Endpoint paths** (`/checkout_sessions` vs `/checkouts`)
   - Different base paths
   - **Fix:** Support both paths as aliases

### 🟡 MEDIUM PRIORITY

4. **Update method** (POST vs PUT)
   - REST semantics differ
   - **Fix:** Support both POST and PUT for updates

5. **Carrier field name** (`carrier_info` vs `carrier`)
   - Minor naming difference
   - **Fix:** Support both in responses

6. **Error param field** (missing RFC 9535 JSONPath)
   - Enhanced error reporting
   - **Fix:** Add `param` field to error objects

### 🟢 LOW PRIORITY

7. **Message content_type** (optional markdown support)
   - Currently plain text only
   - **Fix:** Add markdown support

## Recommendations

### Option 1: Dual Compatibility (RECOMMENDED)
Support both OpenAI and Stripe specs by:
1. Creating alias endpoints at `/checkouts` that map to `/checkout_sessions`
2. Supporting both POST and PUT for updates
3. Accepting both `first_name`/`fore_name` and `last_name`/`sur_name`
4. Accepting both `fulfillment` and `fulfilment` spelling
5. Normalizing all inputs to internal format
6. Responding with the format the client requested

**Pros:** Maximum compatibility, future-proof
**Cons:** Slightly more code complexity
**Effort:** 2-3 hours

### Option 2: Migrate to Stripe Spec Only
Update all endpoints to match Stripe spec exactly:
1. Rename paths from `/checkout_sessions` to `/checkouts`
2. Change update to PUT method
3. Change field names to Stripe spec
4. Update all documentation

**Pros:** Pure Stripe compliance
**Cons:** May break OpenAI compatibility if they diverge
**Effort:** 3-4 hours

### Option 3: Keep Current (Not Recommended)
Continue with OpenAI spec and document differences.

**Pros:** No changes needed
**Cons:** Not officially Stripe ACP compliant
**Effort:** 0 hours

## Proposed Implementation (Option 1)

```typescript
// Type mapper for buyer fields
function normalizeBuyer(buyer: any): NormalizedBuyer {
  return {
    first_name: buyer.first_name || buyer.fore_name,
    last_name: buyer.last_name || buyer.sur_name,
    email: buyer.email,
    phone_number: buyer.phone_number,
  };
}

// Alias endpoints
// /api/checkouts/* -> delegates to /api/checkout_sessions/*

// Support both HTTP methods
export const POST: APIRoute = updateCheckoutSession;
export const PUT: APIRoute = updateCheckoutSession;

// Accept both spelling variants
function normalizeAddress(address: any): Address {
  return {
    name: address.name,
    line_one: address.line_one || address.line_1,
    line_two: address.line_two || address.line_2,
    city: address.city,
    state: address.state,
    country: address.country,
    postal_code: address.postal_code,
  };
}
```

## Testing Checklist

- [ ] Test with OpenAI spec format
- [ ] Test with Stripe spec format
- [ ] Test POST update method
- [ ] Test PUT update method
- [ ] Test `first_name`/`last_name` format
- [ ] Test `fore_name`/`sur_name` format
- [ ] Test `fulfillment` spelling
- [ ] Test `fulfilment` spelling
- [ ] Test `/checkout_sessions` path
- [ ] Test `/checkouts` path
- [ ] Test error messages include `param` field
- [ ] Test idempotency with both specs
- [ ] Test SPT payment with both specs

## Next Steps

1. **Immediate:** Review this analysis with stakeholders
2. **Short-term:** Implement dual compatibility (Option 1)
3. **Medium-term:** Test with both OpenAI and Stripe agents
4. **Long-term:** Monitor ACP spec evolution, update as needed

## References

- OpenAI Agentic Checkout Spec: Provided in earlier context
- Stripe ACP Spec: https://docs.stripe.com/agentic-commerce
- Our Implementation: `/web/src/pages/api/checkout_sessions/*`
- Our Types: `/web/src/lib/types/agentic-checkout.ts`

## Version History

- 2025-11-14: Initial compliance review created
- Next: Implement dual compatibility layer
