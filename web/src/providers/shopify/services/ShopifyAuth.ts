/**
 * ShopifyAuth Service - OAuth 2.0 Authentication & Token Management
 *
 * Handles Shopify OAuth 2.0 authentication including:
 * - Authorization code grant flow
 * - Access token storage and retrieval
 * - Token encryption/decryption
 * - Shop domain validation
 * - HMAC signature verification
 * - Multi-shop support (groupId → shop mapping)
 *
 * Design Philosophy:
 * - Secure by default (all tokens encrypted)
 * - Multi-tenant (each groupId can have multiple shops)
 * - Stateless (no session dependencies)
 * - Effect.ts for composability
 * - HMAC verification using timing-safe comparison
 *
 * OAuth Flow:
 * 1. User initiates: /shopify/install?shop=example.myshopify.com
 * 2. Redirect to Shopify: /admin/oauth/authorize?client_id=...&state=...
 * 3. User approves permissions
 * 4. Callback: /shopify/callback?code=...&hmac=...&shop=...&state=...
 * 5. Verify HMAC and state
 * 6. Exchange code for access token
 * 7. Store encrypted token with groupId mapping
 *
 * Usage:
 * ```typescript
 * import { ShopifyAuth } from './services/ShopifyAuth';
 *
 * // Get access token for shop
 * const program = Effect.gen(function* () {
 *   const auth = yield* ShopifyAuth;
 *   const token = yield* auth.getAccessToken('example.myshopify.com');
 *   return token;
 * }).pipe(Effect.provide(ShopifyAuthLive));
 *
 * const accessToken = await Effect.runPromise(program);
 * ```
 *
 * Related Documentation:
 * - /one/connections/shopify-auth.md - Complete OAuth guide
 * - Shopify Docs: https://shopify.dev/docs/apps/build/authentication-authorization
 */

import { Context, Data, Effect } from 'effect';
import crypto from 'crypto';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * OAuth authorization failed
 */
export class AuthorizationError extends Data.TaggedError('AuthorizationError')<{
  shop: string;
  reason: string;
  details?: Record<string, unknown>;
}> {}

/**
 * Access token not found for shop
 */
export class TokenNotFoundError extends Data.TaggedError('TokenNotFoundError')<{
  shop: string;
  groupId?: string;
  message: string;
}> {}

/**
 * Token storage/retrieval failed
 */
export class TokenStorageError extends Data.TaggedError('TokenStorageError')<{
  shop: string;
  operation: 'save' | 'retrieve' | 'delete' | 'encrypt' | 'decrypt';
  reason: string;
  cause?: unknown;
}> {}

/**
 * Invalid shop domain format
 */
export class InvalidShopDomainError extends Data.TaggedError('InvalidShopDomainError')<{
  shop: string;
  reason: string;
}> {}

/**
 * HMAC verification failed
 */
export class HmacVerificationError extends Data.TaggedError('HmacVerificationError')<{
  shop: string;
  providedHmac: string;
  reason: string;
}> {}

/**
 * OAuth state mismatch (CSRF protection)
 */
export class StateMismatchError extends Data.TaggedError('StateMismatchError')<{
  expected: string;
  received: string;
  message: string;
}> {}

/**
 * Token exchange failed
 */
export class TokenExchangeError extends Data.TaggedError('TokenExchangeError')<{
  shop: string;
  code: string;
  httpStatus?: number;
  reason: string;
}> {}

/**
 * Shop not found in organization mapping
 */
export class ShopNotFoundError extends Data.TaggedError('ShopNotFoundError')<{
  shop: string;
  groupId: string;
  message: string;
}> {}

// ============================================================================
// TYPES
// ============================================================================

/**
 * OAuth authorization parameters
 */
export interface OAuthAuthorizationParams {
  /** Shop domain (e.g., example.myshopify.com) */
  shop: string;
  /** API client ID from Partners dashboard */
  clientId: string;
  /** Comma-separated list of scopes */
  scopes: string;
  /** OAuth callback URL */
  redirectUri: string;
  /** Random nonce for CSRF protection */
  state: string;
  /** Access mode: offline (default) or per-user */
  grantOptions?: 'per-user'[];
}

