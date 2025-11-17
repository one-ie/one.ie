"use client";

import type { CollectionEntry } from "astro:content";
import { X } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Feature = CollectionEntry<"features">;

type Category =
  | "authentication"
  | "ecommerce"
  | "ai-agents"
  | "protocols"
  | "payments"
  | "analytics"
  | "content"
  | "communication"
  | "infrastructure"
  | "integrations"
  | "developer-tools"
  | "other";

interface FeatureCategoryFilterProps {
  features: Feature[];
  onFilterChange?: (filtered: Feature[]) => void;
  className?: string;
  showCounts?: boolean;
}

const categoryColors = {
  authentication: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  ecommerce: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  "ai-agents": "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  protocols: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  payments: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  analytics: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
  content: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  communication: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  infrastructure: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
  integrations: "bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100",
  "developer-tools": "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  other: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
} as const;

/**
 * FeatureCategoryFilter Component
 * Provides interactive filtering of features by category.
 * Shows category counts and allows single/multiple category selection.
 */
export function FeatureCategoryFilter({
  features,
  onFilterChange,
  className = "",
  showCounts = true,
}: FeatureCategoryFilterProps): React.ReactElement {
  const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      authentication: 0,
      ecommerce: 0,
      "ai-agents": 0,
      protocols: 0,
      payments: 0,
      analytics: 0,
      content: 0,
      communication: 0,
      infrastructure: 0,
      integrations: 0,
      "developer-tools": 0,
      other: 0,
    };

    features.forEach((feature) => {
      const category = (feature.data.category as Category) || "other";
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [features]);

  // Filter features based on selected categories
  const filteredFeatures = useMemo(() => {
    if (selectedCategories.length === 0) {
      return features;
    }

    return features.filter((feature) => {
      const category = (feature.data.category as Category) || "other";
      return selectedCategories.includes(category);
    });
  }, [features, selectedCategories]);

  // Notify parent component of filter changes
  React.useEffect(() => {
    onFilterChange?.(filteredFeatures);
  }, [filteredFeatures, onFilterChange]);

  const toggleCategory = useCallback((category: Category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const categories = Object.keys(categoryCounts) as Category[];
  const activeCategories = categories.filter((c) => categoryCounts[c] > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Filter by Category
        </h3>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 gap-1 px-2 text-xs"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const count = categoryCounts[category];
          const colorClass = categoryColors[category];

          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCategory(category)}
              className={`capitalize text-xs transition-colors ${
                isSelected ? "ring-2 ring-offset-2" : ""
              } ${!isSelected && colorClass}`}
              aria-pressed={isSelected}
              title={`${category}: ${count} features`}
            >
              {category.replace("-", " ")}
              {showCounts && <span className="ml-1">({count})</span>}
            </Button>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="bg-muted">
            {filteredFeatures.length}/{features.length} features
          </Badge>
          <span>showing filtered results</span>
        </div>
      )}
    </div>
  );
}
