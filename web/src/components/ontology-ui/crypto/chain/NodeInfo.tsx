/**
 * NodeInfo Component
 *
 * Display blockchain node information and configuration.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface NodeData {
  name: string;
  version: string;
  network: string;
  chainId: number;
  peerId: string;
  listening: boolean;
  peerCount: number;
  syncing: boolean;
  syncProgress?: number;
  protocols: {
    eth?: string;
    snap?: string;
  };
  rpcEndpoint: string;
  wsEndpoint?: string;
}

interface NodeInfoProps {
  node: NodeData;
  onRestart?: () => void;
  onCopyRpc?: () => void;
  className?: string;
}

export function NodeInfo({
  node,
  onRestart,
  onCopyRpc,
  className,
}: NodeInfoProps) {
  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-font text-lg">Node Information</CardTitle>
              <p className="text-font/60 text-sm mt-1">{node.name}</p>
            </div>
            <Badge
              className={
                node.listening
                  ? "bg-tertiary text-white"
                  : "bg-destructive text-white"
              }
            >
              {node.listening ? "● Online" : "○ Offline"}
            </Badge>
          </div>
        </CardHeader>

        {/* Version & Network */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Version</div>
            <div className="text-font font-semibold">{node.version}</div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Network</div>
            <div className="text-font font-semibold">{node.network}</div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Connection Info */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between p-2 bg-background rounded-md">
            <span className="text-font/60">Chain ID</span>
            <Badge variant="secondary">{node.chainId}</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-background rounded-md">
            <span className="text-font/60">Peers</span>
            <span className="text-font font-mono">{node.peerCount}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-background rounded-md">
            <span className="text-font/60">Status</span>
            <Badge className={node.syncing ? "bg-secondary text-white" : "bg-tertiary text-white"}>
              {node.syncing ? "Syncing..." : "Synced"}
            </Badge>
          </div>
        </div>

        {/* Sync Progress */}
        {node.syncing && node.syncProgress !== undefined && (
          <div className="bg-background rounded-md p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-font/60">Sync Progress</span>
              <span className="text-font font-medium">
                {node.syncProgress.toFixed(2)}%
              </span>
            </div>
            <div className="bg-foreground rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${node.syncProgress}%` }}
              />
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Protocols */}
        <div className="mb-4">
          <h4 className="text-font font-medium text-sm mb-2">Protocols</h4>
          <div className="flex gap-2">
            {node.protocols.eth && (
              <Badge variant="secondary">ETH: {node.protocols.eth}</Badge>
            )}
            {node.protocols.snap && (
              <Badge variant="secondary">SNAP: {node.protocols.snap}</Badge>
            )}
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-2 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">RPC Endpoint</div>
            <div className="text-font font-mono text-xs break-all">
              {node.rpcEndpoint}
            </div>
          </div>
          {node.wsEndpoint && (
            <div className="bg-background rounded-md p-3">
              <div className="text-font/60 text-xs mb-1">WebSocket Endpoint</div>
              <div className="text-font font-mono text-xs break-all">
                {node.wsEndpoint}
              </div>
            </div>
          )}
        </div>

        {/* Peer ID */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-1">Peer ID</div>
          <div className="text-font font-mono text-xs break-all">
            {node.peerId}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onCopyRpc && (
            <Button variant="outline" size="sm" onClick={onCopyRpc} className="flex-1">
              Copy RPC URL
            </Button>
          )}
          {onRestart && (
            <Button variant="secondary" size="sm" onClick={onRestart}>
              Restart Node
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
