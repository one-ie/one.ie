/**
 * AppFooter - Application footer component
 *
 * Uses 6-token design system for consistent footers.
 */

import { cn } from "../utils";

export interface AppFooterProps {
  links?: Array<{
    label: string;
    href: string;
  }>;
  copyright?: string;
  className?: string;
}

/**
 * AppFooter - Main application footer
 *
 * @example
 * ```tsx
 * <AppFooter
 *   links={[
 *     { label: "Privacy", href: "/privacy" },
 *     { label: "Terms", href: "/terms" },
 *     { label: "Support", href: "/support" }
 *   ]}
 *   copyright="© 2025 ONE Platform"
 * />
 * ```
 */
export function AppFooter({
  links = [],
  copyright,
  className,
}: AppFooterProps) {
  return (
    <footer className={cn("bg-background border-t", className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          {links.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-6">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-sm text-font/60 hover:text-font transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Copyright */}
          <p className="text-sm text-font/40">
            {copyright || `© ${new Date().getFullYear()} ONE Platform. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
