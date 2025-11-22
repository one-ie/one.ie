/**
 * Shopify Integration Examples
 *
 * This file contains example code showing how the Shopify integration SHOULD work
 * once Cycles 16-24 are completed.
 *
 * ⚠️ WARNING: These examples are PLACEHOLDERS and will NOT work until:
 * - Cycle 16-18: Type definitions are created
 * - Cycle 19-20: Zod schemas are created
 * - Cycle 21-22: GraphQL queries/mutations are created
 * - Cycle 23-24: Transformation functions are created
 *
 * Status: 0% implemented (Cycles 16-24 not executed)
 * Last Updated: 2025-11-22
 */

// ============================================================================
// EXAMPLE 1: Product Sync Flow (Shopify → ONE)
// ============================================================================

/**
 * Example: Fetching a product from Shopify and storing it in ONE Platform
 *
 * Flow: GraphQL Query → Transform → ONE Thing → Save to DataProvider
 */
export async function exampleProductSync() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  // 1. Import required types and functions (from Cycles 16-24)
  import type { ShopifyProduct } from './types/shopify-api';
  import type { Thing } from '@/providers/DataProvider';
  import { GET_PRODUCT } from './graphql/queries';
  import { transformProductToThing } from './transformers/to-one';
  import { ShopifyProductPropertiesSchema } from './schemas/properties';

  // 2. Fetch product from Shopify GraphQL API
  const shopifyClient = createShopifyClient({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
    accessToken: process.env.SHOPIFY_ADMIN_API_TOKEN!
  });

  const response = await shopifyClient.query<{ product: ShopifyProduct }>(
    GET_PRODUCT,
    { id: 'gid://shopify/Product/123456789' }
  );

  const shopifyProduct = response.product;

  // 3. Transform Shopify product to ONE Thing
  const productThing = transformProductToThing(shopifyProduct, storeGroupId);

  // 4. Validate properties using Zod schema
  const validatedProperties = ShopifyProductPropertiesSchema.parse(
    productThing.properties
  );

  // 5. Save to ONE Platform (via DataProvider)
  const provider = getDataProvider(); // Could be ConvexProvider or any backend
  const savedThing = await provider.things.create({
    ...productThing,
    properties: validatedProperties
  });

  // 6. Create knowledge entries (tags, description for RAG)
  if (shopifyProduct.tags.length > 0) {
    await provider.knowledge.create({
      type: 'label',
      thingId: savedThing.id,
      labels: shopifyProduct.tags,
      metadata: { source: 'shopify_tags' }
    });
  }

  if (shopifyProduct.bodyHtml) {
    const embedding = await generateEmbedding(shopifyProduct.bodyHtml);
    await provider.knowledge.create({
      type: 'chunk',
      thingId: savedThing.id,
      content: stripHtml(shopifyProduct.bodyHtml),
      embedding,
      metadata: { chunkType: 'product_description' }
    });
  }

  console.log('Product synced:', savedThing.id);
  return savedThing;
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 2: Product Variant Sync
// ============================================================================

/**
 * Example: Syncing product variants and creating connections
 *
 * Flow: Fetch variants → Transform → Create things → Create connections
 */
export async function exampleVariantSync() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import type { ShopifyVariant } from './types/shopify-api';
  import { transformVariantToThing } from './transformers/to-one';
  import { ShopifyVariantPropertiesSchema } from './schemas/properties';

  // Assume we have a product with variants
  const shopifyProduct = await fetchProduct('gid://shopify/Product/123');
  const productThing = await syncProduct(shopifyProduct);

  // Sync each variant
  for (const shopifyVariant of shopifyProduct.variants) {
    // 1. Transform variant to thing
    const variantThing = transformVariantToThing(
      shopifyVariant,
      shopifyProduct,
      storeGroupId
    );

    // 2. Validate properties
    const validatedProperties = ShopifyVariantPropertiesSchema.parse(
      variantThing.properties
    );

    // 3. Save variant thing
    const savedVariant = await provider.things.create({
      ...variantThing,
      properties: validatedProperties
    });

    // 4. Create connection: variant → product
    await provider.connections.create({
      type: 'variant_of',
      fromThingId: savedVariant.id,
      toThingId: productThing.id,
      metadata: {
        position: shopifyVariant.position
      }
    });

    console.log('Variant synced:', savedVariant.id);
  }
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 3: Order Processing (Shopify Webhook → ONE)
// ============================================================================

