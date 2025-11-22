/**
 * RelationshipViewer - Panel showing all relationships for an entity
 *
 * Displays all incoming and outgoing connections for a thing
 * with tabs to filter by direction and grouping by connection type
 *
 * Design System: Uses 6-token system with tabs and badges
 */

import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Connection, Thing, ConnectionType } from "../types";
import { ConnectionCard } from "./ConnectionCard";
import { getConnectionTypeDisplay, groupBy, cn } from "../utils";

interface RelationshipViewerProps {
  thing: Thing;
  connections: Connection[];
  things: Thing[];
  className?: string;
}

export function RelationshipViewer({
  thing,
  connections,
  things,
  className,
}: RelationshipViewerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "outgoing" | "incoming">("all");

  // Create lookup map for quick thing access
  const thingMap = useMemo(() => {
    const map = new Map<string, Thing>();
    things.forEach((t) => map.set(t._id, t));
    return map;
  }, [things]);

  // Categorize connections
  const { incoming, outgoing } = useMemo(() => {
    const inc: Connection[] = [];
    const out: Connection[] = [];

    connections.forEach((conn) => {
      if (conn.toId === thing._id) {
        inc.push(conn);
      }
      if (conn.fromId === thing._id) {
        out.push(conn);
      }
    });

    return { incoming: inc, outgoing: out };
  }, [connections, thing._id]);

  // Get active connections based on tab
  const activeConnections = useMemo(() => {
    if (activeTab === "incoming") return incoming;
    if (activeTab === "outgoing") return outgoing;
    return connections;
  }, [activeTab, incoming, outgoing, connections]);

  // Group connections by type
  const groupedConnections = useMemo(() => {
    return groupBy(activeConnections, "type") as Record<ConnectionType, Connection[]>;
  }, [activeConnections]);

  const renderConnectionGroup = (type: ConnectionType, conns: Connection[]) => (
    <div key={type} className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-font">{getConnectionTypeDisplay(type)}</h3>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {conns.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {conns.map((conn) => {
          const fromThing = thingMap.get(conn.fromId);
          const toThing = thingMap.get(conn.toId);

          return (
            <ConnectionCard
              key={conn._id}
              connection={conn}
              fromThing={fromThing}
              toThing={toThing}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className={cn("w-full bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-font">Relationships</CardTitle>
            <Badge variant="outline" className="border-primary/20 text-primary">
              {connections.length} {connections.length === 1 ? "connection" : "connections"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3 bg-background">
              <TabsTrigger value="all" className="data-[state=active]:bg-foreground transition-all duration-150">
                All
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  {connections.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="data-[state=active]:bg-foreground transition-all duration-150">
                Outgoing
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  {outgoing.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="incoming" className="data-[state=active]:bg-foreground transition-all duration-150">
                Incoming
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                  {incoming.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-4">
              {Object.keys(groupedConnections).length === 0 ? (
                <div className="text-center py-8 text-font/60">
                  No connections found
                </div>
              ) : (
                Object.entries(groupedConnections).map(([type, conns]) =>
                  renderConnectionGroup(type as ConnectionType, conns)
                )
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-6 mt-4">
              {outgoing.length === 0 ? (
                <div className="text-center py-8 text-font/60">
                  No outgoing connections
                </div>
              ) : (
                Object.entries(groupBy(outgoing, "type") as Record<ConnectionType, Connection[]>).map(
                  ([type, conns]) => renderConnectionGroup(type as ConnectionType, conns)
                )
              )}
            </TabsContent>

            <TabsContent value="incoming" className="space-y-6 mt-4">
              {incoming.length === 0 ? (
                <div className="text-center py-8 text-font/60">
                  No incoming connections
                </div>
              ) : (
                Object.entries(groupBy(incoming, "type") as Record<ConnectionType, Connection[]>).map(
                  ([type, conns]) => renderConnectionGroup(type as ConnectionType, conns)
                )
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
}
