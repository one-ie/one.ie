/**
 * ConnectionCreator - Form for creating connections between things
 *
 * Provides a comprehensive form to create relationships with:
 * - Thing selectors (searchable)
 * - Connection type picker
 * - Metadata editor
 * - Strength indicator
 *
 * Design System: Uses 6-token system with proper form states
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type { Connection, ConnectionType, Thing, FormProps } from "../types";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { getThingTypeIcon, cn } from "../utils";

interface ConnectionCreatorProps extends FormProps {
  fromThing?: Thing;
  toThing?: Thing;
  things?: Thing[];
  onSubmit?: (data: Partial<Connection>) => void;
  onCancel?: () => void;
}

export function ConnectionCreator({
  fromThing,
  toThing,
  things = [],
  onSubmit,
  onCancel,
  initialData,
  mode = "create",
  className,
}: ConnectionCreatorProps) {
  const [selectedFrom, setSelectedFrom] = useState<Thing | undefined>(fromThing);
  const [selectedTo, setSelectedTo] = useState<Thing | undefined>(toThing);
  const [connectionType, setConnectionType] = useState<ConnectionType | undefined>(
    initialData?.type
  );
  const [strength, setStrength] = useState<number>(initialData?.strength ?? 50);
  const [metadata, setMetadata] = useState<Record<string, string>>(
    initialData?.metadata || {}
  );
  const [metadataKey, setMetadataKey] = useState("");
  const [metadataValue, setMetadataValue] = useState("");

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

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

  const handleSubmit = () => {
    if (!selectedFrom || !selectedTo || !connectionType) {
      alert("Please select both things and a connection type");
      return;
    }

    const data: Partial<Connection> = {
      type: connectionType,
      fromId: selectedFrom._id,
      toId: selectedTo._id,
      strength,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      createdAt: Date.now(),
    };

    onSubmit?.(data);
  };

  const ThingSelector = ({
    selected,
    onSelect,
    open,
    onOpenChange,
    label,
    disabled,
  }: {
    selected?: Thing;
    onSelect: (thing: Thing) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    label: string;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className="text-font">{label}</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between bg-foreground text-font border-font/20 hover:bg-background transition-all duration-150",
              !selected && "text-font/60"
            )}
          >
            {selected ? (
              <span className="flex items-center gap-2">
                <span>{getThingTypeIcon(selected.type)}</span>
                <span className="truncate">{selected.name}</span>
              </span>
            ) : (
              "Select thing..."
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-foreground shadow-lg">
          <Command className="bg-foreground">
            <CommandInput
              placeholder="Search things..."
              className="bg-foreground text-font"
            />
            <CommandEmpty className="text-font/60">No things found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {things.map((thing) => (
                <CommandItem
                  key={thing._id}
                  onSelect={() => {
                    onSelect(thing);
                    onOpenChange(false);
                  }}
                  className="text-font hover:bg-background transition-colors duration-150"
                >
                  <span className="mr-2">{getThingTypeIcon(thing.type)}</span>
                  <span className="flex-1 truncate">{thing.name}</span>
                  <span className="text-xs text-font/60 ml-2">
                    {thing.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <CardTitle className="text-font">
            {mode === "create" ? "Create Connection" : "Edit Connection"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* From Thing Selector */}
          <ThingSelector
            selected={selectedFrom}
            onSelect={setSelectedFrom}
            open={fromOpen}
            onOpenChange={setFromOpen}
            label="From Thing"
            disabled={!!fromThing}
          />

          {/* Connection Type */}
          <div className="space-y-2">
            <Label className="text-font">Connection Type</Label>
            <ConnectionTypeSelector
              value={connectionType}
              onChange={setConnectionType}
            />
          </div>

          {/* To Thing Selector */}
          <ThingSelector
            selected={selectedTo}
            onSelect={setSelectedTo}
            open={toOpen}
            onOpenChange={setToOpen}
            label="To Thing"
            disabled={!!toThing}
          />

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
            <Label className="text-font">Metadata (Optional)</Label>

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
            onClick={handleSubmit}
            className="transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            {mode === "create" ? "Create Connection" : "Update Connection"}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
