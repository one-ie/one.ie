/**
 * Delegate Component
 *
 * Delegate voting power to another address.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export interface DelegateData {
  address: string;
  name?: string;
  avatar?: string;
  votingPower: number;
  proposals: number;
  participationRate: number;
}

interface DelegateProps {
  userVotingPower: number;
  currentDelegate?: DelegateData;
  suggestedDelegates?: DelegateData[];
  onDelegate?: (address: string) => Promise<void>;
  onUndelegate?: () => Promise<void>;
  className?: string;
}

export function Delegate({
  userVotingPower,
  currentDelegate,
  suggestedDelegates = [],
  onDelegate,
  onUndelegate,
  className,
}: DelegateProps) {
  const [customAddress, setCustomAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelegate = async (address: string) => {
    if (!onDelegate) return;

    setIsSubmitting(true);
    try {
      await onDelegate(address);
      setCustomAddress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndelegate = async () => {
    if (!onUndelegate) return;

    setIsSubmitting(true);
    try {
      await onUndelegate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDelegated = !!currentDelegate;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Delegate Voting Power</CardTitle>
          <p className="text-font/60 text-sm">
            Delegate your voting power to a trusted representative
          </p>
        </CardHeader>

        {/* Voting Power */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-font/60 text-sm">Your Voting Power</span>
            <Badge variant="secondary" className="font-semibold">
              {userVotingPower.toLocaleString()} votes
            </Badge>
          </div>
        </div>

        {/* Current Delegate */}
        {isDelegated && currentDelegate && (
          <div className="mb-4">
            <Label className="text-font text-sm mb-2 block">Current Delegate</Label>
            <div className="bg-background rounded-md p-3">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentDelegate.avatar} />
                  <AvatarFallback className="bg-primary text-white">
                    {currentDelegate.address.slice(2, 4)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-font font-medium">
                    {currentDelegate.name || `${currentDelegate.address.slice(0, 6)}...${currentDelegate.address.slice(-4)}`}
                  </div>
                  <div className="text-font/60 text-xs font-mono">
                    {currentDelegate.address}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-font/60 text-xs">Power</div>
                  <div className="text-font text-sm font-semibold">
                    {currentDelegate.votingPower.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-font/60 text-xs">Proposals</div>
                  <div className="text-font text-sm font-semibold">
                    {currentDelegate.proposals}
                  </div>
                </div>
                <div>
                  <div className="text-font/60 text-xs">Participation</div>
                  <div className="text-font text-sm font-semibold">
                    {currentDelegate.participationRate}%
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleUndelegate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Undelegating..." : "Undelegate"}
            </Button>
          </div>
        )}

        <Separator className="my-4" />

        {/* Suggested Delegates */}
        {!isDelegated && suggestedDelegates.length > 0 && (
          <div className="mb-4">
            <Label className="text-font text-sm mb-2 block">
              Suggested Delegates
            </Label>
            <div className="space-y-2">
              {suggestedDelegates.map((delegate) => (
                <div
                  key={delegate.address}
                  className="bg-background rounded-md p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={delegate.avatar} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {delegate.address.slice(2, 4)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-font font-medium text-sm">
                        {delegate.name || `${delegate.address.slice(0, 6)}...${delegate.address.slice(-4)}`}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-font/60">
                        <span>{delegate.votingPower.toLocaleString()} power</span>
                        <span>•</span>
                        <span>{delegate.participationRate}% active</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelegate(delegate.address)}
                      disabled={isSubmitting}
                    >
                      Delegate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Address */}
        {!isDelegated && (
          <div>
            <Label htmlFor="delegate-address" className="text-font text-sm mb-2 block">
              Or enter a custom address
            </Label>
            <div className="flex gap-2">
              <Input
                id="delegate-address"
                placeholder="0x..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="bg-background text-font font-mono"
              />
              <Button
                variant="primary"
                onClick={() => handleDelegate(customAddress)}
                disabled={!customAddress || isSubmitting}
              >
                {isSubmitting ? "..." : "Delegate"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
