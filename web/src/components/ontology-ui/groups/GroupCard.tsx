/**
 * GroupCard Component
 *
 * Display group information with metadata
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Group, CardProps } from "../types";
import { cn, formatDate, formatNumber } from "../utils";

export interface GroupCardProps extends CardProps {
  group: Group;
  showMembers?: boolean;
  showMetadata?: boolean;
  memberCount?: number;
}

export function GroupCard({
  group,
  showMembers = true,
  showMetadata = false,
  memberCount,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: GroupCardProps) {
  const isNested = !!group.parentGroupId;

  return (
    <Card
      className={cn(
        "group relative bg-background p-1 shadow-sm rounded-md transition-all duration-300",
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "bg-foreground rounded-md text-font",
          size === "sm" && "p-3",
          size === "md" && "p-4",
          size === "lg" && "p-6"
        )}
      >
        <CardHeader className="pb-3 p-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-font">
                <span className="text-2xl">🏢</span>
                <span>{group.name}</span>
              </CardTitle>
              {group.description && (
                <CardDescription className="mt-1 text-font/80">{group.description}</CardDescription>
              )}
            </div>
            {isNested && (
              <Badge variant="outline" className="ml-2">
                Nested
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-0 pt-3">
          {showMembers && memberCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-font/60">
              <span>👥</span>
              <span>{formatNumber(memberCount)} members</span>
            </div>
          )}

          {showMetadata && group.metadata && (
            <div className="space-y-1">
              {Object.entries(group.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-font/60">{key}:</span>
                  <span className="font-mono text-font">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-font/60 border-t border-font/10 pt-3">
            <span>Created {formatDate(group.createdAt)}</span>
            {interactive && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                View details →
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
