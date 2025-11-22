/**
 * PluginRegistryClient Component
 * Client-side plugin registry with filtering and search
 */

"use client";

import { useState, useMemo } from "react";
import { PluginCard } from "./PluginCard";
import { PluginFilters, type FilterState } from "./PluginFilters";
import { PluginInstallModal } from "./PluginInstallModal";
import type { Plugin, PluginCategory } from "@/types/plugin";
import { mockPlugins } from "@/lib/mockPluginData";
import { Skeleton } from "@/components/ui/skeleton";

export function PluginRegistryClient() {
  const [plugins] = useState<Plugin[]>(mockPlugins);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "popular",
  });
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(plugins.map((p) => p.category));
    return Array.from(cats) as PluginCategory[];
  }, [plugins]);

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let result = [...plugins];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // Sort
    switch (filters.sortBy) {
      case "popular":
        result.sort((a, b) => (b.installCount || 0) - (a.installCount || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        // Would sort by createdAt in real implementation
        break;
    }

    return result;
  }, [plugins, filters]);

  const handleInstall = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setInstallModalOpen(true);
  };

  const handleView = (plugin: Plugin) => {
    window.location.href = `/plugins/${plugin._id}`;
  };

  const handleInstallComplete = async (
    plugin: Plugin,
    config: Record<string, unknown>
  ) => {
    console.log("Installing plugin:", plugin.name, "with config:", config);
    // Simulate installation
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PluginFilters onFilterChange={setFilters} categories={categories} />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Plugin Grid */}
      {filteredPlugins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin._id}
              plugin={plugin}
              onInstall={handleInstall}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No plugins found matching your criteria</p>
        </div>
      )}

      {/* Install Modal */}
      <PluginInstallModal
        plugin={selectedPlugin}
        open={installModalOpen}
        onOpenChange={setInstallModalOpen}
        onInstall={handleInstallComplete}
      />
    </div>
  );
}
