/**
 * Passkey Settings Page (Cycle 43)
 *
 * Complete passkey management interface with registration and management.
 * Supports multiple passkeys per user (up to 10 recommended).
 */

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PasskeyRegistration } from "./PasskeyRegistration";
import { PasskeyManagement } from "./PasskeyManagement";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Info, Shield } from "lucide-react";

interface PasskeySettingsProps {
  csrfToken: string;
}

export function PasskeySettings({ csrfToken }: PasskeySettingsProps) {
  const passkeys = useQuery(api.queries.passkeys.listPasskeys);

  const passkeyCount = passkeys?.length || 0;
  const maxPasskeys = 10; // Recommended limit

  const showRegistrationCard = passkeyCount < maxPasskeys;

  return (
    <div className="space-y-6">
      {/* Security Info Banner */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Security:</strong> Passkeys use cryptographic keys
          stored securely on your device. They're phishing-resistant and more
          secure than passwords.
        </AlertDescription>
      </Alert>

      {/* Multi-Passkey Info */}
      {passkeyCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have <strong>{passkeyCount}</strong> passkey
            {passkeyCount !== 1 ? "s" : ""} registered. Register passkeys on
            multiple devices to sign in seamlessly from anywhere.
          </AlertDescription>
        </Alert>
      )}

      {/* Registration Card */}
      {showRegistrationCard && (
        <PasskeyRegistration csrfToken={csrfToken} />
      )}

      {/* Max Passkeys Warning */}
      {passkeyCount >= maxPasskeys && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum number of passkeys ({maxPasskeys}). To
            add a new passkey, please delete an existing one first.
          </AlertDescription>
        </Alert>
      )}

      {/* Management Card */}
      <PasskeyManagement csrfToken={csrfToken} />

      {/* Browser Compatibility Info */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium text-sm">Browser Compatibility</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium">Desktop</p>
            <ul className="text-muted-foreground space-y-1 mt-1">
              <li>• Chrome 67+</li>
              <li>• Safari 13+ (macOS)</li>
              <li>• Firefox 60+</li>
              <li>• Edge 18+</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Mobile</p>
            <ul className="text-muted-foreground space-y-1 mt-1">
              <li>• iOS 16+ (Safari)</li>
              <li>• Android (Chrome)</li>
              <li>• Chrome for Android</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Platform authenticators include Touch ID (macOS/iOS), Face ID (iOS),
          Windows Hello, and Android biometrics.
        </p>
      </div>

      {/* Best Practices */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium text-sm">Best Practices</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            ✓ Register passkeys on all devices you regularly use (laptop,
            phone, tablet)
          </li>
          <li>
            ✓ Use descriptive nicknames to identify devices ("Work MacBook",
            "Personal iPhone")
          </li>
          <li>
            ✓ Keep at least 2 passkeys registered in case you lose access to
            one device
          </li>
          <li>
            ✓ Remove passkeys for devices you no longer own or have access to
          </li>
          <li>
            ✓ Consider registering a hardware security key (YubiKey) as a
            backup
          </li>
        </ul>
      </div>

      {/* Security Key Support */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-medium text-sm">Hardware Security Keys</h3>
        <p className="text-sm text-muted-foreground">
          Passkeys work with FIDO2 security keys like YubiKey, Google Titan Key,
          and others. These provide additional security and can be used as a
          backup authentication method.
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded">YubiKey</span>
          <span className="px-2 py-1 bg-muted rounded">Titan Key</span>
          <span className="px-2 py-1 bg-muted rounded">Feitian</span>
          <span className="px-2 py-1 bg-muted rounded">Nitrokey</span>
        </div>
      </div>
    </div>
  );
}
