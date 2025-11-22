---
title: Shopify Customer Model → ONE People Mapping
dimension: people
category: shopify
tags: shopify, customer, addresses, tags, metafields, ecommerce, mapping
related_dimensions: things, connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete mapping of Shopify Customer model to ONE's People dimension (role: "customer").
  Includes addresses, tags, metafields, and customer account status.
  Part of Shopify Integration (Cycle 6).
---

# Shopify Customer Model → ONE People Mapping

**Version:** 1.0.0
**Cycle:** 6 of 100
**Purpose:** Map Shopify Customers to ONE's universal People dimension

---

## Executive Summary

**Shopify's Customer Model:**
- Customer resource stores contact details, order history, marketing preferences
- Multiple addresses (up to 10 most recent returned by API)
- Default address for shipping
- Tags for segmentation
- Metafields for custom data
- Account status (enabled, disabled, invited)
- Marketing consent tracking

**ONE Platform Mapping:**
- **Shopify Customer** → `Thing` (type: "creator", role: "customer")
- **Customer Addresses** → Embedded in `properties.addresses[]`
- **Default Address** → `properties.defaultAddress`
- **Customer Tags** → `Knowledge` (type: "label")
- **Marketing Consent** → `properties.marketing`
- **Customer Groups/Segments** → ONE `groups` (nested within store)

**Key Decision:** Customers are mapped to the "creator" Thing type with role "customer" (not a separate "customer" Thing type) because they are PEOPLE in the ONE ontology. The People dimension is represented as Things with type "creator" and various roles.

---

## Shopify Customer Structure (GraphQL/REST 2024)

### Core Customer Fields

```graphql
type Customer {
  id: ID!                          # Global ID (gid://shopify/Customer/123)
  email: String                    # Unique email (can be null for phone-only)
  phone: String                    # Phone number
  firstName: String
  lastName: String
  displayName: String!             # Computed display name

  # Account Status
  state: CustomerState!            # DISABLED, ENABLED, INVITED, DECLINED
  emailMarketingConsent: CustomerEmailMarketingConsentState
  smsMarketingConsent: CustomerSmsMarketingConsent

  # Addresses
  addresses(first: Int!): MailingAddressConnection!
  defaultAddress: MailingAddress

  # Segmentation
  tags: [String!]!                 # Customer tags

  # Metadata
  metafields: [Metafield!]!
  note: String                     # Internal merchant notes

  # Orders
  orders(first: Int!): OrderConnection!
  numberOfOrders: Int!

  # Lifetime Value
  lifetimeDuration: String         # "P1Y2M3D" (ISO 8601 duration)
  amountSpent: MoneyV2!            # Total spent

  # Tax
  taxExempt: Boolean!
  taxExemptions: [TaxExemption!]!

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
  verifiedEmail: Boolean!
}
```

### Customer Addresses

```graphql
type MailingAddress {
  id: ID!
  address1: String
  address2: String
  city: String
  province: String                 # State/region
  provinceCode: String             # "CA", "NY", etc.
  country: String                  # Full name
  countryCodeV2: CountryCode!      # "US", "CA", etc.
  zip: String                      # Postal code
  phone: String
  firstName: String
  lastName: String
  company: String
  name: String                     # Computed full name
}
```

### Marketing Consent

```graphql
type CustomerEmailMarketingConsentState {
  marketingState: CustomerMarketingState!  # SUBSCRIBED, UNSUBSCRIBED, NOT_SUBSCRIBED
  marketingOptInLevel: CustomerMarketingOptInLevel!  # SINGLE_OPT_IN, CONFIRMED_OPT_IN
  consentUpdatedAt: DateTime
}

type CustomerSmsMarketingConsent {
  marketingState: CustomerMarketingState!
  marketingOptInLevel: CustomerMarketingOptInLevel!
  consentUpdatedAt: DateTime
}
```

### Metafields

