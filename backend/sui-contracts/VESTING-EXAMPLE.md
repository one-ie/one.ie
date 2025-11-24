# Vesting Contract - Calculation Walkthrough

## Overview

The vesting contract implements **linear vesting with a cliff period**, a common pattern for team tokens and investor allocations.

## Example Scenario

**Alice is a team member receiving vested tokens:**

- **Total Allocation**: 1,200,000 tokens
- **Start Date**: January 1, 2025 (timestamp: 1735689600000 ms)
- **Cliff Period**: 3 months (90 days)
- **Total Vesting**: 12 months (365 days)

**Timeline:**
```
Jan 1, 2025          Apr 1, 2025         Jul 1, 2025         Oct 1, 2025         Jan 1, 2026
     |                    |                   |                   |                   |
   START              CLIFF END          6-MONTH MARK        9-MONTH MARK          FULL VEST
     |                    |                   |                   |                   |
  0 tokens          300,000 tokens      600,000 tokens      900,000 tokens      1,200,000 tokens
 claimable           claimable           claimable           claimable           claimable
```

## Vesting Calculation Formula

### Step-by-Step Calculation

```typescript
function calculate_vested_amount(schedule, current_time) {
  // CASE 1: Before cliff - nothing vested
  if (current_time < schedule.cliff_end) {
    return 0;
  }

  // CASE 2: After vesting period - everything vested
  if (current_time >= schedule.vesting_end) {
    return schedule.total_amount;
  }

  // CASE 3: Linear vesting in progress
  const elapsed = current_time - schedule.start_time;
  const total_duration = schedule.vesting_end - schedule.start_time;
  const vested = (schedule.total_amount * elapsed) / total_duration;

  return vested;
}
```

## Detailed Timeline Walkthrough

### **January 1, 2025 (Start) - T+0 days**

```
Current Time: 1735689600000
Start Time:   1735689600000
Cliff End:    1743465600000 (90 days later)
Vesting End:  1767225600000 (365 days later)

Elapsed:      0 days
Status:       Before cliff
Vested:       0 tokens
Claimable:    0 tokens
```

**Calculation:**
```
current_time < cliff_end
→ Return 0 tokens
```

**If Alice tries to claim:** ❌ Error: `E_BEFORE_CLIFF`

---

### **February 1, 2025 - T+31 days**

```
Current Time: 1738368000000
Elapsed:      31 days
Status:       Before cliff
Vested:       0 tokens
Claimable:    0 tokens
```

**Calculation:**
```
current_time < cliff_end (1738368000000 < 1743465600000)
→ Return 0 tokens
```

**If Alice tries to claim:** ❌ Error: `E_BEFORE_CLIFF`

---

### **April 1, 2025 (Cliff End) - T+90 days**

```
Current Time: 1743465600000
Elapsed:      90 days
Status:       Cliff reached!
Vested:       300,000 tokens (25% of 1,200,000)
Claimable:    300,000 tokens
```

**Calculation:**
```
current_time >= cliff_end AND current_time < vesting_end
→ Linear vesting applies

elapsed = 1743465600000 - 1735689600000 = 7,776,000,000 ms (90 days)
total_duration = 1767225600000 - 1735689600000 = 31,536,000,000 ms (365 days)

vested = (1,200,000 * 7,776,000,000) / 31,536,000,000
       = 9,331,200,000,000 / 31,536,000,000
       = 295,890 tokens (approximately 300,000 at cliff)
```

**If Alice claims:** ✅ Success! Receives ~300,000 tokens

---

### **May 1, 2025 - T+120 days**

```
Current Time: 1746144000000
Elapsed:      120 days
Status:       Vesting in progress
Vested:       394,520 tokens
Claimed:      300,000 tokens (from April 1)
Claimable:    94,520 tokens (394,520 - 300,000)
```