/**
 * Example: Processing an "orders/create" webhook from Shopify
 *
 * Flow: Webhook payload → Transform → Create order thing + connections + event
 */
export async function exampleOrderWebhook() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import type { ShopifyOrder } from './types/shopify-api';
  import { transformOrderToThingAndConnections } from './transformers/to-one';
  import { ShopifyOrderPropertiesSchema } from './schemas/properties';
  import { ContainsMetadataSchema } from './schemas/metadata';

  // Webhook payload (from Shopify)
  const webhookPayload: ShopifyOrder = {
    id: 'gid://shopify/Order/123456789',
    orderNumber: 1001,
    email: 'customer@example.com',
    financialStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    totalPrice: '75.38',
    // ... 50+ more fields
  };

  // 1. Transform order to thing + connections
  const { thing: orderThing, connections } = transformOrderToThingAndConnections(
    webhookPayload,
    storeGroupId
  );

  // 2. Validate order properties
  const validatedProperties = ShopifyOrderPropertiesSchema.parse(
    orderThing.properties
  );

  // 3. Create order thing
  const savedOrder = await provider.things.create({
    ...orderThing,
    properties: validatedProperties
  });

  // 4. Create connections for line items (order → products)
  for (const connection of connections) {
    // Validate connection metadata
    if (connection.type === 'contains') {
      const validatedMetadata = ContainsMetadataSchema.parse(
        connection.metadata
      );

      await provider.connections.create({
        ...connection,
        fromThingId: savedOrder.id,
        metadata: validatedMetadata
      });
    }
  }

  // 5. Find customer and create "purchased" connections
  const customer = await findCustomerByEmail(webhookPayload.email);

  for (const lineItem of webhookPayload.lineItems) {
    const product = await findProductByShopifyId(lineItem.productId);

    await provider.connections.create({
      type: 'purchased',
      fromThingId: customer.id,
      toThingId: product.id,
      metadata: {
        orderId: savedOrder.id,
        quantity: lineItem.quantity,
        price: lineItem.price,
        variantId: lineItem.variantId,
        purchasedAt: webhookPayload.processedAt
      }
    });
  }

  // 6. Create event (audit trail)
  await provider.events.create({
    type: 'order_placed',
    thingId: savedOrder.id,
    actorId: customer.id,
    groupId: storeGroupId,
    metadata: {
      shopifyWebhookId: webhookPayload.id,
      orderNumber: webhookPayload.orderNumber,
      totalPrice: webhookPayload.totalPrice,
      currency: webhookPayload.currency,
      itemCount: webhookPayload.lineItems.length
    }
  });

  console.log('Order processed:', savedOrder.id);
  return savedOrder;
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 4: Cart Management (Client-side)
// ============================================================================

/**
 * Example: Adding a product to cart (creates connection)
 *
 * Flow: User action → Create connection (in_cart) → Update cart state
 */
export async function exampleAddToCart() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import { InCartMetadataSchema } from './schemas/metadata';

  // User wants to add a product to their cart
  const customerId = 'current-user-id';
  const productId = 'thing-id-for-product';
  const variantId = 'thing-id-for-variant';
  const quantity = 2;

  // 1. Check if product is already in cart
  const existingConnection = await provider.connections.findOne({
    type: 'in_cart',
    fromThingId: customerId,
    toThingId: productId,
    'metadata.variantId': variantId
  });

  if (existingConnection) {
    // 2a. Update quantity if already in cart
    const newQuantity = existingConnection.metadata.quantity + quantity;

    await provider.connections.update(existingConnection.id, {
      metadata: {
        ...existingConnection.metadata,
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      }
    });
  } else {
    // 2b. Create new cart connection
    const metadata = {
      variantId,
      quantity,
      addedAt: new Date().toISOString()
    };

    // Validate metadata
    const validatedMetadata = InCartMetadataSchema.parse(metadata);

    await provider.connections.create({
      type: 'in_cart',
      fromThingId: customerId,
      toThingId: productId,
      metadata: validatedMetadata
    });
  }

  // 3. Create event (for analytics)
  await provider.events.create({
    type: 'product_added_to_cart',
    thingId: productId,
    actorId: customerId,
    groupId: storeGroupId,
    metadata: { variantId, quantity }
  });

  console.log('Added to cart:', { productId, variantId, quantity });
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 5: Get User's Cart (Query Connections)
// ============================================================================