```graphql
type Metafield {
  id: ID!
  namespace: String!               # Grouping (e.g., "custom", "loyalty")
  key: String!                     # Field name (e.g., "vip_tier")
  value: String!                   # Serialized value
  type: String!                    # "single_line_text_field", "number_integer", etc.
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

---

## ONE Thing Mapping

### Customer → Thing (type: "creator", role: "customer")

```typescript
// ONE Platform Thing structure for Shopify Customer
{
  _id: Id<'things'>,
  groupId: Id<'groups'>,           // Shopify Store ID
  type: "creator",                 // People are "creator" Things in ONE
  name: string,                    // Full name or email
  slug: string,                    // Email-based slug

  properties: {
    // Role (People dimension)
    role: "customer",              // ONE role: customer, org_owner, org_user, platform_owner

    // Shopify identifiers
    shopifyId: string,             // gid://shopify/Customer/123 or "123"

    // Contact info
    email?: string,                // Can be null (phone-only customers)
    phone?: string,
    firstName?: string,
    lastName?: string,
    displayName: string,

    // Account status
    accountState: "disabled" | "enabled" | "invited" | "declined",
    verifiedEmail: boolean,

    // Marketing consent
    marketing: {
      email: {
        state: "subscribed" | "unsubscribed" | "not_subscribed",
        optInLevel: "single_opt_in" | "confirmed_opt_in" | null,
        consentUpdatedAt?: string
      },
      sms: {
        state: "subscribed" | "unsubscribed" | "not_subscribed",
        optInLevel: "single_opt_in" | "confirmed_opt_in" | null,
        consentUpdatedAt?: string
      }
    },

    // Addresses (array of up to 10)
    addresses: Array<{
      shopifyId: string,           # Address ID
      address1?: string,
      address2?: string,
      city?: string,
      province?: string,
      provinceCode?: string,
      country?: string,
      countryCode: string,
      zip?: string,
      phone?: string,
      firstName?: string,
      lastName?: string,
      company?: string,
      isDefault: boolean           # Is this the default address?
    }>,

    // Default address (quick access)
    defaultAddress?: {
      shopifyId: string,
      address1?: string,
      address2?: string,
      city?: string,
      province?: string,
      provinceCode?: string,
      country?: string,
      countryCode: string,
      zip?: string,
      phone?: string,
      company?: string
    },

    // Merchant notes
    note?: string,                 # Internal notes (private to merchant)

    // Order statistics
    orderCount: number,
    totalSpent: number,
    currency: string,
    lifetimeDuration?: string,     # ISO 8601 duration (e.g., "P2Y3M")

    // Tax
    taxExempt: boolean,
    taxExemptions?: string[],      # ["CA_BC_RESELLER", etc.]

    // Shopify metadata
    metafields?: Record<string, {
      value: any,
      type: string,
      namespace: string,
      key: string
    }>,

    // Timestamps (from Shopify)
    shopifyCreatedAt: string,      # ISO 8601
    shopifyUpdatedAt: string
  },

  // ONE Platform standard fields
  createdAt: number,               # ONE timestamp (milliseconds)
  updatedAt: number,
  createdBy?: Id<'things'>         # Who synced this customer (admin)
}
```

---

## Transformation Logic

### Step 1: Map Customer to ONE Thing

```typescript
function transformShopifyCustomerToThing(
  shopifyCustomer: ShopifyCustomer,
  groupId: Id<'groups'>
): ThingInput {
  return {
    groupId,
    type: "creator",               // People are creators in ONE
    name: shopifyCustomer.displayName || shopifyCustomer.email || "Guest",
    slug: generateCustomerSlug(shopifyCustomer),

    properties: {
      role: "customer",

      shopifyId: extractNumericId(shopifyCustomer.id),

      email: shopifyCustomer.email,
      phone: shopifyCustomer.phone,
      firstName: shopifyCustomer.firstName,
      lastName: shopifyCustomer.lastName,
      displayName: shopifyCustomer.displayName,

      accountState: shopifyCustomer.state.toLowerCase(),
      verifiedEmail: shopifyCustomer.verifiedEmail,

      marketing: {
        email: shopifyCustomer.emailMarketingConsent ? {
          state: shopifyCustomer.emailMarketingConsent.marketingState.toLowerCase(),
          optInLevel: shopifyCustomer.emailMarketingConsent.marketingOptInLevel?.toLowerCase(),
          consentUpdatedAt: shopifyCustomer.emailMarketingConsent.consentUpdatedAt
        } : {
          state: "not_subscribed",
          optInLevel: null
        },
        sms: shopifyCustomer.smsMarketingConsent ? {
          state: shopifyCustomer.smsMarketingConsent.marketingState.toLowerCase(),
          optInLevel: shopifyCustomer.smsMarketingConsent.marketingOptInLevel?.toLowerCase(),
          consentUpdatedAt: shopifyCustomer.smsMarketingConsent.consentUpdatedAt
        } : {
          state: "not_subscribed",
          optInLevel: null
        }
      },

      addresses: shopifyCustomer.addresses.edges.map(edge =>
        transformAddress(edge.node, shopifyCustomer.defaultAddress)
      ),

      defaultAddress: shopifyCustomer.defaultAddress
        ? transformAddress(shopifyCustomer.defaultAddress, shopifyCustomer.defaultAddress)
        : undefined,

      note: shopifyCustomer.note,

      orderCount: shopifyCustomer.numberOfOrders,
      totalSpent: parseFloat(shopifyCustomer.amountSpent.amount),
      currency: shopifyCustomer.amountSpent.currencyCode,
      lifetimeDuration: shopifyCustomer.lifetimeDuration,

      taxExempt: shopifyCustomer.taxExempt,
      taxExemptions: shopifyCustomer.taxExemptions,

      metafields: transformMetafields(shopifyCustomer.metafields),

      shopifyCreatedAt: shopifyCustomer.createdAt,
      shopifyUpdatedAt: shopifyCustomer.updatedAt
    }
  };
}

