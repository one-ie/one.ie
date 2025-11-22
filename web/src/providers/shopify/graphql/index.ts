/**
 * Shopify GraphQL Operations
 *
 * Central export file for all Shopify GraphQL queries, mutations, fragments, and types.
 *
 * Usage:
 * ```typescript
 * import {
 *   GET_PRODUCT,
 *   CREATE_PRODUCT,
 *   LIST_PRODUCTS,
 *   type GetProductVariables,
 *   type CreateProductResponse
 * } from '@/providers/shopify/graphql';
 * ```
 *
 * API Version: 2025-10
 * Documentation: https://shopify.dev/docs/api/admin-graphql
 */

// =============================================================================
// FRAGMENTS
// =============================================================================

export {
  // Product fragments
  PRODUCT_BASIC_FRAGMENT,
  VARIANT_FRAGMENT,
  PRODUCT_FULL_FRAGMENT,

  // Order fragments
  ORDER_LINE_ITEM_FRAGMENT,
  ORDER_BASIC_FRAGMENT,
  ORDER_FULL_FRAGMENT,

  // Customer fragments
  CUSTOMER_BASIC_FRAGMENT,
  CUSTOMER_FULL_FRAGMENT,

  // Other fragments
  INVENTORY_LEVEL_FRAGMENT,
  COLLECTION_BASIC_FRAGMENT,
  METAFIELD_FRAGMENT,
} from './queries';

// =============================================================================
// QUERIES
// =============================================================================

export {
  // Product queries
  GET_PRODUCT,
  LIST_PRODUCTS,
  SEARCH_PRODUCTS,
  GET_PRODUCT_VARIANTS,

  // Order queries
  GET_ORDER,
  LIST_ORDERS,
  GET_ORDER_FULFILLMENTS,

  // Customer queries
  GET_CUSTOMER,
  LIST_CUSTOMERS,
  SEARCH_CUSTOMERS,

  // Inventory queries
  GET_INVENTORY_LEVELS,
  GET_INVENTORY_ITEM,

  // Collection queries
  GET_COLLECTION,
  LIST_COLLECTIONS,

  // Shop queries
  GET_SHOP,
} from './queries';

// =============================================================================
// MUTATIONS
// =============================================================================

export {
  // Product mutations
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  PUBLISH_PRODUCT,

  // Variant mutations
  CREATE_PRODUCT_VARIANT,
  UPDATE_PRODUCT_VARIANT,
  DELETE_PRODUCT_VARIANT,

  // Customer mutations
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,

  // Order mutations
  CREATE_DRAFT_ORDER,
  UPDATE_ORDER,
  CANCEL_ORDER,
  CREATE_FULFILLMENT,
  CREATE_REFUND,

  // Inventory mutations
  ADJUST_INVENTORY_LEVEL,
  SET_INVENTORY_LEVEL,
  ACTIVATE_INVENTORY,

  // Metafield mutations
  METAFIELDS_SET,
  METAFIELD_DELETE,

  // Webhook mutations
  WEBHOOK_SUBSCRIPTION_CREATE,
  WEBHOOK_SUBSCRIPTION_DELETE,
  WEBHOOK_SUBSCRIPTION_UPDATE,

  // Bulk operations
  BULK_OPERATION_RUN_QUERY,
  BULK_OPERATION_CANCEL,
} from './mutations';

// =============================================================================
// QUERY TYPES
// =============================================================================

export type {
  // Product query types
  GetProductVariables,
  GetProductResponse,
  ListProductsVariables,
  ListProductsResponse,

  // Order query types
  GetOrderVariables,
  GetOrderResponse,
  ListOrdersVariables,

  // Customer query types
  GetCustomerVariables,
  GetCustomerResponse,
  ListCustomersVariables,

  // Inventory query types
  GetInventoryLevelsVariables,
  GetInventoryItemVariables,

  // Collection query types
  GetCollectionVariables,
  ListCollectionsVariables,

  // Shop query types
  GetShopResponse,

  // Pagination types
  PageInfo,
  PaginatedResponse,
} from './queries';

