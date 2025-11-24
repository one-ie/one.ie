/**
 * METADATA VALIDATORS FOR ALL 67 EVENT TYPES
 *
 * Ensures metadata structure matches event type and includes required protocol information.
 * Supports:
 * - Entity lifecycle events (created, updated, deleted, archived)
 * - Specific entity events (course_created, lesson_created, etc.)
 * - Consolidated event families with rich metadata
 *
 * Pattern:
 * 1. Define MetadataSchema for each event type
 * 2. Use validator in mutations before logging events
 * 3. Protocol field supports multi-protocol events (payment, commerce, etc.)
 *
 * Example:
 * ```
 * const schema = MetadataSchemas[eventType];
 * if (schema && schema.validate) {
 *   const valid = schema.validate(metadata);
 *   if (!valid) throw new Error("Invalid metadata");
 * }
 * ```
 */

export interface MetadataSchema {
  name: string;
  description: string;
  protocol?: "payment" | "commerce" | "communication" | "task" | "cycle";
  requiredFields?: string[];
  optionalFields?: string[];
  validate?: (metadata: any) => boolean;
}

// ============================================================================
// ENTITY LIFECYCLE EVENTS (4 consolidated types)
// ============================================================================

export const thingCreatedMetadata: MetadataSchema = {
  name: "thing_created",
  description: "Entity creation event",
  requiredFields: ["entityType"],
  optionalFields: ["entityId", "groupId", "properties"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.entityType === "string"
    );
  },
};

export const thingUpdatedMetadata: MetadataSchema = {
  name: "thing_updated",
  description: "Entity update event",
  requiredFields: ["entityType"],
  optionalFields: ["entityId", "groupId", "changes", "previousValues"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.entityType === "string"
    );
  },
};

export const thingDeletedMetadata: MetadataSchema = {
  name: "thing_deleted",
  description: "Entity deletion event",
  requiredFields: ["entityType"],
  optionalFields: ["entityId", "groupId", "reason"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.entityType === "string"
    );
  },
};

export const thingArchivedMetadata: MetadataSchema = {
  name: "thing_archived",
  description: "Entity archival event",
  requiredFields: ["entityType"],
  optionalFields: ["entityId", "groupId", "reason"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.entityType === "string"
    );
  },
};

export const thingViewedMetadata: MetadataSchema = {
  name: "thing_viewed",
  description: "Entity view/access event",
  requiredFields: ["entityType"],
  optionalFields: ["entityId", "groupId", "referrer"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.entityType === "string"
    );
  },
};

// ============================================================================
// BLOG EVENTS (3)
// ============================================================================

export const blogPostPublishedMetadata: MetadataSchema = {
  name: "blog_post_published",
  description: "Blog post publication event",
  requiredFields: ["postId", "postTitle"],
  optionalFields: ["category", "tags", "excerpt"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.postId === "string" &&
      typeof metadata.postTitle === "string"
    );
  },
};

export const blogPostViewedMetadata: MetadataSchema = {
  name: "blog_post_viewed",
  description: "Blog post view event",
  requiredFields: ["postId"],
  optionalFields: ["postTitle", "referrer"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.postId === "string";
  },
};

// ============================================================================
// PORTFOLIO EVENTS (2)
// ============================================================================

export const projectViewedMetadata: MetadataSchema = {
  name: "project_viewed",
  description: "Project view event",
  requiredFields: ["projectId"],
  optionalFields: ["projectName", "referrer"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.projectId === "string";
  },
};

// ============================================================================
// COMMERCE EVENTS (consolidated)
// ============================================================================

export const productAddedToCartMetadata: MetadataSchema = {
  name: "product_added_to_cart",
  description: "Product added to shopping cart",
  requiredFields: ["productId", "quantity", "price"],
  optionalFields: ["cartId", "variant"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.productId === "string" &&
      typeof metadata.quantity === "number" &&
      typeof metadata.price === "number"
    );
  },
};

export const cartUpdatedMetadata: MetadataSchema = {
  name: "cart_updated",
  description: "Shopping cart updated",
  requiredFields: ["cartId", "itemCount", "total"],
  optionalFields: ["items", "changes"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.cartId === "string" &&
      typeof metadata.itemCount === "number" &&
      typeof metadata.total === "number"
    );
  },
};

export const cartAbandonedMetadata: MetadataSchema = {
  name: "cart_abandoned",
  description: "Shopping cart abandoned",
  requiredFields: ["cartId", "total"],
  optionalFields: ["itemCount", "lastUpdated"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.cartId === "string" &&
      typeof metadata.total === "number"
    );
  },
};

