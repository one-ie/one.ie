/**
 * Upgrade Banner
 *
 * Shows when free tier users hit limitations
 */

import { getUpgradeUrl } from "@/config/backend";

export interface UpgradeBannerProps {
  feature?: string;
  children: React.ReactNode;
}

export function UpgradeBanner({ feature, children }: UpgradeBannerProps) {
  const upgradeUrl = getUpgradeUrl(feature);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Lightning bolt icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-semibold">Upgrade to Premium</span>
          </div>
          <div className="text-sm opacity-90">{children}</div>
        </div>
        <a
          href={upgradeUrl}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          Upgrade Now
        </a>
      </div>
    </div>
  );
}
