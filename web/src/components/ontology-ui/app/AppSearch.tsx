/**
 * AppSearch - Application-wide search component
 *
 * Uses 6-token design system with command palette style.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import { Search, ArrowRight } from "lucide-react";

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface AppSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * AppSearch - Global search command palette
 *
 * @example
 * ```tsx
 * <AppSearch
 *   open={searchOpen}
 *   onOpenChange={setSearchOpen}
 *   onSearch={async (query) => {
 *     const results = await fetchSearchResults(query);
 *     return results;
 *   }}
 *   onSelect={(result) => navigate(result.href)}
 * />
 * ```
 */
export function AppSearch({
  open,
  onOpenChange,
  onSearch,
  onSelect,
  placeholder = "Search...",
  className,
}: AppSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelect(results[selectedIndex]);
      onOpenChange(false);
      setQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl p-0", className)}>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-font/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-font/60">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-font/60">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, i) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelect(result);
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors",
                    i === selectedIndex
                      ? "bg-background"
                      : "hover:bg-background"
                  )}
                >
                  {result.icon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {result.icon}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-font truncate">
                        {result.title}
                      </span>
                      {result.category && (
                        <Badge variant="secondary" className="text-xs">
                          {result.category}
                        </Badge>
                      )}
                    </div>
                    {result.description && (
                      <p className="text-xs text-font/60 truncate">
                        {result.description}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="h-4 w-4 text-font/40 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-sm text-font/60">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-font/60">
              Start typing to search...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t text-xs text-font/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↓</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-background">↵</kbd>
              <span>select</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border bg-background">ESC</kbd>
            <span>close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
