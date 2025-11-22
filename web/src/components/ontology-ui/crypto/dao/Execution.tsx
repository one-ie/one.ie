/**
 * Execution Component
 *
 * Displays proposal execution status and actions.
 * Uses 6-token design system with timeline markers.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ExecutionAction {
  target: string;
  value: string;
  signature: string;
  calldata: string;
  description?: string;
}

export interface ExecutionData {
  proposalId: string;
  proposalTitle: string;
  status: "pending" | "queued" | "executing" | "executed" | "cancelled" | "failed";
  queuedAt?: Date;
  executionTime?: Date;
  executedAt?: Date;
  actions: ExecutionAction[];
  executionDelay?: number; // in seconds
  error?: string;
}

interface ExecutionProps {
  execution: ExecutionData;
  onExecute?: (proposalId: string) => Promise<void>;
  onCancel?: (proposalId: string) => Promise<void>;
  canExecute?: boolean;
  canCancel?: boolean;
  className?: string;
}

export function Execution({
  execution,
  onExecute,
  onCancel,
  canExecute = false,
  canCancel = false,
  className,
}: ExecutionProps) {
  const [isExecuting, setIsExecuting] = React.useState(false);

  const handleExecute = async () => {
    if (!onExecute) return;
    setIsExecuting(true);
    try {
      await onExecute(execution.proposalId);
    } finally {
      setIsExecuting(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-secondary text-white",
    queued: "bg-primary text-white",
    executing: "bg-secondary text-white animate-pulse",
    executed: "bg-tertiary text-white",
    cancelled: "bg-destructive text-white",
    failed: "bg-destructive text-white",
  };

  const isExecutable =
    canExecute &&
    execution.status === "queued" &&
    execution.executionTime &&
    new Date() >= execution.executionTime;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-font text-lg">
                Proposal Execution
              </CardTitle>
              <p className="text-font/60 text-sm mt-1">
                {execution.proposalTitle}
              </p>
            </div>
            <Badge className={statusColors[execution.status]}>
              {execution.status}
            </Badge>
          </div>
        </CardHeader>

        {/* Timeline */}
        <div className="space-y-3 mb-4">
          {execution.queuedAt && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <div className="text-font text-sm font-medium">Queued</div>
                <div className="text-font/60 text-xs">
                  {execution.queuedAt.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {execution.executionTime && (
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                  new Date() >= execution.executionTime
                    ? "bg-tertiary"
                    : "bg-background border-2 border-primary"
                }`}
              />
              <div>
                <div className="text-font text-sm font-medium">
                  Ready for Execution
                </div>
                <div className="text-font/60 text-xs">
                  {execution.executionTime.toLocaleString()}
                  {new Date() < execution.executionTime && (
                    <span className="ml-2 text-secondary">
                      (in {Math.ceil(
                        (execution.executionTime.getTime() - Date.now()) /
                          1000 /
                          60
                      )}{" "}
                      minutes)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {execution.executedAt && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-tertiary mt-1.5" />
              <div>
                <div className="text-font text-sm font-medium">Executed</div>
                <div className="text-font/60 text-xs">
                  {execution.executedAt.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="space-y-2 mb-4">
          <h4 className="text-font font-medium text-sm">
            Actions ({execution.actions.length})
          </h4>
          {execution.actions.map((action, index) => (
            <div
              key={index}
              className="bg-background rounded-md p-3 text-sm font-mono"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-font/60">Action {index + 1}</span>
                {action.description && (
                  <span className="text-font text-xs">{action.description}</span>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-font/60">Target: </span>
                  <span className="text-font">{action.target}</span>
                </div>
                <div>
                  <span className="text-font/60">Value: </span>
                  <span className="text-font">{action.value}</span>
                </div>
                <div>
                  <span className="text-font/60">Function: </span>
                  <span className="text-font">{action.signature}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {execution.error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
            <p className="text-destructive text-sm font-medium">
              Execution Failed
            </p>
            <p className="text-font/60 text-xs mt-1">{execution.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isExecutable && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? "Executing..." : "Execute Proposal"}
            </Button>
          )}
          {canCancel && execution.status !== "executed" && execution.status !== "cancelled" && (
            <Button
              variant="outline"
              onClick={() => onCancel?.(execution.proposalId)}
            >
              Cancel
            </Button>
          )}
          {!isExecutable && execution.status === "queued" && (
            <div className="flex-1 bg-background rounded-md p-3 text-center">
              <p className="text-font/60 text-sm">
                Waiting for execution delay to complete
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
