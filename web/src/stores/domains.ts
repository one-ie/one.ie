/**
 * Domain Store - State Management for Custom Domains
 *
 * Manages custom domain configuration and verification status
 * Uses nanostores for frontend-only state management
 */

import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

// ============================================================================
// TYPES
// ============================================================================

export type DomainStatus = "pending" | "active" | "failed" | "verifying";

export interface CustomDomain {
  id: string;
  domain: string;
  status: DomainStatus;
  addedAt: number;
  verifiedAt?: number;
  lastChecked?: number;
  errorMessage?: string;
  sslEnabled?: boolean;
  funnelId: string;
}

export interface DNSRecord {
  type: "CNAME" | "A" | "TXT";
  name: string;
  value: string;
  ttl?: number;
}

// ============================================================================
// STORES
// ============================================================================

/**
 * All custom domains across all funnels (persisted to localStorage)
 */
export const customDomains$ = persistentAtom<CustomDomain[]>("custom-domains", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/**
 * Currently selected domain for editing
 */
export const selectedDomain$ = atom<CustomDomain | null>(null);

/**
 * Domain verification in progress
 */
export const verifying$ = atom<boolean>(false);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Add a new custom domain
 */
export function addCustomDomain(funnelId: string, domain: string): CustomDomain {
  const newDomain: CustomDomain = {
    id: `domain_${Date.now()}`,
    domain: domain.toLowerCase().trim(),
    status: "pending",
    addedAt: Date.now(),
    funnelId,
  };

  customDomains$.set([...customDomains$.get(), newDomain]);
  return newDomain;
}

/**
 * Remove a custom domain
 */
export function removeCustomDomain(domainId: string): void {
  const domains = customDomains$.get();
  customDomains$.set(domains.filter((d) => d.id !== domainId));
}

/**
 * Update domain status
 */
export function updateDomainStatus(
  domainId: string,
  status: DomainStatus,
  errorMessage?: string
): void {
  const domains = customDomains$.get();
  const updated = domains.map((d) =>
    d.id === domainId
      ? {
          ...d,
          status,
          errorMessage,
          lastChecked: Date.now(),
          verifiedAt: status === "active" ? Date.now() : d.verifiedAt,
        }
      : d
  );

  customDomains$.set(updated);
}

/**
 * Get domains for a specific funnel
 */
export function getDomainsForFunnel(funnelId: string): CustomDomain[] {
  return customDomains$.get().filter((d) => d.funnelId === funnelId);
}

/**
 * Verify domain DNS configuration (mock implementation)
 *
 * In production, this would call a backend API to check DNS records
 * For now, simulates verification with random success/failure
 */
export async function verifyDomain(domainId: string): Promise<{
  success: boolean;
  message: string;
}> {
  verifying$.set(true);

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock verification (60% success rate for demo)
    const success = Math.random() > 0.4;

    if (success) {
      updateDomainStatus(domainId, "active");
      return {
        success: true,
        message: "Domain verified successfully! SSL certificate will be provisioned within 24 hours.",
      };
    } else {
      updateDomainStatus(
        domainId,
        "failed",
        "DNS records not found. Please check your configuration and try again in a few minutes."
      );
      return {
        success: false,
        message: "DNS verification failed. Please check your DNS settings.",
      };
    }
  } finally {
    verifying$.set(false);
  }
}

/**
 * Enable SSL for domain (mock implementation)
 */
export function enableSSL(domainId: string): void {
  const domains = customDomains$.get();
  const updated = domains.map((d) =>
    d.id === domainId ? { ...d, sslEnabled: true } : d
  );
  customDomains$.set(updated);
}

/**
 * Get DNS records for a domain
 */
export function getDNSRecords(domain: string, funnelSlug: string): DNSRecord[] {
  return [
    {
      type: "CNAME",
      name: domain,
      value: `${funnelSlug}.funnels.one.ie`,
      ttl: 3600,
    },
    {
      type: "A",
      name: domain,
      value: "76.76.21.21", // Example IP
      ttl: 3600,
    },
    {
      type: "TXT",
      name: `_verification.${domain}`,
      value: `one-verification=${generateVerificationToken(domain)}`,
      ttl: 3600,
    },
  ];
}

/**
 * Generate verification token for domain
 */
function generateVerificationToken(domain: string): string {
  // Simple hash-like token for demo (in production, use crypto.subtle)
  return btoa(domain + Date.now())
    .substring(0, 32)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Get default subdomain for funnel
 */
export function getDefaultSubdomain(funnelSlug: string): string {
  return `${funnelSlug}.funnels.one.ie`;
}