export const orderPlacedMetadata: MetadataSchema = {
  name: "order_placed",
  description: "Order placed event",
  protocol: "commerce",
  requiredFields: ["orderId", "total", "itemCount"],
  optionalFields: ["items", "shippingAddress", "paymentMethod"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.orderId === "string" &&
      typeof metadata.total === "number" &&
      typeof metadata.itemCount === "number"
    );
  },
};

export const orderFulfilledMetadata: MetadataSchema = {
  name: "order_fulfilled",
  description: "Order fulfilled event",
  protocol: "commerce",
  requiredFields: ["orderId"],
  optionalFields: ["trackingNumber", "carrier"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.orderId === "string";
  },
};

export const orderShippedMetadata: MetadataSchema = {
  name: "order_shipped",
  description: "Order shipped event",
  protocol: "commerce",
  requiredFields: ["orderId", "trackingNumber"],
  optionalFields: ["carrier", "estimatedDelivery"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.orderId === "string" &&
      typeof metadata.trackingNumber === "string"
    );
  },
};

export const orderDeliveredMetadata: MetadataSchema = {
  name: "order_delivered",
  description: "Order delivered event",
  protocol: "commerce",
  requiredFields: ["orderId"],
  optionalFields: ["deliveredAt", "signature"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.orderId === "string";
  },
};

// ============================================================================
// PAYMENT EVENTS (consolidated)
// ============================================================================

export const paymentProcessedMetadata: MetadataSchema = {
  name: "payment_processed",
  description: "Payment successful event",
  protocol: "payment",
  requiredFields: ["amount", "currency", "paymentId"],
  optionalFields: ["method", "fee", "orderId"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.amount === "number" &&
      typeof metadata.currency === "string" &&
      typeof metadata.paymentId === "string"
    );
  },
};

export const paymentFailedMetadata: MetadataSchema = {
  name: "payment_failed",
  description: "Payment failed event",
  protocol: "payment",
  requiredFields: ["amount", "currency", "reason"],
  optionalFields: ["paymentId", "errorCode", "orderId"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.amount === "number" &&
      typeof metadata.currency === "string" &&
      typeof metadata.reason === "string"
    );
  },
};

// ============================================================================
// PRODUCT EVENTS
// ============================================================================

export const productViewedMetadata: MetadataSchema = {
  name: "product_viewed",
  description: "Product view event",
  requiredFields: ["productId"],
  optionalFields: ["productName", "category", "referrer"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.productId === "string";
  },
};

// ============================================================================
// DISCOUNT EVENTS
// ============================================================================

export const discountAppliedMetadata: MetadataSchema = {
  name: "discount_applied",
  description: "Discount code applied event",
  requiredFields: ["discountCode", "discountAmount"],
  optionalFields: ["orderId", "originalTotal", "newTotal"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.discountCode === "string" &&
      typeof metadata.discountAmount === "number"
    );
  },
};

// ============================================================================
// CONTACT EVENTS
// ============================================================================

export const contactSubmittedMetadata: MetadataSchema = {
  name: "contact_submitted",
  description: "Contact form submission event",
  requiredFields: ["email", "subject"],
  optionalFields: ["name", "message", "phone"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.email === "string" &&
      typeof metadata.subject === "string"
    );
  },
};

// ============================================================================
// CONNECTION EVENTS
// ============================================================================

export const connectionCreatedMetadata: MetadataSchema = {
  name: "connection_created",
  description: "Relationship created event",
  requiredFields: ["relationshipType", "fromEntityId", "toEntityId"],
  optionalFields: ["metadata", "strength"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.relationshipType === "string" &&
      typeof metadata.fromEntityId === "string" &&
      typeof metadata.toEntityId === "string"
    );
  },
};

// ============================================================================
// USER/AUTHENTICATION EVENTS
// ============================================================================

export const userRegisteredMetadata: MetadataSchema = {
  name: "user_registered",
  description: "User registration event",
  requiredFields: ["email"],
  optionalFields: ["displayName", "authProvider"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.email === "string";
  },
};

export const userVerifiedMetadata: MetadataSchema = {
  name: "user_verified",
  description: "User email verification event",
  requiredFields: ["email"],
  optionalFields: ["verificationMethod"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.email === "string";
  },
};

export const userLoginMetadata: MetadataSchema = {
  name: "user_login",
  description: "User login event",
  requiredFields: ["email"],
  optionalFields: ["ipAddress", "userAgent", "authMethod"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.email === "string";
  },
};

export const profileUpdatedMetadata: MetadataSchema = {
  name: "profile_updated",
  description: "User profile update event",
  requiredFields: ["userId"],
  optionalFields: ["changes", "previousValues"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.userId === "string";
  },
};