/**
 * Example: Fetching a customer's cart
 *
 * Flow: Query connections (type: in_cart) → Fetch products → Return cart items
 */
export async function exampleGetCart() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  const customerId = 'current-user-id';

  // 1. Fetch all "in_cart" connections for this customer
  const cartConnections = await provider.connections.list({
    type: 'in_cart',
    fromThingId: customerId
  });

  // 2. Fetch product and variant details for each item
  const cartItems = await Promise.all(
    cartConnections.map(async (connection) => {
      const product = await provider.things.get(connection.toThingId);
      const variant = await provider.things.get(connection.metadata.variantId);

      return {
        connectionId: connection.id,
        product,
        variant,
        quantity: connection.metadata.quantity,
        addedAt: connection.metadata.addedAt,
        price: variant.properties.price,
        subtotal: (
          parseFloat(variant.properties.price) * connection.metadata.quantity
        ).toFixed(2)
      };
    })
  );

  // 3. Calculate cart totals
  const cartTotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.subtotal),
    0
  );

  return {
    items: cartItems,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    subtotal: cartTotal.toFixed(2),
    currency: 'USD'
  };
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 6: Reverse Flow (ONE → Shopify)
// ============================================================================

/**
 * Example: Updating a product in ONE and pushing changes to Shopify
 *
 * Flow: Update ONE thing → Transform → GraphQL mutation → Update Shopify
 */
export async function exampleUpdateProduct() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import { transformThingToProductInput } from './transformers/to-shopify';
  import { UPDATE_PRODUCT } from './graphql/mutations';

  const productThingId = 'thing-id-for-product';

  // 1. Update product in ONE Platform
  const updatedThing = await provider.things.update(productThingId, {
    name: 'New Product Title',
    description: 'Updated product description',
    properties: {
      price: '34.99',  // Changed from 29.99
      tags: ['summer', 'sale', 'bestseller']  // Added 'sale' tag
    }
  });

  // 2. Transform ONE thing to Shopify product input
  const productInput = transformThingToProductInput(updatedThing);

  // 3. Push changes to Shopify via GraphQL mutation
  const shopifyClient = createShopifyClient({...});

  const response = await shopifyClient.mutate(UPDATE_PRODUCT, {
    input: {
      id: updatedThing.properties.shopifyProductId,
      ...productInput
    }
  });

  // 4. Handle errors from Shopify
  if (response.productUpdate.userErrors.length > 0) {
    console.error('Shopify errors:', response.productUpdate.userErrors);
    throw new Error('Failed to update product in Shopify');
  }

  // 5. Create event (for audit trail)
  await provider.events.create({
    type: 'product_updated',
    thingId: productThingId,
    actorId: currentUserId,
    groupId: storeGroupId,
    metadata: {
      shopifyProductId: updatedThing.properties.shopifyProductId,
      changes: {
        title: { old: 'Old Title', new: 'New Product Title' },
        price: { old: '29.99', new: '34.99' }
      }
    }
  });

  console.log('Product updated in both ONE and Shopify');
  return updatedThing;
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 7: Error Handling
// ============================================================================

/**
 * Example: Proper error handling for Shopify operations
 *
 * Shows how to handle validation errors, API errors, and transformation errors
 */
export async function exampleErrorHandling() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import { z } from 'zod';
  import { ShopifyProductPropertiesSchema } from './schemas/properties';
  import { ShopifyAPIError, ShopifyRateLimitError } from './errors';

  try {
    // 1. Fetch product from Shopify
    const response = await shopifyClient.query(GET_PRODUCT, { id: 'invalid-id' });

    // 2. Validate response
    const shopifyProduct = response.product;

    if (!shopifyProduct) {
      throw new Error('Product not found in Shopify');
    }

    // 3. Transform to ONE thing
    const productThing = transformProductToThing(shopifyProduct, storeGroupId);

    // 4. Validate properties with Zod
    try {
      const validatedProperties = ShopifyProductPropertiesSchema.parse(
        productThing.properties
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        throw new Error(`Invalid product properties: ${error.message}`);
      }
      throw error;
    }

    // 5. Save to ONE Platform
    const savedThing = await provider.things.create(productThing);

    return savedThing;

  } catch (error) {
    // Handle different error types
    if (error instanceof ShopifyRateLimitError) {
      // Rate limit hit - retry with exponential backoff
      console.warn('Rate limit hit, retrying in:', error.retryAfter);
      await sleep(error.retryAfter * 1000);
      return exampleErrorHandling(); // Retry
    }

    if (error instanceof ShopifyAPIError) {
      // Shopify API error
      console.error('Shopify API error:', {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors
      });
      throw error;
    }

    // Unknown error
    console.error('Unexpected error:', error);
    throw error;
  }
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 8: Batch Product Sync
// ============================================================================

