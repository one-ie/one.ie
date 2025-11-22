/**
 * ThingList - Filterable, searchable list of things
 *
 * Provides a complete data table experience with search, filtering, sorting, and pagination.
 * Supports thing-level branding via ThingCard wrapper.
 *
 * Cycle 32: Updated for 6-token design system with thing-level color support
 */

import { useState, useMemo } from "react";
import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "./ThingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch, useSort, useFilter, usePagination } from "../hooks";
import { getThingTypeDisplay, cn } from "../utils";

interface ThingListProps {
  things: Thing[];
  onThingClick?: (thing: Thing) => void;
  typeFilter?: string[];
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  className?: string;
}

export function ThingList({
  things,
  onThingClick,
  typeFilter,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 12,
  className,
}: ThingListProps) {
  const [selectedType, setSelectedType] = useState<string | "all">("all");

  // Get unique types from things
  const availableTypes = useMemo(() => {
    const types = new Set(things.map((t) => t.type));
    return Array.from(types).sort();
  }, [things]);

  // Search
  const { searchedData, query, setQuery } = useSearch(things, ["name", "properties.description"]);

  // Filter by type
  const typeFilteredData = useMemo(() => {
    if (selectedType === "all") return searchedData;
    return searchedData.filter((t) => t.type === selectedType);
  }, [searchedData, selectedType]);

  // Sort
  const { sortedData, sortConfig, setSort } = useSort(typeFilteredData, {
    field: "createdAt",
    direction: "desc",
  });

  // Paginate
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, pageSize);

  // Empty state
  if (things.length === 0) {
    return (
      <div className={cn("text-center py-12 text-font/60", className)}>
        <p className="text-lg">No things found</p>
        <p className="text-sm mt-2">
          Create your first thing to get started
        </p>
      </div>
    );
  }

  // No results after filtering
  const hasNoResults = paginatedData.length === 0 && (query || selectedType !== "all");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {searchable && (
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search things..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-foreground border-font/20 text-font placeholder:text-font/40"
            />
          </div>
        )}

        {filterable && (
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value)}
          >
            <SelectTrigger className="w-full sm:w-48 bg-foreground border-font/20 text-font">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-foreground border-font/20">
              <SelectItem value="all" className="text-font hover:bg-background">
                All Types
              </SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-font hover:bg-background">
                  {getThingTypeDisplay(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {sortable && (
          <Select
            value={`${sortConfig?.field}-${sortConfig?.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split("-");
              setSort(field, direction as "asc" | "desc");
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-foreground border-font/20 text-font">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-foreground border-font/20">
              <SelectItem value="name-asc" className="text-font hover:bg-background">
                Name (A-Z)
              </SelectItem>
              <SelectItem value="name-desc" className="text-font hover:bg-background">
                Name (Z-A)
              </SelectItem>
              <SelectItem value="createdAt-desc" className="text-font hover:bg-background">
                Newest First
              </SelectItem>
              <SelectItem value="createdAt-asc" className="text-font hover:bg-background">
                Oldest First
              </SelectItem>
              <SelectItem value="updatedAt-desc" className="text-font hover:bg-background">
                Recently Updated
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-font/60">
        <span>
          Showing {paginatedData.length} of {sortedData.length} things
        </span>
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
            className="text-font/60 hover:text-font hover:bg-background"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Empty results */}
      {hasNoResults && (
        <div className="text-center py-12">
          <p className="text-lg text-font/60">No things match your filters</p>
          <div className="flex gap-2 justify-center mt-4">
            {query && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery("")}
                className="border-font/20 text-font hover:bg-background"
              >
                Clear search
              </Button>
            )}
            {selectedType !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedType("all")}
                className="border-font/20 text-font hover:bg-background"
              >
                Clear type filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Thing cards */}
      {!hasNoResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((thing) => (
            <ThingCard
              key={thing._id}
              thing={thing}
              interactive={!!onThingClick}
              onClick={() => onThingClick?.(thing)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-font/10">
          <div className="text-sm text-font/60">
            Page {pagination.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pagination.page === 1}
              className="border-font/20 text-font hover:bg-background disabled:opacity-50"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className={
                    pagination.page === page
                      ? "bg-primary text-white"
                      : "border-font/20 text-font hover:bg-background"
                  }
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 py-1 text-font/60">...</span>
                <Button
                  variant={pagination.page === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  className={
                    pagination.page === totalPages
                      ? "bg-primary text-white"
                      : "border-font/20 text-font hover:bg-background"
                  }
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pagination.page === totalPages}
              className="border-font/20 text-font hover:bg-background disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
