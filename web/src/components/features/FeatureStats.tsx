"use client";

import type { CollectionEntry } from "astro:content";
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";

type Feature = CollectionEntry<"features">;

interface FeatureStatsProps {
  features: Feature[];
  showCompletionPercentage?: boolean;
  className?: string;
}

/**
 * FeatureStats Component
 * Displays statistics about the features collection:
 * - Total features
 * - Completed (released)
 * - In development (beta + in_development)
 * - Planned features
 * - Completion percentage
 */
export function FeatureStats({
  features,
  showCompletionPercentage = true,
  className = "",
}: FeatureStatsProps): React.ReactElement {
  const stats = React.useMemo(() => {
    const completed = features.filter((f) => f.data.status === "completed").length;
    const inDev = features.filter(
      (f) => f.data.status === "in_development" || f.data.status === "beta"
    ).length;
    const planned = features.filter((f) => f.data.status === "planned").length;
    const total = features.length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inDev,
      planned,
      completionPercentage,
    };
  }, [features]);

  return (
    <div
      className={`flex flex-wrap gap-3 ${className}`}
      role="region"
      aria-label="Feature statistics"
    >
      <Badge
        variant="secondary"
        className="gap-2 px-3 py-2"
        title={`${stats.total} total features`}
      >
        <TrendingUp className="h-4 w-4" />
        {stats.total} Features
      </Badge>

      <Badge
        variant="secondary"
        className="gap-2 px-3 py-2 bg-green-50 text-green-700 border-green-200"
        title={`${stats.completed} completed features`}
      >
        <CheckCircle2 className="h-4 w-4" />
        {stats.completed} Completed
      </Badge>

      <Badge
        variant="secondary"
        className="gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 border-yellow-200"
        title={`${stats.inDev} features in development`}
      >
        <Clock className="h-4 w-4" />
        {stats.inDev} In Development
      </Badge>

      <Badge
        variant="secondary"
        className="gap-2 px-3 py-2 bg-gray-50 text-gray-700 border-gray-200"
        title={`${stats.planned} planned features`}
      >
        <AlertCircle className="h-4 w-4" />
        {stats.planned} Planned
      </Badge>

      {showCompletionPercentage && (
        <Badge
          variant="outline"
          className="gap-2 px-3 py-2"
          title={`${stats.completionPercentage}% completion rate`}
        >
          <span className="text-xs font-semibold">{stats.completionPercentage}% Complete</span>
        </Badge>
      )}
    </div>
  );
}
