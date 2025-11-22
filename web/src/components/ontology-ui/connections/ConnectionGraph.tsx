/**
 * ConnectionGraph - Visual graph of connections
 *
 * Simple SVG-based network visualization showing things (nodes) and connections (edges).
 * Part of CONNECTIONS dimension (ontology-ui)
 *
 * Design System: Uses primary color for nodes, proper elevation and motion
 */

import React, { useMemo } from "react";
import type { Connection, Thing } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, getThingTypeIcon } from "../utils";

interface ConnectionGraphProps {
  connections: Connection[];
  things: Thing[];
  centerThingId?: string;
  className?: string;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  thing: Thing;
  isCentered: boolean;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  connection: Connection;
}

export function ConnectionGraph({
  connections,
  things,
  centerThingId,
  className,
}: ConnectionGraphProps) {
  // Build graph data structure
  const graphData = useMemo(() => {
    const thingMap = new Map(things.map((t) => [t._id, t]));
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Find center thing or use first thing
    const centerId = centerThingId || things[0]?._id;

    // Get all connected thing IDs
    const connectedIds = new Set<string>();
    connections.forEach((conn) => {
      if (conn.fromId === centerId || conn.toId === centerId) {
        connectedIds.add(conn.fromId);
        connectedIds.add(conn.toId);
      }
    });

    // Create nodes
    const nodes: GraphNode[] = [];
    const nodeArray = Array.from(connectedIds)
      .map((id) => thingMap.get(id))
      .filter((thing): thing is Thing => thing !== undefined);

    // Position center node
    const centerThing = thingMap.get(centerId);
    if (centerThing) {
      nodes.push({
        id: centerId,
        x: centerX,
        y: centerY,
        thing: centerThing,
        isCentered: true,
      });
    }

    // Position other nodes in a circle around center
    const radius = 150;
    const otherNodes = nodeArray.filter((t) => t._id !== centerId);
    otherNodes.forEach((thing, index) => {
      const angle = (2 * Math.PI * index) / otherNodes.length;
      nodes.push({
        id: thing._id,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        thing,
        isCentered: false,
      });
    });

    // Create edges
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const edges: GraphEdge[] = connections
      .map((conn) => {
        const from = nodeMap.get(conn.fromId);
        const to = nodeMap.get(conn.toId);
        if (from && to) {
          return { from, to, connection: conn };
        }
        return null;
      })
      .filter((edge): edge is GraphEdge => edge !== null);

    return { nodes, edges, width, height };
  }, [connections, things, centerThingId]);

  if (graphData.nodes.length === 0) {
    return (
      <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
        <div className="bg-foreground rounded-md">
          <CardHeader>
            <CardTitle className="text-font">Connection Graph</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-font/60">
              <p>No connections to display</p>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <CardTitle className="text-font">Connection Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <svg
              width={graphData.width}
              height={graphData.height}
              className="border border-font/10 rounded-lg bg-background"
              viewBox={`0 0 ${graphData.width} ${graphData.height}`}
            >
              {/* Define arrow marker using primary color */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  className="fill-primary"
                >
                  <polygon points="0 0, 10 3, 0 6" />
                </marker>
              </defs>

              {/* Draw edges (connections) */}
              {graphData.edges.map((edge, index) => {
                // Calculate line points (offset for node radius)
                const dx = edge.to.x - edge.from.x;
                const dy = edge.to.y - edge.from.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const nodeRadius = 30;

                const offsetX = (dx / length) * nodeRadius;
                const offsetY = (dy / length) * nodeRadius;

                const x1 = edge.from.x + offsetX;
                const y1 = edge.from.y + offsetY;
                const x2 = edge.to.x - offsetX;
                const y2 = edge.to.y - offsetY;

                return (
                  <g key={`edge-${index}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      className="stroke-primary/40 transition-all duration-300 ease-in-out"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    {/* Connection strength (if available) */}
                    {edge.connection.strength !== undefined && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2}
                        className="fill-font/60 text-xs"
                        textAnchor="middle"
                        dy="-5"
                      >
                        {edge.connection.strength}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw nodes (things) */}
              {graphData.nodes.map((node) => {
                const icon = getThingTypeIcon(node.thing.type);

                return (
                  <g key={`node-${node.id}`} className="transition-all duration-300 ease-in-out">
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="30"
                      className={cn(
                        "stroke-2 transition-all duration-300 ease-in-out",
                        node.isCentered
                          ? "fill-primary stroke-foreground"
                          : "fill-secondary stroke-foreground"
                      )}
                    />

                    {/* Thing icon */}
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-2xl pointer-events-none select-none"
                    >
                      {icon}
                    </text>

                    {/* Thing name (below node) */}
                    <text
                      x={node.x}
                      y={node.y + 45}
                      textAnchor="middle"
                      className={cn(
                        "text-xs pointer-events-none select-none",
                        node.isCentered
                          ? "fill-font font-semibold"
                          : "fill-font/60"
                      )}
                    >
                      {node.thing.name.length > 15
                        ? node.thing.name.substring(0, 12) + "..."
                        : node.thing.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-font/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Centered thing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span>Connected thing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="12">
                <line
                  x1="0"
                  y1="6"
                  x2="24"
                  y2="6"
                  className="stroke-primary"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </svg>
              <span>Connection</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
