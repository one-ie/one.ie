/**
 * BlankLayout - Minimal layout with no chrome
 *
 * Uses 6-token design system with minimal structure.
 */

import { cn } from "../utils";

export interface BlankLayoutProps {
  children: React.ReactNode;
  centered?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

/**
 * BlankLayout - Minimal wrapper for full-screen experiences
 *
 * @example
 * ```tsx
 * // Full-screen canvas
 * <BlankLayout>
 *   <Canvas />
 * </BlankLayout>
 *
 * // Centered content
 * <BlankLayout centered maxWidth="md">
 *   <Onboarding />
 * </BlankLayout>
 * ```
 */
export function BlankLayout({
  children,
  centered = false,
  maxWidth = "full",
  className,
}: BlankLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        centered && "flex items-center justify-center p-4",
        className
      )}
    >
      <div
        className={cn(
          "w-full bg-foreground",
          centered && maxWidthClasses[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  );
}
