"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  Copy,
  Loader,
  Rocket,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeploymentStatus = "idle" | "building" | "deploying" | "live" | "error";

interface BuildLog {
  timestamp: number;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

interface DeploymentState {
  status: DeploymentStatus;
  progress: number;
  logs: BuildLog[];
  liveUrl?: string;
  errorMessage?: string;
  startTime?: number;
  endTime?: number;
}

interface DeploymentPanelProps {
  websiteId: string;
}

const statusConfig = {
  idle: {
    label: "Ready to Deploy",
    icon: Rocket,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  building: {
    label: "Building",
    icon: Loader,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  deploying: {
    label: "Deploying",
    icon: Loader,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  live: {
    label: "Live",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  error: {
    label: "Deployment Failed",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

export function DeploymentPanel({ websiteId }: DeploymentPanelProps) {
  const [deployment, setDeployment] = React.useState<DeploymentState>({
    status: "idle",
    progress: 0,
    logs: [],
  });

  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [isDeploying, setIsDeploying] = React.useState(false);

  // Fetch existing deployment status
  const existingDeployment = useQuery(
    api.queries.websites.getDeploymentStatus,
    {
      websiteId,
    }
  );

  // Mutations
  const startDeployment = useMutation(
    api.mutations.ai_website_builder.startDeployment
  );

  // Load existing deployment when fetched
  React.useEffect(() => {
    if (existingDeployment) {
      setDeployment({
        status: existingDeployment.status || "idle",
        progress: existingDeployment.progress || 0,
        logs: existingDeployment.logs || [],
        liveUrl: existingDeployment.liveUrl,
        errorMessage: existingDeployment.errorMessage,
        startTime: existingDeployment.startTime,
        endTime: existingDeployment.endTime,
      });
    }
  }, [existingDeployment]);

  // Simulate build logs (in production, this would stream from backend)
  const simulateBuildLogs = React.useCallback(() => {
    const logs: BuildLog[] = [
      {
        timestamp: Date.now(),
        level: "info",
        message: "Starting build process...",
      },
      {
        timestamp: Date.now() + 500,
        level: "info",
        message: "Installing dependencies...",
      },
      {
        timestamp: Date.now() + 1500,
        level: "info",
        message: "Building Astro project...",
      },
      {
        timestamp: Date.now() + 3000,
        level: "info",
        message: "Optimizing assets...",
      },
      {
        timestamp: Date.now() + 4500,
        level: "success",
        message: "Build completed successfully (1.2s)",
      },
      {
        timestamp: Date.now() + 5000,
        level: "info",
        message: "Starting deployment...",
      },
      {
        timestamp: Date.now() + 6000,
        level: "info",
        message: "Uploading files to CDN...",
      },
      {
        timestamp: Date.now() + 8000,
        level: "info",
        message: "Configuring domains...",
      },
      {
        timestamp: Date.now() + 9000,
        level: "success",
        message: "Deployment completed!",
      },
    ];

    return logs;
  }, []);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      // Update deployment state to building
      setDeployment((prev) => ({
        ...prev,
        status: "building",
        progress: 0,
        logs: [],
        errorMessage: undefined,
        startTime: Date.now(),
      }));

      // In production, call backend mutation
      // const result = await startDeployment({ websiteId });

      // Simulate build logs
      const logs = simulateBuildLogs();

      // Animate log output
      for (let i = 0; i < logs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const currentLog = logs[i];
        const progressPercentage = ((i + 1) / logs.length) * 100;

        // Determine status based on progress
        let status: DeploymentStatus = "building";
        if (progressPercentage > 50) {
          status = "deploying";
        }
        if (progressPercentage === 100) {
          status = "live";
        }

        setDeployment((prev) => ({
          ...prev,
          status,
          progress: progressPercentage,
          logs: [...prev.logs, currentLog],
        }));
      }

      // Set final state with live URL
      const liveUrl = `https://${websiteId}.pages.dev`;
      setDeployment((prev) => ({
        ...prev,
        status: "live",
        progress: 100,
        liveUrl,
        endTime: Date.now(),
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Deployment failed";

      setDeployment((prev) => ({
        ...prev,
        status: "error",
        errorMessage,
        endTime: Date.now(),
      }));
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRetry = () => {
    setDeployment({
      status: "idle",
      progress: 0,
      logs: [],
      errorMessage: undefined,
    });
  };

  const copyLiveUrl = () => {
    if (deployment.liveUrl) {
      navigator.clipboard.writeText(deployment.liveUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const durationSeconds = deployment.startTime
    ? Math.floor(
        ((deployment.endTime || Date.now()) - deployment.startTime) / 1000
      )
    : 0;

  const config = statusConfig[deployment.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Deploy {websiteId}</h1>
          <p className="text-muted-foreground">
            Build and deploy your website to production
          </p>
        </div>

        {/* Status Card */}
        <Card className={cn(config.bg, "border")}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg bg-white border")}>
                  <StatusIcon className={cn("w-6 h-6", config.color)} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{config.label}</h2>
                  <p className="text-sm text-muted-foreground">
                    {deployment.status === "live" && deployment.liveUrl && (
                      <span>Live at {deployment.liveUrl}</span>
                    )}
                    {deployment.status === "error" && deployment.errorMessage && (
                      <span>{deployment.errorMessage}</span>
                    )}
                    {deployment.status === "idle" && (
                      <span>Click deploy to start the build process</span>
                    )}
                    {(deployment.status === "building" ||
                      deployment.status === "deploying") &&
                      durationSeconds > 0 && (
                        <span>{durationSeconds}s elapsed</span>
                      )}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {deployment.progress > 0 && deployment.progress < 100 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {Math.round(deployment.progress)}%
                    </p>
                  </div>
                )}
                {deployment.status === "live" && (
                  <Badge variant="outline" className="bg-green-50">
                    <Check className="w-3 h-3 mr-1" />
                    Deployed
                  </Badge>
                )}
                {deployment.status === "error" && (
                  <Badge variant="destructive">Failed</Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {deployment.progress > 0 && deployment.progress < 100 && (
              <div className="mt-4 space-y-2">
                <Progress value={deployment.progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live URL Card */}
        {deployment.status === "live" && deployment.liveUrl && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Your website is live!
                  </h3>
                </div>

                <div className="flex gap-2 items-center">
                  <code className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono">
                    {deployment.liveUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLiveUrl}
                    className="gap-2"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={deployment.liveUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {deployment.status === "error" && deployment.errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {deployment.errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Build Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Build Logs
            </CardTitle>
            <CardDescription>
              Real-time output from the build and deployment process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto border border-gray-800">
              {deployment.logs.length === 0 ? (
                <div className="text-gray-500 flex items-center justify-center h-full">
                  Logs will appear here during deployment
                </div>
              ) : (
                <div className="space-y-1">
                  {deployment.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={cn("flex gap-2 text-xs", {
                        "text-gray-400": log.level === "info",
                        "text-yellow-400": log.level === "warning",
                        "text-red-400": log.level === "error",
                        "text-green-400": log.level === "success",
                      })}
                    >
                      <span className="text-gray-600 flex-shrink-0 w-20">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-shrink-0 w-12">
                        {log.level === "info" && "[info]"}
                        {log.level === "warning" && "[warn]"}
                        {log.level === "error" && "[error]"}
                        {log.level === "success" && "[✓]"}
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between">
          <div className="flex gap-3">
            {deployment.status === "idle" && (
              <Button
                size="lg"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="gap-2"
              >
                {isDeploying ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy Now
                  </>
                )}
              </Button>
            )}

            {deployment.status === "error" && (
              <>
                <Button
                  size="lg"
                  onClick={handleRetry}
                  className="gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Retry Deployment
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a href={`/builder/${websiteId}/settings`}>
                    View Settings
                  </a>
                </Button>
              </>
            )}

            {deployment.status === "live" && (
              <>
                <Button
                  size="lg"
                  onClick={handleRetry}
                  variant="outline"
                  className="gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Deploy Again
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a href={`/builder/${websiteId}/pages`}>
                    Manage Pages
                  </a>
                </Button>
              </>
            )}
          </div>

          {deployment.status !== "live" && deployment.status !== "error" && (
            <Button variant="ghost" size="lg">
              Cancel
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Deployment Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Builds typically take 30-60 seconds</li>
                    <li>
                      Your site will be available at{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        {websiteId}.pages.dev
                      </code>
                    </li>
                    <li>Custom domains can be configured in settings</li>
                    <li>
                      Past deployments are stored in your deployment history
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
