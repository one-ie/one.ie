/**
 * ChainMonitor Component
 *
 * Real-time blockchain monitoring with alerts.
 * Uses 6-token design system with live updates.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface MonitorAlert {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

export interface ChainHealth {
  status: "healthy" | "degraded" | "critical";
  uptime: number;
  averageBlockTime: number;
  missedBlocks: number;
  alerts: MonitorAlert[];
}

interface ChainMonitorProps {
  chainName: string;
  health: ChainHealth;
  isLive?: boolean;
  className?: string;
}

export function ChainMonitor({
  chainName,
  health,
  isLive = true,
  className,
}: ChainMonitorProps) {
  const statusColors: Record<string, string> = {
    healthy: "bg-tertiary text-white",
    degraded: "bg-secondary text-white",
    critical: "bg-destructive text-white",
  };

  const alertColors: Record<string, string> = {
    info: "bg-primary/10 border-primary/20 text-font",
    warning: "bg-secondary/10 border-secondary/20 text-font",
    critical: "bg-destructive/10 border-destructive/20 text-destructive",
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-font text-lg">
              {chainName} Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge className="bg-tertiary text-white">
                  <span className="animate-pulse mr-1">●</span> Live
                </Badge>
              )}
              <Badge className={statusColors[health.status]}>
                {health.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Health Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Uptime</div>
            <div className="text-font font-semibold">
              {health.uptime.toFixed(2)}%
            </div>
          </div>
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Block Time</div>
            <div className="text-font font-semibold">
              {health.averageBlockTime.toFixed(1)}s
            </div>
          </div>
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Missed</div>
            <div className={`font-semibold ${health.missedBlocks > 0 ? "text-destructive" : "text-font"}`}>
              {health.missedBlocks}
            </div>
          </div>
        </div>

        {/* Uptime Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-font/60">Network Health</span>
            <span className="text-font font-medium">
              {health.uptime.toFixed(2)}%
            </span>
          </div>
          <Progress value={health.uptime} className="h-2 bg-background">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                health.uptime >= 99
                  ? "bg-tertiary"
                  : health.uptime >= 95
                  ? "bg-secondary"
                  : "bg-destructive"
              }`}
              style={{ width: `${health.uptime}%` }}
            />
          </Progress>
        </div>

        {/* Recent Alerts */}
        {health.alerts.length > 0 && (
          <div>
            <h4 className="text-font font-medium text-sm mb-3">
              Recent Alerts ({health.alerts.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {health.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-md p-2 ${alertColors[alert.type]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{alert.message}</p>
                    <span className="text-xs text-font/60 whitespace-nowrap">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {health.alerts.length === 0 && (
          <div className="bg-tertiary/10 border border-tertiary/20 rounded-md p-3 text-center">
            <p className="text-tertiary text-sm">
              ✓ No alerts - Network operating normally
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
