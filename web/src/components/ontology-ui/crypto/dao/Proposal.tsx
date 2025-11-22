/**
 * Proposal Component
 *
 * Displays a governance proposal with voting interface and timeline.
 * Uses 6-token design system with progress bars and status badges.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface ProposalData {
  id: string;
  title: string;
  description: string;
  proposer: {
    address: string;
    name?: string;
    avatar?: string;
  };
  status: "active" | "passed" | "failed" | "executed" | "pending";
  votesFor: number;
  votesAgainst: number;
  votesAbstain?: number;
  totalVotes: number;
  quorum: number;
  startTime: Date;
  endTime: Date;
  executionTime?: Date;
  userVote?: "for" | "against" | "abstain";
  userVotingPower?: number;
}

interface ProposalProps {
  proposal: ProposalData;
  onVote?: (proposalId: string, vote: "for" | "against" | "abstain") => void;
  onViewDetails?: (proposalId: string) => void;
  className?: string;
}

export function Proposal({
  proposal,
  onVote,
  onViewDetails,
  className,
}: ProposalProps) {
  const now = new Date();
  const isActive = proposal.status === "active" && now < proposal.endTime;
  const hasVoted = !!proposal.userVote;

  // Calculate percentages
  const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100 || 0;
  const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100 || 0;
  const abstainPercentage = ((proposal.votesAbstain || 0) / proposal.totalVotes) * 100 || 0;
  const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100;

  // Status colors
  const statusColors: Record<string, string> = {
    active: "bg-secondary text-white",
    passed: "bg-tertiary text-white",
    failed: "bg-destructive text-white",
    executed: "bg-primary text-white",
    pending: "bg-background text-font",
  };

  // Time remaining
  const getTimeRemaining = () => {
    if (!isActive) return null;
    const diff = proposal.endTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Ending soon";
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-font font-semibold text-lg mb-1">
              {proposal.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[proposal.status]}>
                {proposal.status}
              </Badge>
              {isActive && (
                <span className="text-font/60 text-xs">
                  {getTimeRemaining()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Proposer */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={proposal.proposer.avatar} />
            <AvatarFallback className="bg-primary text-white text-xs">
              {proposal.proposer.address.slice(2, 4)}
            </AvatarFallback>
          </Avatar>
          <span className="text-font/60 text-xs">
            Proposed by {proposal.proposer.name || `${proposal.proposer.address.slice(0, 6)}...${proposal.proposer.address.slice(-4)}`}
          </span>
        </div>

        {/* Description */}
        <p className="text-font/80 text-sm mb-4 line-clamp-3">
          {proposal.description}
        </p>

        <Separator className="my-4" />

        {/* Voting Results */}
        <div className="space-y-3 mb-4">
          {/* For */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-font/60">For</span>
              <span className="text-font font-medium">
                {forPercentage.toFixed(1)}% ({proposal.votesFor.toLocaleString()} votes)
              </span>
            </div>
            <Progress value={forPercentage} className="h-2 bg-background">
              <div className="h-full bg-tertiary rounded-full transition-all duration-300" style={{ width: `${forPercentage}%` }} />
            </Progress>
          </div>

          {/* Against */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-font/60">Against</span>
              <span className="text-font font-medium">
                {againstPercentage.toFixed(1)}% ({proposal.votesAgainst.toLocaleString()} votes)
              </span>
            </div>
            <Progress value={againstPercentage} className="h-2 bg-background">
              <div className="h-full bg-destructive rounded-full transition-all duration-300" style={{ width: `${againstPercentage}%` }} />
            </Progress>
          </div>

          {/* Abstain (if exists) */}
          {(proposal.votesAbstain || 0) > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-font/60">Abstain</span>
                <span className="text-font font-medium">
                  {abstainPercentage.toFixed(1)}% ({proposal.votesAbstain?.toLocaleString()} votes)
                </span>
              </div>
              <Progress value={abstainPercentage} className="h-2 bg-background">
                <div className="h-full bg-secondary rounded-full transition-all duration-300" style={{ width: `${abstainPercentage}%` }} />
              </Progress>
            </div>
          )}

          {/* Quorum */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-font/60">Quorum</span>
              <span className={`font-medium ${quorumPercentage >= 100 ? "text-tertiary" : "text-font"}`}>
                {quorumPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(quorumPercentage, 100)} className="h-2 bg-background">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(quorumPercentage, 100)}%` }} />
            </Progress>
          </div>
        </div>

        {/* User voting status */}
        {hasVoted && (
          <div className="bg-background rounded-md p-3 mb-4">
            <p className="text-font text-sm">
              You voted <span className="font-semibold capitalize">{proposal.userVote}</span>
              {proposal.userVotingPower && (
                <span className="text-font/60"> with {proposal.userVotingPower.toLocaleString()} votes</span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isActive && !hasVoted ? (
            <>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => onVote?.(proposal.id, "for")}
              >
                Vote For
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onVote?.(proposal.id, "against")}
              >
                Vote Against
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails?.(proposal.id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