// ============================================================================
// ORGANIZATION EVENTS
// ============================================================================

export const organizationCreatedMetadata: MetadataSchema = {
  name: "organization_created",
  description: "Organization creation event",
  requiredFields: ["organizationId", "organizationName"],
  optionalFields: ["plan", "owner"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.organizationId === "string" &&
      typeof metadata.organizationName === "string"
    );
  },
};

export const userJoinedOrgMetadata: MetadataSchema = {
  name: "user_joined_org",
  description: "User joined organization event",
  requiredFields: ["organizationId", "userId", "role"],
  optionalFields: ["joinedAt"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.organizationId === "string" &&
      typeof metadata.userId === "string" &&
      typeof metadata.role === "string"
    );
  },
};

export const userRemovedFromOrgMetadata: MetadataSchema = {
  name: "user_removed_from_org",
  description: "User removed from organization event",
  requiredFields: ["organizationId", "userId"],
  optionalFields: ["reason", "removedBy"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.organizationId === "string" &&
      typeof metadata.userId === "string"
    );
  },
};

// ============================================================================
// AGENT EVENTS
// ============================================================================

export const agentCreatedMetadata: MetadataSchema = {
  name: "agent_created",
  description: "AI agent creation event",
  requiredFields: ["agentType"],
  optionalFields: ["agentId", "model", "configuration"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.agentType === "string"
    );
  },
};

export const agentExecutedMetadata: MetadataSchema = {
  name: "agent_executed",
  description: "Agent execution event",
  requiredFields: ["agentId", "agentType"],
  optionalFields: ["input", "executionTime"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.agentId === "string" &&
      typeof metadata.agentType === "string"
    );
  },
};

export const agentCompletedMetadata: MetadataSchema = {
  name: "agent_completed",
  description: "Agent task completion event",
  requiredFields: ["agentId"],
  optionalFields: ["output", "executionTime", "tokensUsed"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.agentId === "string";
  },
};

export const agentFailedMetadata: MetadataSchema = {
  name: "agent_failed",
  description: "Agent failure event",
  requiredFields: ["agentId", "error"],
  optionalFields: ["executionTime", "stackTrace"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.agentId === "string" &&
      typeof metadata.error === "string"
    );
  },
};

// ============================================================================
// WORKFLOW/TASK EVENTS
// ============================================================================

export const taskCompletedMetadata: MetadataSchema = {
  name: "task_completed",
  description: "Task completion event",
  requiredFields: ["taskId"],
  optionalFields: ["result", "completedAt"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.taskId === "string";
  },
};

export const implementationCompleteMetadata: MetadataSchema = {
  name: "implementation_complete",
  description: "Feature implementation completion event",
  requiredFields: ["featureId"],
  optionalFields: ["description", "modulesImplemented", "testsCovered"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.featureId === "string";
  },
};

export const fixStartedMetadata: MetadataSchema = {
  name: "fix_started",
  description: "Bug fix start event",
  requiredFields: ["issueId"],
  optionalFields: ["description", "assignee"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.issueId === "string";
  },
};

export const fixCompleteMetadata: MetadataSchema = {
  name: "fix_complete",
  description: "Bug fix completion event",
  requiredFields: ["issueId"],
  optionalFields: ["resolution", "testsPassed"],
  validate: (metadata) => {
    return metadata && typeof metadata === "object" && typeof metadata.issueId === "string";
  },
};

// ============================================================================
// ANALYTICS/INTELLIGENCE EVENTS
// ============================================================================

export const metricCalculatedMetadata: MetadataSchema = {
  name: "metric_calculated",
  description: "Metric calculation event",
  requiredFields: ["metricKey", "value"],
  optionalFields: ["unit", "timestamp", "target"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.metricKey === "string" &&
      metadata.value !== undefined
    );
  },
};

export const insightGeneratedMetadata: MetadataSchema = {
  name: "insight_generated",
  description: "Insight generation event",
  protocol: "cycle",
  requiredFields: ["insightType"],
  optionalFields: ["title", "confidence", "actionItems"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.insightType === "string"
    );
  },
};

export const predictionMadeMetadata: MetadataSchema = {
  name: "prediction_made",
  description: "Prediction event",
  protocol: "cycle",
  requiredFields: ["modelId", "prediction"],
  optionalFields: ["confidence", "features"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.modelId === "string" &&
      metadata.prediction !== undefined
    );
  },
};

// ============================================================================
// INFERENCE/AI EVENTS
// ============================================================================

export const cycleRequestMetadata: MetadataSchema = {
  name: "cycle_request",
  description: "Cycle request event",
  protocol: "cycle",
  requiredFields: ["modelId", "input"],
  optionalFields: ["temperature", "maxTokens"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.modelId === "string"
    );
  },
};

