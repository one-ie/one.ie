/**
 * Agentic Checkout API Types
 *
 * Based on OpenAI Agentic Checkout Spec + Stripe Shared Payment Tokens
 * Version: 2025-01-14
 *
 * References:
 * - https://developers.openai.com/commerce/agentic-checkout
 * - https://docs.stripe.com/agentic-commerce/concepts
 */

// ===== Request/Response Headers =====

export interface AgenticCheckoutRequestHeaders {
  /** API Key for authentication */
  Authorization: string; // Bearer api_key_123
  /** Preferred locale for content */
  "Accept-Language"?: string; // en-US
  /** Client making the request */
  "User-Agent": string; // ChatGPT/2.0
  /** Idempotency key */
  "Idempotency-Key": string;
  /** Unique request ID for tracing */
  "Request-Id": string;
  /** Content type */
  "Content-Type": "application/json";
  /** HMAC signature of request body */
  Signature?: string;
  /** RFC 3339 timestamp */
  Timestamp: string;
  /** API version */
  "API-Version": string; // 2025-09-12
}

export interface AgenticCheckoutResponseHeaders {
  /** Echo idempotency key */
  "Idempotency-Key": string;
  /** Echo request ID */
  "Request-Id": string;
}

// ===== Core Entities =====

/** Item to purchase */
export interface Item {
  /** Product ID */
  id: string;
  /** Quantity */
  quantity: number; // Must be > 0
}

/** Customer address */
export interface Address {
  /** Recipient name */
  name: string; // Max 256 chars
  /** Address line 1 */
  line_one: string; // Max 60 chars
  /** Address line 2 */
  line_two?: string; // Max 60 chars
  /** City */
  city: string; // Max 60 chars
  /** State/province (ISO 3166-2) */
  state: string;
  /** Country (ISO 3166-1) */
  country: string;
  /** Postal code */
  postal_code: string; // Max 20 chars
  /** Phone number (E.164) */
  phone_number?: string;
}

/** Buyer information */
export interface Buyer {
  /** First name */
  first_name: string; // Max 256 chars
  /** Email */
  email: string; // Max 256 chars
  /** Phone number (E.164) */
  phone_number?: string;
}

/** Payment provider configuration */
export interface PaymentProvider {
  /** Payment processor */
  provider: "stripe";
  /** Supported payment methods */
  supported_payment_methods: Array<"card">;
}

/** Line item with computed costs */
export interface LineItem {
  /** Line item ID (unique) */
  id: string;
  /** Item reference */
  item: Item;
  /** Base amount before adjustments (cents) */
  base_amount: number; // >= 0
  /** Discount amount (cents) */
  discount: number; // >= 0
  /** Subtotal (cents) */
  subtotal: number; // = base_amount - discount
  /** Tax amount (cents) */
  tax: number; // >= 0
  /** Total (cents) */
  total: number; // = subtotal + tax
}

/** Total breakdown */
export interface Total {
  /** Type of total */
  type:
    | "items_base_amount"
    | "items_discount"
    | "subtotal"
    | "discount"
    | "fulfillment"
    | "tax"
    | "fee"
    | "total";
  /** Display text */
  display_text: string;
  /** Amount in cents */
  amount: number; // >= 0
}

/** Fulfillment option (shipping) */
export interface FulfillmentOptionShipping {
  /** Type */
  type: "shipping";
  /** Unique ID */
  id: string;
  /** Title */
  title: string;
  /** Subtitle (e.g., "Arrives in 4-5 days") */
  subtitle: string;
  /** Carrier name */
  carrier_info: string;
  /** Earliest delivery (RFC 3339) */
  earliest_delivery_time: string;
  /** Latest delivery (RFC 3339) */
  latest_delivery_time: string;
  /** Subtotal (cents) */
  subtotal: number; // >= 0
  /** Tax (cents) */
  tax: number; // >= 0
  /** Total (cents) */
  total: number; // = subtotal + tax
}

/** Fulfillment option (digital) */
export interface FulfillmentOptionDigital {
  /** Type */
  type: "digital";
  /** Unique ID */
  id: string;
  /** Title */
  title: string;
  /** Subtitle */
  subtitle?: string;
  /** Subtotal (cents) */
  subtotal: number; // >= 0
  /** Tax (cents) */
  tax: number; // >= 0
  /** Total (cents) */
  total: number; // = subtotal + tax
}

export type FulfillmentOption = FulfillmentOptionShipping | FulfillmentOptionDigital;

/** Message (info) */
export interface MessageInfo {
  /** Type */
  type: "info";
  /** JSONPath to component */
  param: string; // e.g., $.line_items[1]
  /** Content type */
  content_type: "plain" | "markdown";
  /** Message content */
  content: string;
}

