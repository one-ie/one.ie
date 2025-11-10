/**
 * Feature Gate
 *
 * Conditionally renders content based on tier
 * Shows upgrade prompt if feature is locked
 */

import { canAccessPremium, getUpgradeUrl } from '@/config/backend';
import { UpgradeBanner } from './UpgradeBanner';

export interface FeatureGateProps {
  feature: string;
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  featureName,
  children,
  fallback,
}: FeatureGateProps) {
  if (canAccessPremium()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradeBanner feature={feature}>
      {featureName} requires a premium subscription.
    </UpgradeBanner>
  );
}
