/**
 * Member Component
 *
 * Displays DAO member profile with voting history and participation.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export interface MemberData {
  address: string;
  name?: string;
  avatar?: string;
  joinedDate: Date;
  votingPower: number;
  delegatedPower?: number;
  proposalsCreated: number;
  votesParticipated: number;
  totalProposals: number;
  role?: string;
}

interface MemberProps {
  member: MemberData;
  onViewProfile?: (address: string) => void;
  className?: string;
}

export function Member({ member, onViewProfile, className }: MemberProps) {
  const participationRate =
    member.totalProposals > 0
      ? (member.votesParticipated / member.totalProposals) * 100
      : 0;

  return (
    <Card
      className={`bg-background p-1 shadow-sm rounded-md hover:shadow-md transition-all duration-300 cursor-pointer ${className || ""}`}
      onClick={() => onViewProfile?.(member.address)}
    >
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Profile Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className="bg-primary text-white">
              {member.address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-font font-semibold truncate">
              {member.name ||
                `${member.address.slice(0, 6)}...${member.address.slice(-4)}`}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {member.role && (
                <Badge variant="secondary" className="text-xs">
                  {member.role}
                </Badge>
              )}
              <span className="text-font/60 text-xs">
                Joined {member.joinedDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Voting Power */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-background rounded-md p-2.5">
            <div className="text-font/60 text-xs mb-1">Voting Power</div>
            <div className="text-font font-semibold text-sm">
              {member.votingPower.toLocaleString()}
            </div>
          </div>
          {member.delegatedPower !== undefined && member.delegatedPower > 0 && (
            <div className="bg-background rounded-md p-2.5">
              <div className="text-font/60 text-xs mb-1">Delegated</div>
              <div className="text-font font-semibold text-sm">
                {member.delegatedPower.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Participation */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-font/60">Participation Rate</span>
            <span className="text-font font-medium">
              {participationRate.toFixed(0)}%
            </span>
          </div>
          <Progress value={participationRate} className="h-2 bg-background">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-300"
              style={{ width: `${participationRate}%` }}
            />
          </Progress>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-background rounded-md p-2">
            <div className="text-font/60 text-xs">Proposals</div>
            <div className="text-font font-semibold">
              {member.proposalsCreated}
            </div>
          </div>
          <div className="bg-background rounded-md p-2">
            <div className="text-font/60 text-xs">Votes Cast</div>
            <div className="text-font font-semibold">
              {member.votesParticipated}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
