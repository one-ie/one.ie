/**
 * Shopify GraphQL Query Definitions
 *
 * This file contains all GraphQL queries for read operations with the Shopify Admin API.
 * All queries are optimized for query cost and include proper TypeScript types.
 *
 * API Version: 2025-10
 * Documentation: https://shopify.dev/docs/api/admin-graphql
 *
 * Query Cost Guidelines:
 * - Simple queries (shop info): ~5 points
 * - Single resource queries: ~10-20 points
 * - List queries with pagination: ~50-100 points
 * - Complex nested queries: ~100+ points
 *
 * Rate Limits:
 * - Maximum available: 1,000 points
 * - Restore rate: 50 points/second
 * - Use bulk operations for >1,000 records
 */

// =============================================================================
// FRAGMENTS - Reusable field selections
// =============================================================================

/**
 * Basic product fields
 * Cost: ~5 points per product
 */
export const PRODUCT_BASIC_FRAGMENT = `
  fragment ProductBasic on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    status
    tags
    createdAt
    updatedAt
    publishedAt
  }
`;

/**
 * Product variant fields
 * Cost: ~3 points per variant
 */
export const VARIANT_FRAGMENT = `
  fragment ProductVariant on ProductVariant {
    id
    title
    sku
    price
    compareAtPrice
    inventoryQuantity
    inventoryPolicy
    fulfillmentService
    inventoryManagement
    taxable
    barcode
    weight
    weightUnit
    requiresShipping
    createdAt
    updatedAt
  }
`;

/**
 * Product with variants and images
 * Cost: ~15-30 points (depending on variant count)
 */
export const PRODUCT_FULL_FRAGMENT = `
  ${PRODUCT_BASIC_FRAGMENT}
  ${VARIANT_FRAGMENT}

  fragment ProductFull on Product {
    ...ProductBasic
    priceRangeV2 {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    totalInventory
    tracksInventory
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        cursor
        node {
          ...ProductVariant
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
    options {
      id
      name
      values
      position
    }
  }
`;

/**
 * Order line item fields
 * Cost: ~5 points per item
 */
export const ORDER_LINE_ITEM_FRAGMENT = `
  fragment OrderLineItem on LineItem {
    id
    title
    quantity
    variant {
      id
      title
      sku
      price
      image {
        url
      }
    }
    originalUnitPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    discountedUnitPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    discountedTotalSet {
      shopMoney {
        amount
        currencyCode
      }
    }
  }
`;

/**
 * Order fields (without line items)
 * Cost: ~10 points per order
 */
export const ORDER_BASIC_FRAGMENT = `
  fragment OrderBasic on Order {
    id
    name
    email
    createdAt
    updatedAt
    cancelledAt
    closedAt
    displayFinancialStatus
    displayFulfillmentStatus
    totalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    subtotalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalTaxSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalShippingPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    customer {
      id
      email
      firstName
      lastName
      phone
    }
    shippingAddress {
      firstName
      lastName
      address1
      address2
      city
      province
      country
      zip
      phone
    }
    billingAddress {
      firstName
      lastName
      address1
      address2
      city
      province
      country
      zip
      phone
    }
  }
`;

/**
 * Complete order fields with line items
 * Cost: ~30-50 points (depending on line item count)
 */
export const ORDER_FULL_FRAGMENT = `
  ${ORDER_BASIC_FRAGMENT}
  ${ORDER_LINE_ITEM_FRAGMENT}

  fragment OrderFull on Order {
    ...OrderBasic
    lineItems(first: 50) {
      edges {
        cursor
        node {
          ...OrderLineItem
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * Customer basic fields
 * Cost: ~5 points per customer
 */
export const CUSTOMER_BASIC_FRAGMENT = `
  fragment CustomerBasic on Customer {
    id
    email
    firstName
    lastName
    phone
    state
    tags
    note
    verifiedEmail
    taxExempt
    numberOfOrders
    createdAt
    updatedAt
  }
`;

/**
 * Customer with addresses
 * Cost: ~8-12 points
 */
export const CUSTOMER_FULL_FRAGMENT = `
  ${CUSTOMER_BASIC_FRAGMENT}

  fragment CustomerFull on Customer {
    ...CustomerBasic
    addresses(first: 10) {
      edges {
        node {
          id
          firstName
          lastName
          address1
          address2
          city
          province
          country
          zip
          phone
        }
      }
    }
    defaultAddress {
      id
      firstName
      lastName
      address1
      address2
      city
      province
      country
      zip
      phone
    }
  }
