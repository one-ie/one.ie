/**
 * AppHeader - Application header component
 *
 * Uses 6-token design system for consistent headers.
 */

import { Button } from "@/components/ui/button";
import { cn } from "../utils";
import { Menu, Search } from "lucide-react";
import type { Person } from "../types";

export interface AppHeaderProps {
  title?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  currentUser?: Person;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

/**
 * AppHeader - Main application header
 *
 * @example
 * ```tsx
 * <AppHeader
 *   title="Dashboard"
 *   currentUser={user}
 *   onMenuClick={() => toggleSidebar()}
 *   actions={<Button>Create</Button>}
 * />
 * ```
 */
export function AppHeader({
  title,
  logo,
  actions,
  currentUser,
  onMenuClick,
  onSearchClick,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-foreground/95 backdrop-blur",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Menu + Logo/Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {logo || (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm">
                ONE
              </div>
              {title && (
                <h1 className="text-lg font-semibold text-font">{title}</h1>
              )}
            </div>
          )}
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-3">
          {onSearchClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {actions}
        </div>
      </div>
    </header>
  );
}
