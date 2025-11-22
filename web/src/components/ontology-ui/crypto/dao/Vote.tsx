/**
 * Vote Component
 *
 * Voting interface with vote type selection and voting power display.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VoteProps {
  proposalId: string;
  proposalTitle: string;
  userVotingPower: number;
  currentVote?: "for" | "against" | "abstain";
  onSubmitVote?: (
    proposalId: string,
    vote: "for" | "against" | "abstain",
    reason?: string
  ) => Promise<void>;
  allowReason?: boolean;
  className?: string;
}

export function Vote({
  proposalId,
  proposalTitle,
  userVotingPower,
  currentVote,
  onSubmitVote,
  allowReason = true,
  className,
}: VoteProps) {
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | "abstain" | "">(
    currentVote || ""
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedVote || !onSubmitVote) return;

    setIsSubmitting(true);
    try {
      await onSubmitVote(proposalId, selectedVote, reason || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasVoted = !!currentVote;
  const canChangeVote = hasVoted && currentVote !== selectedVote;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Cast Your Vote</CardTitle>
          <p className="text-font/60 text-sm">{proposalTitle}</p>
        </CardHeader>

        {/* Voting Power Display */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-font/60 text-sm">Your Voting Power</span>
            <Badge variant="secondary" className="font-semibold">
              {userVotingPower.toLocaleString()} votes
            </Badge>
          </div>
        </div>

        {/* Vote Options */}
        <RadioGroup
          value={selectedVote}
          onValueChange={(value: any) => setSelectedVote(value)}
          className="space-y-3 mb-4"
          disabled={hasVoted && !canChangeVote}
        >
          <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:border-tertiary transition-colors cursor-pointer">
            <RadioGroupItem value="for" id="for" />
            <Label htmlFor="for" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-font font-medium">Vote For</span>
                <Badge className="bg-tertiary text-white">Support</Badge>
              </div>
              <p className="text-font/60 text-xs mt-1">
                I support this proposal
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:border-destructive transition-colors cursor-pointer">
            <RadioGroupItem value="against" id="against" />
            <Label htmlFor="against" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-font font-medium">Vote Against</span>
                <Badge className="bg-destructive text-white">Oppose</Badge>
              </div>
              <p className="text-font/60 text-xs mt-1">
                I oppose this proposal
              </p>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-md border-2 border-transparent hover:border-secondary transition-colors cursor-pointer">
            <RadioGroupItem value="abstain" id="abstain" />
            <Label htmlFor="abstain" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-font font-medium">Abstain</span>
                <Badge className="bg-secondary text-white">Neutral</Badge>
              </div>
              <p className="text-font/60 text-xs mt-1">
                I acknowledge but don't vote either way
              </p>
            </Label>
          </div>
        </RadioGroup>

        {/* Reason (optional) */}
        {allowReason && (
          <div className="mb-4">
            <Label htmlFor="reason" className="text-font text-sm mb-2 block">
              Reason (optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Share why you're voting this way..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="bg-background text-font"
              disabled={hasVoted && !canChangeVote}
            />
          </div>
        )}

        {/* Current vote status */}
        {hasVoted && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mb-4">
            <p className="text-font text-sm">
              You previously voted <span className="font-semibold capitalize">{currentVote}</span>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleSubmit}
          disabled={!selectedVote || isSubmitting || (hasVoted && !canChangeVote)}
        >
          {isSubmitting
            ? "Submitting..."
            : hasVoted && canChangeVote
            ? "Change Vote"
            : hasVoted
            ? "Already Voted"
            : "Submit Vote"}
        </Button>
      </CardContent>
    </Card>
  );
}