`;

/**
 * Inventory level fields
 * Cost: ~3 points per level
 */
export const INVENTORY_LEVEL_FRAGMENT = `
  fragment InventoryLevel on InventoryLevel {
    id
    available
    incoming
    location {
      id
      name
      address {
        address1
        city
        province
        country
        zip
      }
    }
    item {
      id
      sku
      tracked
    }
  }
`;

/**
 * Collection basic fields
 * Cost: ~5 points per collection
 */
export const COLLECTION_BASIC_FRAGMENT = `
  fragment CollectionBasic on Collection {
    id
    title
    handle
    description
    descriptionHtml
    sortOrder
    templateSuffix
    updatedAt
    image {
      id
      url
      altText
    }
  }
`;

/**
 * Metafield fields
 * Cost: ~2 points per metafield
 */
export const METAFIELD_FRAGMENT = `
  fragment Metafield on Metafield {
    id
    namespace
    key
    value
    type
    description
    createdAt
    updatedAt
  }
`;

// =============================================================================
// PRODUCT QUERIES
// =============================================================================

/**
 * Get single product by ID or handle
 *
 * Estimated Cost: ~30-50 points
 *
 * Variables:
 * - id: Product global ID (e.g., "gid://shopify/Product/123")
 *
 * @example
 * const result = await client.query({
 *   query: GET_PRODUCT,
 *   variables: { id: "gid://shopify/Product/123" }
 * });
 */
export const GET_PRODUCT = `
  ${PRODUCT_FULL_FRAGMENT}
  ${METAFIELD_FRAGMENT}

  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFull
      metafields(first: 20) {
        edges {
          node {
            ...Metafield
          }
        }
      }
    }
  }
`;

export interface GetProductVariables {
  id: string;
}

export interface GetProductResponse {
  product: {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    productType: string;
    vendor: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
    tags: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    priceRangeV2: {
      minVariantPrice: { amount: string; currencyCode: string };
      maxVariantPrice: { amount: string; currencyCode: string };
    };
    totalInventory: number;
    tracksInventory: boolean;
    images: {
      edges: Array<{
        node: {
          id: string;
          url: string;
          altText: string | null;
          width: number;
          height: number;
        };
      }>;
    };
    variants: {
      edges: Array<{
        cursor: string;
        node: {
          id: string;
          title: string;
          sku: string | null;
          price: string;
          compareAtPrice: string | null;
          inventoryQuantity: number;
          [key: string]: any;
        };
      }>;
      pageInfo: PageInfo;
    };
    metafields: {
      edges: Array<{
        node: {
          id: string;
          namespace: string;
          key: string;
          value: string;
          type: string;
        };
      }>;
    };
  };
}

/**
 * List products with pagination and filtering
 *
 * Estimated Cost: ~50-150 points (depending on page size)
 *
 * Variables:
 * - first: Number of products to fetch (max 250)
 * - after: Cursor for pagination
 * - query: Search query (e.g., "status:active product_type:Digital")
 * - sortKey: Sort field (TITLE, CREATED_AT, UPDATED_AT, etc.)
 * - reverse: Reverse sort order
 *
 * @example
 * const result = await client.query({
 *   query: LIST_PRODUCTS,
 *   variables: { first: 50, query: "status:active" }
 * });
 */
export const LIST_PRODUCTS = `
  ${PRODUCT_BASIC_FRAGMENT}

  query ListProducts(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...ProductBasic
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          totalInventory
          featuredImage {
            id
            url
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface ListProductsVariables {
  first: number;
  after?: string;
  query?: string;
  sortKey?: 'TITLE' | 'CREATED_AT' | 'UPDATED_AT' | 'PRODUCT_TYPE' | 'VENDOR';
  reverse?: boolean;
}

export interface ListProductsResponse {
  products: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        title: string;
        handle: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        priceRangeV2: {
          minVariantPrice: { amount: string; currencyCode: string };
        };
        totalInventory: number;
        featuredImage: {
          id: string;
          url: string;
          altText: string | null;
        } | null;
      };
    }>;
    pageInfo: PageInfo;
  };
}