/**
 * Example: Syncing all products from Shopify (pagination)
 *
 * Flow: Paginated queries → Transform all → Batch save to ONE
 */
export async function exampleBatchSync() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import { LIST_PRODUCTS } from './graphql/queries';

  let hasNextPage = true;
  let cursor: string | null = null;
  let totalSynced = 0;

  while (hasNextPage) {
    // 1. Fetch page of products
    const response = await shopifyClient.query(LIST_PRODUCTS, {
      first: 50,  // Shopify max = 250, but 50 is safer for rate limits
      after: cursor
    });

    const { edges, pageInfo } = response.products;

    // 2. Transform and save each product
    for (const edge of edges) {
      const shopifyProduct = edge.node;

      try {
        // Transform
        const productThing = transformProductToThing(shopifyProduct, storeGroupId);

        // Check if already exists (by shopifyProductId)
        const existing = await provider.things.findOne({
          type: 'product',
          'properties.shopifyProductId': shopifyProduct.id
        });

        if (existing) {
          // Update existing
          await provider.things.update(existing.id, productThing);
        } else {
          // Create new
          await provider.things.create(productThing);
        }

        totalSynced++;

        // Also sync variants
        for (const variant of shopifyProduct.variants) {
          await syncVariant(variant, productThing.id);
        }

      } catch (error) {
        console.error('Failed to sync product:', shopifyProduct.id, error);
        // Continue with next product
      }
    }

    // 3. Move to next page
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;

    console.log(`Synced ${totalSynced} products so far...`);
  }

  console.log(`Batch sync complete: ${totalSynced} products synced`);
  return totalSynced;
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 9: Semantic Product Search (Knowledge Dimension)
// ============================================================================

/**
 * Example: Using the knowledge dimension for AI-powered product search
 *
 * Flow: User query → Generate embedding → Vector search → Return products
 */
export async function exampleSemanticSearch() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  import { generateEmbedding } from '@/lib/ai/embeddings';

  const userQuery = "soft comfortable summer clothes";

  // 1. Generate embedding for user's search query
  const queryEmbedding = await generateEmbedding(userQuery);

  // 2. Search knowledge dimension for similar product descriptions
  const knowledgeResults = await provider.knowledge.search({
    embedding: queryEmbedding,
    type: 'chunk',
    'metadata.chunkType': 'product_description',
    limit: 20,
    minSimilarity: 0.7
  });

  // 3. Fetch the actual products
  const productIds = knowledgeResults.map(k => k.thingId);
  const products = await provider.things.list({
    id: { $in: productIds },
    type: 'product',
    'properties.status': 'active'
  });

  // 4. Also search by tags (for exact matches)
  const tagResults = await provider.knowledge.list({
    type: 'label',
    labels: { $contains: 'summer' }
  });

  const tagProductIds = tagResults.map(k => k.thingId);
  const tagProducts = await provider.things.list({
    id: { $in: tagProductIds },
    type: 'product'
  });

  // 5. Merge and deduplicate results
  const allProducts = [...products, ...tagProducts].reduce((acc, product) => {
    if (!acc.some(p => p.id === product.id)) {
      acc.push(product);
    }
    return acc;
  }, []);

  console.log(`Found ${allProducts.length} products matching: "${userQuery}"`);
  return allProducts;
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// EXAMPLE 10: Collection Hierarchy (Groups Dimension)
// ============================================================================

/**
 * Example: Working with nested collections
 *
 * Flow: Create collection groups → Add products → Query by collection
 */
