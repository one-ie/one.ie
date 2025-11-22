/**
 * ErrorLayout - Error page layout
 *
 * Uses 6-token design system for error pages.
 */

import { cn } from "../utils";

export interface ErrorLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  className?: string;
}

/**
 * ErrorLayout - Minimal layout for error pages
 *
 * @example
 * ```tsx
 * <ErrorLayout>
 *   <NotFound />
 * </ErrorLayout>
 *
 * <ErrorLayout>
 *   <ServerError />
 * </ErrorLayout>
 * ```
 */
export function ErrorLayout({
  children,
  showLogo = true,
  className,
}: ErrorLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Logo */}
      {showLogo && (
        <header className="p-6">
          <a href="/" className="flex items-center gap-2 w-fit">
            <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold">
              ONE
            </div>
            <span className="font-bold text-font text-xl">Platform</span>
          </a>
        </header>
      )}

      {/* Error Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-font/40">
        Need help? <a href="/support" className="text-primary hover:underline">Contact Support</a>
      </footer>
    </div>
  );
}
