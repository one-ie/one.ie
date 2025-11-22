/**
 * SignMessage Component
 *
 * Sign messages with connected wallet.
 * Uses 6-token design system.
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SignMessageProps {
  walletAddress?: string;
  onSign?: (message: string) => Promise<string>;
  onCopySignature?: (signature: string) => void;
  className?: string;
}

export function SignMessage({
  walletAddress,
  onSign,
  onCopySignature,
  className,
}: SignMessageProps) {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = async () => {
    if (!message || !onSign) return;

    setIsSigning(true);
    setSignature("");
    try {
      const sig = await onSign(message);
      setSignature(sig);
    } catch (error: any) {
      console.error("Signing failed:", error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Card className={`bg-background p-1 shadow-sm rounded-md ${className || ""}`}>
      <CardContent className="bg-foreground p-4 rounded-md">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-font text-lg">Sign Message</CardTitle>
          <p className="text-font/60 text-sm">
            Cryptographically sign a message with your wallet
          </p>
        </CardHeader>

        {/* Wallet Address */}
        {walletAddress && (
          <div className="bg-background rounded-md p-3 mb-4">
            <div className="text-font/60 text-xs mb-1">Signing with</div>
            <div className="text-font font-mono text-sm">{walletAddress}</div>
          </div>
        )}

        {/* Message Input */}
        <div className="mb-4">
          <Label htmlFor="message" className="text-font text-sm mb-2 block">
            Message to Sign
          </Label>
          <Textarea
            id="message"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="bg-background text-font"
          />
          <p className="text-font/60 text-xs mt-1">
            This message will be signed with your private key
          </p>
        </div>

        {/* Sign Button */}
        <Button
          variant="primary"
          className="w-full mb-4"
          onClick={handleSign}
          disabled={!message || !walletAddress || isSigning}
        >
          {isSigning ? "Signing..." : "Sign Message"}
        </Button>

        {/* Signature Output */}
        {signature && (
          <>
            <Separator className="my-4" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-font text-sm">Signature</Label>
                <Badge className="bg-tertiary text-white">✓ Signed</Badge>
              </div>
              <div className="bg-background rounded-md p-3 relative">
                <pre className="text-font font-mono text-xs break-all">
                  {signature}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onCopySignature?.(signature)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="bg-background rounded-md p-3 mt-4">
          <p className="text-font/60 text-xs">
            🔒 Signatures prove you control this wallet address. Never sign
            messages you don't understand or trust.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