function transformAddress(
  address: ShopifyMailingAddress,
  defaultAddress: ShopifyMailingAddress | null
): CustomerAddress {
  return {
    shopifyId: extractNumericId(address.id),
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    province: address.province,
    provinceCode: address.provinceCode,
    country: address.country,
    countryCode: address.countryCodeV2,
    zip: address.zip,
    phone: address.phone,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    isDefault: defaultAddress ? address.id === defaultAddress.id : false
  };
}

function generateCustomerSlug(customer: ShopifyCustomer): string {
  if (customer.email) {
    return customer.email.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (customer.phone) {
    return `phone-${customer.phone.replace(/[^0-9]+/g, '')}`;
  }
  return `customer-${extractNumericId(customer.id)}`;
}
```

### Step 2: Create Knowledge Labels for Tags

```typescript
function transformCustomerTagsToKnowledge(
  shopifyCustomer: ShopifyCustomer,
  customerThingId: Id<'things'>,
  groupId: Id<'groups'>
): KnowledgeInput[] {
  return shopifyCustomer.tags.map(tag => ({
    groupId,
    sourceThingId: customerThingId,
    knowledgeType: "label",
    text: tag,
    labels: ["customer_tag", "shopify"],
    createdAt: Date.now()
  }));
}
```

### Step 3: Create Customer Registration Event

```typescript
function transformCustomerToRegistrationEvent(
  shopifyCustomer: ShopifyCustomer,
  customerThingId: Id<'things'>,
  groupId: Id<'groups'>
): EventInput {
  return {
    groupId,
    type: "customer_registered",
    actorId: customerThingId,      // Customer registered themselves

    metadata: {
      shopifyCustomerId: extractNumericId(shopifyCustomer.id),
      email: shopifyCustomer.email,
      phone: shopifyCustomer.phone,
      accountState: shopifyCustomer.state.toLowerCase(),
      marketingOptIn: shopifyCustomer.emailMarketingConsent?.marketingState === "SUBSCRIBED",

      shopifyCreatedAt: shopifyCustomer.createdAt
    },

    timestamp: new Date(shopifyCustomer.createdAt).getTime()
  };
}
```

---

## Transformation Examples

### Example 1: Standard Customer with Multiple Addresses

**Shopify Customer JSON:**

```json
{
  "id": "gid://shopify/Customer/7777777777",
  "email": "john.doe@example.com",
  "phone": "+12025551234",
  "firstName": "John",
  "lastName": "Doe",
  "displayName": "John Doe",
  "state": "ENABLED",
  "verifiedEmail": true,
  "emailMarketingConsent": {
    "marketingState": "SUBSCRIBED",
    "marketingOptInLevel": "CONFIRMED_OPT_IN",
    "consentUpdatedAt": "2024-01-15T10:00:00Z"
  },
  "smsMarketingConsent": {
    "marketingState": "NOT_SUBSCRIBED",
    "marketingOptInLevel": null,
    "consentUpdatedAt": null
  },
  "addresses": {
    "edges": [
      {
        "node": {
          "id": "gid://shopify/MailingAddress/111",
          "address1": "123 Main St",
          "address2": "Apt 4B",
          "city": "New York",
          "province": "New York",
          "provinceCode": "NY",
          "country": "United States",
          "countryCodeV2": "US",
          "zip": "10001",
          "phone": "+12025551234"
        }
      },
      {
        "node": {
          "id": "gid://shopify/MailingAddress/222",
          "address1": "456 Oak Ave",
          "city": "Brooklyn",
          "province": "New York",
          "provinceCode": "NY",
          "country": "United States",
          "countryCodeV2": "US",
          "zip": "11201"
        }
      }
    ]
  },
  "defaultAddress": {
    "id": "gid://shopify/MailingAddress/111",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "province": "New York",
    "provinceCode": "NY",
    "country": "United States",
    "countryCodeV2": "US",
    "zip": "10001"
  },
  "tags": ["VIP", "Newsletter", "High-Value"],
  "note": "Preferred customer, expedite shipping",
  "numberOfOrders": 12,
  "amountSpent": {
    "amount": "1249.88",
    "currencyCode": "USD"
  },
  "lifetimeDuration": "P2Y3M15D",
  "taxExempt": false,
  "metafields": [
    {
      "namespace": "loyalty",
      "key": "points",
      "value": "2500",
      "type": "number_integer"
    }
  ],
  "createdAt": "2022-08-10T14:30:00Z",
  "updatedAt": "2024-11-22T10:00:00Z"
}
```

**ONE Platform Transformation:**

```typescript
// Customer Thing
{
  _id: "k777...",
  groupId: "k999...",              // Shopify Store
  type: "creator",
  name: "John Doe",
  slug: "john-doe-example-com",

  properties: {
    role: "customer",

    shopifyId: "7777777777",

    email: "john.doe@example.com",
    phone: "+12025551234",
    firstName: "John",
    lastName: "Doe",
    displayName: "John Doe",

    accountState: "enabled",
    verifiedEmail: true,

    marketing: {
      email: {
        state: "subscribed",
        optInLevel: "confirmed_opt_in",
        consentUpdatedAt: "2024-01-15T10:00:00Z"
      },
      sms: {
        state: "not_subscribed",
        optInLevel: null,
        consentUpdatedAt: null
      }
    },

    addresses: [
      {
        shopifyId: "111",
        address1: "123 Main St",
        address2: "Apt 4B",
        city: "New York",
        province: "New York",
        provinceCode: "NY",
        country: "United States",
        countryCode: "US",
        zip: "10001",
        phone: "+12025551234",
        isDefault: true
      },
      {
        shopifyId: "222",
        address1: "456 Oak Ave",
        city: "Brooklyn",
        province: "New York",
        provinceCode: "NY",
        country: "United States",
        countryCode: "US",
        zip: "11201",
        isDefault: false
      }
    ],

    defaultAddress: {
      shopifyId: "111",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: "New York",
      province: "New York",
      provinceCode: "NY",
      country: "United States",
      countryCode: "US",
      zip: "10001",
      phone: "+12025551234"
    },

    note: "Preferred customer, expedite shipping",

    orderCount: 12,
    totalSpent: 1249.88,
    currency: "USD",
    lifetimeDuration: "P2Y3M15D",

    taxExempt: false,
    taxExemptions: [],

    metafields: {
      "loyalty.points": {
        value: 2500,
        type: "number_integer",
        namespace: "loyalty",
        key: "points"
      }
    },

    shopifyCreatedAt: "2022-08-10T14:30:00Z",
    shopifyUpdatedAt: "2024-11-22T10:00:00Z"
  },

  createdAt: 1660139400000,
  updatedAt: 1732269600000
}

// Knowledge Labels (Customer Tags)
[
  {
    _id: "k800...",
    groupId: "k999...",
    sourceThingId: "k777...",      // Customer
    knowledgeType: "label",
    text: "VIP",
    labels: ["customer_tag", "shopify"],
    createdAt: 1732269600000
  },
  {
    _id: "k801...",
    groupId: "k999...",
    sourceThingId: "k777...",
    knowledgeType: "label",
    text: "Newsletter",
    labels: ["customer_tag", "shopify"],
    createdAt: 1732269600000
  },
  {
    _id: "k802...",
    groupId: "k999...",
    sourceThingId: "k777...",
    knowledgeType: "label",
    text: "High-Value",
    labels: ["customer_tag", "shopify"],
    createdAt: 1732269600000
  }
]

// Event (Customer Registered)
{
  _id: "k900...",
  groupId: "k999...",
  type: "customer_registered",
  actorId: "k777...",

  metadata: {
    shopifyCustomerId: "7777777777",
    email: "john.doe@example.com",
    phone: "+12025551234",
    accountState: "enabled",
    marketingOptIn: true,

    shopifyCreatedAt: "2022-08-10T14:30:00Z"
  },

  timestamp: 1660139400000,
  createdAt: 1660139400000
}
```

---

## Edge Cases & Challenges

### 1. Phone-Only Customers (No Email)

**Scenario:** Customer creates account with phone number only

**Shopify:** `email: null`, `phone: "+1234567890"`

**ONE Mapping:**
```typescript
{
  name: "+1234567890",
  slug: "phone-1234567890",
  properties: {
    email: null,
    phone: "+1234567890",
    displayName: "+1234567890"
  }
}
```

**Challenge:** Email is commonly used as unique identifier
**Solution:** Use phone as fallback, or Shopify customer ID

### 2. Guest Customers (Checkout Without Account)

**Scenario:** Customer completes checkout without creating account

**Shopify:** Order has email/phone but no customer record

**ONE Mapping:**
- Create temporary customer Thing with `isGuest: true` flag
- If they later create account, merge guest orders
- Use email/phone as deduplication key

```typescript
{
  type: "creator",
  name: "Guest",
  slug: "guest-customer-example-com",
  properties: {
    role: "customer",
    email: "customer@example.com",
    isGuest: true,
    shopifyId: null,
    accountState: "guest"
  }
}
```

### 3. Disabled Customer Accounts

**Scenario:** Merchant disables customer account (spam, fraud, etc.)

**Shopify:** `state: "DISABLED"`

**ONE Mapping:**
```typescript
properties: {
  accountState: "disabled"
}

// Still keep customer in database (order history)
// Filter out disabled customers from public queries
// Allow admin access
```

### 4. Invited Customers (Not Yet Accepted)

**Scenario:** Merchant creates customer, sends invite, customer hasn't accepted

**Shopify:** `state: "INVITED"`

**ONE Mapping:**
```typescript
properties: {
  accountState: "invited",
  verifiedEmail: false
}

// Create event: customer_invited
// When they accept → Update to "enabled" + create customer_registered event
```

### 5. Missing Default Address

**Scenario:** Customer has no default address set

**Shopify:** `defaultAddress: null`

**ONE Mapping:**
```typescript
properties: {
  addresses: [...],
  defaultAddress: undefined  // or null
}

// Render logic: use first address as fallback
// Or prompt customer to set default
```

### 6. Address Updates

**Scenario:** Customer adds/updates/deletes addresses

**Shopify Webhook:** `customers/update`

**ONE Mapping:**
- Replace entire `addresses` array (Shopify returns up to 10)
- Update `defaultAddress` if changed
- Create event: `customer_updated` with metadata `{ updated: "addresses" }`

### 7. Metafields for Custom Loyalty Programs

**Scenario:** Store uses metafields for loyalty points, tiers, referral codes

**Shopify:**
```json
{
  "metafields": [
    { "namespace": "loyalty", "key": "points", "value": "2500" },
    { "namespace": "loyalty", "key": "tier", "value": "gold" },
    { "namespace": "referral", "key": "code", "value": "JOHN2024" }
  ]
}
```

**ONE Mapping:**

**Option A: Store in properties.metafields**
```typescript
properties: {
  metafields: {
    "loyalty.points": { value: 2500, type: "number_integer", ... },
    "loyalty.tier": { value: "gold", type: "single_line_text_field", ... },
    "referral.code": { value: "JOHN2024", type: "single_line_text_field", ... }
  }
}
```

**Option B: Promote important metafields to top-level properties**
```typescript
properties: {
  loyalty: {
    points: 2500,
    tier: "gold"
  },
  referralCode: "JOHN2024",
  metafields: { ... }  // Keep original for reference
}
```

**Recommendation:** Option B for frequently accessed data (loyalty, VIP status)

### 8. Customer Merge (Duplicate Accounts)

**Scenario:** Same person has 2 accounts (different emails), merchant merges them

**Shopify:** Merges customer records, keeps one ID

**ONE Mapping:**
- Keep both customer Things (historical accuracy)
- Mark one as `merged: true`, `mergedInto: customerId`
- Migrate all connections to primary customer
- Create event: `customer_merged`

```typescript
// Old customer (archived)
{
  _id: "k777...",
  properties: {
    accountState: "merged",
    mergedInto: "k778...",  // New customer ID
    mergedAt: "2024-11-22T10:00:00Z"
  }
}
```

---

## Query Patterns

### Get Customer by Email

```typescript
const customer = await provider.things.query({
  groupId,
  type: "creator",
  filters: {
    "properties.role": "customer",
    "properties.email": email
  }
});
```

### Get Customer Tags

```typescript
const tags = await provider.knowledge.query({
  groupId,
  sourceThingId: customerId,
  knowledgeType: "label",
  labels: ["customer_tag"]
});
```

### Get High-Value Customers (Spent > $1000)

```typescript
const vipCustomers = await provider.things.query({
  groupId,
  type: "creator",
  filters: {
    "properties.role": "customer",
    "properties.totalSpent": { $gte: 1000 }
  },
  orderBy: "properties.totalSpent",
  order: "desc"
});
```

### Get Customers Who Opted In to Email Marketing

```typescript
const subscribers = await provider.things.query({
  groupId,
  type: "creator",
  filters: {
    "properties.role": "customer",
    "properties.marketing.email.state": "subscribed"
  }
});
```

### Get Customer Purchase History

```typescript
// Get all purchases for customer
const purchases = await provider.connections.query({
  groupId,
  fromThingId: customerId,
  relationshipType: "purchased"
});

// Get unique orders
const orderNumbers = [...new Set(purchases.map(p => p.metadata.orderNumber))];
```

---

## Sync Strategy

### Initial Sync (All Customers)

1. Fetch all customers from Shopify (paginated, 250 per request)
2. For each customer:
   - Create Customer Thing (type: "creator", role: "customer")
   - Create Knowledge labels for tags
   - Create `customer_registered` Event
3. Store sync metadata (last sync cursor, timestamp)

### Incremental Sync (Webhooks)

**Webhook topics:**
- `customers/create` → Create Customer Thing + Event
- `customers/update` → Update Customer Thing + Create `customer_updated` Event
- `customers/delete` → Soft delete (mark as deleted, keep for order history)
- `customers/enable` → Update accountState to "enabled"
- `customers/disable` → Update accountState to "disabled"

### Data Privacy Compliance (GDPR/CCPA)

**Webhook topics:**
- `customers/data_request` → Export all customer data from ONE database
- `customers/redact` → Anonymize customer PII, keep order statistics

```typescript
// GDPR Redaction
{
  type: "creator",
  name: "Redacted Customer",
  slug: "redacted-customer-123",
  properties: {
    role: "customer",
    email: null,                   // Removed
    phone: null,                   // Removed
    firstName: "Redacted",
    lastName: "Redacted",
    addresses: [],                 // Removed
    note: null,                    // Removed
    orderCount: 12,                // Kept (aggregated data)
    totalSpent: 1249.88,           // Kept (aggregated data)
    shopifyId: null,               // Removed
    isRedacted: true,
    redactedAt: "2024-11-22T10:00:00Z"
  }
}
```

---

## Performance Considerations

### Large Customer Base (100,000+ customers)

- Batch create customers (Convex batching)
- Index by email, phone, shopifyId for fast lookups
- Paginate customer lists
- Cache frequently accessed customers (VIP, recent)

### Address Storage

- Store up to 10 addresses per customer (Shopify limit)
- Denormalize defaultAddress for quick access
- Consider separate addresses table if >10 needed

### Metafields

- Store in JSON field (flexible schema)
- Index important metafields (loyalty points, VIP status)
- Create computed fields for frequently queried metafields

---

## Related Dimensions

**Things:**
- Customer → (type: "creator", role: "customer")
- Related products (via "purchased" connections)

**Connections:**
- `purchased` - Customer → ProductVariant
- `favorited` - Customer → Product (wishlist)
- `reviewed` - Customer → Product (future)

**Events:**
- `customer_registered` - Account created
- `customer_updated` - Profile updated
- `customer_login` - Logged in (if ONE provides auth)
- `customer_merged` - Duplicate accounts merged

**Knowledge:**
- Customer tags → labels
- Customer notes → chunks (for AI customer support)
- Customer segments → labels

**Groups:**
- Customer segments → nested groups within store
  - Example: Store > VIP Customers > Gold Tier

---

## Customer Segmentation with Groups

### Advanced: Map Shopify Segments to ONE Groups

**Shopify:** Customer tags used for segmentation (VIP, Wholesale, Newsletter, etc.)

**ONE:** Create nested groups for each segment

```typescript
// Store Group
{
  _id: "k999...",
  slug: "my-shopify-store",
  name: "My Shopify Store",
  type: "business"
}

// VIP Customers Group (nested)
{
  _id: "k1000...",
  slug: "vip-customers",
  name: "VIP Customers",
  type: "community",
  parentGroupId: "k999..."         // Nested under store
}

// Add VIP customers to VIP group via Connection
{
  fromThingId: "k777...",          // Customer
  toThingId: "k1000...",           // VIP Group
  relationshipType: "member_of"
}
```

**Benefits:**
- Query all VIP customers via group membership
- Apply group-level permissions (VIP-only products)
- Segment-specific analytics

---

## Next Steps

**Cycle 7:** Design ShopifyProvider interface
**Cycle 8:** Implement Shopify authentication (OAuth)

---

## References

**Shopify Documentation:**
- [Customer GraphQL Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Customer)
- [Customer REST API](https://shopify.dev/docs/api/admin-rest/latest/resources/customer)
- [Customer Account API (Metafields)](https://shopify.dev/docs/apps/build/customer-accounts/metafields)
- [Metafields Guide](https://shopify.dev/docs/apps/build/custom-data)

**ONE Platform:**
- `/one/knowledge/ontology.md` - 6-dimension specification (People dimension)
- `/one/things/plans/shopify-integration-100-cycles.md` - Integration plan

---

## Summary of Shopify → ONE Mappings

| Shopify Entity | ONE Dimension | Type | Notes |
|----------------|---------------|------|-------|
| **Product** | Things | `type: "product"` | Parent entity |
| **ProductVariant** | Things | `type: "product_variant"` | Separate Thing, connected via `variant_of` |
| **Customer** | Things (People) | `type: "creator"`, `role: "customer"` | People dimension |
| **Order** | Connections + Events | `type: "purchased"` + lifecycle events | NOT a Thing! |
| **LineItem** | Connections | `type: "purchased"` | One connection per line item |
| **Address** | Embedded | `properties.addresses[]` | Array in customer Thing |
| **Tags** | Knowledge | `type: "label"` | Searchable labels |
| **Metafields** | Embedded | `properties.metafields{}` | JSON object |

---

**Built with clarity, simplicity, and infinite scale in mind.**
