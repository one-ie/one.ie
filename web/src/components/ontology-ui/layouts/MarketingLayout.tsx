/**
 * MarketingLayout - Marketing/landing page layout
 *
 * Uses 6-token design system for marketing pages.
 */

import { cn } from "../utils";
import { Button } from "@/components/ui/button";

export interface MarketingLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerActions?: React.ReactNode;
  className?: string;
}

/**
 * MarketingLayout - Public marketing page wrapper
 *
 * @example
 * ```tsx
 * <MarketingLayout
 *   headerActions={
 *     <>
 *       <Button variant="ghost">Features</Button>
 *       <Button>Sign Up</Button>
 *     </>
 *   }
 * >
 *   <Hero />
 *   <Features />
 *   <CTA />
 * </MarketingLayout>
 * ```
 */
export function MarketingLayout({
  children,
  showHeader = true,
  showFooter = true,
  headerActions,
  className,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b bg-foreground/95 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold">
                ONE
              </div>
              <span className="font-bold text-font text-xl">Platform</span>
            </a>

            {/* Actions */}
            {headerActions && (
              <div className="flex items-center gap-4">{headerActions}</div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn("bg-foreground", className)}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-background border-t">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company */}
              <div>
                <h3 className="font-semibold text-font mb-4">ONE Platform</h3>
                <p className="text-sm text-font/60">
                  Multi-tenant AI-native platform built on the 6-dimension ontology.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-medium text-font mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-font/60">
                  <li><a href="/features" className="hover:text-font">Features</a></li>
                  <li><a href="/pricing" className="hover:text-font">Pricing</a></li>
                  <li><a href="/docs" className="hover:text-font">Documentation</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-medium text-font mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-font/60">
                  <li><a href="/blog" className="hover:text-font">Blog</a></li>
                  <li><a href="/guides" className="hover:text-font">Guides</a></li>
                  <li><a href="/changelog" className="hover:text-font">Changelog</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-medium text-font mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-font/60">
                  <li><a href="/about" className="hover:text-font">About</a></li>
                  <li><a href="/contact" className="hover:text-font">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-font">Privacy</a></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t text-center text-sm text-font/40">
              © {new Date().getFullYear()} ONE Platform. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
