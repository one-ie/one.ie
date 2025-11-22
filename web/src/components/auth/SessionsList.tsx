/**
 * Sessions List Component (Cycle 82)
 *
 * Displays all active sessions for the current user with:
 * - Device type, browser, OS
 * - IP address (masked for privacy)
 * - Location (if available)
 * - Last active timestamp
 * - Revoke buttons
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { parseUserAgent, maskIPAddress } from "@/lib/userAgentParser";
import { formatDistanceToNow } from "date-fns";

interface SessionsListProps {
  sessionToken: string;
}

export function SessionsList({ sessionToken }: SessionsListProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Query all sessions
  const sessions = useQuery(api.queries.sessions.listUserSessions, {
    token: sessionToken,
  });

  // Mutations
  const revokeSession = useMutation(api.mutations.sessions.revokeSession);
  const revokeAllOtherSessions = useMutation(
    api.mutations.sessions.revokeAllOtherSessions
  );

  const handleRevokeSession = async (sessionId: Id<"sessions">) => {
    setRevoking(sessionId);
    try {
      await revokeSession({
        token: sessionToken,
        sessionIdToRevoke: sessionId,
      });
    } catch (error) {
      console.error("Failed to revoke session:", error);
      alert("Failed to revoke session. Please try again.");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setRevokingAll(true);
    try {
      const result = await revokeAllOtherSessions({
        token: sessionToken,
      });
      if (result.revokedCount > 0) {
        alert(`Successfully revoked ${result.revokedCount} session(s)`);
      }
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      alert("Failed to revoke sessions. Please try again.");
    } finally {
      setRevokingAll(false);
    }
  };

  if (sessions === undefined) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading sessions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessions) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Not authenticated
          </div>
        </CardContent>
      </Card>
    );
  }

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="space-y-6">
      {/* Header with "Revoke All" button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Sessions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length} active {sessions.length === 1 ? "session" : "sessions"}
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={revokingAll}>
                {revokingAll
                  ? "Revoking..."
                  : `Revoke All Other Sessions (${otherSessionsCount})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out of all devices except this one. You will
                  need to sign in again on those devices.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAllOther}>
                  Revoke All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Sessions list */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const parsed = parseUserAgent(session.userAgent);
          const isRevoking = revoking === session.id;

          return (
            <Card key={session.id} className={session.isCurrent ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {parsed.browser} on {parsed.os}
                      </CardTitle>
                      {session.isCurrent && (
                        <Badge variant="default">Current Session</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Device:</span>
                        <span className="capitalize">{parsed.deviceType}</span>
                      </div>
                      {parsed.browserVersion && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Version:</span>
                          <span>{parsed.browserVersion}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">IP Address:</span>
                        <span className="font-mono text-xs">
                          {maskIPAddress(session.ipAddress)}
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Location:</span>
                          <span>{session.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Last active:</span>
                        <span>
                          {formatDistanceToNow(session.lastActiveAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Signed in:</span>
                        <span>
                          {formatDistanceToNow(session.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRevoking}
                        >
                          {isRevoking ? "Revoking..." : "Revoke"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will sign you out of this device. You will need to
                            sign in again on that device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            Revoke Session
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