// =============================================================================
// MUTATION TYPES
// =============================================================================

export type {
  // Shared types
  UserError,
  MutationResponse,

  // Product mutation types
  ProductInput,
  CreateProductVariables,
  CreateProductResponse,
  UpdateProductVariables,
  UpdateProductResponse,
  DeleteProductVariables,
  DeleteProductResponse,
  PublishProductVariables,

  // Variant mutation types
  ProductVariantInput,
  CreateProductVariantVariables,
  CreateProductVariantResponse,
  UpdateProductVariantVariables,
  UpdateProductVariantResponse,
  DeleteProductVariantVariables,
  DeleteProductVariantResponse,

  // Customer mutation types
  CustomerInput,
  CreateCustomerVariables,
  CreateCustomerResponse,
  UpdateCustomerVariables,
  UpdateCustomerResponse,
  DeleteCustomerVariables,
  DeleteCustomerResponse,

  // Order mutation types
  DraftOrderInput,
  CreateDraftOrderVariables,
  CreateDraftOrderResponse,
  UpdateOrderVariables,
  CancelOrderVariables,
  CancelOrderResponse,

  // Fulfillment mutation types
  FulfillmentInput,
  CreateFulfillmentVariables,
  CreateFulfillmentResponse,

  // Refund mutation types
  RefundInput,
  CreateRefundVariables,
  CreateRefundResponse,

  // Inventory mutation types
  AdjustInventoryLevelVariables,
  AdjustInventoryLevelResponse,
  SetInventoryLevelVariables,
  SetInventoryLevelResponse,
  ActivateInventoryVariables,

  // Metafield mutation types
  MetafieldInput,
  MetafieldsSetVariables,
  MetafieldsSetResponse,
  MetafieldDeleteVariables,
  MetafieldDeleteResponse,

  // Webhook mutation types
  WebhookTopic,
  WebhookSubscriptionCreateVariables,
  WebhookSubscriptionCreateResponse,
  WebhookSubscriptionDeleteVariables,
  WebhookSubscriptionDeleteResponse,
  WebhookSubscriptionUpdateVariables,

  // Bulk operation types
  BulkOperationRunQueryVariables,
  BulkOperationRunQueryResponse,
  BulkOperationCancelVariables,
} from './mutations';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export {
  // Query helpers
  extractNodes,
  hasMorePages,
  getNextCursor,
  paginateQuery,
  estimateQueryCost,
  isQueryTooExpensive,
} from './queries';

export {
  // Mutation helpers
  hasUserErrors,
  getUserErrors,
  getFirstErrorMessage,
  throwIfUserErrors,
  extractMutationResult,
  batchMetafields,
  setMetafieldsBatched,
  estimateMutationCost,
} from './mutations';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Shopify GraphQL API rate limits
 */
export const SHOPIFY_RATE_LIMITS = {
  /**
   * Maximum available points in the bucket
   */
  MAX_POINTS: 1000,

  /**
   * Points restored per second
   */
  RESTORE_RATE: 50,

  /**
   * Standard mutation cost
   */
  MUTATION_COST: 10,

  /**
   * Recommended minimum points before throttling
   */
  THROTTLE_THRESHOLD: 100,

  /**
   * Maximum metafields per batch
   */
  MAX_METAFIELDS_PER_BATCH: 25,

  /**
   * Maximum items per page (recommended)
   */
  MAX_PAGE_SIZE: 250,

  /**
   * Recommended page size for optimal performance
   */
  RECOMMENDED_PAGE_SIZE: 50,

  /**
   * Bulk operation limits
   */
  BULK_OPERATION: {
    MAX_OBJECTS: 1_000_000,
    MAX_FILE_SIZE_BYTES: 1_073_741_824, // 1 GB
    MAX_RUNTIME_HOURS: 24,
    RESULTS_RETENTION_DAYS: 7,
  },
} as const;

