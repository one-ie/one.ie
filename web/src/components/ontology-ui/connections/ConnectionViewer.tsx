/**
 * ConnectionViewer - Detailed view of a single connection
 *
 * Displays complete connection details including:
 * - From/To things with full info
 * - Connection type and strength
 * - Metadata in structured format
 * - Timeline of changes
 *
 * Design System: Uses 6-token system with detailed layout
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Connection, Thing } from "../types";
import { cn, getConnectionTypeDisplay, formatDate } from "../utils";
import { ArrowRight, Calendar, Edit2, Trash2 } from "lucide-react";

export interface ConnectionViewerProps {
  connection: Connection;
  fromThing?: Thing;
  toThing?: Thing;
  onEdit?: (connection: Connection) => void;
  onDelete?: (connection: Connection) => void;
  className?: string;
}

export function ConnectionViewer({
  connection,
  fromThing,
  toThing,
  onEdit,
  onDelete,
  className,
}: ConnectionViewerProps) {
  const typeDisplay = getConnectionTypeDisplay(connection.type);

  // Strength color using design system tokens
  const getStrengthColor = (strength?: number) => {
    if (!strength) return "bg-background text-font/60";
    if (strength >= 75) return "bg-tertiary/10 text-tertiary border-tertiary/20";
    if (strength >= 50) return "bg-primary/10 text-primary border-primary/20";
    if (strength >= 25) return "bg-secondary/10 text-secondary border-secondary/20";
    return "bg-font/10 text-font/60 border-font/20";
  };

  const strengthLabel = (strength?: number) => {
    if (!strength) return "Not set";
    if (strength >= 75) return "Strong";
    if (strength >= 50) return "Medium";
    if (strength >= 25) return "Weak";
    return "Very weak";
  };

  return (
    <Card className={cn("w-full bg-background p-1 shadow-md rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-font flex items-center gap-2">
                🔗 Connection Details
              </CardTitle>
              <CardDescription className="text-font/60 mt-1">
                {typeDisplay}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(connection)}
                  className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(connection)}
                  className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] text-font/80 hover:text-font"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Flow */}
          <div>
            <h3 className="text-sm font-semibold text-font mb-3">Connection Flow</h3>
            <div className="flex items-center gap-4 p-4 bg-background rounded-md">
              <div className="flex-1 text-center">
                <div className="text-xs text-font/60 mb-1">From</div>
                <div className="font-medium text-font">
                  {fromThing?.name || connection.fromId}
                </div>
                {fromThing && (
                  <div className="text-xs text-font/60 mt-1">{fromThing.type}</div>
                )}
              </div>

              <ArrowRight className="h-6 w-6 text-primary flex-shrink-0" />

              <div className="flex-1 text-center">
                <div className="text-xs text-font/60 mb-1">To</div>
                <div className="font-medium text-font">
                  {toThing?.name || connection.toId}
                </div>
                {toThing && (
                  <div className="text-xs text-font/60 mt-1">{toThing.type}</div>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-font/10" />

          {/* Connection Type */}
          <div>
            <h3 className="text-sm font-semibold text-font mb-2">Type</h3>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {typeDisplay}
            </Badge>
          </div>

          {/* Connection Strength */}
          {connection.strength !== undefined && (
            <>
              <Separator className="bg-font/10" />
              <div>
                <h3 className="text-sm font-semibold text-font mb-3">Strength</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(getStrengthColor(connection.strength))}
                    >
                      {strengthLabel(connection.strength)}
                    </Badge>
                    <span className="text-sm font-medium text-font">
                      {connection.strength}%
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-in-out"
                      style={{ width: `${connection.strength}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          {connection.metadata && Object.keys(connection.metadata).length > 0 && (
            <>
              <Separator className="bg-font/10" />
              <div>
                <h3 className="text-sm font-semibold text-font mb-3">Metadata</h3>
                <div className="space-y-2">
                  {Object.entries(connection.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between p-2 bg-background rounded-sm"
                    >
                      <span className="text-sm font-medium text-font/80 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-font/60 ml-4 text-right">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator className="bg-font/10" />
          <div>
            <h3 className="text-sm font-semibold text-font mb-3">Timeline</h3>
            <div className="space-y-2 text-sm text-font/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(connection.createdAt)}</span>
              </div>
              {connection.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {formatDate(connection.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
