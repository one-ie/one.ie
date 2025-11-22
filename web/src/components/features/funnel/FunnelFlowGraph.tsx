/**
 * FunnelFlowGraph - Horizontal funnel step visualization
 *
 * Features:
 * - Horizontal left-to-right flow
 * - Conversion rates on edges
 * - Click nodes to edit
 * - Drag to reorder steps
 * - Responsive design
 */

import React, { useState, useRef, useEffect } from "react";
import type { Thing, Connection } from "@/components/ontology-ui/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ontology-ui/utils";
import { GripVertical, Edit, Trash2, Plus } from "lucide-react";

interface FunnelStep extends Thing {
  order: number;
  conversionRate?: number;
  visitors?: number;
  conversions?: number;
}

interface FunnelFlowGraphProps {
  steps: FunnelStep[];
  onStepClick?: (step: FunnelStep) => void;
  onStepReorder?: (fromIndex: number, toIndex: number) => void;
  onStepDelete?: (stepId: string) => void;
  onAddStep?: () => void;
  className?: string;
  showMetrics?: boolean;
  editable?: boolean;
}

interface DragState {
  isDragging: boolean;
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

export function FunnelFlowGraph({
  steps,
  onStepClick,
  onStepReorder,
  onStepDelete,
  onAddStep,
  className,
  showMetrics = true,
  editable = true,
}: FunnelFlowGraphProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
  });

  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  // Calculate conversion rates between steps
  const getConversionRate = (fromStep: FunnelStep, toStep: FunnelStep): number => {
    if (!fromStep.visitors || !toStep.visitors) return 0;
    return (toStep.visitors / fromStep.visitors) * 100;
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!editable) return;
    e.dataTransfer.effectAllowed = "move";
    setDragState({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: null,
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!editable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragState((prev) => ({
      ...prev,
      dragOverIndex: index,
    }));
  };

  const handleDragEnd = () => {
    const { draggedIndex, dragOverIndex } = dragState;

    if (
      draggedIndex !== null &&
      dragOverIndex !== null &&
      draggedIndex !== dragOverIndex &&
      onStepReorder
    ) {
      onStepReorder(draggedIndex, dragOverIndex);
    }

    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragEnd();
  };

  if (sortedSteps.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Funnel Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No funnel steps yet</p>
            {onAddStep && (
              <Button onClick={onAddStep}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Step
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Funnel Flow</CardTitle>
          {onAddStep && (
            <Button variant="outline" size="sm" onClick={onAddStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Horizontal flow container */}
          <div className="flex items-center gap-0 overflow-x-auto pb-4">
            {sortedSteps.map((step, index) => (
              <React.Fragment key={step._id}>
                {/* Step Node */}
                <div
                  className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    dragState.draggedIndex === index && "opacity-50",
                    dragState.dragOverIndex === index && "scale-105"
                  )}
                  draggable={editable}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                >
                  <div
                    className={cn(
                      "relative group w-48 p-4 rounded-lg border-2 bg-background transition-all cursor-pointer",
                      "hover:shadow-lg hover:border-primary",
                      editable && "hover:cursor-grab active:cursor-grabbing"
                    )}
                    onClick={() => onStepClick?.(step)}
                  >
                    {/* Drag handle */}
                    {editable && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    {/* Step number badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>

                    {/* Step content */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {step.name}
                      </h4>

                      {showMetrics && (
                        <div className="space-y-1 text-xs">
                          {step.visitors !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Visitors:</span>
                              <span className="font-medium">{step.visitors.toLocaleString()}</span>
                            </div>
                          )}
                          {step.conversions !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Conversions:</span>
                              <span className="font-medium">{step.conversions.toLocaleString()}</span>
                            </div>
                          )}
                          {step.conversionRate !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rate:</span>
                              <Badge variant="secondary" className="text-xs">
                                {step.conversionRate.toFixed(1)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      {editable && (
                        <div className="flex gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStepClick?.(step);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {onStepDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStepDelete(step._id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow connector (between steps) */}
                {index < sortedSteps.length - 1 && (
                  <div className="flex-shrink-0 flex flex-col items-center justify-center px-2 min-w-[80px]">
                    {/* Arrow */}
                    <svg
                      width="60"
                      height="20"
                      viewBox="0 0 60 20"
                      className="text-muted-foreground"
                    >
                      <defs>
                        <marker
                          id="arrowhead-funnel"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3, 0 6"
                            fill="currentColor"
                          />
                        </marker>
                      </defs>
                      <line
                        x1="0"
                        y1="10"
                        x2="60"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead-funnel)"
                      />
                    </svg>

                    {/* Conversion rate */}
                    {showMetrics && (
                      <div className="mt-1 text-xs font-medium text-center">
                        {getConversionRate(
                          sortedSteps[index],
                          sortedSteps[index + 1]
                        ).toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Overall metrics */}
          {showMetrics && sortedSteps.length > 1 && (
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Steps</p>
                  <p className="text-2xl font-bold">{sortedSteps.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Starting Visitors</p>
                  <p className="text-2xl font-bold">
                    {sortedSteps[0]?.visitors?.toLocaleString() || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Overall Conversion</p>
                  <p className="text-2xl font-bold">
                    {sortedSteps[0]?.visitors && sortedSteps[sortedSteps.length - 1]?.conversions
                      ? (
                          (sortedSteps[sortedSteps.length - 1].conversions /
                            sortedSteps[0].visitors) *
                          100
                        ).toFixed(1)
                      : "—"}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