/** Message (error) */
export interface MessageError {
  /** Type */
  type: "error";
  /** Error code */
  code:
    | "missing"
    | "invalid"
    | "out_of_stock"
    | "payment_declined"
    | "requires_sign_in"
    | "requires_3ds";
  /** JSONPath to component */
  param?: string;
  /** Content type */
  content_type: "plain" | "markdown";
  /** Message content */
  content: string;
}

export type Message = MessageInfo | MessageError;

/** Link */
export interface Link {
  /** Link type */
  type: "terms_of_use" | "privacy_policy" | "seller_shop_policies";
  /** URL */
  value: string;
}

/** Payment data (Stripe Shared Payment Token) */
export interface PaymentData {
  /** Stripe Shared Payment Token */
  token: string; // spt_...
  /** Provider */
  provider: "stripe";
  /** Billing address */
  billing_address?: Address;
}

/** Order */
export interface Order {
  /** Order ID */
  id: string;
  /** Checkout session ID */
  checkout_session_id: string;
  /** Order permalink URL */
  permalink_url: string;
}

/** Checkout session status */
export type CheckoutSessionStatus =
  | "not_ready_for_payment"
  | "ready_for_payment"
  | "in_progress"
  | "completed"
  | "canceled";

// ===== API Request/Response Types =====

/** POST /checkout_sessions - Request */
export interface CreateCheckoutSessionRequest {
  /** Items to purchase */
  items: Item[];
  /** Buyer info */
  buyer?: Buyer;
  /** Fulfillment address */
  fulfillment_address?: Address;
}

/** POST /checkout_sessions - Response (201) */
export interface CheckoutSessionResponse {
  /** Session ID */
  id: string;
  /** Buyer */
  buyer?: Buyer;
  /** Payment provider */
  payment_provider: PaymentProvider;
  /** Status */
  status: CheckoutSessionStatus;
  /** Currency (ISO 4217, lowercase) */
  currency: string;
  /** Line items */
  line_items: LineItem[];
  /** Fulfillment address */
  fulfillment_address?: Address;
  /** Fulfillment options */
  fulfillment_options: FulfillmentOption[];
  /** Selected fulfillment option ID */
  fulfillment_option_id?: string;
  /** Totals */
  totals: Total[];
  /** Messages */
  messages: Message[];
  /** Links */
  links: Link[];
  /** Order (only on complete) */
  order?: Order;
}

/** POST /checkout_sessions/{id} - Request */
export interface UpdateCheckoutSessionRequest {
  /** Buyer */
  buyer?: Buyer;
  /** Items */
  items?: Item[];
  /** Fulfillment address */
  fulfillment_address?: Address;
  /** Fulfillment option ID */
  fulfillment_option_id?: string;
}

/** POST /checkout_sessions/{id}/complete - Request */
export interface CompleteCheckoutSessionRequest {
  /** Buyer */
  buyer?: Buyer;
  /** Payment data (Stripe SPT) */
  payment_data: PaymentData;
}

/** Error response */
export interface ErrorResponse {
  /** Error type */
  type: "invalid_request";
  /** Error code */
  code: "request_not_idempotent" | string;
  /** Human-readable message */
  message: string;
  /** JSONPath to offending field */
  param?: string;
}

// ===== Webhook Types =====

/** Webhook event */
export interface WebhookEvent {
  /** Event type */
  type: "order_created" | "order_updated";
  /** Event data */
  data: EventData;
}

/** Event data (order) */
export interface EventData {
  /** Type */
  type: "order";
  /** Checkout session ID */
  checkout_session_id: string;
  /** Order permalink */
  permalink_url: string;
  /** Order status */
  status: "created" | "manual_review" | "confirmed" | "canceled" | "shipped" | "fulfilled";
  /** Refunds */
  refunds: Refund[];
}

/** Refund */
export interface Refund {
  /** Refund type */
  type: "store_credit" | "original_payment";
  /** Amount (cents) */
  amount: number; // >= 0
}

// ===== Stripe-Specific Types =====

/** Stripe Shared Payment Token (from agent) */
export interface StripeSharedPaymentToken {
  /** Token ID */
  id: string; // spt_...
  /** Object type */
  object: "shared_payment_granted_token";
  /** Created timestamp */
  created: number;
  /** Payment method details */
  payment_method: {
    id: string;
    type: "card";
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  };
  /** Allowance */
  allowance: {
    reason: "one_time";
    max_amount: number;
    currency: string;
    expires_at: number;
  };
}

/** Stripe PaymentIntent creation params */
export interface StripePaymentIntentParams {
  /** Amount in cents */
  amount: number;
  /** Currency */
  currency: string;
  /** Shared payment token */
  shared_payment_granted_token: string;
  /** Metadata */
  metadata?: Record<string, string>;
  /** Automatic payment methods */
  automatic_payment_methods?: {
    enabled: boolean;
  };
}
