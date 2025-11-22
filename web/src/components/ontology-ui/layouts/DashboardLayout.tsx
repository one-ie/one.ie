/**
 * DashboardLayout - Dashboard-specific layout
 *
 * Uses 6-token design system with dashboard-specific features.
 */

import { cn } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dimension } from "../types";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
  }>;
  className?: string;
}

/**
 * DashboardLayout - Dashboard page wrapper
 *
 * @example
 * ```tsx
 * <DashboardLayout
 *   title="Analytics Dashboard"
 *   description="View your platform metrics"
 *   stats={[
 *     { label: "Total Users", value: "1,234", change: "+12%", trend: "up" },
 *     { label: "Revenue", value: "$45.2K", change: "+8%", trend: "up" }
 *   ]}
 * >
 *   <Charts />
 * </DashboardLayout>
 * ```
 */
export function DashboardLayout({
  children,
  title,
  description,
  actions,
  stats,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      {(title || description || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h1 className="text-3xl font-bold text-font">{title}</h1>
            )}
            {description && (
              <p className="text-sm text-font/60 mt-2">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-background p-1 shadow-sm rounded-md">
              <CardContent className="bg-foreground p-4 rounded-md">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-font/60 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <span className="text-2xl font-bold text-font mt-2">
                    {stat.value}
                  </span>
                  {stat.change && (
                    <span
                      className={cn(
                        "text-xs font-medium mt-1",
                        stat.trend === "up" && "text-green-600",
                        stat.trend === "down" && "text-red-600",
                        stat.trend === "neutral" && "text-font/60"
                      )}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div>{children}</div>
    </div>
  );
}
