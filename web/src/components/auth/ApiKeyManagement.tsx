/**
 * API Key Management Component
 *
 * Provides a complete UI for managing API keys:
 * - List all API keys with usage stats
 * - Create new API keys with permissions
 * - Revoke/rotate existing keys
 * - View usage statistics
 * - Copy keys to clipboard
 */

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

export function ApiKeyManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Fetch API keys
  const apiKeys = useQuery(api.queries.apiKeys.listApiKeys) || [];

  // Mutations
  const createApiKey = useMutation(api.mutations.apiKeys.createApiKey);
  const revokeApiKey = useMutation(api.mutations.apiKeys.revokeApiKey);
  const rotateApiKey = useMutation(api.mutations.apiKeys.rotateApiKey);

  const handleCreateKey = async (data: any) => {
    try {
      const result = await createApiKey(data);
      setNewlyCreatedKey(result.key);
      setShowCreateDialog(false);
    } catch (error: any) {
      alert(`Error creating API key: ${error.message}`);
    }
  };

  const handleRevokeKey = async (apiKeyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await revokeApiKey({ apiKeyId });
    } catch (error: any) {
      alert(`Error revoking API key: ${error.message}`);
    }
  };

  const handleRotateKey = async (apiKeyId: string) => {
    if (!confirm("Are you sure you want to rotate this API key? The old key will stop working immediately.")) {
      return;
    }

    try {
      const result = await rotateApiKey({ apiKeyId });
      setNewlyCreatedKey(result.key);
    } catch (error: any) {
      alert(`Error rotating API key: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API key copied to clipboard!");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to your account
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create API Key
        </Button>
      </div>

      {/* Newly Created Key Alert */}
      {newlyCreatedKey && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Your New API Key
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Save this key now - it will not be shown again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white dark:bg-gray-900 rounded border font-mono text-sm break-all">
                {newlyCreatedKey}
              </code>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(newlyCreatedKey)}
              >
                Copy
              </Button>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setNewlyCreatedKey(null)}
            >
              I've saved this key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No API keys yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key: any) => (
            <Card key={key.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {key.name}
                      <StatusBadge status={key.status} />
                    </CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">
                      {key.keyPreview}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotateKey(key.id)}
                      disabled={key.status !== "active"}
                    >
                      Rotate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      disabled={key.status !== "active"}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Permissions */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(key.permissions).map(([resource, actions]: [string, any]) =>
                      actions && actions.length > 0 ? (
                        <Badge key={resource} variant="secondary">
                          {resource}: {actions.join(", ")}
                        </Badge>
                      ) : null
                    )}
                  </div>
                </div>

                {/* Usage Statistics */}
                {key.usageStats && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Usage Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Requests</p>
                        <p className="font-semibold">{key.usageStats.totalRequests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">This Window</p>
                        <p className="font-semibold">{key.usageStats.requestsThisWindow}</p>
                      </div>
                      {key.rateLimit && key.rateLimit.enabled && (
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold">
                            {key.usageStats.remainingRequests} / {key.rateLimit.maxRequests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rate Limit Info */}
                {key.rateLimit && key.rateLimit.enabled && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Rate Limit</h4>
                    <p className="text-sm text-muted-foreground">
                      {key.rateLimit.maxRequests} requests per{" "}
                      {(key.rateLimit.timeWindowMs / 3600000).toFixed(0)} hours
                      {key.rateLimit.refillRate && (
                        <> • {key.rateLimit.refillRate} tokens refill every{" "}
                        {(key.rateLimit.refillIntervalMs / 3600000).toFixed(0)} hours
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                {key.metadata && Object.keys(key.metadata).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Metadata</h4>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {JSON.stringify(key.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>Created: {formatDate(key.createdAt)}</p>
                    {key.lastUsedAt && <p>Last Used: {formatDate(key.lastUsedAt)}</p>}
                  </div>
                  <div>
                    {key.expiresAt && (
                      <p className={key.expiresAt < Date.now() ? "text-red-600" : ""}>
                        Expires: {formatDate(key.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create API Key Dialog */}
      {showCreateDialog && (
        <CreateApiKeyDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateKey}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    revoked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    expired: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  };

  return (
    <Badge className={variants[status] || ""}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CreateApiKeyDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState({
    users: [] as string[],
    projects: [] as string[],
    analytics: [] as string[],
    groups: [] as string[],
    data: [] as string[],
  });
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(90);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [maxRequests, setMaxRequests] = useState(1000);
  const [timeWindowHours, setTimeWindowHours] = useState(24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreate({
      name,
      permissions,
      expiresInDays,
      rateLimit: rateLimitEnabled
        ? {
            enabled: true,
            maxRequests,
            timeWindowMs: timeWindowHours * 3600000,
            refillRate: 10,
            refillIntervalMs: 3600000, // 1 hour
          }
        : undefined,
    });
  };

  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[resource as keyof typeof prev] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create API Key</CardTitle>
          <CardDescription>
            Configure permissions and settings for your new API key
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Production API Key"
                required
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="space-y-3">
                {["users", "projects", "analytics", "groups", "data"].map((resource) => (
                  <div key={resource} className="border p-3 rounded">
                    <p className="font-semibold text-sm mb-2 capitalize">{resource}</p>
                    <div className="flex flex-wrap gap-2">
                      {getActionsForResource(resource).map((action) => (
                        <label key={action} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions[resource as keyof typeof permissions]?.includes(action) || false}
                            onChange={() => togglePermission(resource, action)}
                          />
                          <span className="text-sm">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium mb-2">Expires In (Days)</label>
              <input
                type="number"
                value={expiresInDays || ""}
                onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border rounded"
                placeholder="90"
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for no expiration
              </p>
            </div>

            {/* Rate Limiting */}
            <div>
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={rateLimitEnabled}
                  onChange={(e) => setRateLimitEnabled(e.target.checked)}
                />
                <span className="text-sm font-medium">Enable Rate Limiting</span>
              </label>

              {rateLimitEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Max Requests</label>
                    <input
                      type="number"
                      value={maxRequests}
                      onChange={(e) => setMaxRequests(Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Time Window (Hours)</label>
                    <input
                      type="number"
                      value={timeWindowHours}
                      onChange={(e) => setTimeWindowHours(Number(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create API Key</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function getActionsForResource(resource: string): string[] {
  const actions: Record<string, string[]> = {
    users: ["read", "write", "delete", "admin"],
    projects: ["read", "write", "delete", "admin"],
    analytics: ["read", "write", "export"],
    groups: ["read", "write", "delete", "admin"],
    data: ["read", "write", "delete", "export", "import"],
  };
  return actions[resource] || [];
}
