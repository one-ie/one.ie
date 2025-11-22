/**
 * SearchResults Component - Search results display for KNOWLEDGE dimension
 *
 * Features:
 * - Highlight matching text in results
 * - Group results by thing type
 * - Display relevance score
 * - Click handlers for result selection
 */

import type { SearchResult, ThingType } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getThingTypeIcon, getThingTypeDisplay, groupBy } from "../utils";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
  groupByType?: boolean;
}

export function SearchResults({
  results,
  query,
  onResultClick,
  className,
  groupByType = true,
}: SearchResultsProps) {
  // Highlight matching text in a string
  const highlightText = (text: string, searchQuery: string): JSX.Element => {
    if (!searchQuery.trim()) {
      return <>{text}</>;
    }

    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-200 dark:bg-yellow-900 font-medium"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Get score color based on relevance using design system
  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "text-tertiary"; // Green for high score
    if (score >= 0.5) return "text-secondary"; // Secondary for medium
    return "text-font/60"; // Muted for lower scores
  };

  // Format score percentage
  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  if (results.length === 0) {
    return (
      <div
        className={cn(
          "text-center p-12 text-font/60",
          className
        )}
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium mb-2 text-font">No results found</h3>
        <p className="text-sm">
          Try adjusting your search query or browse categories
        </p>
      </div>
    );
  }

  // Group results by type if enabled
  const groupedResults = groupByType
    ? groupBy(results, "type")
    : { All: results };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results count */}
      <div className="text-sm text-font/60">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
        <span className="font-medium text-font">"{query}"</span>
      </div>

      {/* Grouped results */}
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type}>
          {groupByType && (
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-font">
              <span>{getThingTypeIcon(type as ThingType)}</span>
              {getThingTypeDisplay(type as ThingType)}
              <Badge variant="secondary" className="ml-2">
                {typeResults.length}
              </Badge>
            </h3>
          )}

          <div className="space-y-3">
            {typeResults.map((result) => (
              <Card
                key={result._id}
                className={cn(
                  "bg-background p-1 shadow-sm rounded-md transition-all duration-150",
                  onResultClick &&
                    "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] hover:border-primary"
                )}
                onClick={() => onResultClick?.(result)}
              >
                <div className="bg-foreground p-4 rounded-md">
                  <CardHeader className="pb-3 p-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xl">
                          {getThingTypeIcon(result.type as any)}
                        </span>
                        <CardTitle className="text-base text-font">
                          {highlightText(result.name, query)}
                        </CardTitle>
                      </div>
                      {/* Relevance score */}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          getScoreColor(result.score)
                        )}
                      >
                        {formatScore(result.score)}
                      </span>
                    </div>
                    {result.description && (
                      <CardDescription className="text-sm text-font/60">
                        {highlightText(result.description, query)}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {/* Highlights from search */}
                  {result.highlights && result.highlights.length > 0 && (
                    <CardContent className="pt-2 p-0">
                      <div className="space-y-1">
                        {result.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-font/60 border-l-2 border-font/20 pl-2"
                          >
                            {highlightText(highlight, query)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
