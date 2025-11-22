/**
 * AdminLayout - Admin panel layout
 *
 * Uses 6-token design system with admin-specific features.
 */

import { cn } from "../utils";
import { Badge } from "@/components/ui/badge";
import type { Person } from "../types";

export interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser?: Person;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * AdminLayout - Admin panel wrapper
 *
 * @example
 * ```tsx
 * <AdminLayout
 *   currentUser={user}
 *   breadcrumbs={[
 *     { label: "Admin", href: "/admin" },
 *     { label: "Users" }
 *   ]}
 *   actions={<Button>Add User</Button>}
 * >
 *   <UserManagement />
 * </AdminLayout>
 * ```
 */
export function AdminLayout({
  children,
  currentUser,
  breadcrumbs,
  actions,
  className,
}: AdminLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-font/40">/</span>}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="text-font/60 hover:text-font"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-font font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Right: User + Admin Badge */}
            <div className="flex items-center gap-3">
              {actions}
              {currentUser && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Admin
                  </Badge>
                  <span className="text-sm text-font">
                    {currentUser.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("container mx-auto px-6", className)}>
        {children}
      </div>
    </div>
  );
}