/**
 * Search products by query string
 *
 * Estimated Cost: ~50-100 points
 *
 * Variables:
 * - first: Number of results
 * - query: Search query string
 *
 * Query syntax examples:
 * - "title:*shirt*" - Search in title
 * - "tag:summer" - Filter by tag
 * - "vendor:Nike" - Filter by vendor
 * - "status:active" - Filter by status
 *
 * @example
 * const result = await client.query({
 *   query: SEARCH_PRODUCTS,
 *   variables: { first: 20, query: "title:*shirt*" }
 * });
 */
export const SEARCH_PRODUCTS = `
  ${PRODUCT_BASIC_FRAGMENT}

  query SearchProducts($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      edges {
        cursor
        node {
          ...ProductBasic
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Get variants for a product
 *
 * Estimated Cost: ~20-40 points
 *
 * Variables:
 * - productId: Product global ID
 * - first: Number of variants to fetch
 * - after: Cursor for pagination
 */
export const GET_PRODUCT_VARIANTS = `
  ${VARIANT_FRAGMENT}

  query GetProductVariants($productId: ID!, $first: Int!, $after: String) {
    product(id: $productId) {
      id
      title
      variants(first: $first, after: $after) {
        edges {
          cursor
          node {
            ...ProductVariant
            image {
              url
              altText
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

// =============================================================================
// ORDER QUERIES
// =============================================================================

/**
 * Get single order by ID
 *
 * Estimated Cost: ~40-60 points
 *
 * Variables:
 * - id: Order global ID (e.g., "gid://shopify/Order/123")
 */
export const GET_ORDER = `
  ${ORDER_FULL_FRAGMENT}

  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderFull
      fulfillments(first: 10) {
        edges {
          node {
            id
            status
            createdAt
            updatedAt
            trackingCompany
            trackingInfo {
              company
              number
              url
            }
          }
        }
      }
      transactions(first: 10) {
        edges {
          node {
            id
            kind
            status
            amount {
              amount
              currencyCode
            }
            processedAt
          }
        }
      }
    }
  }
`;

export interface GetOrderVariables {
  id: string;
}

export interface GetOrderResponse {
  order: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    displayFinancialStatus: string;
    displayFulfillmentStatus: string;
    totalPriceSet: {
      shopMoney: { amount: string; currencyCode: string };
    };
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    } | null;
    lineItems: {
      edges: Array<{
        cursor: string;
        node: {
          id: string;
          title: string;
          quantity: number;
          variant: any;
        };
      }>;
      pageInfo: PageInfo;
    };
    fulfillments: {
      edges: Array<{
        node: {
          id: string;
          status: string;
          createdAt: string;
        };
      }>;
    };
  };
}

/**
 * List orders with pagination and date filtering
 *
 * Estimated Cost: ~100-200 points
 *
 * Variables:
 * - first: Number of orders to fetch
 * - after: Cursor for pagination
 * - query: Filter query (e.g., "created_at:>2024-01-01")
 * - sortKey: Sort field (CREATED_AT, UPDATED_AT, etc.)
 */
export const LIST_ORDERS = `
  ${ORDER_BASIC_FRAGMENT}

  query ListOrders(
    $first: Int!
    $after: String
    $query: String
    $sortKey: OrderSortKeys
    $reverse: Boolean
  ) {
    orders(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...OrderBasic
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface ListOrdersVariables {
  first: number;
  after?: string;
  query?: string;
  sortKey?: 'CREATED_AT' | 'UPDATED_AT' | 'ORDER_NUMBER' | 'TOTAL_PRICE';
  reverse?: boolean;
}

/**
 * Get fulfillments for an order
 *
 * Estimated Cost: ~15-25 points
 */
export const GET_ORDER_FULFILLMENTS = `
  query GetOrderFulfillments($orderId: ID!, $first: Int!) {
    order(id: $orderId) {
      id
      name
      fulfillments(first: $first) {
        edges {
          node {
            id
            status
            createdAt
            updatedAt
            trackingCompany
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
                  lineItem {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// =============================================================================
// CUSTOMER QUERIES
// =============================================================================

/**
 * Get single customer by ID
 *
 * Estimated Cost: ~20-30 points
 *
 * Variables:
 * - id: Customer global ID (e.g., "gid://shopify/Customer/123")
 */
export const GET_CUSTOMER = `
  ${CUSTOMER_FULL_FRAGMENT}
  ${METAFIELD_FRAGMENT}

  query GetCustomer($id: ID!) {
    customer(id: $id) {
      ...CustomerFull
      totalSpent {
        amount
        currencyCode
      }
      metafields(first: 20) {
        edges {
          node {
            ...Metafield
          }
        }
      }
    }
  }
`;

export interface GetCustomerVariables {
  id: string;
}

export interface GetCustomerResponse {
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    state: string;
    numberOfOrders: number;
    totalSpent: {
      amount: string;
      currencyCode: string;
    };
    addresses: {
      edges: Array<{
        node: {
          id: string;
          address1: string;
          city: string;
          province: string;
          country: string;
          zip: string;
        };
      }>;
    };
  };
}

/**
 * List customers with pagination
 *
 * Estimated Cost: ~50-100 points
 */
export const LIST_CUSTOMERS = `
  ${CUSTOMER_BASIC_FRAGMENT}

  query ListCustomers(
    $first: Int!
    $after: String
    $query: String
    $sortKey: CustomerSortKeys
    $reverse: Boolean
  ) {
    customers(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...CustomerBasic
          totalSpent {
            amount
            currencyCode
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface ListCustomersVariables {
  first: number;
  after?: string;
  query?: string;
  sortKey?: 'NAME' | 'EMAIL' | 'CREATED_AT' | 'UPDATED_AT' | 'TOTAL_SPENT';
  reverse?: boolean;
}

/**
 * Search customers by email or name
 *
 * Estimated Cost: ~30-50 points
 */
export const SEARCH_CUSTOMERS = `
  ${CUSTOMER_BASIC_FRAGMENT}

  query SearchCustomers($first: Int!, $query: String!) {
    customers(first: $first, query: $query) {
      edges {
        cursor
        node {
          ...CustomerBasic
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// =============================================================================
// INVENTORY QUERIES
// =============================================================================

/**
 * Get inventory levels for a product
 *
 * Estimated Cost: ~20-40 points
 *
 * Variables:
 * - productId: Product global ID
 */
export const GET_INVENTORY_LEVELS = `
  ${INVENTORY_LEVEL_FRAGMENT}

  query GetInventoryLevels($productId: ID!) {
    product(id: $productId) {
      id
      title
      variants(first: 50) {
        edges {
          node {
            id
            sku
            inventoryItem {
              id
              tracked
              inventoryLevels(first: 10) {
                edges {
                  node {
                    ...InventoryLevel
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface GetInventoryLevelsVariables {
  productId: string;
}

/**
 * Get inventory item details
 *
 * Estimated Cost: ~10-15 points
 */
export const GET_INVENTORY_ITEM = `
  query GetInventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      sku
      tracked
      countryCodeOfOrigin
      provinceCodeOfOrigin
      harmonizedSystemCode
      createdAt
      updatedAt
      unitCost {
        amount
        currencyCode
      }
      inventoryLevels(first: 20) {
        edges {
          node {
            id
            available
            incoming
            location {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export interface GetInventoryItemVariables {
  id: string;
}

// =============================================================================
// COLLECTION QUERIES
// =============================================================================

/**
 * Get single collection by ID
 *
 * Estimated Cost: ~30-60 points (depending on product count)
 *
 * Variables:
 * - id: Collection global ID
 * - productsFirst: Number of products to include
 */
export const GET_COLLECTION = `
  ${COLLECTION_BASIC_FRAGMENT}
  ${PRODUCT_BASIC_FRAGMENT}

  query GetCollection($id: ID!, $productsFirst: Int) {
    collection(id: $id) {
      ...CollectionBasic
      productsCount
      products(first: $productsFirst) {
        edges {
          cursor
          node {
            ...ProductBasic
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface GetCollectionVariables {
  id: string;
  productsFirst?: number;
}

/**
 * List all collections
 *
 * Estimated Cost: ~40-80 points
 */
export const LIST_COLLECTIONS = `
  ${COLLECTION_BASIC_FRAGMENT}

  query ListCollections(
    $first: Int!
    $after: String
    $query: String
    $sortKey: CollectionSortKeys
    $reverse: Boolean
  ) {
    collections(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...CollectionBasic
          productsCount
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export interface ListCollectionsVariables {
  first: number;
  after?: string;
  query?: string;
  sortKey?: 'TITLE' | 'UPDATED_AT';
  reverse?: boolean;
}

// =============================================================================
// SHOP QUERIES
// =============================================================================

/**
 * Get shop details
 *
 * Estimated Cost: ~5-8 points
 *
 * Returns basic shop information including name, domain, currency, and plan.
 */
export const GET_SHOP = `
  query GetShop {
    shop {
      id
      name
      email
      description
      myshopifyDomain
      primaryDomain {
        id
        host
        url
      }
      currencyCode
      currencyFormats {
        moneyFormat
        moneyWithCurrencyFormat
      }
      enabledPresentmentCurrencies
      ianaTimezone
      plan {
        displayName
        partnerDevelopment
        shopifyPlus
      }
      billingAddress {
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      createdAt
      updatedAt
    }
  }
`;

export interface GetShopResponse {
  shop: {
    id: string;
    name: string;
    email: string;
    description: string | null;
    myshopifyDomain: string;
    primaryDomain: {
      id: string;
      host: string;
      url: string;
    };
    currencyCode: string;
    currencyFormats: {
      moneyFormat: string;
      moneyWithCurrencyFormat: string;
    };
    enabledPresentmentCurrencies: string[];
    ianaTimezone: string;
    plan: {
      displayName: string;
      partnerDevelopment: boolean;
      shopifyPlus: boolean;
    };
    billingAddress: {
      address1: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

// =============================================================================
// PAGINATION HELPER TYPES
// =============================================================================

/**
 * Standard Shopify GraphQL PageInfo type
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  edges: Array<{
    cursor: string;
    node: T;
  }>;
  pageInfo: PageInfo;
}

// =============================================================================
// PAGINATION HELPER FUNCTIONS
// =============================================================================

/**
 * Extract nodes from paginated response
 *
 * @example
 * const products = extractNodes(response.products);
 */
export function extractNodes<T>(paginatedData: PaginatedResponse<T>): T[] {
  return paginatedData.edges.map((edge) => edge.node);
}

/**
 * Check if there are more pages
 */
export function hasMorePages(paginatedData: PaginatedResponse<any>): boolean {
  return paginatedData.pageInfo.hasNextPage;
}

/**
 * Get next page cursor
 */
export function getNextCursor(paginatedData: PaginatedResponse<any>): string | null {
  return paginatedData.pageInfo.hasNextPage ? paginatedData.pageInfo.endCursor : null;
}

/**
 * Async generator for paginating through all results
 *
 * @example
 * for await (const products of paginateQuery(client, LIST_PRODUCTS, { first: 50 })) {
 *   console.log(products);
 * }
 */
export async function* paginateQuery<TVariables extends { after?: string }, TData>(
  queryFn: (variables: TVariables) => Promise<{ data: TData }>,
  variables: TVariables,
  extractPath: (data: TData) => PaginatedResponse<any>
): AsyncGenerator<any[], void, unknown> {
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await queryFn({ ...variables, after: cursor } as TVariables);
    const paginatedData = extractPath(response.data);

    yield extractNodes(paginatedData);

    hasNextPage = paginatedData.pageInfo.hasNextPage;
    cursor = paginatedData.pageInfo.endCursor;
  }
}

// =============================================================================
// QUERY COST ESTIMATION
// =============================================================================

/**
 * Estimate query cost based on query complexity
 *
 * Note: This is a rough estimation. Actual costs are returned in response.extensions.cost
 */
export function estimateQueryCost(query: string, variables: any): number {
  let cost = 5; // Base cost

  // Count connections
  const connectionMatches = query.match(/first:\s*\$?\w+/g) || [];
  connectionMatches.forEach((match) => {
    const limit = parseInt(match.match(/\d+/)?.[0] || '10');
    cost += 2 + limit; // Connection cost: 2 + N items
  });

  // Count nested levels (rough heuristic)
  const nestingLevel = (query.match(/{/g) || []).length;
  cost += nestingLevel * 2;

  return cost;
}

/**
 * Check if query exceeds recommended cost threshold
 */
export function isQueryTooExpensive(estimatedCost: number): boolean {
  return estimatedCost > 500; // Recommend using bulk operations above this
}
