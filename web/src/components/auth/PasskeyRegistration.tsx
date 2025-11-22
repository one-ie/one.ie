/**
 * Passkey Registration Component (Cycle 39)
 *
 * Allows authenticated users to register a new passkey.
 * Uses SimpleWebAuthn browser library with Convex backend.
 */

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startRegistration } from "@simplewebauthn/browser";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Fingerprint, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PasskeyRegistrationProps {
  csrfToken: string; // Required for mutations
  onSuccess?: () => void;
}

export function PasskeyRegistration({
  csrfToken,
  onSuccess,
}: PasskeyRegistrationProps) {
  const [nickname, setNickname] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerStart = useMutation(api.mutations.passkeys.registerPasskeyStart);
  const registerFinish = useMutation(
    api.mutations.passkeys.registerPasskeyFinish
  );

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Check browser support
      if (!window.PublicKeyCredential) {
        throw new Error(
          "Passkeys are not supported in this browser. Please use Chrome, Safari, Firefox, or Edge."
        );
      }

      // Step 2: Get registration options from server
      const options = await registerStart({
        _csrfToken: csrfToken,
      });

      // Step 3: Start registration with browser
      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Registration was cancelled. Please try again and approve the passkey creation."
          );
        }
        throw new Error(`Browser registration failed: ${error.message}`);
      }

      // Step 4: Send response to server for verification
      const result = await registerFinish({
        _csrfToken: csrfToken,
        response: attResp,
        nickname: nickname.trim() || undefined,
      });

      // Success!
      setSuccess(true);
      setNickname("");

      // Call success callback after 1 second
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      console.error("Passkey registration error:", err);
      setError(err.message || "Failed to register passkey");
    } finally {
      setIsRegistering(false);
    }
  };

  const detectDeviceName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("Windows")) return "Windows";
    return "Device";
  };

  const getSuggestedNickname = () => {
    const device = detectDeviceName();
    const auth = navigator.userAgent.includes("Mac") ? "Touch ID" : "Biometric";
    return `${device} ${auth}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Add Passkey
        </CardTitle>
        <CardDescription>
          Register a passkey to sign in without a password. Use Touch ID, Face
          ID, Windows Hello, or a security key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Passkey registered successfully! You can now use it to sign in.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="passkey-nickname">
            Passkey Nickname (Optional)
          </Label>
          <Input
            id="passkey-nickname"
            placeholder={getSuggestedNickname()}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isRegistering || success}
          />
          <p className="text-xs text-muted-foreground">
            Give your passkey a memorable name like "Work MacBook" or "Personal
            iPhone"
          </p>
        </div>

        <Button
          onClick={handleRegister}
          disabled={isRegistering || success}
          className="w-full"
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : success ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Registered
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-4 w-4" />
              Register Passkey
            </>
          )}
        </Button>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Click "Register Passkey"</li>
            <li>Your device will prompt you to authenticate (Touch ID, etc.)</li>
            <li>Your passkey is saved securely on this device</li>
            <li>Sign in instantly next time without a password</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
