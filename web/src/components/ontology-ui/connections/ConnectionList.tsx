/**
 * ConnectionList - List of connections with type filtering
 *
 * Displays connections with search, filter by type, sort, and pagination.
 * Part of CONNECTIONS dimension (ontology-ui)
 *
 * Design System: Uses 6-token system with proper interactive states
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectionCard } from "./ConnectionCard";
import type { Connection, ConnectionType, ListProps } from "../types";
import { useSearch, useSort, useFilter, usePagination } from "../hooks";
import { cn, getConnectionTypeDisplay } from "../utils";

export interface ConnectionListProps extends ListProps {
  connections: Connection[];
  onConnectionClick?: (connection: Connection) => void;
  typeFilter?: ConnectionType;
}

export function ConnectionList({
  connections,
  onConnectionClick,
  typeFilter,
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  pageSize = 10,
  className,
}: ConnectionListProps) {
  const [selectedType, setSelectedType] = useState<string>(typeFilter || "all");

  // Search functionality (search by connection type)
  const { searchedData, query, setQuery } = useSearch(connections, ["type"]);

  // Filter by connection type
  const { filteredData, addFilter, clearFilters } = useFilter(searchedData);

  // Apply type filter
  React.useEffect(() => {
    clearFilters();
    if (selectedType !== "all") {
      addFilter({
        field: "type",
        operator: "eq",
        value: selectedType,
      });
    }
  }, [selectedType, clearFilters, addFilter]);

  // Sort functionality
  const { sortedData, sortConfig, setSort } = useSort(filteredData, {
    field: "createdAt",
    direction: "desc",
  });

  // Pagination functionality
  const {
    paginatedData,
    pagination,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, pageSize);

  // Determine which data to display
  const displayData = paginated ? paginatedData : sortedData;

  // Get unique connection types for filter
  const connectionTypes = Array.from(
    new Set(connections.map((c) => c.type))
  ).sort();

  // Handle connection click
  const handleConnectionClick = (connection: Connection) => {
    if (onConnectionClick) {
      onConnectionClick(connection);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search, Filter, and Sort Controls */}
      {(searchable || filterable || sortable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                type="search"
                placeholder="Search by connection type..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-foreground text-font border-font/20 focus:ring-2 focus:ring-primary transition-all duration-150"
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {/* Type Filter */}
            {filterable && (
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px] bg-foreground text-font border-font/20">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-foreground shadow-lg">
                  <SelectItem value="all">All Types</SelectItem>
                  {connectionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getConnectionTypeDisplay(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort Buttons */}
            {sortable && (
              <>
                <Button
                  variant={
                    sortConfig?.field === "createdAt" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSort("createdAt")}
                  className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Created{" "}
                  {sortConfig?.field === "createdAt" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant={
                    sortConfig?.field === "strength" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSort("strength")}
                  className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Strength{" "}
                  {sortConfig?.field === "strength" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-font/60">
        {sortedData.length === connections.length ? (
          <span>{sortedData.length} connections</span>
        ) : (
          <span>
            {sortedData.length} of {connections.length} connections
          </span>
        )}
      </div>

      {/* Connection List */}
      <div className="space-y-3">
        {displayData.length === 0 ? (
          <div className="text-center py-12 text-font/60 bg-background rounded-md">
            <p className="text-lg">No connections found</p>
            {(query || selectedType !== "all") && (
              <p className="text-sm mt-2">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        ) : (
          displayData.map((connection) => (
            <ConnectionCard
              key={connection._id}
              connection={connection}
              onClick={() => handleConnectionClick(connection)}
              interactive={!!onConnectionClick}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-font/10 pt-4">
          <div className="text-sm text-font/60">
            Page {pagination.page} of {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={pagination.page === 1}
              className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;

                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={
                      pagination.page === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pagination.page === totalPages}
              className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
