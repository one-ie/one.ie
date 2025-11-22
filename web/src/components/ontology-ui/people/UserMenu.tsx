/**
 * UserMenu Component
 *
 * Dropdown menu for user actions with avatar and profile options
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Person } from "../types";
import { cn } from "../utils";

export interface UserMenuProps {
  user: Person;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function UserMenu({
  user,
  onProfile,
  onSettings,
  onLogout,
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5",
            "hover:bg-background transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            className
          )}
        >
          <Avatar className="h-8 w-8 rounded-full border-2 border-font/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs text-font bg-background">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline-block text-font">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-foreground shadow-lg rounded-md border border-font/10">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-10 w-10 rounded-full border-2 border-font/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-font bg-background">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-font">{user.name}</p>
            {user.email && (
              <p className="text-xs text-font/60 leading-none">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {onProfile && (
          <DropdownMenuItem onClick={onProfile}>
            <span className="mr-2">👤</span>
            Profile
          </DropdownMenuItem>
        )}

        {onSettings && (
          <DropdownMenuItem onClick={onSettings}>
            <span className="mr-2">⚙️</span>
            Settings
          </DropdownMenuItem>
        )}

        {(onProfile || onSettings) && onLogout && <DropdownMenuSeparator />}

        {onLogout && (
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <span className="mr-2">🚪</span>
            Logout
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
