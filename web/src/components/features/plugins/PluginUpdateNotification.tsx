import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  X,
} from "lucide-react";

interface PluginUpdate {
  pluginId: string;
  pluginName: string;
  currentVersion: string;
  newVersion: string;
  releaseDate: Date;
  changelog: {
    type: "feature" | "fix" | "breaking" | "improvement";
    description: string;
  }[];
  important: boolean;
  breaking: boolean;
}

interface PluginUpdateNotificationProps {
  updates: PluginUpdate[];
  onUpdate?: (pluginId: string) => Promise<void>;
  onDismiss?: (pluginId: string) => void;
  onRollback?: (pluginId: string) => Promise<void>;
}

export function PluginUpdateNotification({
  updates,
  onUpdate,
  onDismiss,
  onRollback,
}: PluginUpdateNotificationProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<PluginUpdate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  if (updates.length === 0) {
    return null;
  }

  const handleUpdate = async (pluginId: string) => {
    if (!onUpdate) return;

    setUpdating(true);
    setUpdateProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUpdateProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpdate(pluginId);
      clearInterval(progressInterval);
      setUpdateProgress(100);

      // Close dialog after successful update
      setTimeout(() => {
        setShowDialog(false);
        setUpdating(false);
        setUpdateProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Update failed:", error);
      setUpdating(false);
      setUpdateProgress(0);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getChangelogIcon = (type: string) => {
    switch (type) {
      case "feature":
        return "✨";
      case "fix":
        return "🐛";
      case "breaking":
        return "⚠️";
      case "improvement":
        return "📈";
      default:
        return "•";
    }
  };

  const importantUpdates = updates.filter((u) => u.important);
  const regularUpdates = updates.filter((u) => !u.important);

  return (
    <div className="space-y-4">
      {/* Important Updates Alert */}
      {importantUpdates.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {importantUpdates.length} important plugin update
              {importantUpdates.length === 1 ? "" : "s"} available
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUpdate(importantUpdates[0]);
                setShowDialog(true);
              }}
            >
              View Updates
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Update Notification Cards */}
      <div className="space-y-2">
        {updates.slice(0, 3).map((update) => (
          <Card
            key={update.pluginId}
            className={
              update.important
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                : ""
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {update.pluginName}
                      {update.important && (
                        <Badge variant="destructive" className="text-xs">
                          Important
                        </Badge>
                      )}
                      {update.breaking && (
                        <Badge variant="outline" className="text-xs">
                          Breaking Changes
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {update.currentVersion} → {update.newVersion}
                    </p>
                  </div>
                </div>
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onDismiss(update.pluginId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardFooter className="pt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUpdate(update);
                  setShowDialog(true);
                }}
              >
                <Info className="w-4 h-4 mr-1" />
                View Changelog
              </Button>
              {onUpdate && (
                <Button
                  size="sm"
                  onClick={() => handleUpdate(update.pluginId)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Update Now
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {updates.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSelectedUpdate(updates[3]);
              setShowDialog(true);
            }}
          >
            View {updates.length - 3} more update
            {updates.length - 3 === 1 ? "" : "s"}
          </Button>
        )}
      </div>

      {/* Update Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUpdate
                ? `Update ${selectedUpdate.pluginName}`
                : "Plugin Update"}
            </DialogTitle>
          </DialogHeader>

          {selectedUpdate && (
            <div className="space-y-4 py-4">
              {/* Version Information */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Current Version</p>
                  <p className="text-2xl font-bold">
                    {selectedUpdate.currentVersion}
                  </p>
                </div>
                <div className="text-muted-foreground">→</div>
                <div>
                  <p className="text-sm font-medium">New Version</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedUpdate.newVersion}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Release Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedUpdate.releaseDate)}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {selectedUpdate.breaking && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This update contains breaking changes. Please review the
                    changelog carefully before updating.
                  </AlertDescription>
                </Alert>
              )}

              {/* Changelog */}
              <div className="space-y-2">
                <h3 className="font-semibold">What's New</h3>
                <ScrollArea className="h-64 rounded-lg border p-4">
                  <div className="space-y-4">
                    {selectedUpdate.changelog.map((change, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="text-lg">
                          {getChangelogIcon(change.type)}
                        </span>
                        <div className="flex-1">
                          <Badge
                            variant={
                              change.type === "breaking"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs mb-1"
                          >
                            {change.type}
                          </Badge>
                          <p className="text-sm">{change.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Update Progress */}
              {updating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Updating plugin...</span>
                    <span>{Math.round(updateProgress)}%</span>
                  </div>
                  <Progress value={updateProgress} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDialog(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                {onRollback && (
                  <Button
                    variant="outline"
                    onClick={() => onRollback(selectedUpdate.pluginId)}
                    disabled={updating}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Rollback
                  </Button>
                )}
                {onUpdate && (
                  <Button
                    className="flex-1"
                    onClick={() => handleUpdate(selectedUpdate.pluginId)}
                    disabled={updating}
                  >
                    {updating ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Update Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Badge component to show update count
export function PluginUpdateBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="relative">
      <Bell className="w-5 h-5" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {count > 9 ? "9+" : count}
      </Badge>
    </div>
  );
}