**Calculation:**
```
elapsed = 1746144000000 - 1735689600000 = 10,454,400,000 ms (120 days)
total_duration = 31,536,000,000 ms (365 days)

vested = (1,200,000 * 10,454,400,000) / 31,536,000,000
       = 12,545,280,000,000 / 31,536,000,000
       = 397,808 tokens

claimable = 397,808 - 300,000 = 97,808 tokens
```

**If Alice claims:** ✅ Success! Receives ~97,808 additional tokens

---

### **July 1, 2025 (6-Month Mark) - T+181 days**

```
Current Time: 1751414400000
Elapsed:      181 days
Status:       Vesting in progress
Vested:       595,890 tokens (approximately 50%)
Claimed:      397,808 tokens (cumulative)
Claimable:    198,082 tokens
```

**Calculation:**
```
elapsed = 1751414400000 - 1735689600000 = 15,724,800,000 ms (181 days)
total_duration = 31,536,000,000 ms (365 days)

vested = (1,200,000 * 15,724,800,000) / 31,536,000,000
       = 18,869,760,000,000 / 31,536,000,000
       = 598,356 tokens

claimable = 598,356 - 397,808 = 200,548 tokens
```

---

### **October 1, 2025 (9-Month Mark) - T+273 days**

```
Current Time: 1759190400000
Elapsed:      273 days
Status:       Vesting in progress
Vested:       873,698 tokens (approximately 73%)
Claimed:      598,356 tokens (cumulative)
Claimable:    275,342 tokens
```

**Calculation:**
```
elapsed = 1759190400000 - 1735689600000 = 23,500,800,000 ms (273 days)
total_duration = 31,536,000,000 ms (365 days)

vested = (1,200,000 * 23,500,800,000) / 31,536,000,000
       = 28,200,960,000,000 / 31,536,000,000
       = 894,246 tokens

claimable = 894,246 - 598,356 = 295,890 tokens
```

---

### **January 1, 2026 (Full Vest) - T+365 days**

```
Current Time: 1767225600000
Elapsed:      365 days
Status:       Fully vested!
Vested:       1,200,000 tokens (100%)
Claimed:      894,246 tokens (cumulative)
Claimable:    305,754 tokens
```

**Calculation:**
```
current_time >= vesting_end
→ Return total_amount

vested = 1,200,000 tokens (all vested)
claimable = 1,200,000 - 894,246 = 305,754 tokens
```

**If Alice claims:** ✅ Success! Receives final 305,754 tokens

---

### **February 1, 2026 (Post-Vesting) - T+396 days**

```
Current Time: 1769904000000
Elapsed:      396 days
Status:       Fully vested (all claimed)
Vested:       1,200,000 tokens
Claimed:      1,200,000 tokens
Claimable:    0 tokens
```

**Calculation:**
```
current_time >= vesting_end
→ Return total_amount = 1,200,000

claimable = 1,200,000 - 1,200,000 = 0
```

**If Alice tries to claim:** ❌ Error: `E_NO_TOKENS_TO_CLAIM`

---

## Edge Cases

### 1. **Claim Before Cliff**

```move
// Alice tries to claim on Feb 1, 2025 (before cliff)
claim_vested_tokens(schedule, clock, ctx)

// Error: E_BEFORE_CLIFF
// current_time (1738368000000) < cliff_end (1743465600000)
```

### 2. **Multiple Claims in Same Day**

```move
// Alice claims all vested tokens
claim_vested_tokens(schedule, clock, ctx)
// Claimed: 300,000 tokens
// claimed_amount updated to 300,000

// Alice tries to claim again immediately
claim_vested_tokens(schedule, clock, ctx)
// Error: E_NO_TOKENS_TO_CLAIM
// vested_amount (300,000) - claimed_amount (300,000) = 0
```

### 3. **Vesting Revoked Mid-Schedule**

