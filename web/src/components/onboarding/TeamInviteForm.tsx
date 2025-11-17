/**
 * TeamInviteForm - Add team members to workspace
 *
 * Allows creators to invite team members with email addresses
 * and specify their roles (editor or viewer)
 */

import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteTeamMember } from "@/hooks/useOnboarding";

interface TeamInviteFormProps {
  userId: string;
  workspaceId: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

interface PendingInvitation {
  email: string;
  role: "editor" | "viewer";
  id: string;
}

export function TeamInviteForm({ userId, workspaceId, onSuccess, onSkip }: TeamInviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [emailError, setEmailError] = useState("");
  const { mutate: inviteTeamMember, loading, nextRetryAt } = useInviteTeamMember();
  const [nextRetryCountdown, setNextRetryCountdown] = useState(0);

  // Countdown timer for rate limiting
  useState(() => {
    if (!nextRetryAt) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000));
      setNextRetryCountdown(remaining);
    }, 1000);
    return () => clearInterval(timer);
  });

  const validateEmail = (emailAddress: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  };

  const handleAddInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError("");

    if (!email.trim()) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (pendingInvites.some((invite) => invite.email === email)) {
      setEmailError("This email has already been added");
      return;
    }

    try {
      const result = await inviteTeamMember({
        userId,
        workspaceId,
        invitedEmail: email,
        role,
      });

      if (result.success) {
        setPendingInvites([
          ...pendingInvites,
          {
            email,
            role,
            id: result.data?.invitationId || `${email}-${Date.now()}`,
          },
        ]);
        setEmail("");
        setRole("editor");
        toast.success("Invitation sent!", {
          description: `Invitation sent to ${email}`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send invitation";
      setEmailError(message);
      toast.error("Invitation failed", { description: message });
    }
  };

  const handleRemoveInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter((invite) => invite.id !== inviteId));
  };

  const handleContinue = () => {
    if (pendingInvites.length === 0) {
      onSkip?.();
      return;
    }
    onSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <form onSubmit={handleAddInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Team Member Email</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || nextRetryCountdown > 0}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || nextRetryCountdown > 0 || !email}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {emailError && <p className="text-sm font-medium text-destructive">{emailError}</p>}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as "editor" | "viewer")}>
            <SelectTrigger id="role" disabled={loading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Editor (can edit)</SelectItem>
              <SelectItem value="viewer">Viewer (read-only)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Editors can create and modify content. Viewers can only view.
          </p>
        </div>

        {/* Rate Limit Alert */}
        {nextRetryCountdown > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've sent too many invitations. Please wait {nextRetryCountdown}s before sending
              more.
            </AlertDescription>
          </Alert>
        )}
      </form>

      {/* Pending Invitations List */}
      {pendingInvites.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Pending Invitations ({pendingInvites.length})</h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {invite.role === "editor" ? "Can edit" : "View only"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveInvite(invite.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Team members will receive an email invitation to join your workspace. You can invite more
          people later from your workspace settings.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button type="button" className="w-full" onClick={handleContinue} disabled={loading}>
          {pendingInvites.length > 0 ? "Continue" : "Skip for Now"}
        </Button>
      </div>
    </div>
  );
}
