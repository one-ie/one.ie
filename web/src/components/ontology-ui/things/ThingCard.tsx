/**
 * ThingCard - Universal card component for any thing type
 *
 * Renders a single thing with adaptive styling based on type.
 * Supports all thing types from the ontology with thing-level color branding.
 *
 * Uses ThingCard wrapper from universal/ for consistent design system support.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard as UniversalThingCard } from "../universal/ThingCard";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getThingTypeDisplay, getThingTypeIcon, formatDate, cn } from "../utils";

interface ThingCardProps {
  thing: Thing;
  showType?: boolean;
  showOwner?: boolean;
  showTags?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ThingCard({
  thing,
  showType = true,
  showOwner = false,
  showTags = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: ThingCardProps) {
  const icon = getThingTypeIcon(thing.type);
  const typeDisplay = getThingTypeDisplay(thing.type);

  const sizeClasses = {
    sm: "text-sm",
    md: "",
    lg: "text-lg",
  };

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <UniversalThingCard
      thing={thing}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        variant === "outline" && "border-2",
        variant === "ghost" && "border-0 shadow-none",
        sizeClasses[size],
        className
      )}
      style={{
        opacity: interactive ? 1 : 0.95,
      }}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md", contentPadding[size])}
      >
        <CardHeader className="pb-3 px-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl" aria-label={typeDisplay}>
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <CardTitle className={cn(
                  "truncate text-font",
                  size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
                )}>
                  {thing.name}
                </CardTitle>
                {showType && (
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {typeDisplay}
                  </Badge>
                )}
              </div>
            </div>
            {thing.status && (
              <Badge
                variant="outline"
                className="capitalize border-font/20 text-font"
              >
                {thing.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-0">
          {thing.properties.description && (
            <CardDescription className="line-clamp-2 text-font/70">
              {thing.properties.description}
            </CardDescription>
          )}

          {showTags && thing.properties.tags && Array.isArray(thing.properties.tags) && thing.properties.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {thing.properties.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs border-font/20 text-font">
                  {tag}
                </Badge>
              ))}
              {thing.properties.tags.length > 3 && (
                <Badge variant="outline" className="text-xs border-font/20 text-font">
                  +{thing.properties.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {thing.properties && Object.keys(thing.properties).length > 0 && (
            <div className="text-xs text-font/60 space-y-1">
              {Object.entries(thing.properties)
                .filter(([key]) => !["description", "tags", "image"].includes(key))
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                    <span className="truncate ml-2">{String(value)}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-font/50 pt-2 border-t border-font/10">
            <span>Created {formatDate(thing.createdAt)}</span>
            {thing.updatedAt && <span>Updated {formatDate(thing.updatedAt)}</span>}
          </div>
        </CardContent>
      </div>
    </UniversalThingCard>
  );
}
