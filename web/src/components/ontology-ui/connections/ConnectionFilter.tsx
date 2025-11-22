/**
 * ConnectionFilter - Filter connections by multiple criteria
 *
 * Provides filtering controls for:
 * - Connection type
 * - Strength range
 * - Date range
 * - Thing type (from/to)
 *
 * Design System: Uses 6-token system with collapsible sections
 */

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { ConnectionType } from "../types";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { cn } from "../utils";
import { X } from "lucide-react";

export interface ConnectionFilterOptions {
  types?: ConnectionType[];
  strengthRange?: [number, number];
  dateRange?: [number, number];
  fromThingType?: string;
  toThingType?: string;
}

export interface ConnectionFilterProps {
  onFilterChange?: (filters: ConnectionFilterOptions) => void;
  onClear?: () => void;
  className?: string;
}

export function ConnectionFilter({
  onFilterChange,
  onClear,
  className,
}: ConnectionFilterProps) {
  const [selectedTypes, setSelectedTypes] = useState<ConnectionType[]>([]);
  const [strengthRange, setStrengthRange] = useState<[number, number]>([0, 100]);
  const [fromThingType, setFromThingType] = useState<string>("all");
  const [toThingType, setToThingType] = useState<string>("all");

  const handleTypeAdd = (type: ConnectionType) => {
    if (!selectedTypes.includes(type)) {
      const newTypes = [...selectedTypes, type];
      setSelectedTypes(newTypes);
      applyFilters({ types: newTypes });
    }
  };

  const handleTypeRemove = (type: ConnectionType) => {
    const newTypes = selectedTypes.filter(t => t !== type);
    setSelectedTypes(newTypes);
    applyFilters({ types: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleStrengthChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setStrengthRange(range);
    applyFilters({ strengthRange: range });
  };

  const applyFilters = (partialFilters: Partial<ConnectionFilterOptions>) => {
    const filters: ConnectionFilterOptions = {
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      strengthRange: strengthRange[0] !== 0 || strengthRange[1] !== 100 ? strengthRange : undefined,
      fromThingType: fromThingType !== "all" ? fromThingType : undefined,
      toThingType: toThingType !== "all" ? toThingType : undefined,
      ...partialFilters,
    };

    onFilterChange?.(filters);
  };

  const handleClear = () => {
    setSelectedTypes([]);
    setStrengthRange([0, 100]);
    setFromThingType("all");
    setToThingType("all");
    onClear?.();
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    strengthRange[0] !== 0 ||
    strengthRange[1] !== 100 ||
    fromThingType !== "all" ||
    toThingType !== "all";

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-font">Filter Connections</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-font/60 hover:text-font transition-colors duration-150"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Types */}
          <div className="space-y-3">
            <Label className="text-font">Connection Types</Label>
            <ConnectionTypeSelector
              onChange={handleTypeAdd}
              placeholder="Add connection type..."
            />
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTypes.map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTypeRemove(type)}
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-150"
                  >
                    {type}
                    <X className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Strength Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-font">Strength Range</Label>
              <span className="text-sm text-font/60">
                {strengthRange[0]}% - {strengthRange[1]}%
              </span>
            </div>
            <Slider
              value={strengthRange}
              onValueChange={handleStrengthChange}
              min={0}
              max={100}
              step={5}
              minStepsBetweenThumbs={10}
              className="w-full"
            />
          </div>

          {/* From Thing Type */}
          <div className="space-y-2">
            <Label className="text-font">From Thing Type</Label>
            <Select
              value={fromThingType}
              onValueChange={(value) => {
                setFromThingType(value);
                applyFilters({ fromThingType: value !== "all" ? value : undefined });
              }}
            >
              <SelectTrigger className="bg-foreground text-font border-font/20">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent className="bg-foreground shadow-lg">
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="token">Token</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* To Thing Type */}
          <div className="space-y-2">
            <Label className="text-font">To Thing Type</Label>
            <Select
              value={toThingType}
              onValueChange={(value) => {
                setToThingType(value);
                applyFilters({ toThingType: value !== "all" ? value : undefined });
              }}
            >
              <SelectTrigger className="bg-foreground text-font border-font/20">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent className="bg-foreground shadow-lg">
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="token">Token</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
