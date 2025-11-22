/**
 * TagCloud Component - Visual tag cloud for KNOWLEDGE dimension
 *
 * Displays labels as an interactive tag cloud with:
 * - Size based on frequency/count
 * - Color-coded by category
 * - Click interaction support
 * - Responsive layout
 */

import type { Label } from "../types";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";

interface TagCloudProps {
  labels: Label[];
  onTagClick?: (label: Label) => void;
  maxTags?: number;
  className?: string;
}

export function TagCloud({
  labels,
  onTagClick,
  maxTags = 50,
  className,
}: TagCloudProps) {
  // Calculate frequency/popularity for sizing
  const labelsWithSize = labels
    .slice(0, maxTags)
    .map((label) => ({
      ...label,
      size: label.confidence
        ? Math.max(0.8, Math.min(2, label.confidence * 2))
        : 1,
    }))
    .sort(() => Math.random() - 0.5); // Shuffle for visual variety

  // Category-based color mapping
  const getCategoryColor = (category?: string): string => {
    if (!category) return "default";

    const colorMap: Record<string, string> = {
      topic: "blue",
      skill: "green",
      technology: "purple",
      domain: "orange",
      industry: "red",
      tag: "gray",
    };

    return colorMap[category.toLowerCase()] || "default";
  };

  // Badge variant mapping
  const getVariant = (
    color: string
  ): "default" | "secondary" | "outline" | "destructive" => {
    if (color === "default") return "default";
    if (color === "gray") return "secondary";
    return "outline";
  };

  if (labels.length === 0) {
    return (
      <div className={cn("text-center p-8 text-font/60", className)}>
        No labels available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 p-4 items-center justify-center",
        className
      )}
    >
      {labelsWithSize.map((label) => {
        const color = getCategoryColor(label.category);
        const variant = getVariant(color);

        return (
          <Badge
            key={label._id}
            variant={variant}
            className={cn(
              "transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95",
              onTagClick && "hover:shadow-md",
              // Color classes based on category using design system
              color === "blue" && "bg-primary/10 text-primary",
              color === "green" && "bg-tertiary/10 text-tertiary",
              color === "purple" && "bg-secondary/10 text-secondary",
              color === "orange" && "bg-primary/10 text-primary",
              color === "red" && "bg-destructive/10 text-destructive"
            )}
            style={{
              fontSize: `${label.size}rem`,
              padding: `${label.size * 0.25}rem ${label.size * 0.5}rem`,
            }}
            onClick={() => onTagClick?.(label)}
          >
            {label.label}
          </Badge>
        );
      })}
    </div>
  );
}
