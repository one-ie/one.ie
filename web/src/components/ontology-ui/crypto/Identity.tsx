/**
 * Identity Component
 *
 * Decentralized identity management and verification.
 * Uses 6-token design system.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export interface IdentityData {
  address: string;
  did?: string;
  ensName?: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  verifications: {
    type: string;
    verified: boolean;
    verifier?: string;
    timestamp?: Date;
  }[];
  credentials: {
    id: string;
    type: string;
    issuer: string;
    issuedAt: Date;
  }[];
}

interface IdentityProps {
  identity: IdentityData;
  onVerify?: (type: string) => void;
  onManageCredentials?: () => void;
  className?: string;
}

export function Identity({
  identity,
  onVerify,
  onManageCredentials,
  className,
}: IdentityProps) {
  const verifiedCount = identity.verifications.filter((v) => v.verified).length;

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-start gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={identity.avatar} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {(identity.displayName || identity.ensName || identity.address)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-font text-xl">
                {identity.displayName || identity.ensName || "Anonymous"}
              </CardTitle>
              {identity.did && (
                <div className="text-font/60 text-xs font-mono mt-1">
                  {identity.did}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                {identity.ensName && (
                  <Badge variant="secondary">{identity.ensName}</Badge>
                )}
                <Badge className="bg-tertiary text-white">
                  {verifiedCount} verified
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Bio */}
        {identity.bio && (
          <p className="text-font text-sm mb-4">{identity.bio}</p>
        )}

        {/* Address */}
        <div className="bg-background rounded-md p-3 mb-4">
          <div className="text-font/60 text-xs mb-1">Wallet Address</div>
          <div className="text-font font-mono text-sm break-all">
            {identity.address}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Verifications */}
        <div className="mb-4">
          <h4 className="text-font font-medium mb-3">Verifications</h4>
          <div className="space-y-2">
            {identity.verifications.map((verification, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-background rounded-md"
              >
                <div className="flex-1">
                  <div className="text-font font-medium text-sm capitalize">
                    {verification.type}
                  </div>
                  {verification.verifier && (
                    <div className="text-font/60 text-xs">
                      by {verification.verifier}
                    </div>
                  )}
                </div>
                {verification.verified ? (
                  <Badge className="bg-tertiary text-white">✓ Verified</Badge>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onVerify?.(verification.type)}
                  >
                    Verify
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Credentials */}
        {identity.credentials.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="mb-4">
              <h4 className="text-font font-medium mb-3">
                Credentials ({identity.credentials.length})
              </h4>
              <div className="space-y-2">
                {identity.credentials.slice(0, 3).map((credential) => (
                  <div
                    key={credential.id}
                    className="p-3 bg-background rounded-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-font font-medium text-sm">
                        {credential.type}
                      </span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="text-font/60 text-xs">
                      Issued by {credential.issuer} on{" "}
                      {credential.issuedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {identity.credentials.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={onManageCredentials}
                  >
                    View all {identity.credentials.length} credentials
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onManageCredentials}
          >
            Manage Identity
          </Button>
          <Button variant="outline" size="sm">
            Share Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
