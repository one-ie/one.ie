/**
 * JWT Utilities for Session Management
 *
 * Provides cryptographically signed JSON Web Tokens for secure session management.
 * Integrates with the 6-dimension ontology (people dimension).
 */

import { v } from "convex/values";

// JWT header (alg: HS256, typ: JWT)
const JWT_HEADER = {
  alg: "HS256",
  typ: "JWT"
};

// Token expiry durations
export const TOKEN_EXPIRY = {
  ACCESS: 15 * 60 * 1000,           // 15 minutes
  REFRESH: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  sub: string;        // Subject (userId)
  email: string;      // User email
  name?: string;      // User name
  role?: string;      // User role (for people dimension)
  iat: number;        // Issued at timestamp
  exp: number;        // Expiry timestamp
  type: "access" | "refresh"; // Token type
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(data: string): string {
  const base64 = btoa(data);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(encoded: string): string {
  // Add padding if needed
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * HMAC SHA-256 signature
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

  return signatureBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Sign a JWT token
 */
export async function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: number
): Promise<string> {
  const now = Date.now();

  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(JWT_HEADER));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // Create signature
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSha256(message, secret);

  return `${message}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const message = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await hmacSha256(message, secret);

    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }

    // Decode payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson) as JWTPayload;

    // Check expiry
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Generate access token (short-lived)
 */
export async function generateAccessToken(
  userId: string,
  email: string,
  name: string | undefined,
  role: string | undefined,
  secret: string
): Promise<string> {
  return signJWT(
    {
      sub: userId,
      email,
      name,
      role,
      type: "access"
    },
    secret,
    TOKEN_EXPIRY.ACCESS
  );
}

/**
 * Generate refresh token (long-lived)
 */
export async function generateRefreshToken(
  userId: string,
  email: string,
  secret: string
): Promise<string> {
  return signJWT(
    {
      sub: userId,
      email,
      type: "refresh"
    },
    secret,
    TOKEN_EXPIRY.REFRESH
  );
}

/**
 * Extract user ID from JWT token
 */
export async function getUserIdFromToken(
  token: string,
  secret: string
): Promise<string | null> {
  const payload = await verifyJWT(token, secret);
  return payload?.sub || null;
}