/**
 * Shopify GraphQL API version
 */
export const SHOPIFY_API_VERSION = '2025-10' as const;

/**
 * Shopify Global ID prefixes
 */
export const SHOPIFY_GID_PREFIXES = {
  PRODUCT: 'gid://shopify/Product/',
  PRODUCT_VARIANT: 'gid://shopify/ProductVariant/',
  ORDER: 'gid://shopify/Order/',
  CUSTOMER: 'gid://shopify/Customer/',
  COLLECTION: 'gid://shopify/Collection/',
  INVENTORY_ITEM: 'gid://shopify/InventoryItem/',
  INVENTORY_LEVEL: 'gid://shopify/InventoryLevel/',
  LOCATION: 'gid://shopify/Location/',
  METAFIELD: 'gid://shopify/Metafield/',
  FULFILLMENT: 'gid://shopify/Fulfillment/',
  REFUND: 'gid://shopify/Refund/',
  SHOP: 'gid://shopify/Shop/',
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert Shopify REST ID to GraphQL Global ID
 *
 * @example
 * toGlobalId('Product', '123') // "gid://shopify/Product/123"
 */
export function toGlobalId(resourceType: keyof typeof SHOPIFY_GID_PREFIXES, id: string | number): string {
  return `${SHOPIFY_GID_PREFIXES[resourceType]}${id}`;
}

/**
 * Extract numeric ID from Shopify Global ID
 *
 * @example
 * fromGlobalId("gid://shopify/Product/123") // "123"
 */
export function fromGlobalId(globalId: string): string {
  return globalId.split('/').pop() || '';
}

/**
 * Get resource type from Global ID
 *
 * @example
 * getResourceType("gid://shopify/Product/123") // "Product"
 */
export function getResourceType(globalId: string): string {
  const match = globalId.match(/gid:\/\/shopify\/(\w+)\//);
  return match ? match[1] : '';
}

/**
 * Check if string is a valid Shopify Global ID
 */
export function isGlobalId(value: string): boolean {
  return /^gid:\/\/shopify\/\w+\/\d+$/.test(value);
}

/**
 * Format money amount for Shopify
 *
 * @example
 * formatMoney(19.99) // "19.99"
 * formatMoney(20) // "20.00"
 */
export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Parse money amount from Shopify
 *
 * @example
 * parseMoney("19.99") // 19.99
 */
export function parseMoney(amount: string): number {
  return parseFloat(amount);
}

/**
 * Build Shopify search query string
 *
 * @example
 * buildSearchQuery({
 *   status: 'active',
 *   product_type: 'Digital Course',
 *   tag: 'featured'
 * })
 * // Returns: "status:active product_type:'Digital Course' tag:featured"
 */
export function buildSearchQuery(filters: Record<string, string | number | boolean>): string {
  return Object.entries(filters)
    .map(([key, value]) => {
      // Quote values with spaces
      const formattedValue = typeof value === 'string' && value.includes(' ')
        ? `'${value}'`
        : value;
      return `${key}:${formattedValue}`;
    })
    .join(' ');
}

/**
 * Calculate cost per second based on restore rate
 */
export function calculateSecondsUntilPoints(requiredPoints: number): number {
  const { RESTORE_RATE } = SHOPIFY_RATE_LIMITS;
  return Math.ceil(requiredPoints / RESTORE_RATE);
}

/**
 * Calculate recommended delay between requests
 */
export function calculateThrottleDelay(currentPoints: number, requiredPoints: number): number {
  if (currentPoints >= requiredPoints) {
    return 0;
  }

  const pointsNeeded = requiredPoints - currentPoints;
  const secondsNeeded = calculateSecondsUntilPoints(pointsNeeded);

  // Convert to milliseconds and add small buffer
  return (secondsNeeded * 1000) + 100;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

/**
 * Re-export everything for convenience
 */
export * from './queries';
export * from './mutations';
