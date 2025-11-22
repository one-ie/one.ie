/**
 * Attestation Component
 *
 * Create and view on-chain attestations.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface AttestationData {
  id: string;
  schema: string;
  recipient: string;
  attester: string;
  data: Record<string, any>;
  timestamp: Date;
  revoked?: boolean;
  expirationTime?: Date;
}

interface AttestationProps {
  onCreateAttestation?: (data: {
    recipient: string;
    schema: string;
    data: Record<string, any>;
  }) => Promise<string>;
  onViewAttestation?: (id: string) => Promise<AttestationData | null>;
  className?: string;
}

export function Attestation({
  onCreateAttestation,
  onViewAttestation,
  className,
}: AttestationProps) {
  const [mode, setMode] = useState<"create" | "view">("create");
  const [recipient, setRecipient] = useState("");
  const [schema, setSchema] = useState("");
  const [attestationData, setAttestationData] = useState("");
  const [attestationId, setAttestationId] = useState("");
  const [viewedAttestation, setViewedAttestation] =
    useState<AttestationData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [createdId, setCreatedId] = useState("");

  const handleCreate = async () => {
    if (!recipient || !schema || !attestationData || !onCreateAttestation)
      return;

    setIsCreating(true);
    setCreatedId("");

    try {
      const data = JSON.parse(attestationData);
      const id = await onCreateAttestation({ recipient, schema, data });
      setCreatedId(id);
    } catch (error) {
      console.error("Failed to create attestation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleView = async () => {
    if (!attestationId || !onViewAttestation) return;

    setIsViewing(true);
    setViewedAttestation(null);

    try {
      const attestation = await onViewAttestation(attestationId);
      setViewedAttestation(attestation);
    } catch (error) {
      console.error("Failed to view attestation:", error);
    } finally {
      setIsViewing(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Attestations</CardTitle>
          <p className="text-font/60 text-sm">
            Create and verify on-chain attestations
          </p>
        </CardHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4 bg-background rounded-md p-1">
          <Button
            variant={mode === "create" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("create")}
          >
            Create
          </Button>
          <Button
            variant={mode === "view" ? "primary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setMode("view")}
          >
            View
          </Button>
        </div>

        {/* Create Mode */}
        {mode === "create" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="recipient" className="text-font text-sm mb-2 block">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-background font-mono"
              />
            </div>

            <div>
              <Label htmlFor="schema" className="text-font text-sm mb-2 block">
                Schema ID
              </Label>
              <Input
                id="schema"
                placeholder="Enter schema ID..."
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="bg-background font-mono"
              />
            </div>

            <div>
              <Label htmlFor="data" className="text-font text-sm mb-2 block">
                Attestation Data (JSON)
              </Label>
              <Textarea
                id="data"
                placeholder='{"key": "value"}'
                value={attestationData}
                onChange={(e) => setAttestationData(e.target.value)}
                rows={4}
                className="bg-background font-mono text-sm"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleCreate}
              disabled={!recipient || !schema || !attestationData || isCreating}
            >
              {isCreating ? "Creating..." : "Create Attestation"}
            </Button>

            {createdId && (
              <div className="bg-tertiary/10 border border-tertiary/20 rounded-md p-3">
                <div className="text-font font-medium text-sm mb-2">
                  ✓ Attestation Created
                </div>
                <div className="text-font font-mono text-xs break-all">
                  ID: {createdId}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode */}
        {mode === "view" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter attestation ID..."
                value={attestationId}
                onChange={(e) => setAttestationId(e.target.value)}
                className="bg-background font-mono"
              />
              <Button
                variant="primary"
                onClick={handleView}
                disabled={!attestationId || isViewing}
              >
                {isViewing ? "..." : "View"}
              </Button>
            </div>

            {viewedAttestation && (
              <div className="bg-background rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-font font-medium">Attestation Details</h4>
                  <Badge
                    className={
                      viewedAttestation.revoked
                        ? "bg-destructive text-white"
                        : "bg-tertiary text-white"
                    }
                  >
                    {viewedAttestation.revoked ? "Revoked" : "Active"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-font/60">Attester: </span>
                    <span className="text-font font-mono text-xs">
                      {viewedAttestation.attester}
                    </span>
                  </div>
                  <div>
                    <span className="text-font/60">Recipient: </span>
                    <span className="text-font font-mono text-xs">
                      {viewedAttestation.recipient}
                    </span>
                  </div>
                  <div>
                    <span className="text-font/60">Schema: </span>
                    <span className="text-font font-mono text-xs">
                      {viewedAttestation.schema}
                    </span>
                  </div>
                  <div>
                    <span className="text-font/60">Created: </span>
                    <span className="text-font">
                      {viewedAttestation.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {viewedAttestation.expirationTime && (
                    <div>
                      <span className="text-font/60">Expires: </span>
                      <span className="text-font">
                        {viewedAttestation.expirationTime.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="text-font/60 text-xs mb-2">Data</div>
                  <pre className="bg-foreground rounded-md p-2 text-font font-mono text-xs overflow-x-auto">
                    {JSON.stringify(viewedAttestation.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
