/**
 * AppNav - Horizontal navigation component
 *
 * Uses 6-token design system for tab-style navigation.
 */

import { cn } from "../utils";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  id: string;
  label: string;
  badge?: string | number;
  active?: boolean;
}

export interface AppNavProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
  className?: string;
}

/**
 * AppNav - Horizontal tab navigation
 *
 * @example
 * ```tsx
 * <AppNav
 *   items={[
 *     { id: "all", label: "All", badge: "24", active: true },
 *     { id: "active", label: "Active", badge: "12" },
 *     { id: "archived", label: "Archived", badge: "12" }
 *   ]}
 *   onItemClick={(item) => setFilter(item.id)}
 * />
 * ```
 */
export function AppNav({
  items,
  onItemClick,
  className,
}: AppNavProps) {
  return (
    <nav
      className={cn(
        "flex items-center gap-1 border-b bg-background",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
            item.active
              ? "text-font border-b-2 border-primary"
              : "text-font/60 hover:text-font hover:bg-foreground"
          )}
        >
          <span>{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  );
}
