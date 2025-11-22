/**
 * ComponentSearch - Semantic Component Discovery UI
 *
 * CYCLE 6: Interactive component search interface
 *
 * Allows developers to search for components using natural language:
 * - Type query like "pricing table" or "dark mode toggle"
 * - See top 5 matching components with scores
 * - Click to copy import path
 * - View component details
 *
 * Usage:
 *   <ComponentSearch client:load />
 */

import { useState } from "react";
import { Search, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import type { ComponentSearchResult } from "@/lib/services/component-search";
import { SAMPLE_QUERIES } from "@/lib/services/component-search";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentSearchProps {
  /** Initial query */
  initialQuery?: string;
  /** Max results to show */
  limit?: number;
  /** Show sample queries */
  showSamples?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentSearch({
  initialQuery = "",
  limit = 5,
  showSamples = true,
}: ComponentSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ComponentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // ========================================================================
  // SEARCH HANDLER
  // ========================================================================

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);

    try {
      // Call API endpoint for component search
      const response = await fetch("/api/components/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);

      if (data.results?.length === 0) {
        toast.info("No components found. Try a different query.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // ========================================================================
  // COPY HANDLER
  // ========================================================================

  const handleCopy = (path: string) => {
    // Convert to import path
    const importPath = path.replace(/^src\//, "@/").replace(/\.(tsx|astro)$/, "");

    navigator.clipboard.writeText(`import { Component } from '${importPath}';`);
    setCopiedPath(path);
    toast.success("Import copied to clipboard!");

    setTimeout(() => setCopiedPath(null), 2000);
  };

  // ========================================================================
  // SAMPLE QUERY HANDLER
  // ========================================================================

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle>Component Search</CardTitle>
          <CardDescription>
            Search components using natural language (e.g., "pricing table", "dark mode toggle")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search components..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Sample Queries */}
          {showSamples && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.slice(0, 6).map((sample) => (
                  <Button
                    key={sample}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSampleClick(sample)}
                  >
                    {sample}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Results ({results.length})
          </h2>

          {results.map((result, index) => {
            const scorePercent = (result.score * 100).toFixed(1);
            const isCopied = copiedPath === result.path;

            return (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {index === 0 && <span className="text-xl">🏆</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge variant="secondary">{scorePercent}%</Badge>
                      </div>
                      <CardDescription>{result.description}</CardDescription>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.path)}
                      >
                        {isCopied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {result.relativePath}
                      </code>
                    </div>

                    {result.props && result.props.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Props:</span>{" "}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {result.props.slice(0, 3).join(", ")}
                          {result.props.length > 3 && ` +${result.props.length - 3} more`}
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isSearching && query && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No results found for "{query}".
              <br />
              Try a different query or use one of the samples above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
