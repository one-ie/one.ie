import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  THING_TYPES,
  CONNECTION_TYPES,
  EVENT_TYPES,
  ENABLED_FEATURES,
  type ThingType,
  type ConnectionType,
  type EventType,
} from "./types/ontology";

// ============================================================================
// Ontology Composition System
// Types are auto-generated from YAML ontologies
// Run: PUBLIC_FEATURES="blog,portfolio" bun run scripts/generate-ontology-types.ts
// ============================================================================

console.log("🎯 Ontology Composition:");
console.log(`  Features: ${ENABLED_FEATURES.join(", ")}`);
console.log(`  Thing types: ${THING_TYPES.length}`);
console.log(`  Connection types: ${CONNECTION_TYPES.length}`);
console.log(`  Event types: ${EVENT_TYPES.length}`);

// Helper to create type unions from arrays
const createTypeUnion = <T extends string>(types: readonly T[]) => {
  if (types.length === 0) {
    throw new Error("Cannot create type union from empty array");
  }
  if (types.length === 1) {
    return v.literal(types[0]);
  }
  return v.union(...types.map((t) => v.literal(t))) as any;
};

export default defineSchema({
  // ========================
  // Dimension 1: Groups
  // Multi-tenant isolation boundary with hierarchical nesting
  // ========================
  groups: defineTable({
    slug: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")),
    description: v.optional(v.string()),
    metadata: v.any(),
    settings: v.object({
      visibility: v.union(v.literal("public"), v.literal("private")),
      joinPolicy: v.union(
        v.literal("open"),
        v.literal("invite_only"),
        v.literal("approval_required")
      ),
      plan: v.optional(v.union(
        v.literal("starter"),
        v.literal("pro"),
        v.literal("enterprise")
      )),
      limits: v.optional(v.object({
        users: v.number(),
        storage: v.number(),
        apiCalls: v.number()
      }))
    }),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_parent", ["parentGroupId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // ========================
  // Dimension 3: Things (Entities)
  // Dynamic types from ontology composition: ${ENABLED_FEATURES.join(", ")}
  // Available types: ${THING_TYPES.join(", ")}
  // ========================
  entities: defineTable({
    groupId: v.id("groups"),
    type: createTypeUnion(THING_TYPES), // DYNAMIC: auto-generated from ontology YAML
    name: v.string(),
    properties: v.any(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    )),
    schemaVersion: v.optional(v.number()), // CRITICAL: Track schema evolution (made optional for compatibility)
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_updated", ["updatedAt"])
    .index("group_type", ["groupId", "type"])
    .index("group_status", ["groupId", "status"])
    .index("group_created", ["groupId", "createdAt"])
    .index("group_updated", ["groupId", "updatedAt"]),

  // ========================
  // Dimension 4: Connections
  // Dynamic types from ontology composition: ${ENABLED_FEATURES.join(", ")}
  // Available types: ${CONNECTION_TYPES.join(", ")}
  // ========================
  connections: defineTable({
    groupId: v.id("groups"),
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: createTypeUnion(CONNECTION_TYPES), // DYNAMIC: auto-generated from ontology YAML
    metadata: v.optional(v.any()),
    strength: v.optional(v.number()),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(), // CRITICAL: Now required for temporal validation
    deletedAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("from_entity", ["fromEntityId"])
    .index("to_entity", ["toEntityId"])
    .index("from_type", ["fromEntityId", "relationshipType"])
    .index("to_type", ["toEntityId", "relationshipType"])
    .index("bidirectional", ["fromEntityId", "toEntityId", "relationshipType"])
    .index("by_created", ["createdAt"])
    .index("group_type", ["groupId", "relationshipType"])
    .index("group_from", ["groupId", "fromEntityId"])
    .index("group_to", ["groupId", "toEntityId"])
    .index("group_valid", ["groupId", "validFrom", "validTo"]),

  // ========================
  // Dimension 5: Events
  // Dynamic types from ontology composition: ${ENABLED_FEATURES.join(", ")}
  // Available types: ${EVENT_TYPES.join(", ")}
  // ========================
  events: defineTable({
    groupId: v.id("groups"),
    type: createTypeUnion(EVENT_TYPES), // DYNAMIC: auto-generated from ontology YAML
    actorId: v.optional(v.id("entities")), // Optional for anonymous actions (e.g., contact forms)
    targetId: v.optional(v.id("entities")),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
    archived: v.optional(v.boolean()), // CRITICAL: Mark old events as archived for compliance
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_target", ["targetId"])
    .index("by_timestamp", ["timestamp"])
    .index("actor_type", ["actorId", "type"])
    .index("target_type", ["targetId", "type"])
    .index("group_type", ["groupId", "type"])
    .index("group_timestamp", ["groupId", "timestamp"])
    .index("group_type_time", ["groupId", "type", "timestamp"])
    .index("actor_time", ["actorId", "timestamp"]),

  // ========================
  // Dimension 6: Knowledge + Junction
  // Labels, embeddings, and semantic search (RAG)
  // ========================
  knowledge: defineTable({
    groupId: v.id("groups"),
    knowledgeType: v.union(
      v.literal("label"),
      v.literal("document"),
      v.literal("chunk"),
      v.literal("vector_only"),
    ),
    text: v.optional(v.string()),
    embedding: v.optional(v.array(v.number())),
    embeddingModel: v.optional(v.string()),
    embeddingDim: v.optional(v.number()),
    sourceThingId: v.optional(v.id("entities")),
    sourceField: v.optional(v.string()),
    chunk: v.optional(v.any()),
    labels: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["knowledgeType"])
    .index("by_source", ["sourceThingId"])
    .index("by_created", ["createdAt"])
    .index("by_updated", ["updatedAt"])
    .index("group_type", ["groupId", "knowledgeType"])
    .index("group_source", ["groupId", "sourceThingId"]),

  thingKnowledge: defineTable({
    thingId: v.id("entities"),
    knowledgeId: v.id("knowledge"),
    role: v.optional(v.union(
      v.literal("label"),
      v.literal("summary"),
      v.literal("chunk_of"),
      v.literal("caption"),
      v.literal("keyword"),
    )),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(), // CRITICAL: Track updates to junctions
  })
    .index("by_thing", ["thingId"])
    .index("by_knowledge", ["knowledgeId"])
    .index("unique_junction", ["thingId", "knowledgeId", "role"]), // CRITICAL: Prevent duplicates
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  passwordResets: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  emailVerifications: defineTable({
    userId: v.id("users"),
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    verified: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  magicLinks: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["token"])
    .index("by_email", ["email"]),

  twoFactorAuth: defineTable({
    userId: v.id("users"),
    secret: v.string(),
    backupCodes: v.array(v.string()),
    enabled: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ========================
  // E-COMMERCE TABLES
  // Products, orders, carts, and subscriptions
  // ========================

  products: defineTable({
    groupId: v.id("groups"),
    thingId: v.id("entities"), // Link to product entity in things table
    sku: v.string(),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    currency: v.string(),
    inventory: v.number(),
    category: v.string(),
    tags: v.array(v.string()),
    images: v.array(v.string()),
    thumbnail: v.string(),
    attributes: v.optional(v.any()), // Variants, dimensions, etc.
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    featured: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_sku", ["sku"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("group_category", ["groupId", "category"])
    .index("group_status", ["groupId", "status"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["groupId", "status", "category"]
    }),

  orders: defineTable({
    groupId: v.id("groups"),
    userId: v.id("entities"), // Reference to user entity
    orderNumber: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
      variant: v.optional(v.any())
    })),
    subtotal: v.number(),
    tax: v.number(),
    shipping: v.number(),
    total: v.number(),
    currency: v.string(),
    shippingAddress: v.object({
      fullName: v.string(),
      addressLine1: v.string(),
      addressLine2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postalCode: v.string(),
      country: v.string(),
      phone: v.optional(v.string())
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentId: v.optional(v.string()), // Stripe payment intent ID
    discountCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_order_number", ["orderNumber"])
    .index("group_user", ["groupId", "userId"])
    .index("group_status", ["groupId", "status"])
    .index("by_created", ["createdAt"]),

  cart_items: defineTable({
    groupId: v.id("groups"),
    userId: v.id("entities"), // Reference to user entity
    productId: v.id("products"),
    quantity: v.number(),
    variant: v.optional(v.any()),
    addedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("user_product", ["userId", "productId"]),

  subscriptions: defineTable({
    groupId: v.id("groups"),
    userId: v.id("entities"), // Reference to user entity
    productId: v.id("products"),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelledAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_stripe_subscription", ["stripeSubscriptionId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_status", ["status"])
    .index("group_user", ["groupId", "userId"]),

  // ========================
  // WAVE 1: CREATOR ONBOARDING TABLES
  // ========================

  /**
   * Email verification codes for signup flow
   * Stores 6-digit codes with expiry (typically 15 minutes)
   */
  emailVerificationCodes: defineTable({
    email: v.string(),
    code: v.string(), // 6-digit code like "123456"
    expiresAt: v.number(), // Timestamp when code expires
    attempts: v.number(), // Track failed attempts for rate limiting
    verified: v.boolean(), // Has this code been used?
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_code", ["code"])
    .index("by_expires", ["expiresAt"]),

  /**
   * Team invitation tokens
   * Created when inviting team members to workspace
   * Single-use tokens with expiry (typically 7 days)
   */
  invitationTokens: defineTable({
    groupId: v.id("groups"), // Workspace being joined
    token: v.string(), // Unique token (UUID)
    invitedBy: v.id("entities"), // Creator who sent invitation
    invitedEmail: v.string(), // Email address invited
    role: v.union(v.literal("editor"), v.literal("viewer")), // Role they'll get
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    expiresAt: v.number(), // When invitation expires (7 days)
    acceptedAt: v.optional(v.number()),
    acceptedBy: v.optional(v.id("entities")), // Who accepted (may differ from invitedEmail)
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_group", ["groupId"])
    .index("by_email", ["invitedEmail"])
    .index("by_status", ["status"])
    .index("group_status", ["groupId", "status"])
    .index("by_expires", ["expiresAt"]),

  /**
   * Wallet connections for creators
   * Tracks connected blockchain wallets (Ethereum, Solana, etc.)
   */
  walletConnections: defineTable({
    groupId: v.id("groups"),
    creatorId: v.id("entities"), // Creator entity
    walletAddress: v.string(), // Normalized wallet address
    chainId: v.optional(v.number()), // 1 for Ethereum, 137 for Polygon, etc.
    walletType: v.union(
      v.literal("metamask"),
      v.literal("walletconnect"),
      v.literal("rainbowkit"),
      v.literal("other")
    ),
    verified: v.boolean(), // Has signature been verified?
    verificationMessage: v.optional(v.string()), // Message they signed
    verificationSignature: v.optional(v.string()), // Their signature
    verifiedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_creator", ["creatorId"])
    .index("by_address", ["walletAddress"])
    .index("group_creator", ["groupId", "creatorId"]),

  /**
   * Rate limiting for onboarding actions
   * Tracks signup, verification, and invitation attempts per user/IP
   */
  rateLimitTracking: defineTable({
    identifier: v.string(), // Email, IP, or user ID
    action: v.string(), // "signup", "verify_email", "invite_team"
    count: v.number(), // Number of attempts
    windowStart: v.number(), // When tracking window started
    windowEnd: v.number(), // When window expires
    createdAt: v.number(),
  })
    .index("by_identifier", ["identifier"])
    .index("by_action", ["action"])
    .index("by_window", ["windowStart", "windowEnd"]),

  // ========================
  // DATA QUALITY MONITORING
  // Snapshots of integrity metrics over time
  // ========================

  dataQualitySnapshots: defineTable({
    timestamp: v.number(),
    groupId: v.optional(v.id("groups")), // null = platform-wide snapshot
    referentialIntegrityScore: v.number(), // 0-100% (100 = perfect)
    orphanedConnections: v.number(), // Count of connections with missing entities
    crossGroupViolations: v.number(), // Count of cross-group reference violations
    malformedProperties: v.number(), // Count of entities with invalid properties
    metadata: v.optional(v.any()), // Additional metrics and context
  })
    .index("by_time", ["timestamp"])
    .index("by_group_time", ["groupId", "timestamp"])
    .index("by_group", ["groupId"]),

  // ========================
  // PHASE 3: USAGE QUOTA TRACKING
  // Track resource usage per metric per group per period
  // ========================
  usage: defineTable({
    groupId: v.id("groups"), // REQUIRED: which group this usage belongs to
    metric: v.string(), // "users", "storage_gb", "api_calls", "entities_total", "connections_total"
    period: v.string(), // "daily", "monthly", "annual" - for resetting counters
    value: v.number(), // Current usage value
    limit: v.number(), // Quota limit for this metric/period
    timestamp: v.number(), // When this usage snapshot was recorded
    periodStart: v.optional(v.number()), // Start of period (for monthly/annual)
    periodEnd: v.optional(v.number()), // End of period
    metadata: v.optional(v.any()), // Additional context
  })
    .index("by_group_period", ["groupId", "period"])
    .index("by_group_metric", ["groupId", "metric"])
    .index("by_group_metric_time", ["groupId", "metric", "timestamp"])
    .index("by_timestamp", ["timestamp"]),
});
