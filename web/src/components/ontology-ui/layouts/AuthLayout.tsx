/**
 * AuthLayout - Authentication pages layout
 *
 * Uses 6-token design system for login/signup pages.
 */

import { cn } from "../utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * AuthLayout - Authentication page wrapper
 *
 * @example
 * ```tsx
 * <AuthLayout
 *   title="Welcome back"
 *   description="Sign in to your account"
 * >
 *   <LoginForm />
 * </AuthLayout>
 * ```
 */
export function AuthLayout({
  children,
  title,
  description,
  logo,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        {logo || (
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-lg bg-primary text-white items-center justify-center font-bold text-xl mb-2">
              ONE
            </div>
            <h1 className="text-2xl font-bold text-font">Platform</h1>
          </div>
        )}

        {/* Auth Card */}
        <Card className={cn("bg-background p-1 shadow-lg rounded-md", className)}>
          <CardContent className="bg-foreground p-8 rounded-md">
            {(title || description) && (
              <div className="mb-6 text-center">
                {title && (
                  <h2 className="text-2xl font-semibold text-font mb-2">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-font/60">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Auth Form */}
            {children}
          </CardContent>
        </Card>

        {/* Footer Links */}
        {footer && (
          <div className="text-center text-sm text-font/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
