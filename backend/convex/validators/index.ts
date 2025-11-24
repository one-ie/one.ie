/**
 * VALIDATORS INDEX
 *
 * Central export point for all validators used in mutations and queries.
 * Organized by category for easy discovery.
 */

// Property validators for all 66 thing types
export {
  PropertySchemas,
  getPropertyValidator,
  hasPropertySchema,
  // Core
  creatorProperties,
  aiCloneProperties,
  audienceMemberProperties,
  organizationProperties,
  // Agents
  strategyAgentProperties,
  researchAgentProperties,
  marketingAgentProperties,
  salesAgentProperties,
  serviceAgentProperties,
  designAgentProperties,
  engineeringAgentProperties,
  financeAgentProperties,
  legalAgentProperties,
  intelligenceAgentProperties,
  // Content
  blogPostProperties,
  videoProperties,
  podcastProperties,
  socialPostProperties,
  emailProperties,
  courseProperties,
  lessonProperties,
  // Products & Commerce
  productProperties,
  digitalProductProperties,
  membershipProperties,
  consultationProperties,
  nftProperties,
  // Community
  communityProperties,
  conversationProperties,
  messageProperties,
  // Tokens
  tokenProperties,
  tokenContractProperties,
  // Platform
  websiteProperties,
  landingPageProperties,
  templateProperties,
  livestreamProperties,
  // Business
  paymentProperties,
  subscriptionProperties,
  invoiceProperties,
  metricProperties,
  insightProperties,
  taskProperties,
  // Portfolio
  caseStudyProperties,
  projectProperties,
  pageProperties,
  fileProperties,
  linkProperties,
  noteProperties,
  // Product variants
  productVariantProperties,
  shoppingCartProperties,
  orderProperties,
  discountCodeProperties,
  // Blog categories
  blogCategoryProperties,
  // Contact
  contactSubmissionProperties,
} from "./properties";

// Temporal validators
export {
  validateConnectionTiming,
  validateEventTimestamp,
  validateEntityTimestamps,
  validateDeletionTimestamp,
  validateEventSequence,
  getTimeWindowValidity,
  getTimeDelta,
} from "./temporal";

// Metadata validators for all 67 event types
export {
  MetadataSchemas,
  validateEventMetadata,
  getMetadataSchema,
  supportsProtocol,
  getEventsByProtocol,
  // Entity lifecycle
  thingCreatedMetadata,
  thingUpdatedMetadata,
  thingDeletedMetadata,
  thingArchivedMetadata,
  thingViewedMetadata,
  // Blog events
  blogPostPublishedMetadata,
  blogPostViewedMetadata,
  // Portfolio
  projectViewedMetadata,
  // Commerce
  productAddedToCartMetadata,
  cartUpdatedMetadata,
  cartAbandonedMetadata,
  orderPlacedMetadata,
  orderFulfilledMetadata,
  orderShippedMetadata,
  orderDeliveredMetadata,
  // Payment
  paymentProcessedMetadata,
  paymentFailedMetadata,
  // Products
  productViewedMetadata,
  // Discount
  discountAppliedMetadata,
  // Contact
  contactSubmittedMetadata,
  // Connections
  connectionCreatedMetadata,
  // User/Auth
  userRegisteredMetadata,
  userVerifiedMetadata,
  userLoginMetadata,
  profileUpdatedMetadata,
  // Organization
  organizationCreatedMetadata,
  userJoinedOrgMetadata,
  userRemovedFromOrgMetadata,
  // Agents
  agentCreatedMetadata,
  agentExecutedMetadata,
  agentCompletedMetadata,
  agentFailedMetadata,
  // Workflows
  taskCompletedMetadata,
  implementationCompleteMetadata,
  fixStartedMetadata,
  fixCompleteMetadata,
  // Analytics
  metricCalculatedMetadata,
  insightGeneratedMetadata,
  predictionMadeMetadata,
  // Cycle
  cycleRequestMetadata,
  cycleCompletedMetadata,
  cycleFailedMetadata,
} from "./metadata";

// Type exports
export type { MetadataSchema } from "./metadata";