/**
 * OAuth callback parameters
 */
export interface OAuthCallbackParams {
  /** Authorization code to exchange for token */
  code: string;
  /** HMAC signature for verification */
  hmac: string;
  /** Shop domain */
  shop: string;
  /** State parameter (must match original) */
  state: string;
  /** Host parameter (base64 encoded) */
  host?: string;
  /** Timestamp of request */
  timestamp: string;
}

/**
 * Access token response from Shopify
 */
export interface AccessTokenResponse {
  /** Access token (starts with shpat_) */
  access_token: string;
  /** Granted scopes */
  scope: string;
  /** Expiration (null for offline access) */
  expires_in: number | null;
  /** Associated user info (for online access) */
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    account_owner: boolean;
    locale: string;
    collaborator: boolean;
  };
  /** User scopes (for online access) */
  associated_user_scope?: string;
}

/**
 * Stored shop credentials
 */
export interface ShopCredentials {
  /** Shop domain */
  shop: string;
  /** Encrypted access token */
  encryptedToken: string;
  /** Granted scopes */
  scopes: string;
  /** Installation timestamp */
  installedAt: number;
  /** Group ID (organization) */
  groupId: string;
  /** Associated user (if online access) */
  associatedUser?: AccessTokenResponse['associated_user'];
}

/**
 * Shop-to-group mapping
 */
