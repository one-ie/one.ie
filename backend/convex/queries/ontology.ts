/**
 * Ontology Query Endpoint
 *
 * Runtime ontology discovery for frontend applications
 * Allows UI to conditionally render features based on enabled composition
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import {
  THING_TYPES,
  CONNECTION_TYPES,
  EVENT_TYPES,
  ENABLED_FEATURES,
  ONTOLOGY_METADATA,
  type ThingType,
  type ConnectionType,
  type EventType,
} from "../types/ontology";

/**
 * Get ontology composition metadata
 * Returns information about enabled features and available types
 */
export const getMetadata = query({
  args: {},
  handler: async () => {
    return ONTOLOGY_METADATA;
  },
});

/**
 * Get all thing types
 * Returns array of all entity types available in current composition
 */
export const getThingTypes = query({
  args: {},
  handler: async () => {
    return Array.from(THING_TYPES);
  },
});

/**
 * Get all connection types
 * Returns array of all relationship types available in current composition
 */
export const getConnectionTypes = query({
  args: {},
  handler: async () => {
    return Array.from(CONNECTION_TYPES);
  },
});

/**
 * Get all event types
 * Returns array of all event types available in current composition
 */
export const getEventTypes = query({
  args: {},
  handler: async () => {
    return Array.from(EVENT_TYPES);
  },
});

/**
 * Get enabled features
 * Returns array of features included in current ontology composition
 */
export const getEnabledFeatures = query({
  args: {},
  handler: async () => {
    return Array.from(ENABLED_FEATURES);
  },
});

/**
 * Check if a specific feature is enabled
 *
 * @param feature - Feature name to check
 * @returns true if feature is enabled in current composition
 */
export const hasFeature = query({
  args: { feature: v.string() },
  handler: async (_, { feature }) => {
    return ENABLED_FEATURES.includes(feature as any);
  },
});

/**
 * Get complete ontology information
 * Useful for building dynamic UIs that adapt to enabled features
 *
 * @returns Complete ontology configuration including all types and metadata
 */
export const getOntology = query({
  args: {},
  handler: async () => {
    return {
      features: Array.from(ENABLED_FEATURES),
      thingTypes: Array.from(THING_TYPES),
      connectionTypes: Array.from(CONNECTION_TYPES),
      eventTypes: Array.from(EVENT_TYPES),
      metadata: ONTOLOGY_METADATA,
    };
  },
});

/**
 * Get feature breakdown with type information
 * Returns detailed information about what each feature provides
 */
export const getFeatureBreakdown = query({
  args: {},
  handler: async () => {
    // Manual mapping based on generated ontology comments
    // This could be auto-generated in the future
    return {
      core: {
        description: "Core ontology always present in every ONE installation",
        thingTypes: ["page", "user", "file", "link", "note"] as ThingType[],
        connectionTypes: ["created_by", "updated_by", "viewed_by", "favorited_by"] as ConnectionType[],
        eventTypes: ["thing_created", "thing_updated", "thing_deleted", "thing_viewed"] as EventType[],
      },
      blog: ENABLED_FEATURES.includes("blog") ? {
        description: "Blog and content publishing",
        thingTypes: ["blog_post", "blog_category"] as ThingType[],
        connectionTypes: ["posted_in"] as ConnectionType[],
        eventTypes: ["blog_post_published", "blog_post_viewed"] as EventType[],
      } : undefined,
      portfolio: ENABLED_FEATURES.includes("portfolio") ? {
        description: "Portfolio and project showcase",
        thingTypes: ["project", "case_study"] as ThingType[],
        connectionTypes: ["belongs_to_portfolio"] as ConnectionType[],
        eventTypes: ["project_viewed"] as EventType[],
      } : undefined,
      shop: ENABLED_FEATURES.includes("shop") ? {
        description: "E-commerce and online store functionality",
        thingTypes: ["product", "product_variant", "shopping_cart", "order", "discount_code", "payment"] as ThingType[],
        connectionTypes: ["purchased", "in_cart", "variant_of", "ordered", "paid_for"] as ConnectionType[],
        eventTypes: [
          "product_added_to_cart", "cart_updated", "cart_abandoned",
          "order_placed", "order_fulfilled", "order_shipped", "order_delivered",
          "payment_processed", "payment_failed", "product_viewed", "discount_applied"
        ] as EventType[],
      } : undefined,
    };
  },
});
