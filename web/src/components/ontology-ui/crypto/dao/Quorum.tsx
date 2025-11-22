/**
 * Quorum Component
 *
 * Displays quorum progress for a proposal with visual progress bar.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuorumProps {
  currentVotes: number;
  requiredVotes: number;
  proposalId: string;
  status?: "active" | "passed" | "failed";
  compact?: boolean;
  className?: string;
}

export function Quorum({
  currentVotes,
  requiredVotes,
  proposalId,
  status = "active",
  compact = false,
  className,
}: QuorumProps) {
  const percentage = Math.min((currentVotes / requiredVotes) * 100, 100);
  const votesRemaining = Math.max(requiredVotes - currentVotes, 0);
  const hasReachedQuorum = currentVotes >= requiredVotes;

  const statusColors: Record<string, string> = {
    active: hasReachedQuorum ? "bg-tertiary text-white" : "bg-secondary text-white",
    passed: "bg-tertiary text-white",
    failed: "bg-destructive text-white",
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className || ""}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-font/60">Quorum</span>
          <Badge className={statusColors[status]}>
            {percentage.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={percentage} className="h-2 bg-background">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              hasReachedQuorum ? "bg-tertiary" : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </Progress>
        <div className="flex items-center justify-between text-xs text-font/60">
          <span>{currentVotes.toLocaleString()} votes</span>
          <span>{requiredVotes.toLocaleString()} required</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-font font-semibold">Quorum Progress</h3>
          <Badge className={statusColors[status]}>
            {hasReachedQuorum ? "Quorum Reached" : `${percentage.toFixed(1)}%`}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={percentage} className="h-3 bg-background">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hasReachedQuorum ? "bg-tertiary" : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </Progress>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Current</div>
            <div className="text-font font-semibold">
              {currentVotes.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Required</div>
            <div className="text-font font-semibold">
              {requiredVotes.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-3 text-center">
            <div className="text-font/60 text-xs mb-1">Remaining</div>
            <div className={`font-semibold ${hasReachedQuorum ? "text-tertiary" : "text-font"}`}>
              {hasReachedQuorum ? "✓" : votesRemaining.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {hasReachedQuorum ? (
          <div className="bg-tertiary/10 border border-tertiary/20 rounded-md p-3 text-center">
            <p className="text-tertiary text-sm font-medium">
              ✓ Quorum has been reached for this proposal
            </p>
          </div>
        ) : (
          <div className="bg-background rounded-md p-3 text-center">
            <p className="text-font/60 text-sm">
              {votesRemaining.toLocaleString()} more votes needed to reach quorum
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
