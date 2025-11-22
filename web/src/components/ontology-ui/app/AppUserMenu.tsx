/**
 * AppUserMenu - User account dropdown menu
 *
 * Uses 6-token design system for user menus.
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import type { Person } from "../types";
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  Shield,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  separator?: boolean;
  variant?: "default" | "destructive";
}

export interface AppUserMenuProps {
  user: Person;
  menuItems?: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
  onLogout?: () => void;
  className?: string;
}

/**
 * AppUserMenu - User account dropdown
 *
 * @example
 * ```tsx
 * <AppUserMenu
 *   user={currentUser}
 *   menuItems={[
 *     { id: "profile", label: "Profile", icon: <User /> },
 *     { id: "settings", label: "Settings", icon: <Settings /> }
 *   ]}
 *   onItemClick={(item) => navigate(item.href)}
 *   onLogout={() => signOut()}
 * />
 * ```
 */
export function AppUserMenu({
  user,
  menuItems = [],
  onItemClick,
  onLogout,
  className,
}: AppUserMenuProps) {
  const defaultMenuItems: MenuItem[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
    { id: "separator-1", label: "", separator: true },
    { id: "help", label: "Help & Support", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "separator-2", label: "", separator: true },
    {
      id: "logout",
      label: "Log out",
      icon: <LogOut className="h-4 w-4" />,
      variant: "destructive" as const,
    },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultMenuItems;

  const handleItemClick = (item: MenuItem) => {
    if (item.id === "logout" && onLogout) {
      onLogout();
    } else {
      onItemClick?.(item);
    }
  };

  const roleColors: Record<string, string> = {
    platform_owner: "bg-purple-100 text-purple-700",
    org_owner: "bg-blue-100 text-blue-700",
    org_user: "bg-green-100 text-green-700",
    customer: "bg-gray-100 text-gray-700",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("flex items-center gap-2 px-2", className)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.properties?.avatarUrl} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-sm font-medium text-font">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-font">{user.name}</p>
            <p className="text-xs text-font/60">{user.properties?.email}</p>
            {user.properties?.role && (
              <Badge
                className={cn("w-fit text-xs mt-1", roleColors[user.properties.role])}
              >
                {user.properties.role.replace("_", " ")}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        {items.map((item) =>
          item.separator ? (
            <DropdownMenuSeparator key={item.id} />
          ) : (
            <DropdownMenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "cursor-pointer gap-2",
                item.variant === "destructive" && "text-red-600 focus:text-red-600"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
