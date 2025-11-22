/**
 * NetworkStatus Component
 *
 * Display network connection status and health indicators.
 * Uses 6-token design system with real-time indicators.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface NetworkHealth {
  status: "online" | "slow" | "offline";
  latency: number;
  blockHeight: number;
  peerCount: number;
  syncProgress?: number;
}

interface NetworkStatusProps {
  chainName: string;
  health: NetworkHealth;
  compact?: boolean;
  className?: string;
}

export function NetworkStatus({
  chainName,
  health,
  compact = false,
  className,
}: NetworkStatusProps) {
  const statusColors: Record<string, string> = {
    online: "bg-tertiary text-white",
    slow: "bg-secondary text-white",
    offline: "bg-destructive text-white",
  };

  const statusIcons: Record<string, string> = {
    online: "●",
    slow: "◐",
    offline: "○",
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return "text-tertiary";
    if (latency < 300) return "text-secondary";
    return "text-destructive";
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <Badge className={statusColors[health.status]}>
          <span className={health.status === "online" ? "animate-pulse" : ""}>
            {statusIcons[health.status]}
          </span>
          <span className="ml-1 capitalize">{health.status}</span>
        </Badge>
        <span className="text-font/60 text-sm">
          {health.latency}ms
        </span>
      </div>
    );
  }

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-3 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-font font-semibold">{chainName}</h3>
            <div className="text-font/60 text-xs">Network Status</div>
          </div>
          <Badge className={statusColors[health.status]}>
            <span className={health.status === "online" ? "animate-pulse" : ""}>
              {statusIcons[health.status]}
            </span>
            <span className="ml-1 capitalize">{health.status}</span>
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background rounded-md p-2 text-center">
            <div className="text-font/60 text-xs mb-1">Latency</div>
            <div className={`font-semibold ${getLatencyColor(health.latency)}`}>
              {health.latency}ms
            </div>
          </div>
          <div className="bg-background rounded-md p-2 text-center">
            <div className="text-font/60 text-xs mb-1">Block</div>
            <div className="text-font font-semibold">
              {health.blockHeight.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-2 text-center">
            <div className="text-font/60 text-xs mb-1">Peers</div>
            <div className="text-font font-semibold">{health.peerCount}</div>
          </div>
        </div>

        {/* Sync Progress */}
        {health.syncProgress !== undefined && health.syncProgress < 100 && (
          <div className="mt-3 bg-background rounded-md p-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-font/60">Syncing...</span>
              <span className="text-font font-medium">
                {health.syncProgress.toFixed(1)}%
              </span>
            </div>
            <div className="bg-foreground rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${health.syncProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
