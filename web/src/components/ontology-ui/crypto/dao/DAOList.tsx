/**
 * DAOList Component
 *
 * Displays a list of DAOs with filtering and sorting.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DAOCard, type DAO } from "./DAOCard";

interface DAOListProps {
  daos: DAO[];
  onViewDetails?: (id: string) => void;
  onJoin?: (id: string) => void;
  userMemberships?: string[];
  className?: string;
}

export function DAOList({
  daos,
  onViewDetails,
  onJoin,
  userMemberships = [],
  className,
}: DAOListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "proposals" | "treasury">("members");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories
  const categories = ["all", ...new Set(daos.map((d) => d.category).filter(Boolean))];

  // Filter and sort DAOs
  const filteredDAOs = daos
    .filter((dao) => {
      const matchesSearch =
        dao.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dao.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || dao.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.totalMembers - a.totalMembers;
        case "proposals":
          return b.totalProposals - a.totalProposals;
        case "treasury":
          // Simple string comparison for now
          return b.treasuryValue.localeCompare(a.treasuryValue);
        default:
          return 0;
      }
    });

  return (
    <div className={className}>
      {/* Header with filters */}
      <div className="bg-background p-4 rounded-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-font font-semibold text-xl">
            DAOs ({filteredDAOs.length})
          </h2>
          <Badge variant="secondary">
            {userMemberships.length} joined
          </Badge>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search DAOs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-foreground"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-foreground">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-40 bg-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="members">Members</SelectItem>
              <SelectItem value="proposals">Proposals</SelectItem>
              <SelectItem value="treasury">Treasury</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DAO Grid */}
      {filteredDAOs.length === 0 ? (
        <div className="bg-background p-8 rounded-md text-center">
          <p className="text-font/60">No DAOs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDAOs.map((dao) => (
            <DAOCard
              key={dao.id}
              dao={dao}
              onViewDetails={onViewDetails}
              onJoin={onJoin}
              isMember={userMemberships.includes(dao.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
