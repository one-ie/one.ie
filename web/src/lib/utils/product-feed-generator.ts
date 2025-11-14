/**
 * Product Feed Generator
 *
 * Converts internal Product type to OpenAI Product Feed Spec format
 * Supports JSON, CSV, TSV, and XML export
 */

import type { Product } from '@/lib/types/commerce';
import type {
  ProductFeedItem,
  ProductFeed,
  ProductFeedFormat,
} from '@/lib/types/product-feed';

/**
 * Convert internal Product to ProductFeedItem (OpenAI spec)
 */
export function convertToFeedItem(
  product: Product,
  merchantInfo: {
    name: string;
    url: string;
    privacyPolicy: string;
    tos: string;
    returnPolicy: string;
    returnWindow: number;
  }
): ProductFeedItem {
  return {
    // OpenAI Flags
    enable_search: true,
    enable_checkout: product.inStock, // Only enable checkout if in stock

    // Basic Product Data
    id: product.id,
    gtin: product.attributes?.gtin as string | undefined,
    mpn: product.attributes?.mpn as string | undefined,
    title: product.name,
    description: product.description,
    link: `${merchantInfo.url}/products/${product.id}`,

    // Item Information
    condition: 'new',
    product_category: getCategoryPath(product.category),
    brand: product.attributes?.brand as string | undefined,
    material: product.attributes?.material as string | undefined,
    weight: product.attributes?.weight
      ? `${product.attributes.weight}g`
      : '0g',
    age_group: 'adult',

    // Media
    image_link: product.image,
    additional_image_link: product.attributes?.additionalImages as
      | string[]
      | undefined,

    // Price & Promotions
    price: `${product.price} ${product.currency}`,
    sale_price: product.attributes?.salePrice
      ? `${product.attributes.salePrice} ${product.currency}`
      : undefined,

    // Availability & Inventory
    availability: product.inStock ? 'in_stock' : 'out_of_stock',
    inventory_quantity: product.attributes?.inventoryQuantity
      ? (product.attributes.inventoryQuantity as number)
      : product.inStock
        ? 10
        : 0,

    // Variants (if applicable)
    item_group_id: product.attributes?.itemGroupId as string | undefined,
    color: product.attributes?.color as string | undefined,
    size: product.attributes?.size as string | undefined,
    gender: product.attributes?.gender as 'male' | 'female' | 'unisex' | undefined,

    // Fulfillment
    shipping: ['US:*:Standard:5.00 USD', 'US:*:Express:15.00 USD'],
    delivery_estimate: getDeliveryEstimate(5), // 5 business days

    // Merchant Info
    seller_name: merchantInfo.name,
    seller_url: merchantInfo.url,
    seller_privacy_policy: merchantInfo.privacyPolicy,
    seller_tos: merchantInfo.tos,

    // Returns
    return_policy: merchantInfo.returnPolicy,
    return_window: merchantInfo.returnWindow,

    // Performance Signals
    popularity_score: product.rating,
    product_review_count: product.reviewCount,
    product_review_rating: product.rating,

    // Related Products
    related_product_id: product.aiSimilarProducts,
    relationship_type: 'substitute',
  };
}

/**
 * Get category path in OpenAI format
 */
function getCategoryPath(category: string): string {
  const categoryMap: Record<string, string> = {
    padel_racket: 'Sporting Goods > Racquet Sports > Padel > Rackets',
    course: 'Media > Education > Online Courses',
    software: 'Software > Business Software > Project Management',
    clothing: 'Apparel & Accessories',
    electronics: 'Electronics',
  };

  return categoryMap[category] || 'Other';
}

/**
 * Get delivery estimate (future date)
 */
function getDeliveryEstimate(businessDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + businessDays);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Generate complete product feed
 */
export function generateProductFeed(
  products: Product[],
  merchantInfo: {
    name: string;
    id: string;
    url: string;
    privacyPolicy: string;
    tos: string;
    returnPolicy: string;
    returnWindow: number;
  }
): ProductFeed {
  return {
    meta: {
      generated_at: new Date().toISOString(),
      total_products: products.length,
      format: 'json',
      version: '1.0',
      merchant: {
        name: merchantInfo.name,
        id: merchantInfo.id,
        url: merchantInfo.url,
      },
    },
    products: products.map((p) => convertToFeedItem(p, merchantInfo)),
  };
}

/**
 * Export feed as JSON string
 */
export function exportAsJSON(feed: ProductFeed): string {
  return JSON.stringify(feed, null, 2);
}

/**
 * Export feed as CSV
 */
export function exportAsCSV(feed: ProductFeed): string {
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'price',
    'availability',
    'inventory_quantity',
    'brand',
    'product_category',
    'condition',
    'gtin',
    'mpn',
    'enable_search',
    'enable_checkout',
    'seller_name',
    'seller_url',
  ];

  const rows = feed.products.map((product) =>
    headers.map((header) => {
      const value = product[header as keyof ProductFeedItem];
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '');
      return stringValue.includes(',')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    })
  );

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Export feed as TSV
 */
export function exportAsTSV(feed: ProductFeed): string {
  const csv = exportAsCSV(feed);
  // Replace commas with tabs, accounting for quoted fields
  return csv.replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\t');
}

/**
 * Export feed as XML
 */
export function exportAsXML(feed: ProductFeed): string {
  const xmlProducts = feed.products
    .map(
      (product) => `
    <product>
      <id>${escapeXML(product.id)}</id>
      <title>${escapeXML(product.title)}</title>
      <description>${escapeXML(product.description)}</description>
      <link>${escapeXML(product.link)}</link>
      <image_link>${escapeXML(product.image_link)}</image_link>
      <price>${escapeXML(product.price)}</price>
      <availability>${escapeXML(product.availability)}</availability>
      <inventory_quantity>${product.inventory_quantity}</inventory_quantity>
      <brand>${escapeXML(product.brand || '')}</brand>
      <product_category>${escapeXML(product.product_category)}</product_category>
      <condition>${escapeXML(product.condition || 'new')}</condition>
      <enable_search>${product.enable_search}</enable_search>
      <enable_checkout>${product.enable_checkout}</enable_checkout>
      <seller_name>${escapeXML(product.seller_name)}</seller_name>
      <seller_url>${escapeXML(product.seller_url)}</seller_url>
    </product>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <meta>
    <generated_at>${feed.meta.generated_at}</generated_at>
    <total_products>${feed.meta.total_products}</total_products>
    <version>${feed.meta.version}</version>
    <merchant>
      <name>${escapeXML(feed.meta.merchant.name)}</name>
      <id>${escapeXML(feed.meta.merchant.id)}</id>
      <url>${escapeXML(feed.meta.merchant.url)}</url>
    </merchant>
  </meta>
  <products>${xmlProducts}
  </products>
</feed>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export feed in specified format
 */
export function exportProductFeed(
  feed: ProductFeed,
  format: ProductFeedFormat
): string {
  switch (format) {
    case 'json':
      return exportAsJSON(feed);
    case 'csv':
      return exportAsCSV(feed);
    case 'tsv':
      return exportAsTSV(feed);
    case 'xml':
      return exportAsXML(feed);
    default:
      return exportAsJSON(feed);
  }
}

/**
 * Get content type for format
 */
export function getContentType(format: ProductFeedFormat): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'csv':
      return 'text/csv';
    case 'tsv':
      return 'text/tab-separated-values';
    case 'xml':
      return 'application/xml';
    default:
      return 'application/json';
  }
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ProductFeedFormat): string {
  return format;
}
