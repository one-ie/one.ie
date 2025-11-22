/**
 * Shopify GraphQL Mutation Definitions
 *
 * This file contains all GraphQL mutations for write operations with the Shopify Admin API.
 * All mutations include proper error handling and TypeScript types.
 *
 * API Version: 2025-10
 * Documentation: https://shopify.dev/docs/api/admin-graphql
 *
 * Mutation Cost Guidelines:
 * - Simple mutations: ~10 points (standard cost)
 * - Batch mutations: ~10 + (N × item_cost) points
 * - Complex mutations with nested data: ~20-50 points
 *
 * Error Handling:
 * - All mutations return `userErrors` array for validation errors
 * - Check `userErrors` before accessing mutation result
 * - Network/GraphQL errors throw exceptions
 */

import {
  PRODUCT_FULL_FRAGMENT,
  VARIANT_FRAGMENT,
  CUSTOMER_FULL_FRAGMENT,
  ORDER_FULL_FRAGMENT,
  METAFIELD_FRAGMENT,
} from './queries';

// =============================================================================
// SHARED TYPES
// =============================================================================

/**
 * Standard user error type returned by all mutations
 */
export interface UserError {
  field: string[] | null;
  message: string;
}

/**
 * Generic mutation response structure
 */
export interface MutationResponse<T> {
  [key: string]: {
    [resultKey: string]: T | null;
    userErrors: UserError[];
  };
}

// =============================================================================
// PRODUCT MUTATIONS
// =============================================================================

/**
 * Create a new product
 *
 * Estimated Cost: ~10 points
 *
 * @example
 * const result = await client.mutate({
 *   mutation: CREATE_PRODUCT,
 *   variables: {
 *     input: {
 *       title: "New Product",
 *       productType: "Digital Course",
 *       vendor: "ONE Platform"
 *     }
 *   }
 * });
 */
export const CREATE_PRODUCT = `
  ${PRODUCT_FULL_FRAGMENT}

  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        ...ProductFull
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ProductInput {
  title: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  variants?: Array<{
    price: string;
    sku?: string;
    inventoryQuantity?: number;
    options?: string[];
  }>;
  images?: Array<{
    src: string;
    altText?: string;
  }>;
  options?: string[];
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export interface CreateProductVariables {
  input: ProductInput;
}

export interface CreateProductResponse {
  productCreate: {
    product: {
      id: string;
      title: string;
      handle: string;
      status: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Update an existing product
 *
 * Estimated Cost: ~10 points
 */
export const UPDATE_PRODUCT = `
  ${PRODUCT_FULL_FRAGMENT}

  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        ...ProductFull
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface UpdateProductVariables {
  input: ProductInput & { id: string };
}

