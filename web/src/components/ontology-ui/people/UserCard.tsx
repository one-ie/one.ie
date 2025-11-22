/**
 * UserCard Component
 *
 * User profile card with avatar and details
 * Part of PEOPLE dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Person, CardProps } from "../types";
import { cn, getRoleDisplay, formatDate } from "../utils";

export interface UserCardProps extends CardProps {
  user: Person;
  showRole?: boolean;
  showEmail?: boolean;
  showActions?: boolean;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

export function UserCard({
  user,
  showRole = true,
  showEmail = true,
  showActions = false,
  onMessage,
  onViewProfile,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: UserCardProps) {
  return (
    <Card
      className={cn(
        "bg-background p-1 shadow-sm rounded-md",
        "group relative transition-all duration-300 ease-in-out",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "bg-foreground rounded-md text-font",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6"
      )}>
        <CardHeader className="p-0 pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-full border-2 border-font/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-font bg-background">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-font truncate">{user.name}</h3>
                {showRole && <Badge variant="secondary">{getRoleDisplay(user.role)}</Badge>}
              </div>
              {showEmail && user.email && (
                <p className="text-sm text-font/80 truncate">{user.email}</p>
              )}
            </div>
          </div>
        </CardHeader>

        {(showActions || user.metadata) && (
          <CardContent className="p-0 space-y-3">
            {user.metadata?.bio && (
              <p className="text-sm text-font/80 line-clamp-2">
                {user.metadata.bio as string}
              </p>
            )}

            {showActions && (
              <div className="flex gap-2">
                {onMessage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onMessage}
                    className="transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    💬 Message
                  </Button>
                )}
                {onViewProfile && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={onViewProfile}
                    className="transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    View Profile
                  </Button>
                )}
              </div>
            )}

            <div className="text-xs text-font/60">
              Joined {formatDate(user.createdAt)}
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
}
