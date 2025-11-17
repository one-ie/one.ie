/**
 * Backend Configuration
 *
 * Controls whether features require backend database or work client-side only.
 *
 * FREE TIER (backend=off):
 * - Client-side AI chat (ephemeral, lost on refresh)
 * - User provides their own API key
 * - No persistence, no analytics
 *
 * PREMIUM TIER (backend=on):
 * - Persistent chat threads saved to Convex
 * - Human-in-the-loop (humans can join AI chats)
 * - Token usage analytics
 * - RAG integration
 * - Multi-tenant (team collaboration)
 */

export interface BackendConfig {
  enabled: boolean;
  features: {
    persistence: boolean;
    humanInTheLoop: boolean;
    analytics: boolean;
    rag: boolean;
    multiTenant: boolean;
  };
  endpoints: {
    api: string;
    convex?: string;
  };
  tier: "free" | "starter" | "pro" | "enterprise";
}

const isBackendEnabled = import.meta.env.PUBLIC_BACKEND === "on";

export const backendConfig: BackendConfig = {
  enabled: isBackendEnabled,

  features: {
    persistence: isBackendEnabled,
    humanInTheLoop: isBackendEnabled,
    analytics: isBackendEnabled,
    rag: isBackendEnabled,
    multiTenant: isBackendEnabled,
  },

  endpoints: {
    api: import.meta.env.PUBLIC_BACKEND_URL || "https://api.one.ie",
    convex: import.meta.env.PUBLIC_CONVEX_URL,
  },

  tier: isBackendEnabled
    ? (import.meta.env.PUBLIC_TIER as "starter" | "pro" | "enterprise") || "starter"
    : "free",
};

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof BackendConfig["features"]): boolean {
  return backendConfig.features[feature];
}

/**
 * Get upgrade URL with feature context
 */
export function getUpgradeUrl(feature?: string): string {
  const baseUrl = "/upgrade";
  if (feature) {
    return `${baseUrl}?feature=${encodeURIComponent(feature)}`;
  }
  return baseUrl;
}

/**
 * Check if user is on free tier
 */
export function isFreeTier(): boolean {
  return backendConfig.tier === "free";
}

/**
 * Check if user can access premium features
 */
export function canAccessPremium(): boolean {
  return backendConfig.enabled;
}
