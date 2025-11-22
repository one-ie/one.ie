/**
 * VerifySignature Component
 *
 * Verify message signatures.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface VerifySignatureProps {
  onVerify?: (message: string, signature: string, address?: string) => Promise<{
    valid: boolean;
    recoveredAddress?: string;
  }>;
  className?: string;
}

export function VerifySignature({ onVerify, className }: VerifySignatureProps) {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [expectedAddress, setExpectedAddress] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    recoveredAddress?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!message || !signature || !onVerify) return;

    setIsVerifying(true);
    setResult(null);
    try {
      const verifyResult = await onVerify(
        message,
        signature,
        expectedAddress || undefined
      );
      setResult(verifyResult);
    } catch (error: any) {
      setResult({ valid: false });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Verify Signature</CardTitle>
          <p className="text-font/60 text-sm">
            Verify a cryptographic signature
          </p>
        </CardHeader>

        {/* Message Input */}
        <div className="mb-4">
          <Label htmlFor="verify-message" className="text-font text-sm mb-2 block">
            Original Message
          </Label>
          <Textarea
            id="verify-message"
            placeholder="Enter the original message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="bg-background text-font"
          />
        </div>

        {/* Signature Input */}
        <div className="mb-4">
          <Label htmlFor="signature" className="text-font text-sm mb-2 block">
            Signature
          </Label>
          <Textarea
            id="signature"
            placeholder="0x..."
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={2}
            className="bg-background text-font font-mono"
          />
        </div>

        {/* Expected Address (optional) */}
        <div className="mb-4">
          <Label htmlFor="address" className="text-font text-sm mb-2 block">
            Expected Address (optional)
          </Label>
          <Input
            id="address"
            placeholder="0x..."
            value={expectedAddress}
            onChange={(e) => setExpectedAddress(e.target.value)}
            className="bg-background text-font font-mono"
          />
          <p className="text-font/60 text-xs mt-1">
            Leave empty to recover signer address
          </p>
        </div>

        {/* Verify Button */}
        <Button
          variant="primary"
          className="w-full mb-4"
          onClick={handleVerify}
          disabled={!message || !signature || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Signature"}
        </Button>

        {/* Result */}
        {result && (
          <div
            className={`rounded-md p-4 ${
              result.valid
                ? "bg-tertiary/10 border border-tertiary/20"
                : "bg-destructive/10 border border-destructive/20"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-font font-medium">Verification Result</span>
              <Badge
                className={
                  result.valid
                    ? "bg-tertiary text-white"
                    : "bg-destructive text-white"
                }
              >
                {result.valid ? "✓ Valid" : "✗ Invalid"}
              </Badge>
            </div>

            {result.recoveredAddress && (
              <div>
                <div className="text-font/60 text-xs mb-1">Recovered Address</div>
                <div className="text-font font-mono text-sm break-all">
                  {result.recoveredAddress}
                </div>
                {expectedAddress &&
                  result.recoveredAddress.toLowerCase() !==
                    expectedAddress.toLowerCase() && (
                    <p className="text-destructive text-xs mt-2">
                      ⚠️ Recovered address does not match expected address
                    </p>
                  )}
              </div>
            )}

            {!result.valid && (
              <p className="text-font/60 text-sm">
                The signature could not be verified. Please check that the
                message, signature, and address are correct.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
