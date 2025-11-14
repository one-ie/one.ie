/**
 * OpenAI Product Feed Specification Types
 *
 * Based on official spec: https://developers.openai.com/commerce/product-feed
 * Version: 2025-01-14
 */

/**
 * Complete product feed item per OpenAI specification
 * All fields aligned with official ACP Product Feed Spec
 */
export interface ProductFeedItem {
  // ===== OpenAI Flags =====
  /** Controls whether product can be surfaced in ChatGPT search */
  enable_search: boolean;
  /** Allows direct purchase inside ChatGPT (requires enable_search = true) */
  enable_checkout: boolean;

  // ===== Basic Product Data =====
  /** Merchant product ID (unique, max 100 chars) */
  id: string;
  /** Universal product identifier (GTIN, UPC, ISBN - 8-14 digits) */
  gtin?: string;
  /** Manufacturer part number (required if gtin missing, max 70 chars) */
  mpn?: string;
  /** Product title (max 150 chars, avoid all-caps) */
  title: string;
  /** Full product description (max 5,000 chars, plain text) */
  description: string;
  /** Product detail page URL (must resolve HTTP 200, HTTPS preferred) */
  link: string;

  // ===== Item Information =====
  /** Condition of product */
  condition?: 'new' | 'refurbished' | 'used';
  /** Category path using ">" separator */
  product_category: string;
  /** Product brand (max 70 chars) */
  brand?: string;
  /** Primary material(s) (max 100 chars) */
  material?: string;
  /** Overall dimensions (e.g., "12x8x5 in") */
  dimensions?: string;
  /** Individual length with unit */
  length?: string;
  /** Individual width with unit */
  width?: string;
  /** Individual height with unit */
  height?: string;
  /** Product weight (positive number with unit) */
  weight: string;
  /** Target demographic */
  age_group?: 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';

  // ===== Media =====
  /** Main product image URL (JPEG/PNG, HTTPS preferred) */
  image_link: string;
  /** Extra images (comma-separated or array) */
  additional_image_link?: string[];
  /** Product video URL */
  video_link?: string;
  /** 3D model URL (GLB/GLTF preferred) */
  model_3d_link?: string;

  // ===== Price & Promotions =====
  /** Regular price with ISO 4217 currency code */
  price: string;
  /** Discounted price (must be ≤ price) */
  sale_price?: string;
  /** Sale window (ISO 8601 date range) */
  sale_price_effective_date?: string;
  /** Unit pricing measure */
  unit_pricing_measure?: string;
  /** Base measure for unit pricing */
  base_measure?: string;
  /** Price trend message (max 80 chars) */
  pricing_trend?: string;

  // ===== Availability & Inventory =====
  /** Product availability status */
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  /** Availability date if preorder (must be future date) */
  availability_date?: string;
  /** Stock count (non-negative integer) */
  inventory_quantity: number;
  /** Remove product after this date */
  expiration_date?: string;
  /** Pickup options */
  pickup_method?: 'in_store' | 'reserve' | 'not_supported';
  /** Pickup SLA (e.g., "1 day") */
  pickup_sla?: string;

  // ===== Variants =====
  /** Variant group ID (max 70 chars) */
  item_group_id?: string;
  /** Group product title (max 150 chars) */
  item_group_title?: string;
  /** Variant color (max 40 chars) */
  color?: string;
  /** Variant size (max 20 chars) */
  size?: string;
  /** Size system (2-letter country code) */
  size_system?: string;
  /** Gender target */
  gender?: 'male' | 'female' | 'unisex';
  /** Offer ID (unique within feed) */
  offer_id?: string;
  /** Custom variant dimension 1 */
  custom_variant1_category?: string;
  custom_variant1_option?: string;
  /** Custom variant dimension 2 */
  custom_variant2_category?: string;
  custom_variant2_option?: string;
  /** Custom variant dimension 3 */
  custom_variant3_category?: string;
  custom_variant3_option?: string;

  // ===== Fulfillment =====
  /** Shipping method/cost/region (country:region:service_class:price) */
  shipping?: string[];
  /** Estimated arrival date (must be future) */
  delivery_estimate?: string;

  // ===== Merchant Info =====
  /** Seller name (max 70 chars) */
  seller_name: string;
  /** Seller page URL (HTTPS preferred) */
  seller_url: string;
  /** Seller privacy policy URL (required if enable_checkout = true) */
  seller_privacy_policy?: string;
  /** Seller terms of service URL (required if enable_checkout = true) */
  seller_tos?: string;

  // ===== Returns =====
  /** Return policy URL (HTTPS preferred) */
  return_policy: string;
  /** Days allowed for return (positive integer) */
  return_window: number;

  // ===== Performance Signals =====
  /** Popularity indicator (0-5 scale or merchant-defined) */
  popularity_score?: number;
  /** Return rate (0-100%) */
  return_rate?: number;

  // ===== Compliance =====
  /** Product disclaimers */
  warning?: string;
  /** Warning URL */
  warning_url?: string;
  /** Minimum purchase age (positive integer) */
  age_restriction?: number;

  // ===== Reviews and Q&A =====
  /** Number of product reviews (non-negative) */
  product_review_count?: number;
  /** Average review score (0-5 scale) */
  product_review_rating?: number;
  /** Number of brand/store reviews */
  store_review_count?: number;
  /** Average store rating (0-5 scale) */
  store_review_rating?: number;
  /** FAQ content (plain text) */
  q_and_a?: string;
  /** Raw review payload */
  raw_review_data?: string;

  // ===== Related Products =====
  /** Associated product IDs (comma-separated) */
  related_product_id?: string[];
  /** Relationship type */
  relationship_type?:
    | 'part_of_set'
    | 'required_part'
    | 'often_bought_with'
    | 'substitute'
    | 'different_brand'
    | 'accessory';

  // ===== Geo Tagging =====
  /** Price by region */
  geo_price?: string[];
  /** Availability per region */
  geo_availability?: string[];
}

/**
 * Product feed export formats
 */
export type ProductFeedFormat = 'json' | 'csv' | 'tsv' | 'xml';

/**
 * Product feed metadata
 */
export interface ProductFeedMeta {
  /** Feed generation timestamp */
  generated_at: string;
  /** Total number of products */
  total_products: number;
  /** Feed format */
  format: ProductFeedFormat;
  /** Feed version */
  version: string;
  /** Merchant information */
  merchant: {
    name: string;
    id: string;
    url: string;
  };
}

/**
 * Complete product feed
 */
export interface ProductFeed {
  meta: ProductFeedMeta;
  products: ProductFeedItem[];
}