export async function exampleCollectionHierarchy() {
  // NOTE: This code will NOT work until Cycles 16-24 are complete

  /*
  // 1. Create root collection group
  const summerCollection = await provider.groups.create({
    type: 'collection',
    parentGroupId: storeGroupId,
    name: 'Summer Collection 2025',
    properties: {
      shopifyCollectionId: 'gid://shopify/Collection/123',
      handle: 'summer-2025',
      sortOrder: 'best-selling',
      isSmartCollection: false
    }
  });

  // 2. Create subcollections
  const mensCollection = await provider.groups.create({
    type: 'collection',
    parentGroupId: summerCollection.id,  // Nested!
    name: "Men's Summer",
    properties: {
      shopifyCollectionId: 'gid://shopify/Collection/456',
      handle: 'summer-2025-mens'
    }
  });

  const womensCollection = await provider.groups.create({
    type: 'collection',
    parentGroupId: summerCollection.id,  // Nested!
    name: "Women's Summer",
    properties: {
      shopifyCollectionId: 'gid://shopify/Collection/789',
      handle: 'summer-2025-womens'
    }
  });

  // 3. Add products to collections via connections
  const tshirtProduct = await provider.things.get('product-thing-id');

  await provider.connections.create({
    type: 'belongs_to',
    fromThingId: tshirtProduct.id,
    toThingId: mensCollection.id,
    metadata: {
      position: 1,
      featured: true
    }
  });

  // 4. Query all products in a collection
  const connections = await provider.connections.list({
    type: 'belongs_to',
    toThingId: mensCollection.id
  });

  const productIds = connections.map(c => c.fromThingId);
  const products = await provider.things.list({
    id: { $in: productIds },
    type: 'product'
  });

  // 5. Query entire collection hierarchy
  const allSubcollections = await provider.groups.list({
    parentGroupId: summerCollection.id
  });

  console.log(`Collection "${summerCollection.name}" has ${allSubcollections.length} subcollections`);
  console.log(`"${mensCollection.name}" has ${products.length} products`);
  */

  throw new Error('Example not implemented - Cycles 16-24 required');
}

// ============================================================================
// Helper Functions (Placeholders)
// ============================================================================

async function fetchProduct(id: string): Promise<any> {
  throw new Error('Not implemented - Cycle 21 required');
}

async function syncProduct(shopifyProduct: any): Promise<any> {
  throw new Error('Not implemented - Cycle 23 required');
}

async function syncVariant(variant: any, productId: string): Promise<void> {
  throw new Error('Not implemented - Cycle 23 required');
}

async function findCustomerByEmail(email: string): Promise<any> {
  throw new Error('Not implemented');
}

async function findProductByShopifyId(shopifyId: string): Promise<any> {
  throw new Error('Not implemented');
}

async function createShopifyClient(config: any): Promise<any> {
  throw new Error('Not implemented - Cycle 26 required');
}

async function getDataProvider(): Promise<any> {
  throw new Error('Not implemented');
}

async function generateEmbedding(text: string): Promise<number[]> {
  throw new Error('Not implemented');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Export all examples
// ============================================================================

export const examples = {
  productSync: exampleProductSync,
  variantSync: exampleVariantSync,
  orderWebhook: exampleOrderWebhook,
  addToCart: exampleAddToCart,
  getCart: exampleGetCart,
  updateProduct: exampleUpdateProduct,
  errorHandling: exampleErrorHandling,
  batchSync: exampleBatchSync,
  semanticSearch: exampleSemanticSearch,
  collectionHierarchy: exampleCollectionHierarchy
};

export default examples;

/**
 * README
 *
 * These examples demonstrate the INTENDED usage patterns for the Shopify integration.
 * They show how the 6-dimension ontology maps to Shopify's e-commerce model.
 *
 * Current Status: PLACEHOLDER CODE
 *
 * To make these examples work:
 * 1. Complete Cycle 16-18: Type definitions
 * 2. Complete Cycle 19-20: Zod schemas
 * 3. Complete Cycle 21-22: GraphQL queries/mutations
 * 4. Complete Cycle 23-24: Transformation functions
 * 5. Uncomment the code blocks
 * 6. Remove the throw statements
 *
 * See: /home/user/one.ie/one/events/shopify-mapping-validation.md
 */
