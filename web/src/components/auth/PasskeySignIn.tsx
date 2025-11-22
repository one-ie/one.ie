/**
 * Passkey Sign In Component (Cycle 41)
 *
 * Allows users to authenticate using registered passkeys.
 * Supports both conditional UI (autofill) and explicit button.
 */

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startAuthentication } from "@simplewebauthn/browser";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Fingerprint, Loader2, AlertCircle } from "lucide-react";

interface PasskeySignInProps {
  email?: string; // Optional: pre-fill for specific user
  onSuccess?: (sessionToken: string, csrfToken: string) => void;
  onError?: (error: string) => void;
}

export function PasskeySignIn({
  email,
  onSuccess,
  onError,
}: PasskeySignInProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticateStart = useMutation(
    api.mutations.passkeys.authenticatePasskeyStart
  );
  const authenticateFinish = useMutation(
    api.mutations.passkeys.authenticatePasskeyFinish
  );

  // Check if user has passkeys (optional optimization)
  const passkeyStatus = email
    ? useQuery(api.queries.passkeys.hasPasskeys, { email })
    : { hasPasskeys: true }; // Show button if no email provided

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Step 1: Check browser support
      if (!window.PublicKeyCredential) {
        throw new Error(
          "Passkeys are not supported in this browser. Please use Chrome, Safari, Firefox, or Edge."
        );
      }

      // Step 2: Get authentication options from server
      const options = await authenticateStart({
        email: email?.toLowerCase(),
      });

      // Step 3: Start authentication with browser
      let asseResp;
      try {
        asseResp = await startAuthentication(options);
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Authentication was cancelled. Please try again and approve the passkey authentication."
          );
        }
        throw new Error(`Browser authentication failed: ${error.message}`);
      }

      // Step 4: Get client metadata for login tracking
      const clientIp = undefined; // Would need server-side detection
      const userAgent = navigator.userAgent;
      const location = undefined; // Would need geolocation API

      // Step 5: Send response to server for verification
      const result = await authenticateFinish({
        response: asseResp,
        clientIp,
        userAgent,
        location,
      });

      // Success! Call callback with session data
      onSuccess?.(result.sessionToken, result.csrfToken);

      // Store session in localStorage (same as password login)
      localStorage.setItem("sessionToken", result.sessionToken);
      localStorage.setItem("csrfToken", result.csrfToken);

      // Show unusual activity warning if detected
      if (result.unusualActivity) {
        console.warn("Unusual login activity detected");
        // Could show a notification here
      }
    } catch (err: any) {
      console.error("Passkey authentication error:", err);
      const errorMsg = err.message || "Failed to authenticate with passkey";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Don't show button if user has no passkeys
  if (passkeyStatus && !passkeyStatus.hasPasskeys) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleSignIn}
        disabled={isAuthenticating}
        variant="outline"
        className="w-full"
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-4 w-4" />
            Sign in with Passkey
          </>
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Passkey Sign In Button (Standalone)
 *
 * Simple button for adding to existing sign-in forms.
 */
export function PasskeySignInButton({
  email,
  onSuccess,
}: {
  email?: string;
  onSuccess?: (sessionToken: string, csrfToken: string) => void;
}) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticateStart = useMutation(
    api.mutations.passkeys.authenticatePasskeyStart
  );
  const authenticateFinish = useMutation(
    api.mutations.passkeys.authenticatePasskeyFinish
  );

  const handleClick = async () => {
    setIsAuthenticating(true);

    try {
      if (!window.PublicKeyCredential) {
        alert("Passkeys not supported in this browser");
        return;
      }

      const options = await authenticateStart({
        email: email?.toLowerCase(),
      });

      const asseResp = await startAuthentication(options);

      const result = await authenticateFinish({
        response: asseResp,
        userAgent: navigator.userAgent,
      });

      localStorage.setItem("sessionToken", result.sessionToken);
      localStorage.setItem("csrfToken", result.csrfToken);

      onSuccess?.(result.sessionToken, result.csrfToken);
    } catch (err: any) {
      console.error("Passkey error:", err);
      alert(err.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isAuthenticating}
      variant="ghost"
      size="sm"
      className="w-full"
    >
      {isAuthenticating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Fingerprint className="mr-2 h-4 w-4" />
      )}
      Use Passkey
    </Button>
  );
}
