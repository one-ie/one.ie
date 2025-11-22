/**
 * LabelCard Component
 *
 * Card for displaying labels with confidence scores
 * Part of KNOWLEDGE dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Label, CardProps } from "../types";
import { cn, formatDate } from "../utils";

export interface LabelCardProps extends CardProps {
  label: Label;
  showThing?: boolean;
  showConfidence?: boolean;
}

export function LabelCard({
  label,
  showThing = false,
  showConfidence = true,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: LabelCardProps) {
  // Calculate confidence color using design system
  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return "text-font/60";
    if (confidence >= 0.8) return "text-tertiary"; // Green for high confidence
    if (confidence >= 0.6) return "text-secondary"; // Secondary for medium
    return "text-primary"; // Primary for lower (still valid)
  };

  return (
    <Card
      className={cn(
        "group relative bg-background p-1 shadow-sm rounded-md transition-all duration-150",
        interactive && "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <div className={cn(
        "bg-foreground rounded-md",
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
      )}>
        <CardHeader className="pb-3 p-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg">🏷️</span>
              <h3 className="font-semibold truncate text-font">{label.label}</h3>
            </div>

            {label.category && (
              <Badge variant="secondary" className="shrink-0">
                {label.category}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-0 pt-2">
          {/* Confidence Score */}
          {showConfidence && label.confidence !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-font/60">Confidence</span>
              <span className={cn("font-medium", getConfidenceColor(label.confidence))}>
                {(label.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* Thing Reference */}
          {showThing && (
            <div className="text-xs text-font/60">
              Thing ID: {label.thingId}
            </div>
          )}

          {/* Metadata */}
          {label.metadata && Object.keys(label.metadata).length > 0 && (
            <div className="pt-2 border-t border-font/10">
              <div className="text-xs text-font/60 space-y-1">
                {Object.entries(label.metadata).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="truncate ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="text-xs text-font/60 pt-1">
            Created {formatDate(label.createdAt)}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
