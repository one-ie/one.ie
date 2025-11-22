/**
 * ConnectionStats - Statistics and analytics for connections
 *
 * Displays aggregate statistics:
 * - Total connections count
 * - Breakdown by connection type
 * - Average strength
 * - Most connected things
 *
 * Design System: Uses 6-token system with stat cards and charts
 */

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Connection, Thing } from "../types";
import { cn, getConnectionTypeDisplay, groupBy } from "../utils";
import { TrendingUp, Link2, Activity } from "lucide-react";

export interface ConnectionStatsProps {
  connections: Connection[];
  things?: Thing[];
  className?: string;
}

export function ConnectionStats({
  connections,
  things = [],
  className,
}: ConnectionStatsProps) {
  const stats = useMemo(() => {
    // Total count
    const total = connections.length;

    // Breakdown by type
    const byType = groupBy(connections, "type");
    const typeBreakdown = Object.entries(byType).map(([type, conns]) => ({
      type,
      count: conns.length,
      percentage: ((conns.length / total) * 100).toFixed(1),
    })).sort((a, b) => b.count - a.count);

    // Average strength
    const strengthValues = connections
      .filter(c => c.strength !== undefined)
      .map(c => c.strength!);
    const avgStrength = strengthValues.length > 0
      ? (strengthValues.reduce((sum, s) => sum + s, 0) / strengthValues.length).toFixed(1)
      : "0";

    // Most connected things
    const thingConnections = new Map<string, number>();
    connections.forEach(conn => {
      thingConnections.set(conn.fromId, (thingConnections.get(conn.fromId) || 0) + 1);
      thingConnections.set(conn.toId, (thingConnections.get(conn.toId) || 0) + 1);
    });

    const thingMap = new Map(things.map(t => [t._id, t]));
    const mostConnected = Array.from(thingConnections.entries())
      .map(([id, count]) => ({
        id,
        count,
        thing: thingMap.get(id),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      typeBreakdown,
      avgStrength,
      mostConnected,
    };
  }, [connections, things]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {/* Total Connections */}
      <Card className="bg-background p-1 shadow-sm rounded-md">
        <div className="bg-foreground rounded-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-font">
              Total Connections
            </CardTitle>
            <Link2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-font">{stats.total}</div>
            <p className="text-xs text-font/60 mt-1">
              Across all types
            </p>
          </CardContent>
        </div>
      </Card>

      {/* Average Strength */}
      <Card className="bg-background p-1 shadow-sm rounded-md">
        <div className="bg-foreground rounded-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-font">
              Average Strength
            </CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-font">{stats.avgStrength}%</div>
            <p className="text-xs text-font/60 mt-1">
              Mean connection strength
            </p>
          </CardContent>
        </div>
      </Card>

      {/* Most Common Type */}
      <Card className="bg-background p-1 shadow-sm rounded-md">
        <div className="bg-foreground rounded-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-font">
              Most Common Type
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-tertiary" />
          </CardHeader>
          <CardContent>
            {stats.typeBreakdown.length > 0 ? (
              <>
                <div className="text-lg font-semibold text-font">
                  {getConnectionTypeDisplay(stats.typeBreakdown[0].type as any)}
                </div>
                <p className="text-xs text-font/60 mt-1">
                  {stats.typeBreakdown[0].count} connections ({stats.typeBreakdown[0].percentage}%)
                </p>
              </>
            ) : (
              <div className="text-sm text-font/60">No connections yet</div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* Type Breakdown */}
      <Card className="bg-background p-1 shadow-sm rounded-md md:col-span-2 lg:col-span-2">
        <div className="bg-foreground rounded-md">
          <CardHeader>
            <CardTitle className="text-font">Connection Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.typeBreakdown.slice(0, 5).map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {getConnectionTypeDisplay(item.type as any)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-font w-16 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Most Connected Things */}
      <Card className="bg-background p-1 shadow-sm rounded-md lg:col-span-1">
        <div className="bg-foreground rounded-md">
          <CardHeader>
            <CardTitle className="text-font">Most Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mostConnected.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    <span className="text-sm text-font truncate">
                      {item.thing?.name || item.id.slice(0, 8)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    {item.count}
                  </Badge>
                </div>
              ))}
              {stats.mostConnected.length === 0 && (
                <div className="text-sm text-font/60 text-center py-4">
                  No connections yet
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