```move
// April 1, 2025: Alice claims cliff amount
claim_vested_tokens(schedule, clock, ctx)
// Claimed: 300,000 tokens
// claimed_amount = 300,000

// May 1, 2025: Admin revokes vesting
revoke_vesting(admin_cap, schedule, clock, ctx)
// Vested at revocation: 397,808 tokens
// Unvested: 1,200,000 - 397,808 = 802,192 tokens
// Returns: 802,192 tokens to admin
// schedule.revoked = true

// Alice tries to claim on June 1
claim_vested_tokens(schedule, clock, ctx)
// Error: E_ALREADY_REVOKED
// Cannot claim from revoked schedule
```

### 4. **Claim Exactly at Cliff**

```move
// Current time exactly equals cliff_end
current_time = 1743465600000
cliff_end = 1743465600000

// Check passes: current_time >= cliff_end ✅
// Vested calculation proceeds normally
// Alice can claim cliff amount
```

### 5. **Claim After Full Vesting**

```move
// Feb 1, 2026 (31 days after full vest)
current_time = 1769904000000
vesting_end = 1767225600000

// current_time >= vesting_end
// vested_amount = total_amount = 1,200,000
// claimable = 1,200,000 - 1,200,000 = 0

// Error: E_NO_TOKENS_TO_CLAIM (if already claimed all)
```

---

## Gas Optimization Notes

### Use u128 for Intermediate Calculations

```move
// Prevent overflow during multiplication
let vested = ((schedule.total_amount as u128) * (elapsed as u128))
             / (total_duration as u128);
(vested as u64)
```

**Why?**
- `total_amount = 1,200,000 tokens`
- `elapsed = 31,536,000,000 ms`
- `1,200,000 * 31,536,000,000 = 37,843,200,000,000`
- This exceeds `u64::MAX` (18,446,744,073,709,551,615) ❌
- Cast to `u128` prevents overflow ✅

---

## Summary

| Time Period | Vested Amount | Cliff Reached | Can Claim? |
|-------------|---------------|---------------|------------|
| Day 0-89    | 0%            | No            | ❌ No      |
| Day 90      | ~25%          | Yes           | ✅ Yes     |
| Day 120     | ~33%          | Yes           | ✅ Yes     |
| Day 181     | ~50%          | Yes           | ✅ Yes     |
| Day 273     | ~75%          | Yes           | ✅ Yes     |
| Day 365+    | 100%          | Yes           | ✅ Yes     |

**Key Principles:**
1. **Linear Vesting**: Tokens unlock proportionally to time elapsed
2. **Cliff Protection**: No tokens claimable until cliff period passes
3. **Incremental Claims**: Beneficiary can claim multiple times as tokens vest
4. **Double-Claim Prevention**: `claimed_amount` tracks what's already claimed
5. **Revocation Safety**: Admin can revoke, but beneficiary keeps vested tokens

---

## Integration with ONE Platform

### Entity Mapping (6-Dimension Ontology)

**Thing Type:**
- `type: "vesting_schedule"` (stored in `things` table)

**Connections:**
- `beneficiary → vesting_schedule` (relationshipType: "owns")
- `vesting_schedule → token_contract` (relationshipType: "holds_tokens")

**Events:**
- `entity_created` when schedule created (metadata.entityType = "vesting_schedule")
- `entity_updated` when tokens claimed (metadata.action = "claim")
- `entity_deleted` when revoked (metadata.action = "revoke")

**Example Convex Event:**
```typescript
await ctx.db.insert("events", {
  type: "entity_updated",
  actorId: beneficiary._id,
  targetId: vestingSchedule._id,
  timestamp: Date.now(),
  metadata: {
    entityType: "vesting_schedule",
    action: "claim",
    protocol: "sui",
    amount: claimedAmount,
    totalClaimed: schedule.claimed_amount,
    vestingProgress: (schedule.claimed_amount / schedule.total_amount) * 100
  }
});
```

---

**Built for transparent, auditable token distribution.**
