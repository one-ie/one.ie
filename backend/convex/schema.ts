/**
 * Convex Schema - 6-Dimension Ontology Implementation
 *
 * This schema implements the universal 6-dimension ontology that models reality itself.
 *
 * 5 Tables:
 * 1. groups       - Dimension 1: Multi-tenant containers (organizations, teams, etc.)
 * 2. things       - Dimensions 2 & 3: People + Things (all entities)
 * 3. connections  - Dimension 4: All relationships between things
 * 4. events       - Dimension 5: Complete audit trail of actions
 * 5. knowledge    - Dimension 6: Labels, embeddings, RAG
 *
 * Design Principle: Reality doesn't change. Technology does.
 * This schema models reality, so it never needs migration.
 *
 * @see /one/knowledge/ontology.md - Ontology specification
 * @see /one/things/plans/cycle-011-schema-design.md - Schema design
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// DIMENSION 1: GROUPS (Multi-Tenant Isolation)
// ============================================================================

const groups = defineTable({
  // Core fields
  slug: v.string(),                    // URL-safe identifier (unique)
  name: v.string(),                    // Display name
  type: v.string(),                    // organization, team, project, etc.

  // Hierarchy
  parentGroupId: v.optional(v.id("groups")),  // Infinite nesting

  // Metadata
  description: v.optional(v.string()),
  metadata: v.optional(v.any()),       // Flexible JSON metadata

  // Settings
  settings: v.optional(v.any()),       // Group-specific configuration

  // Status & Lifecycle
  status: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("suspended"),
    v.literal("archived")
  ),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_type", ["type"])
  .index("by_parent", ["parentGroupId"])
  .index("by_status", ["status"]);

// ============================================================================
// DIMENSIONS 2 & 3: THINGS (People + All Entities)
// ============================================================================

/**
 * Thing Types (66+ types, extensible via properties)
 *
 * PEOPLE TYPES (Dimension 2):
 * - creator, customer, team_member
 *
 * CORE TYPES:
 * - organization, ai_clone, audience_member
 *
 * AGENT TYPES:
 * - agent, engineering_agent, strategy_agent, marketing_agent
 *
 * CONTENT TYPES:
 * - blog_post, video, podcast, course, lesson, article
 *
 * PRODUCT TYPES:
 * - digital_product, membership, consultation, nft
 *
 * COMMUNITY TYPES:
 * - community, conversation, message
 *
 * TOKEN TYPES:
 * - token, token_contract
 *
 * PLATFORM TYPES:
 * - website, landing_page, template, livestream
 *
 * BUSINESS TYPES:
 * - payment, subscription, invoice, metric, insight, task
 *
 * FUNNEL BUILDER TYPES (NEW - Cycle 011):
 * - funnel, funnel_step, page_element, funnel_template, page_template
 * - form_submission, ab_test, funnel_domain, funnel_analytics, email_sequence
 * - custom_code
 */
