/**
 * PluginFilters Component
 * Filter and search interface for plugin registry
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PluginCategory } from "@/types/plugin";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface PluginFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: PluginCategory[];
}

export interface FilterState {
  search: string;
  category: PluginCategory | "all";
  sortBy: "popular" | "recent" | "rating" | "name";
}

export function PluginFilters({ onFilterChange, categories }: PluginFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "popular",
  });

  const handleFilterChange = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      category: "all",
      sortBy: "popular",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.search || filters.category !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins by name, description, or tags..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category}
          onValueChange={(value) =>
            handleFilterChange({ category: value as PluginCategory | "all" })
          }
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            handleFilterChange({
              sortBy: value as FilterState["sortBy"],
            })
          }
        >
          <SelectTrigger className="w-full md:w-48">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange({ search: "" })}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange({ category: "all" })}
                className="ml-2 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
