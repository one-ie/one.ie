/**
 * AppSidebar - Application sidebar navigation
 *
 * Uses 6-token design system for consistent sidebars.
 */

import { cn } from "../utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  active?: boolean;
}

export interface AppSidebarProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * AppSidebar - Side navigation panel
 *
 * @example
 * ```tsx
 * <AppSidebar
 *   items={[
 *     { id: "dashboard", label: "Dashboard", icon: <Home />, active: true },
 *     { id: "products", label: "Products", icon: <Package />, badge: "12" },
 *     { id: "settings", label: "Settings", icon: <Settings /> }
 *   ]}
 *   onItemClick={(item) => navigate(item.href)}
 * />
 * ```
 */
export function AppSidebar({
  items,
  onItemClick,
  onClose,
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 bg-background border-r flex flex-col",
        className
      )}
    >
      {/* Mobile Close Button */}
      {onClose && (
        <div className="flex items-center justify-end p-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              item.active
                ? "bg-foreground text-font"
                : "text-font/60 hover:bg-foreground hover:text-font"
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
