/**
 * Passkey Management Component (Cycle 42-43)
 *
 * Displays all registered passkeys with ability to rename and delete.
 * Supports multiple passkeys per user.
 */

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Fingerprint,
  Edit2,
  Trash2,
  Smartphone,
  Monitor,
  Key,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PasskeyManagementProps {
  csrfToken: string;
}

export function PasskeyManagement({ csrfToken }: PasskeyManagementProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<any>(null);
  const [newNickname, setNewNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Query passkeys
  const passkeys = useQuery(api.queries.passkeys.listPasskeys);

  // Mutations
  const renamePasskey = useMutation(api.mutations.passkeys.renamePasskey);
  const deletePasskey = useMutation(api.mutations.passkeys.deletePasskey);

  const handleRename = async () => {
    if (!selectedPasskey) return;

    try {
      await renamePasskey({
        _csrfToken: csrfToken,
        passkeyId: selectedPasskey.id,
        nickname: newNickname.trim(),
      });

      setSuccess("Passkey renamed successfully");
      setRenameDialogOpen(false);
      setSelectedPasskey(null);
      setNewNickname("");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to rename passkey");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async () => {
    if (!selectedPasskey) return;

    try {
      await deletePasskey({
        _csrfToken: csrfToken,
        passkeyId: selectedPasskey.id,
      });

      setSuccess("Passkey deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedPasskey(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete passkey");
      setTimeout(() => setError(null), 5000);
    }
  };

  const openRenameDialog = (passkey: any) => {
    setSelectedPasskey(passkey);
    setNewNickname(passkey.nickname);
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (passkey: any) => {
    setSelectedPasskey(passkey);
    setDeleteDialogOpen(true);
  };

  const getTransportIcon = (transports?: string[]) => {
    if (!transports || transports.length === 0) {
      return <Key className="h-5 w-5 text-muted-foreground" />;
    }

    if (transports.includes("internal")) {
      return <Monitor className="h-5 w-5 text-blue-500" />;
    }

    if (transports.includes("usb") || transports.includes("nfc")) {
      return <Key className="h-5 w-5 text-green-500" />;
    }

    return <Smartphone className="h-5 w-5 text-purple-500" />;
  };

  const getTransportLabel = (transports?: string[]) => {
    if (!transports || transports.length === 0) return "Unknown";
    if (transports.includes("internal")) return "Platform Authenticator";
    if (transports.includes("usb")) return "Security Key (USB)";
    if (transports.includes("nfc")) return "Security Key (NFC)";
    if (transports.includes("ble")) return "Security Key (Bluetooth)";
    return "Authenticator";
  };

  if (!passkeys) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Your Passkeys
          </CardTitle>
          <CardDescription>
            Manage your registered passkeys. You can rename or remove passkeys
            at any time.
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
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {passkeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No passkeys registered yet</p>
              <p className="text-sm">
                Add a passkey above to enable passwordless sign-in
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTransportIcon(passkey.transports)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {passkey.nickname}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{getTransportLabel(passkey.transports)}</span>
                        {passkey.lastUsedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Used{" "}
                            {formatDistanceToNow(passkey.lastUsedAt, {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {!passkey.lastUsedAt && (
                          <span className="text-amber-600">Never used</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRenameDialog(passkey)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(passkey)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Register passkeys on all your devices (Mac,
              iPhone, Windows) to sign in seamlessly from anywhere.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Passkey</DialogTitle>
            <DialogDescription>
              Give your passkey a memorable name to identify it easily.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-nickname">Passkey Nickname</Label>
              <Input
                id="rename-nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="e.g., Work MacBook, Personal iPhone"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newNickname.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPasskey?.nickname}"?
              This action cannot be undone. You will need to register a new
              passkey to use this device again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