export interface UpdateProductResponse {
  productUpdate: {
    product: {
      id: string;
      title: string;
      updatedAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Delete a product
 *
 * Estimated Cost: ~10 points
 *
 * Note: This is a destructive operation and cannot be undone.
 */
export const DELETE_PRODUCT = `
  mutation DeleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export interface DeleteProductVariables {
  input: {
    id: string;
  };
}

export interface DeleteProductResponse {
  productDelete: {
    deletedProductId: string | null;
    userErrors: UserError[];
  };
}

/**
 * Publish a product to sales channels
 *
 * Estimated Cost: ~10 points
 */
export const PUBLISH_PRODUCT = `
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        availablePublicationsCount {
          count
        }
        publicationCount
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface PublishProductVariables {
  id: string;
  input: Array<{
    publicationId: string;
  }>;
}

// =============================================================================
// VARIANT MUTATIONS
// =============================================================================

/**
 * Create a new product variant
 *
 * Estimated Cost: ~10 points
 */
export const CREATE_PRODUCT_VARIANT = `
  ${VARIANT_FRAGMENT}

  mutation CreateProductVariant($input: ProductVariantInput!) {
    productVariantCreate(input: $input) {
      productVariant {
        ...ProductVariant
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ProductVariantInput {
  productId: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  barcode?: string;
  inventoryQuantity?: number;
  inventoryPolicy?: 'DENY' | 'CONTINUE';
  fulfillmentService?: string;
  inventoryManagement?: 'SHOPIFY' | 'NOT_MANAGED';
  taxable?: boolean;
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
  options?: string[];
  imageSrc?: string;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export interface CreateProductVariantVariables {
  input: ProductVariantInput;
}

export interface CreateProductVariantResponse {
  productVariantCreate: {
    productVariant: {
      id: string;
      title: string;
      price: string;
      sku: string | null;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Update a product variant
 *
 * Estimated Cost: ~10 points
 */
export const UPDATE_PRODUCT_VARIANT = `
  ${VARIANT_FRAGMENT}

  mutation UpdateProductVariant($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
        ...ProductVariant
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface UpdateProductVariantVariables {
  input: ProductVariantInput & { id: string };
}

export interface UpdateProductVariantResponse {
  productVariantUpdate: {
    productVariant: {
      id: string;
      price: string;
      updatedAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Delete a product variant
 *
 * Estimated Cost: ~10 points
 */
export const DELETE_PRODUCT_VARIANT = `
  mutation DeleteProductVariant($id: ID!) {
    productVariantDelete(id: $id) {
      deletedProductVariantId
      userErrors {
        field
        message
      }
    }
  }
`;

export interface DeleteProductVariantVariables {
  id: string;
}

export interface DeleteProductVariantResponse {
  productVariantDelete: {
    deletedProductVariantId: string | null;
    userErrors: UserError[];
  };
}

// =============================================================================
// CUSTOMER MUTATIONS
// =============================================================================

/**
 * Create a new customer
 *
 * Estimated Cost: ~10 points
 */
export const CREATE_CUSTOMER = `
  ${CUSTOMER_FULL_FRAGMENT}

  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        ...CustomerFull
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CustomerInput {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses?: Array<{
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  }>;
  tags?: string[];
  note?: string;
  taxExempt?: boolean;
  emailMarketingConsent?: {
    marketingState: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'NOT_SUBSCRIBED';
    marketingOptInLevel?: 'SINGLE_OPT_IN' | 'CONFIRMED_OPT_IN' | 'UNKNOWN';
  };
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

export interface CreateCustomerVariables {
  input: CustomerInput;
}

export interface CreateCustomerResponse {
  customerCreate: {
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Update an existing customer
 *
 * Estimated Cost: ~10 points
 */
export const UPDATE_CUSTOMER = `
  ${CUSTOMER_FULL_FRAGMENT}

  mutation UpdateCustomer($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        ...CustomerFull
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface UpdateCustomerVariables {
  input: CustomerInput & { id: string };
}

export interface UpdateCustomerResponse {
  customerUpdate: {
    customer: {
      id: string;
      email: string;
      updatedAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Delete a customer (GDPR-compliant)
 *
 * Estimated Cost: ~10 points
 *
 * Note: This initiates a customer data deletion request.
 * Use for GDPR compliance and "right to be forgotten" requests.
 */
export const DELETE_CUSTOMER = `
  mutation DeleteCustomer($input: CustomerDeleteInput!) {
    customerDelete(input: $input) {
      deletedCustomerId
      userErrors {
        field
        message
      }
    }
  }
`;

export interface DeleteCustomerVariables {
  input: {
    id: string;
  };
}

export interface DeleteCustomerResponse {
  customerDelete: {
    deletedCustomerId: string | null;
    userErrors: UserError[];
  };
}

// =============================================================================
// ORDER MUTATIONS
// =============================================================================

/**
 * Create a draft order
 *
 * Estimated Cost: ~20-30 points
 *
 * Draft orders can be used for:
 * - Manual orders created by staff
 * - Custom invoices
 * - Offline orders
 */
export const CREATE_DRAFT_ORDER = `
  ${ORDER_FULL_FRAGMENT}

  mutation CreateDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        order {
          ...OrderFull
        }
        status
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        invoiceUrl
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface DraftOrderInput {
  customerId?: string;
  email?: string;
  lineItems: Array<{
    variantId?: string;
    quantity: number;
    originalUnitPrice?: string;
    title?: string;
    taxable?: boolean;
  }>;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
  };
  note?: string;
  tags?: string[];
  taxExempt?: boolean;
  appliedDiscount?: {
    description?: string;
    value: number;
    valueType: 'FIXED_AMOUNT' | 'PERCENTAGE';
  };
  shippingLine?: {
    title: string;
    price: string;
  };
}

export interface CreateDraftOrderVariables {
  input: DraftOrderInput;
}

export interface CreateDraftOrderResponse {
  draftOrderCreate: {
    draftOrder: {
      id: string;
      name: string;
      invoiceUrl: string;
      status: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Update an order
 *
 * Estimated Cost: ~10 points
 *
 * Note: Only certain fields can be updated after order creation
 */
export const UPDATE_ORDER = `
  mutation UpdateOrder($input: OrderInput!) {
    orderUpdate(input: $input) {
      order {
        id
        name
        note
        tags
        email
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface UpdateOrderVariables {
  input: {
    id: string;
    note?: string;
    tags?: string[];
    email?: string;
    phone?: string;
  };
}

/**
 * Cancel an order
 *
 * Estimated Cost: ~10 points
 */
export const CANCEL_ORDER = `
  mutation CancelOrder($orderId: ID!, $reason: OrderCancelReason, $refund: Boolean, $notifyCustomer: Boolean) {
    orderCancel(
      orderId: $orderId
      reason: $reason
      refund: $refund
      notifyCustomer: $notifyCustomer
    ) {
      order {
        id
        name
        cancelledAt
        cancelReason
        displayFinancialStatus
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CancelOrderVariables {
  orderId: string;
  reason?: 'CUSTOMER' | 'FRAUD' | 'INVENTORY' | 'DECLINED' | 'OTHER';
  refund?: boolean;
  notifyCustomer?: boolean;
}

export interface CancelOrderResponse {
  orderCancel: {
    order: {
      id: string;
      name: string;
      cancelledAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Create a fulfillment for an order
 *
 * Estimated Cost: ~15-20 points
 */
export const CREATE_FULFILLMENT = `
  mutation CreateFulfillment($input: FulfillmentInput!) {
    fulfillmentCreate(input: $input) {
      fulfillment {
        id
        status
        createdAt
        trackingInfo {
          company
          number
          url
        }
        lineItems(first: 50) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface FulfillmentInput {
  orderId: string;
  lineItems?: Array<{
    id: string;
    quantity?: number;
  }>;
  trackingInfo?: {
    company?: string;
    number?: string;
    url?: string;
  };
  notifyCustomer?: boolean;
  locationId?: string;
}

export interface CreateFulfillmentVariables {
  input: FulfillmentInput;
}

export interface CreateFulfillmentResponse {
  fulfillmentCreate: {
    fulfillment: {
      id: string;
      status: string;
      createdAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Create a refund for an order
 *
 * Estimated Cost: ~15-20 points
 */
export const CREATE_REFUND = `
  mutation CreateRefund($input: RefundInput!) {
    refundCreate(input: $input) {
      refund {
        id
        createdAt
        totalRefundedSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        refundLineItems(first: 50) {
          edges {
            node {
              lineItem {
                id
                title
              }
              quantity
              restockType
              subtotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface RefundInput {
  orderId: string;
  note?: string;
  notify?: boolean;
  shipping?: {
    amount: number;
    fullRefund?: boolean;
  };
  refundLineItems?: Array<{
    lineItemId: string;
    quantity: number;
    restockType?: 'RETURN' | 'CANCEL' | 'LEGACY_RESTOCK' | 'NO_RESTOCK';
  }>;
  transactions?: Array<{
    amount: number;
    gateway: string;
    kind: 'REFUND';
    orderId: string;
  }>;
}

export interface CreateRefundVariables {
  input: RefundInput;
}

export interface CreateRefundResponse {
  refundCreate: {
    refund: {
      id: string;
      createdAt: string;
      totalRefundedSet: {
        shopMoney: {
          amount: string;
          currencyCode: string;
        };
      };
    } | null;
    userErrors: UserError[];
  };
}

// =============================================================================
// INVENTORY MUTATIONS
// =============================================================================

/**
 * Adjust inventory quantity (delta change)
 *
 * Estimated Cost: ~10 points
 *
 * Use this for incremental changes (e.g., +5, -10)
 */
export const ADJUST_INVENTORY_LEVEL = `
  mutation AdjustInventoryLevel($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      inventoryAdjustmentGroup {
        id
        reason
        changes {
          name
          delta
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface AdjustInventoryLevelVariables {
  input: {
    reason: string;
    name: string;
    changes: Array<{
      inventoryItemId: string;
      locationId: string;
      delta: number;
    }>;
  };
}

export interface AdjustInventoryLevelResponse {
  inventoryAdjustQuantities: {
    inventoryAdjustmentGroup: {
      id: string;
      reason: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Set inventory level to specific value
 *
 * Estimated Cost: ~10 points
 *
 * Use this to set absolute inventory values (e.g., set to 100)
 */
export const SET_INVENTORY_LEVEL = `
  mutation SetInventoryLevel($input: InventorySetOnHandQuantitiesInput!) {
    inventorySetOnHandQuantities(input: $input) {
      inventoryAdjustmentGroup {
        id
        reason
        changes {
          name
          quantityAfterChange
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface SetInventoryLevelVariables {
  input: {
    reason: string;
    setQuantities: Array<{
      inventoryItemId: string;
      locationId: string;
      quantity: number;
    }>;
  };
}

export interface SetInventoryLevelResponse {
  inventorySetOnHandQuantities: {
    inventoryAdjustmentGroup: {
      id: string;
      reason: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Activate inventory at a location
 *
 * Estimated Cost: ~10 points
 */
export const ACTIVATE_INVENTORY = `
  mutation ActivateInventory($inventoryItemId: ID!, $locationId: ID!) {
    inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
      inventoryLevel {
        id
        available
        location {
          id
          name
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface ActivateInventoryVariables {
  inventoryItemId: string;
  locationId: string;
}

// =============================================================================
// METAFIELD MUTATIONS
// =============================================================================

/**
 * Set metafields (create or update)
 *
 * Estimated Cost: ~10 + (N × 2) points (N = number of metafields)
 *
 * Can batch up to 25 metafields in a single request
 *
 * @example
 * const result = await client.mutate({
 *   mutation: METAFIELDS_SET,
 *   variables: {
 *     metafields: [{
 *       ownerId: "gid://shopify/Product/123",
 *       namespace: "$app",
 *       key: "one_thing_id",
 *       type: "single_line_text_field",
 *       value: "thing_abc123"
 *     }]
 *   }
 * });
 */
export const METAFIELDS_SET = `
  ${METAFIELD_FRAGMENT}

  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        ...Metafield
        owner {
          ... on Product {
            id
          }
          ... on ProductVariant {
            id
          }
          ... on Customer {
            id
          }
          ... on Order {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface MetafieldInput {
  ownerId: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface MetafieldsSetVariables {
  metafields: MetafieldInput[];
}

export interface MetafieldsSetResponse {
  metafieldsSet: {
    metafields: Array<{
      id: string;
      namespace: string;
      key: string;
      value: string;
      type: string;
      owner: {
        id: string;
      };
    }> | null;
    userErrors: UserError[];
  };
}

/**
 * Delete a metafield
 *
 * Estimated Cost: ~10 points
 */
export const METAFIELD_DELETE = `
  mutation MetafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

export interface MetafieldDeleteVariables {
  input: {
    id: string;
  };
}

export interface MetafieldDeleteResponse {
  metafieldDelete: {
    deletedId: string | null;
    userErrors: UserError[];
  };
}

// =============================================================================
// WEBHOOK MUTATIONS
// =============================================================================

/**
 * Register a webhook subscription
 *
 * Estimated Cost: ~10 points
 *
 * @example
 * const result = await client.mutate({
 *   mutation: WEBHOOK_SUBSCRIPTION_CREATE,
 *   variables: {
 *     topic: "PRODUCTS_CREATE",
 *     webhookSubscription: {
 *       callbackUrl: "https://one.ie/webhooks/shopify/products/create",
 *       format: "JSON"
 *     }
 *   }
 * });
 */
export const WEBHOOK_SUBSCRIPTION_CREATE = `
  mutation WebhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      webhookSubscription {
        id
        topic
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type WebhookTopic =
  | 'PRODUCTS_CREATE'
  | 'PRODUCTS_UPDATE'
  | 'PRODUCTS_DELETE'
  | 'ORDERS_CREATE'
  | 'ORDERS_UPDATED'
  | 'ORDERS_CANCELLED'
  | 'ORDERS_PAID'
  | 'ORDERS_FULFILLED'
  | 'CUSTOMERS_CREATE'
  | 'CUSTOMERS_UPDATE'
  | 'CUSTOMERS_DELETE'
  | 'INVENTORY_LEVELS_UPDATE'
  | 'FULFILLMENTS_CREATE'
  | 'FULFILLMENTS_UPDATE'
  | 'REFUNDS_CREATE';

export interface WebhookSubscriptionCreateVariables {
  topic: WebhookTopic;
  webhookSubscription: {
    callbackUrl: string;
    format?: 'JSON' | 'XML';
    includeFields?: string[];
    metafieldNamespaces?: string[];
  };
}

export interface WebhookSubscriptionCreateResponse {
  webhookSubscriptionCreate: {
    webhookSubscription: {
      id: string;
      topic: string;
      format: string;
      endpoint: {
        callbackUrl: string;
      };
      createdAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Delete a webhook subscription
 *
 * Estimated Cost: ~10 points
 */
export const WEBHOOK_SUBSCRIPTION_DELETE = `
  mutation WebhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors {
        field
        message
      }
    }
  }
`;

export interface WebhookSubscriptionDeleteVariables {
  id: string;
}

export interface WebhookSubscriptionDeleteResponse {
  webhookSubscriptionDelete: {
    deletedWebhookSubscriptionId: string | null;
    userErrors: UserError[];
  };
}

/**
 * Update a webhook subscription
 *
 * Estimated Cost: ~10 points
 */
export const WEBHOOK_SUBSCRIPTION_UPDATE = `
  mutation WebhookSubscriptionUpdate($id: ID!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionUpdate(id: $id, webhookSubscription: $webhookSubscription) {
      webhookSubscription {
        id
        topic
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface WebhookSubscriptionUpdateVariables {
  id: string;
  webhookSubscription: {
    callbackUrl?: string;
    format?: 'JSON' | 'XML';
    includeFields?: string[];
    metafieldNamespaces?: string[];
  };
}

// =============================================================================
// BULK OPERATION MUTATIONS
// =============================================================================

/**
 * Run a bulk operation query
 *
 * Estimated Cost: ~10 points (operation execution is free)
 *
 * Use for large datasets (>1,000 records):
 * - Product exports
 * - Order exports
 * - Customer data exports
 * - Analytics queries
 *
 * @example
 * const result = await client.mutate({
 *   mutation: BULK_OPERATION_RUN_QUERY,
 *   variables: {
 *     query: `{
 *       products {
 *         edges {
 *           node {
 *             id
 *             title
 *           }
 *         }
 *       }
 *     }`
 *   }
 * });
 */
export const BULK_OPERATION_RUN_QUERY = `
  mutation BulkOperationRunQuery($query: String!) {
    bulkOperationRunQuery(query: $query) {
      bulkOperation {
        id
        status
        query
        rootObjectCount
        type
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface BulkOperationRunQueryVariables {
  query: string;
}

export interface BulkOperationRunQueryResponse {
  bulkOperationRunQuery: {
    bulkOperation: {
      id: string;
      status: 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
      query: string;
      rootObjectCount: number;
      type: string;
      createdAt: string;
    } | null;
    userErrors: UserError[];
  };
}

/**
 * Cancel a running bulk operation
 *
 * Estimated Cost: ~10 points
 */
export const BULK_OPERATION_CANCEL = `
  mutation BulkOperationCancel($id: ID!) {
    bulkOperationCancel(id: $id) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface BulkOperationCancelVariables {
  id: string;
}

// =============================================================================
// MUTATION HELPER FUNCTIONS
// =============================================================================

/**
 * Check if mutation has user errors
 */
export function hasUserErrors<T extends { userErrors: UserError[] }>(
  response: T
): boolean {
  return response.userErrors && response.userErrors.length > 0;
}

/**
 * Extract user errors from mutation response
 */
export function getUserErrors<T extends { userErrors: UserError[] }>(
  response: T
): UserError[] {
  return response.userErrors || [];
}

/**
 * Get first error message from mutation response
 */
export function getFirstErrorMessage<T extends { userErrors: UserError[] }>(
  response: T
): string | null {
  const errors = getUserErrors(response);
  return errors.length > 0 ? errors[0].message : null;
}

/**
 * Throw error if mutation has user errors
 */
export function throwIfUserErrors<T extends { userErrors: UserError[] }>(
  response: T,
  operationName: string
): void {
  if (hasUserErrors(response)) {
    const errors = getUserErrors(response);
    throw new Error(
      `${operationName} failed: ${errors.map((e) => e.message).join(', ')}`
    );
  }
}

/**
 * Extract mutation result (throws if errors)
 */
export function extractMutationResult<TResponse, TResult>(
  response: TResponse,
  resultKey: string,
  operationName: string
): TResult {
  const mutationResponse = response as any;

  if (hasUserErrors(mutationResponse)) {
    throwIfUserErrors(mutationResponse, operationName);
  }

  const result = mutationResponse[resultKey];
  if (!result) {
    throw new Error(`${operationName} returned null result`);
  }

  return result as TResult;
}

/**
 * Batch metafields into chunks of 25 (Shopify limit)
 */
export function batchMetafields(metafields: MetafieldInput[]): MetafieldInput[][] {
  const batches: MetafieldInput[][] = [];
  const batchSize = 25;

  for (let i = 0; i < metafields.length; i += batchSize) {
    batches.push(metafields.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Execute metafield mutations in batches
 */
export async function setMetafieldsBatched(
  mutateFn: (variables: MetafieldsSetVariables) => Promise<MetafieldsSetResponse>,
  metafields: MetafieldInput[]
): Promise<MetafieldsSetResponse[]> {
  const batches = batchMetafields(metafields);
  const results: MetafieldsSetResponse[] = [];

  for (const batch of batches) {
    const result = await mutateFn({ metafields: batch });
    results.push(result);

    // Check for errors
    if (hasUserErrors(result.metafieldsSet)) {
      console.warn(
        'Metafield batch had errors:',
        getUserErrors(result.metafieldsSet)
      );
    }
  }

  return results;
}

// =============================================================================
// MUTATION COST ESTIMATION
// =============================================================================

/**
 * Estimate mutation cost
 *
 * Note: Most mutations have a standard cost of 10 points
 */
export function estimateMutationCost(mutationType: string, itemCount = 1): number {
  const baseCost = 10;

  // Batch operations cost more
  if (mutationType.includes('batch') || mutationType.includes('Batch')) {
    return baseCost + itemCount * 2;
  }

  // Complex mutations
  if (
    mutationType.includes('DraftOrder') ||
    mutationType.includes('Fulfillment') ||
    mutationType.includes('Refund')
  ) {
    return baseCost + 10;
  }

  return baseCost;
}