const things = defineTable({
  // Core fields
  type: v.string(),                    // 66+ thing types (see above)
  name: v.string(),                    // Display name

  // Multi-tenant isolation
  groupId: v.optional(v.id("groups")), // Every thing belongs to a group (except platform things)

  // Flexible properties (type-specific data)
  properties: v.any(),                 // JSON property bag

  // Status lifecycle
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("published"),
    v.literal("archived")
  ),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_type", ["type"])
  .index("by_group_type", ["groupId", "type"])     // PRIMARY query pattern
  .index("by_type_status", ["type", "status"])
  .index("by_status", ["status"])
  .searchIndex("search_things", {
    searchField: "name",
    filterFields: ["type", "status", "groupId"]
  });

// ============================================================================
// DIMENSION 4: CONNECTIONS (Relationships)
// ============================================================================

/**
 * Connection Types (25+ types)
 *
 * OWNERSHIP:
 * - owns, created_by
 *
 * AI:
 * - clone_of, trained_on, powers
 *
 * CONTENT:
 * - authored, generated_by, published_to, part_of, references
 *
 * COMMUNITY:
 * - member_of, following, moderates, participated_in
 *
 * BUSINESS:
 * - manages, reports_to, collaborates_with
 *
 * TOKEN:
 * - holds_tokens, staked_in, earned_from
 *
 * PRODUCT:
 * - purchased, enrolled_in, completed, teaching
 *
 * FUNNEL BUILDER (NEW - Cycle 011):
 * - funnel_contains_step, step_contains_element, funnel_based_on_template
 * - step_based_on_template, visitor_entered_funnel, visitor_viewed_step
 * - visitor_submitted_form, customer_purchased_via_funnel, funnel_leads_to_product
 * - ab_test_variant, funnel_sends_email, funnel_uses_domain
 *
 * CONSOLIDATED:
 * - transacted, notified, referred, communicated, delegated, approved, fulfilled
 */
const connections = defineTable({
  // Relationship endpoints
  fromThingId: v.id("things"),         // Source entity
  toThingId: v.id("things"),           // Target entity

  // Relationship type
  relationshipType: v.string(),        // 25+ relationship types (see above)

  // Relationship metadata
  metadata: v.optional(v.any()),       // Relationship-specific data
  strength: v.optional(v.number()),    // Relationship strength (0-1)

  // Temporal validity
  validFrom: v.number(),               // When relationship became valid
  validTo: v.optional(v.number()),     // When relationship ended (optional)

  // Timestamps
  createdAt: v.number(),
})
  .index("from_type", ["fromThingId", "relationshipType"])
  .index("to_type", ["toThingId", "relationshipType"])
  .index("relationship_type", ["relationshipType"])
  .index("by_from", ["fromThingId"])
  .index("by_to", ["toThingId"]);

// ============================================================================
// DIMENSION 5: EVENTS (Audit Trail)
// ============================================================================

/**
 * Event Types (67+ types)
 *
 * ENTITY LIFECYCLE:
 * - entity_created, entity_updated, entity_deleted, entity_archived
 *
 * USER EVENTS:
 * - user_registered, user_verified, user_login, profile_updated
 *
 * ORGANIZATION:
 * - organization_created, user_joined_org, user_removed_from_org
 *
 * AGENT EVENTS:
 * - agent_created, agent_executed, agent_completed, agent_failed
 *
 * WORKFLOW:
 * - task_completed, implementation_complete, fix_started, fix_complete
 *
 * ANALYTICS:
 * - metric_calculated, insight_generated, prediction_made
 *
 * CYCLE:
 * - cycle_request, cycle_completed, cycle_failed
 *
 * FUNNEL BUILDER (NEW - Cycle 011):
 * - funnel_created, funnel_published, funnel_unpublished, funnel_duplicated
 * - funnel_archived, step_added, step_removed, step_reordered
 * - element_added, element_updated, element_removed
 * - form_submitted, purchase_completed, ab_test_started, ab_test_completed
 * - email_sent, domain_connected, analytics_generated
 *
 * CONSOLIDATED:
 * - content_event, payment_event, subscription_event, commerce_event
 * - communication_event, task_event
 */
const events = defineTable({
  // Event type
  type: v.string(),                    // 67+ event types (see above)

  // Event participants
  actorId: v.id("things"),             // Who performed the action
  targetId: v.optional(v.id("things")), // What was affected (optional)

  // Event metadata
  timestamp: v.number(),               // When it happened
  metadata: v.optional(v.any()),       // Event-specific data
})
  .index("by_type", ["type"])
  .index("by_actor", ["actorId", "timestamp"])
  .index("by_target", ["targetId", "timestamp"])
  .index("by_time", ["timestamp"]);

// ============================================================================
// DIMENSION 6: KNOWLEDGE (Labels + Vectors + RAG)
// ============================================================================

/**
 * Knowledge Types:
 * - label: Categorical tags (e.g., "ecommerce", "high-converting")
 * - chunk: Text chunks with embeddings for RAG
 */
const knowledge = defineTable({
  // Knowledge type
  knowledgeType: v.union(
    v.literal("label"),
    v.literal("chunk")
  ),

  // Content
  text: v.string(),                    // Label text or chunk text

  // Embeddings (for semantic search)
  embedding: v.optional(v.array(v.number())),  // Vector embedding
  embeddingModel: v.optional(v.string()),      // Model used (e.g., "text-embedding-3-large")
  embeddingDim: v.optional(v.number()),        // Dimension count (e.g., 3072)

  // Source reference
  sourceThingId: v.optional(v.id("things")),   // Which thing this knowledge came from
  sourceField: v.optional(v.string()),         // Which field (e.g., "description")
  chunk: v.optional(v.number()),               // Chunk index if split

  // Labels (categorical)
  labels: v.optional(v.array(v.string())),     // Associated labels

  // Metadata
  metadata: v.optional(v.any()),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 3072,                   // OpenAI text-embedding-3-large
    filterFields: ["knowledgeType", "sourceThingId"]
  })
  .index("by_source", ["sourceThingId"])
  .index("by_type", ["knowledgeType"]);

// ============================================================================
// SCHEMA EXPORT
// ============================================================================

export default defineSchema({
  groups,
  things,
  connections,
  events,
  knowledge,
});

/**
 * Design Philosophy:
 *
 * This schema implements a universal ontology that models reality itself.
 * Every system (Shopify, Moodle, Stripe, WordPress, ClickFunnels) maps to
 * these same 6 dimensions.
 *
 * Benefits:
 * - 98% AI code generation accuracy (pattern convergence)
 * - Zero migrations (reality doesn't change)
 * - Universal feature import (every system maps to 6 dimensions)
 * - Compound structure (each feature makes AI smarter)
 *
 * Examples:
 * - Shopify Product → thing (type: "product")
 * - Moodle Course → thing (type: "course")
 * - ClickFunnels Funnel → thing (type: "funnel")
 * - Shopify Order → connection (type: "purchased") + event (type: "purchase_completed")
 * - Moodle Enrollment → connection (type: "enrolled_in")
 * - WordPress Category → knowledge (type: "label")
 *
 * The 6-dimension ontology is the universal code generation language.
 */
