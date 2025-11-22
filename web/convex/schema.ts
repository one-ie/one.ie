// convex/schema.ts
// ONE Platform - Convex Schema for AI Website Builder
// Version: 3.0.0 (AI Website Builder Support)
// Maps to 6-dimension ontology: groups, people, things, connections, events, knowledge

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // GROUPS: Multi-tenant isolation (hierarchical containers)
  // ============================================================================
  groups: defineTable({
    name: v.string(),
    slug: v.string(),
    parentGroupId: v.optional(v.id("groups")),
    plan: v.union(
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    limits: v.object({
      users: v.number(),
      websites: v.number(),
      pages: v.number(),
      aiMessages: v.number(),
      deployments: v.number(),
      storage: v.number(),
    }),
    usage: v.object({
      users: v.number(),
      websites: v.number(),
      pages: v.number(),
      aiMessages: v.number(),
      deployments: v.number(),
      storage: v.number(),
    }),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    properties: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentGroupId"])
    .index("by_status", ["status"]),

  // ============================================================================
  // ENTITIES: All objects in the ONE universe
  // ============================================================================
  entities: defineTable({
    // Universal fields
    type: v.union(
      // Core entities (4)
      v.literal("creator"),
      v.literal("ai_clone"),
      v.literal("audience_member"),
      v.literal("organization"),

      // Business function agents (10)
      v.literal("strategy_agent"),
      v.literal("research_agent"),
      v.literal("marketing_agent"),
      v.literal("sales_agent"),
      v.literal("service_agent"),
      v.literal("design_agent"),
      v.literal("engineering_agent"),
      v.literal("finance_agent"),
      v.literal("legal_agent"),
      v.literal("intelligence_agent"),

      // Content types (7)
      v.literal("blog_post"),
      v.literal("video"),
      v.literal("podcast"),
      v.literal("social_post"),
      v.literal("email"),
      v.literal("course"),
      v.literal("lesson"),

      // Products (4)
      v.literal("digital_product"),
      v.literal("membership"),
      v.literal("consultation"),
      v.literal("nft"),

      // Community (3)
      v.literal("community"),
      v.literal("conversation"),
      v.literal("message"),

      // Token (2)
      v.literal("token"),
      v.literal("token_contract"),

      // Knowledge (2)
      v.literal("knowledge_item"),
      v.literal("embedding"),

      // Platform (6)
      v.literal("website"),
      v.literal("landing_page"),
      v.literal("template"),
      v.literal("livestream"),
      v.literal("recording"),
      v.literal("media_asset"),

      // Business (7)
      v.literal("payment"),
      v.literal("subscription"),
      v.literal("invoice"),
      v.literal("metric"),
      v.literal("insight"),
      v.literal("prediction"),
      v.literal("report"),

      // Authentication & Session (5)
      v.literal("session"),
      v.literal("oauth_account"),
      v.literal("verification_token"),
      v.literal("password_reset_token"),
      v.literal("ui_preferences"),

      // Marketing (6)
      v.literal("notification"),
      v.literal("email_campaign"),
      v.literal("announcement"),
      v.literal("referral"),
      v.literal("campaign"),
      v.literal("lead"),

      // External Integrations (3)
      v.literal("external_agent"),
      v.literal("external_workflow"),
      v.literal("external_connection"),

      // Protocol Entities (2)
      v.literal("mandate"),
      v.literal("product"),

      // AI Website Builder (4) - NEW
      v.literal("page"),
      v.literal("ai_conversation"),
      v.literal("deployment"),
      v.literal("component")
    ),

    name: v.string(),

    // Group scoping (multi-tenant isolation)
    groupId: v.optional(v.id("groups")),

    // Type-specific properties stored as JSON
    // For websites: { domain, settings: { title, description, favicon, analytics }, cloudflare: { projectId, accountId } }
    // For pages: { websiteId, slug, code, compiledHtml, metadata: { description, keywords, ogImage } }
    // For ai_conversations: { websiteId, pageId, messages: [], totalTokens, conversationStatus }
    // For deployments: { websiteId, deploymentStatus, url, buildLogs, error, cloudflareDeploymentId, completedAt }
    // For components: { category, code, preview, description, tags }
    properties: v.any(),

    // Status tracking
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
        v.literal("building"),
        v.literal("deploying"),
        v.literal("live"),
        v.literal("failed")
      )
    ),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    // Indexes for efficient queries
    .index("by_type", ["type"])
    .index("by_group", ["groupId"])
    .index("by_group_type", ["groupId", "type"])
    .index("by_status", ["status"])
    .index("by_type_status", ["type", "status"])
    .index("by_created", ["createdAt"])
    .index("by_updated", ["updatedAt"])
    // Search index for entities
    .searchIndex("search_entities", {
      searchField: "name",
      filterFields: ["type", "status", "groupId"],
    }),

  // ============================================================================
  // CONNECTIONS: All relationships (25 types)
  // ============================================================================
  connections: defineTable({
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.union(
      // Ownership (2)
      v.literal("owns"),
      v.literal("created_by"),

      // AI Relationships (3)
      v.literal("clone_of"),
      v.literal("trained_on"),
      v.literal("powers"),

      // Content Relationships (5)
      v.literal("authored"),
      v.literal("generated_by"),
      v.literal("published_to"),
      v.literal("part_of"),
      v.literal("references"),

      // Community Relationships (4)
      v.literal("member_of"),
      v.literal("following"),
      v.literal("moderates"),
      v.literal("participated_in"),

      // Business Relationships (3)
      v.literal("manages"),
      v.literal("reports_to"),
      v.literal("collaborates_with"),

      // Token Relationships (3)
      v.literal("holds_tokens"),
      v.literal("staked_in"),
      v.literal("earned_from"),

      // Product Relationships (4)
      v.literal("purchased"),
      v.literal("enrolled_in"),
      v.literal("completed"),
      v.literal("teaching"),

      // Website Builder Relationships - NEW
      v.literal("contains"), // website contains pages
      v.literal("modified"), // ai_assistant modified page

      // CONSOLIDATED TYPES (7)
      v.literal("transacted"),
      v.literal("notified"),
      v.literal("referred"),
      v.literal("communicated"),
      v.literal("delegated"),
      v.literal("approved"),
      v.literal("fulfilled")
    ),

    // Metadata for type-specific data
    // For contains: { order, section }
    // For modified: { changes, aiModel, tokensUsed }
    metadata: v.optional(v.any()),

    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    // Indexes for relationship queries
    .index("from_entity", ["fromEntityId"])
    .index("to_entity", ["toEntityId"])
    .index("from_type", ["fromEntityId", "relationshipType"])
    .index("to_type", ["toEntityId", "relationshipType"])
    .index("bidirectional", [
      "fromEntityId",
      "toEntityId",
      "relationshipType",
    ])
    .index("by_created", ["createdAt"]),

  // ============================================================================
  // EVENTS: All actions (complete audit trail)
  // ============================================================================
  events: defineTable({
    type: v.union(
      // ENTITY LIFECYCLE (4)
      v.literal("entity_created"),
      v.literal("entity_updated"),
      v.literal("entity_deleted"),
      v.literal("entity_archived"),

      // USER EVENTS (5)
      v.literal("user_registered"),
      v.literal("user_verified"),
      v.literal("user_login"),
      v.literal("user_logout"),
      v.literal("profile_updated"),

      // AUTHENTICATION EVENTS (6)
      v.literal("password_reset_requested"),
      v.literal("password_reset_completed"),
      v.literal("email_verification_sent"),
      v.literal("email_verified"),
      v.literal("two_factor_enabled"),
      v.literal("two_factor_disabled"),

      // ORGANIZATION EVENTS (5)
      v.literal("organization_created"),
      v.literal("organization_updated"),
      v.literal("user_invited_to_org"),
      v.literal("user_joined_org"),
      v.literal("user_removed_from_org"),

      // DASHBOARD & UI EVENTS (4)
      v.literal("dashboard_viewed"),
      v.literal("settings_updated"),
      v.literal("theme_changed"),
      v.literal("preferences_updated"),

      // AI/CLONE EVENTS (4)
      v.literal("clone_created"),
      v.literal("clone_updated"),
      v.literal("voice_cloned"),
      v.literal("appearance_cloned"),

      // AGENT EVENTS (4)
      v.literal("agent_created"),
      v.literal("agent_executed"),
      v.literal("agent_completed"),
      v.literal("agent_failed"),

      // TOKEN EVENTS (7)
      v.literal("token_created"),
      v.literal("token_minted"),
      v.literal("token_burned"),
      v.literal("tokens_purchased"),
      v.literal("tokens_staked"),
      v.literal("tokens_unstaked"),
      v.literal("tokens_transferred"),

      // COURSE EVENTS (5)
      v.literal("course_created"),
      v.literal("course_enrolled"),
      v.literal("lesson_completed"),
      v.literal("course_completed"),
      v.literal("certificate_earned"),

      // ANALYTICS EVENTS (5)
      v.literal("metric_calculated"),
      v.literal("insight_generated"),
      v.literal("prediction_made"),
      v.literal("optimization_applied"),
      v.literal("report_generated"),

      // AI WEBSITE BUILDER EVENTS - NEW (9)
      v.literal("website_created"),
      v.literal("page_generated"),
      v.literal("page_modified"),
      v.literal("deployment_started"),
      v.literal("deployment_completed"),
      v.literal("deployment_failed"),
      v.literal("ai_page_generated"),
      v.literal("component_searched"),
      v.literal("domain_configured"),

      // CONSOLIDATED EVENTS (11)
      v.literal("content_event"),
      v.literal("payment_event"),
      v.literal("subscription_event"),
      v.literal("commerce_event"),
      v.literal("livestream_event"),
      v.literal("notification_event"),
      v.literal("referral_event"),
      v.literal("communication_event"),
      v.literal("task_event"),
      v.literal("mandate_event"),
      v.literal("price_event")
    ),

    actorId: v.id("entities"), // Who/what caused this
    targetId: v.optional(v.id("entities")), // Optional target entity
    timestamp: v.number(), // When it happened

    // Event-specific data
    // For ai_page_generated: { prompt, tokensUsed, duration, model }
    // For deployment_completed: { url, buildTime, deploymentId }
    // For page_modified: { changes, previousVersion, newVersion }
    metadata: v.any(),
  })
    // Indexes for event queries
    .index("by_type", ["type"])
    .index("by_actor", ["actorId"])
    .index("by_target", ["targetId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_actor_type", ["actorId", "type"])
    .index("by_target_type", ["targetId", "type"])
    .index("by_type_timestamp", ["type", "timestamp"]),

  // ============================================================================
  // KNOWLEDGE: Labels, embeddings, and semantic search
  // ============================================================================
  knowledge: defineTable({
    knowledgeType: v.union(v.literal("label"), v.literal("chunk")),

    // For components: description, code snippet, category
    text: v.string(),

    // Vector embedding (3072 dimensions for text-embedding-3-large)
    embedding: v.optional(v.array(v.number())),

    // Source entity (optional)
    sourceEntityId: v.optional(v.id("entities")),

    // Labels for categorization
    labels: v.optional(v.array(v.string())),

    // Group scoping
    groupId: v.optional(v.id("groups")),

    // Metadata
    // For components: { category: "hero" | "features" | "pricing", preview: string, code: string }
    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_type", ["knowledgeType"])
    .index("by_source", ["sourceEntityId"])
    .index("by_group", ["groupId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 3072,
      filterFields: ["knowledgeType", "sourceEntityId", "groupId"],
    }),

  // ============================================================================
  // TAGS: Categorization and labels
  // ============================================================================
  tags: defineTable({
    entityId: v.id("entities"),
    key: v.string(),
    value: v.string(),
  })
    .index("by_entity", ["entityId"])
    .index("by_key", ["key"])
    .index("by_key_value", ["key", "value"]),
});
