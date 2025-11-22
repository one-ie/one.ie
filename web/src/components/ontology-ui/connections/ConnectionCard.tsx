/**
 * ConnectionCard - Card showing a connection relationship
 *
 * Renders a single connection between two things with type, strength, and metadata.
 * Part of CONNECTIONS dimension (ontology-ui)
 *
 * Design System: Uses 6-token system with proper elevation and states
 */

import type { Connection, Thing, CardProps } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getConnectionTypeDisplay, formatDate, cn } from "../utils";
import { ArrowRight } from "lucide-react";

interface ConnectionCardProps extends CardProps {
  connection: Connection;
  fromThing?: Thing;
  toThing?: Thing;
  showStrength?: boolean;
}

export function ConnectionCard({
  connection,
  fromThing,
  toThing,
  showStrength = true,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className,
}: ConnectionCardProps) {
  const typeDisplay = getConnectionTypeDisplay(connection.type);

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantClasses = {
    default: "",
    outline: "border-2",
    ghost: "border-0 shadow-none",
  };

  // Strength color using tertiary (success), secondary (medium), and font (weak)
  const getStrengthColor = (strength?: number) => {
    if (!strength) return "bg-background";
    if (strength >= 75) return "bg-tertiary"; // Success green
    if (strength >= 50) return "bg-primary"; // Primary blue
    if (strength >= 25) return "bg-secondary"; // Secondary gray-blue
    return "bg-font/20"; // Light gray
  };

  return (
    <Card
      className={cn(
        "bg-background p-1 shadow-sm rounded-md transition-all duration-300 ease-in-out",
        sizeClasses[size],
        variantClasses[variant],
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <div className="bg-foreground rounded-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              {/* Connection visual: from → to */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-font truncate block">
                    {fromThing?.name || "Thing"}
                  </span>
                </div>

                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-font truncate block">
                    {toThing?.name || "Thing"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection type badge */}
          <Badge
            variant="secondary"
            className="mt-2 bg-primary/10 text-primary border-primary/20 w-fit"
          >
            {typeDisplay}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 text-font">
          {/* Strength indicator */}
          {showStrength && connection.strength !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-font/60">Strength</span>
                <span className="font-medium text-font">{connection.strength}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 ease-in-out",
                    getStrengthColor(connection.strength)
                  )}
                  style={{ width: `${connection.strength}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          {connection.metadata && Object.keys(connection.metadata).length > 0 && (
            <div className="text-xs text-font/60 space-y-1">
              {Object.entries(connection.metadata).slice(0, 2).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                  <span className="truncate ml-2">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-font/40 pt-2 border-t border-font/10">
            <span>Created {formatDate(connection.createdAt)}</span>
            {connection.updatedAt && <span>Updated {formatDate(connection.updatedAt)}</span>}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
