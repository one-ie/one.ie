/**
 * DAOCard Component
 *
 * Displays DAO information with governance metrics.
 * Uses 6-token design system with thing-level branding support.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface DAO {
  id: string;
  name: string;
  description: string;
  logo?: string;
  tokenSymbol: string;
  totalMembers: number;
  totalProposals: number;
  activeProposals: number;
  treasuryValue: string;
  votingPower?: string;
  category?: string;
}

interface DAOCardProps {
  dao: DAO;
  onViewDetails?: (id: string) => void;
  onJoin?: (id: string) => void;
  isMember?: boolean;
  className?: string;
}

export function DAOCard({
  dao,
  onViewDetails,
  onJoin,
  isMember = false,
  className,
}: DAOCardProps) {
  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md hover:shadow-md transition-all duration-300 ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        {/* Header with logo and name */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={dao.logo} alt={dao.name} />
            <AvatarFallback className="bg-primary text-white">
              {dao.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-font font-semibold text-lg truncate">
              {dao.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {dao.tokenSymbol}
              </Badge>
              {dao.category && (
                <Badge variant="outline" className="text-xs">
                  {dao.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-font/80 text-sm mb-4 line-clamp-2">
          {dao.description}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Members</div>
            <div className="text-font font-semibold">
              {dao.totalMembers.toLocaleString()}
            </div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Treasury</div>
            <div className="text-font font-semibold">{dao.treasuryValue}</div>
          </div>
          <div className="bg-background rounded-md p-3">
            <div className="text-font/60 text-xs mb-1">Proposals</div>
            <div className="text-font font-semibold">
              {dao.totalProposals}
              {dao.activeProposals > 0 && (
                <span className="text-tertiary text-xs ml-1">
                  ({dao.activeProposals} active)
                </span>
              )}
            </div>
          </div>
          {dao.votingPower && (
            <div className="bg-background rounded-md p-3">
              <div className="text-font/60 text-xs mb-1">Your Power</div>
              <div className="text-font font-semibold">{dao.votingPower}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(dao.id)}
          >
            View DAO
          </Button>
          {!isMember && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onJoin?.(dao.id)}
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