export interface ShopGroupMapping {
  shop: string;
  groupId: string;
  installedAt: number;
  installedBy?: string; // User ID who installed
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * ShopifyAuth: OAuth 2.0 authentication and token management
 *
 * All methods return Effect types for composability.
 * Tokens are always encrypted before storage.
 * HMAC verification uses timing-safe comparison.
 */
export class ShopifyAuth extends Context.Tag('ShopifyAuth')<
  ShopifyAuth,
  {
    /**
     * Build OAuth authorization URL
     *
     * Generates URL to redirect user to Shopify for authorization.
     * Includes CSRF protection via state parameter.
     *
     * @param params Authorization parameters
     * @returns Authorization URL
     *
     * @example
     * ```typescript
     * const url = yield* auth.buildAuthorizationUrl({
     *   shop: 'example.myshopify.com',
     *   clientId: 'abc123',
     *   scopes: 'read_products,write_orders',
     *   redirectUri: 'https://one.ie/shopify/callback',
     *   state: randomNonce
     * });
     * // Redirect user to: url
     * ```
     */
    buildAuthorizationUrl: (
      params: OAuthAuthorizationParams
    ) => Effect.Effect<string, InvalidShopDomainError>;

    /**
     * Verify OAuth callback parameters
     *
     * Validates:
     * - Shop domain format
     * - HMAC signature (timing-safe comparison)
     * - State parameter (CSRF protection)
     *
     * @param params Callback parameters from Shopify
     * @param expectedState Expected state value
     * @param clientSecret API client secret
     * @returns Verified shop domain
     *
     * @example
     * ```typescript
     * const shop = yield* auth.verifyCallback(
     *   callbackParams,
     *   session.oauthState,
     *   process.env.SHOPIFY_CLIENT_SECRET
     * );
     * // shop = 'example.myshopify.com' (verified)
     * ```
     */
    verifyCallback: (
      params: OAuthCallbackParams,
      expectedState: string,
      clientSecret: string
    ) => Effect.Effect<
      string,
      InvalidShopDomainError | HmacVerificationError | StateMismatchError
    >;

    /**
     * Exchange authorization code for access token
     *
     * Makes POST request to Shopify to exchange code for token.
     * Validates response and extracts access token.
     *
     * @param shop Shop domain
     * @param code Authorization code
     * @param clientId API client ID
     * @param clientSecret API client secret
     * @returns Access token response
     *
     * @example
     * ```typescript
     * const tokenResponse = yield* auth.exchangeToken(
     *   shop,
     *   authCode,
     *   clientId,
     *   clientSecret
     * );
     * console.log(tokenResponse.access_token); // shpat_...
     * ```
     */
    exchangeToken: (
      shop: string,
      code: string,
      clientId: string,
      clientSecret: string
    ) => Effect.Effect<AccessTokenResponse, TokenExchangeError>;

    /**
     * Store access token for shop
     *
     * Encrypts token before storage.
     * Creates shop → groupId mapping.
     * Logs installation event.
     *
     * @param shop Shop domain
     * @param groupId Group ID (organization)
     * @param tokenResponse Token response from Shopify
     * @param installedBy User ID who installed (optional)
     * @returns Credentials ID
     *
     * @example
     * ```typescript
     * const credId = yield* auth.storeAccessToken(
     *   shop,
     *   'group_123',
     *   tokenResponse,
     *   'user_456'
     * );
     * ```
     */
    storeAccessToken: (
      shop: string,
      groupId: string,
      tokenResponse: AccessTokenResponse,
      installedBy?: string
    ) => Effect.Effect<string, TokenStorageError>;

    /**
     * Get access token for shop
     *
     * Retrieves encrypted token from storage.
     * Decrypts token.
     * Returns plaintext access token.
     *
     * @param shop Shop domain
     * @returns Decrypted access token
     *
     * @example
     * ```typescript
     * const token = yield* auth.getAccessToken('example.myshopify.com');
     * // Use token for API requests
     * ```
     */
    getAccessToken: (
      shop: string
    ) => Effect.Effect<string, TokenNotFoundError | TokenStorageError>;

    /**
     * Refresh access token (if applicable)
     *
     * Note: Shopify offline access tokens never expire.
     * Online access tokens expire after 24 hours but can't be refreshed.
     * This method exists for future compatibility.
     *
     * @param shop Shop domain
     * @returns New access token
     *
     * @example
     * ```typescript
     * const newToken = yield* auth.refreshToken('example.myshopify.com');
     * ```
     */
    refreshToken: (
      shop: string
    ) => Effect.Effect<string, TokenNotFoundError | AuthorizationError>;

    /**
     * Validate shop domain format
     *
     * Checks that shop matches: {name}.myshopify.com
     *
     * @param shop Shop domain to validate
     * @returns Validated shop domain
     *
     * @example
     * ```typescript
     * const shop = yield* auth.validateShop('example.myshopify.com');
     * ```
     */
    validateShop: (
      shop: string
    ) => Effect.Effect<string, InvalidShopDomainError>;

    /**
     * Verify HMAC signature
     *
     * Uses timing-safe comparison to prevent timing attacks.
     * Validates that request came from Shopify.
     *
     * @param params Query parameters
     * @param hmac Provided HMAC signature
     * @param secret Client secret
     * @returns True if valid
     *
     * @example
     * ```typescript
     * const isValid = yield* auth.verifyHmac(
     *   queryParams,
     *   queryParams.hmac,
     *   clientSecret
     * );
     * if (!isValid) throw new Error('Invalid HMAC');
     * ```
     */
    verifyHmac: (
      params: Record<string, string>,
      hmac: string,
      secret: string
    ) => Effect.Effect<boolean, HmacVerificationError>;

    /**
     * Get shop credentials with metadata
     *
     * Returns full credential record including:
     * - Encrypted token
     * - Scopes
     * - Installation timestamp
     * - Group ID
     *
     * @param shop Shop domain
     * @returns Shop credentials
     *
     * @example
     * ```typescript
     * const creds = yield* auth.getCredentials('example.myshopify.com');
     * console.log(creds.scopes); // 'read_products,write_orders'
     * ```
     */
    getCredentials: (
      shop: string
    ) => Effect.Effect<ShopCredentials, TokenNotFoundError>;

    /**
     * List all shops for organization
     *
     * Returns all shops installed in a group.
     *
     * @param groupId Group ID
     * @returns Array of shop domains
     *
     * @example
     * ```typescript
     * const shops = yield* auth.listShopsForGroup('group_123');
     * // ['shop1.myshopify.com', 'shop2.myshopify.com']
     * ```
     */
    listShopsForGroup: (
      groupId: string
    ) => Effect.Effect<string[], never>;

    /**
     * Get group ID for shop
     *
     * Reverse lookup: shop → groupId
     *
     * @param shop Shop domain
     * @returns Group ID
     *
     * @example
     * ```typescript
     * const groupId = yield* auth.getGroupForShop('example.myshopify.com');
     * ```
     */
    getGroupForShop: (
      shop: string
    ) => Effect.Effect<string, ShopNotFoundError>;

    /**
     * Revoke access token
     *
     * Deletes stored credentials.
     * Logs uninstall event.
     *
     * @param shop Shop domain
     * @param revokedBy User ID who revoked (optional)
     * @returns Void
     *
     * @example
     * ```typescript
     * yield* auth.revokeToken('example.myshopify.com', 'user_456');
     * ```
     */
    revokeToken: (
      shop: string,
      revokedBy?: string
    ) => Effect.Effect<void, TokenNotFoundError | TokenStorageError>;

    /**
     * Encrypt access token for storage
     *
     * Uses AES-256-CBC encryption.
     * Returns IV + encrypted data.
     *
     * @param token Plaintext access token
     * @returns Encrypted token (format: iv:encryptedData)
     *
     * @example
     * ```typescript
     * const encrypted = yield* auth.encryptToken('shpat_abc123...');
     * // Store encrypted in database
     * ```
     */
    encryptToken: (
      token: string
    ) => Effect.Effect<string, TokenStorageError>;

    /**
     * Decrypt access token from storage
     *
     * Parses IV and encrypted data.
     * Decrypts using AES-256-CBC.
     * Returns plaintext token.
     *
     * @param encryptedToken Encrypted token (format: iv:encryptedData)
     * @returns Plaintext access token
     *
     * @example
     * ```typescript
     * const token = yield* auth.decryptToken(encryptedFromDb);
     * // Use token for API requests
     * ```
     */
    decryptToken: (
      encryptedToken: string
    ) => Effect.Effect<string, TokenStorageError>;
  }
>() {}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate Shopify shop domain format
 */
export function validateShopDomain(shop: string): boolean {
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopRegex.test(shop);
}

/**
 * Build OAuth authorization URL
 */
export function buildOAuthUrl(params: OAuthAuthorizationParams): string {
  const url = new URL(`https://${params.shop}/admin/oauth/authorize`);

  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('scope', params.scopes);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('state', params.state);

  if (params.grantOptions) {
    params.grantOptions.forEach((option) => {
      url.searchParams.append('grant_options[]', option);
    });
  }

  return url.toString();
}

/**
 * Calculate HMAC signature for OAuth callback verification
 */
export function calculateHmac(
  params: Record<string, string>,
  secret: string
): string {
  // Remove hmac and signature from params
  const { hmac, signature, ...paramsToSign } = params;

  // Sort parameters alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&');

  // Calculate HMAC-SHA256
  const hmacValue = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');

  return hmacValue;
}

/**
 * Verify HMAC using timing-safe comparison
 */
export function verifyHmacSignature(
  params: Record<string, string>,
  providedHmac: string,
  secret: string
): boolean {
  const calculatedHmac = calculateHmac(params, secret);

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedHmac, 'hex'),
      Buffer.from(calculatedHmac, 'hex')
    );
  } catch {
    // Length mismatch or invalid hex
    return false;
  }
}

/**
 * Generate random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt token using AES-256-CBC
 */
export function encryptTokenValue(token: string, encryptionKey: string): string {
  const IV_LENGTH = 16;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt token using AES-256-CBC
 */
export function decryptTokenValue(encryptedToken: string, encryptionKey: string): string {
  const parts = encryptedToken.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

// ============================================================================
// IMPLEMENTATION STUB
// ============================================================================

/**
 * NOTE: This is a DESIGN-ONLY implementation.
 *
 * Full implementation will be added in later cycles:
 * - Cycle 40-42: OAuth flow implementation
 * - Cycle 43-45: Token storage (Convex integration)
 * - Cycle 46-48: Encryption/decryption implementation
 * - Cycle 49-51: Multi-shop management
 *
 * For now, this serves as the interface specification and error type definitions.
 */

// Export helper functions for use in other modules
export {
  buildOAuthUrl,
  calculateHmac,
  verifyHmacSignature,
  generateState,
  encryptTokenValue,
  decryptTokenValue,
};
