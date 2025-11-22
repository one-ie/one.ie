/**
 * ConnectionEditor - Edit existing connection
 *
 * Inline editing form for updating connection properties:
 * - Connection type
 * - Strength
 * - Metadata
 *
 * Design System: Uses 6-token system with form validation
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Connection, ConnectionType } from "../types";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { cn } from "../utils";

export interface ConnectionEditorProps {
  connection: Connection;
  onSave?: (updatedConnection: Partial<Connection>) => void;
  onCancel?: () => void;
  className?: string;
}

export function ConnectionEditor({
  connection,
  onSave,
  onCancel,
  className,
}: ConnectionEditorProps) {
  const [connectionType, setConnectionType] = useState<ConnectionType>(connection.type);
  const [strength, setStrength] = useState<number>(connection.strength ?? 50);
  const [metadata, setMetadata] = useState<Record<string, string>>(
    connection.metadata || {}
  );
  const [metadataKey, setMetadataKey] = useState("");
  const [metadataValue, setMetadataValue] = useState("");

  const handleAddMetadata = () => {
    if (metadataKey && metadataValue) {
      setMetadata({ ...metadata, [metadataKey]: metadataValue });
      setMetadataKey("");
      setMetadataValue("");
    }
  };

  const handleRemoveMetadata = (key: string) => {
    const updated = { ...metadata };
    delete updated[key];
    setMetadata(updated);
  };

  const handleSave = () => {
    const updatedConnection: Partial<Connection> = {
      type: connectionType,
      strength,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      updatedAt: Date.now(),
    };

    onSave?.(updatedConnection);
  };

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <CardTitle className="text-font">Edit Connection</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Type */}
          <div className="space-y-2">
            <Label className="text-font">Connection Type</Label>
            <ConnectionTypeSelector
              value={connectionType}
              onChange={setConnectionType}
            />
          </div>

          {/* Strength Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-font">Connection Strength</Label>
              <span className="text-sm font-medium text-primary">{strength}%</span>
            </div>
            <Slider
              value={[strength]}
              onValueChange={(values) => setStrength(values[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Metadata Editor */}
          <div className="space-y-3">
            <Label className="text-font">Metadata</Label>

            {/* Existing metadata */}
            {Object.entries(metadata).length > 0 && (
              <div className="space-y-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2 bg-background rounded-sm"
                  >
                    <span className="text-sm font-medium flex-1 text-font">
                      {key}: {value}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMetadata(key)}
                      className="hover:bg-font/10 transition-colors duration-150"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add metadata */}
            <div className="flex gap-2">
              <Input
                placeholder="Key"
                value={metadataKey}
                onChange={(e) => setMetadataKey(e.target.value)}
                className="bg-foreground text-font border-font/20 focus:ring-2 focus:ring-primary"
              />
              <Input
                placeholder="Value"
                value={metadataValue}
                onChange={(e) => setMetadataValue(e.target.value)}
                className="bg-foreground text-font border-font/20 focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleAddMetadata}
                variant="outline"
                className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Save Changes
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
