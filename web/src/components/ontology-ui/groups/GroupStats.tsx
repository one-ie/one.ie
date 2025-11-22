/**
 * GroupStats Component
 *
 * Statistics dashboard for group metrics
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatNumber, abbreviateNumber } from "../utils";

export interface GroupStatsData {
  members: number;
  things: number;
  connections: number;
  events: number;
  subgroups?: number;
  growth?: {
    members: number; // percentage
    things: number;
    events: number;
  };
}

export interface GroupStatsProps {
  stats: GroupStatsData;
  showGrowth?: boolean;
  className?: string;
}

function StatCard({
  label,
  value,
  icon,
  growth,
}: {
  label: string;
  value: number;
  icon: string;
  growth?: number;
}) {
  const isPositive = growth && growth > 0;
  const isNegative = growth && growth < 0;

  return (
    <div className="bg-background border border-font/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {growth !== undefined && (
          <span
            className={cn(
              "text-xs font-medium",
              isPositive && "text-tertiary",
              isNegative && "text-destructive"
            )}
          >
            {isPositive && "+"}
            {growth.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-font">{abbreviateNumber(value)}</p>
      <p className="text-sm text-font/60">{label}</p>
    </div>
  );
}

export function GroupStats({
  stats,
  showGrowth = false,
  className,
}: GroupStatsProps) {
  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md p-4 text-font">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-font">
            <span>📊</span>
            Group Statistics
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Members"
              value={stats.members}
              icon="👥"
              growth={showGrowth ? stats.growth?.members : undefined}
            />

            <StatCard
              label="Things"
              value={stats.things}
              icon="📦"
              growth={showGrowth ? stats.growth?.things : undefined}
            />

            <StatCard
              label="Connections"
              value={stats.connections}
              icon="🔗"
              growth={undefined}
            />

            <StatCard
              label="Events"
              value={stats.events}
              icon="📅"
              growth={showGrowth ? stats.growth?.events : undefined}
            />

            {stats.subgroups !== undefined && (
              <StatCard
                label="Subgroups"
                value={stats.subgroups}
                icon="🏢"
                growth={undefined}
              />
            )}

            <StatCard
              label="Total Activity"
              value={stats.members + stats.things + stats.events}
              icon="⚡"
              growth={undefined}
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