export const cycleCompletedMetadata: MetadataSchema = {
  name: "cycle_completed",
  description: "Cycle completion event",
  protocol: "cycle",
  requiredFields: ["modelId", "output"],
  optionalFields: ["tokensUsed", "latency"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.modelId === "string"
    );
  },
};

export const cycleFailedMetadata: MetadataSchema = {
  name: "cycle_failed",
  description: "Cycle failure event",
  protocol: "cycle",
  requiredFields: ["modelId", "error"],
  optionalFields: ["errorCode"],
  validate: (metadata) => {
    return (
      metadata &&
      typeof metadata === "object" &&
      typeof metadata.modelId === "string" &&
      typeof metadata.error === "string"
    );
  },
};

// ============================================================================
// METADATA SCHEMA REGISTRY
// ============================================================================

export const MetadataSchemas: Record<string, MetadataSchema> = {
  // Entity lifecycle
  thing_created: thingCreatedMetadata,
  thing_updated: thingUpdatedMetadata,
  thing_deleted: thingDeletedMetadata,
  thing_archived: thingArchivedMetadata,
  thing_viewed: thingViewedMetadata,

  // Blog
  blog_post_published: blogPostPublishedMetadata,
  blog_post_viewed: blogPostViewedMetadata,

  // Portfolio
  project_viewed: projectViewedMetadata,

  // Commerce
  product_added_to_cart: productAddedToCartMetadata,
  cart_updated: cartUpdatedMetadata,
  cart_abandoned: cartAbandonedMetadata,
  order_placed: orderPlacedMetadata,
  order_fulfilled: orderFulfilledMetadata,
  order_shipped: orderShippedMetadata,
  order_delivered: orderDeliveredMetadata,

  // Payment
  payment_processed: paymentProcessedMetadata,
  payment_failed: paymentFailedMetadata,

  // Products
  product_viewed: productViewedMetadata,

  // Discount
  discount_applied: discountAppliedMetadata,

  // Contact
  contact_submitted: contactSubmittedMetadata,

  // Connections
  connection_created: connectionCreatedMetadata,

  // User/Auth
  user_registered: userRegisteredMetadata,
  user_verified: userVerifiedMetadata,
  user_login: userLoginMetadata,
  profile_updated: profileUpdatedMetadata,

  // Organization
  organization_created: organizationCreatedMetadata,
  user_joined_org: userJoinedOrgMetadata,
  user_removed_from_org: userRemovedFromOrgMetadata,

  // Agents
  agent_created: agentCreatedMetadata,
  agent_executed: agentExecutedMetadata,
  agent_completed: agentCompletedMetadata,
  agent_failed: agentFailedMetadata,

  // Workflows
  task_completed: taskCompletedMetadata,
  implementation_complete: implementationCompleteMetadata,
  fix_started: fixStartedMetadata,
  fix_complete: fixCompleteMetadata,

  // Analytics
  metric_calculated: metricCalculatedMetadata,
  insight_generated: insightGeneratedMetadata,
  prediction_made: predictionMadeMetadata,

  // Cycle
  cycle_request: cycleRequestMetadata,
  cycle_completed: cycleCompletedMetadata,
  cycle_failed: cycleFailedMetadata,
};

/**
 * Validate event metadata against its type schema
 *
 * Returns array of validation errors (empty if valid)
 */
export function validateEventMetadata(
  eventType: string,
  metadata: any
): Array<string> {
  const schema = MetadataSchemas[eventType];
  if (!schema) {
    return [`Unknown event type: ${eventType}`];
  }

  const errors: string[] = [];

  // Check required fields
  if (schema.requiredFields) {
    for (const field of schema.requiredFields) {
      if (!(field in metadata)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Run custom validator if provided
  if (schema.validate) {
    const isValid = schema.validate(metadata);
    if (!isValid) {
      errors.push(`Metadata validation failed for event type: ${eventType}`);
    }
  }

  return errors;
}

/**
 * Get metadata schema for an event type
 */
export function getMetadataSchema(eventType: string): MetadataSchema | undefined {
  return MetadataSchemas[eventType];
}

/**
 * Check if event type supports a specific protocol
 */
export function supportsProtocol(
  eventType: string,
  protocol: string
): boolean {
  const schema = MetadataSchemas[eventType];
  return schema?.protocol === protocol;
}

/**
 * Get all event types for a specific protocol
 */
export function getEventsByProtocol(protocol: string): string[] {
  return Object.entries(MetadataSchemas)
    .filter(([_, schema]) => schema.protocol === protocol)
    .map(([eventType, _]) => eventType);
}
