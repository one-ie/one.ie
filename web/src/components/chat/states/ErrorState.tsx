/**
 * CYCLE 76: ErrorState Component
 *
 * Error states with helpful recovery actions:
 * - Network error (with retry countdown)
 * - Permission denied (with request access)
 * - Not found (with navigation)
 * - Rate limit (with cooldown timer)
 * - Server error (with support link)
 *
 * Features:
 * - Auto-retry with countdown
 * - Helpful error messages
 * - Recovery actions
 * - Dark mode support
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Lock,
  Search,
  Clock,
  ServerCrash,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorStateType =
  | "network-error"
  | "permission-denied"
  | "not-found"
  | "rate-limit"
  | "server-error"
  | "unknown-error";

interface ErrorStateProps {
  type: ErrorStateType;
  error?: Error | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onRequestAccess?: () => void;
  resourceName?: string;
  cooldownSeconds?: number;
  className?: string;
}

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  actions?: Array<{
    label: string;
    variant?: "default" | "outline" | "secondary";
    handler?: "retry" | "goBack" | "requestAccess";
  }>;
}

export function ErrorState({
  type,
  error,
  onRetry,
  onGoBack,
  onRequestAccess,
  resourceName,
  cooldownSeconds = 5,
  className
}: ErrorStateProps) {
  const [countdown, setCountdown] = useState(cooldownSeconds);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-retry countdown for network errors
  useEffect(() => {
    if (type === "network-error" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (type === "network-error" && countdown === 0 && onRetry) {
      handleRetry();
    }
  }, [type, countdown, onRetry]);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
      setCountdown(cooldownSeconds); // Reset countdown
    }
  };

  const configs: Record<ErrorStateType, ErrorConfig> = {
    "network-error": {
      icon: <WifiOff className="h-12 w-12" />,
      title: "Connection lost",
      description:
        "Unable to reach the server. Your messages are safe and will be sent when connection is restored.",
      severity: "error",
      actions: [
        { label: "Retry Now", variant: "default", handler: "retry" },
        { label: "Go Offline", variant: "outline", handler: "goBack" }
      ]
    },
    "permission-denied": {
      icon: <Lock className="h-12 w-12" />,
      title: "Access denied",
      description: resourceName
        ? `You don't have permission to view ${resourceName}.`
        : "You don't have permission to view this resource.",
      severity: "warning",
      actions: [
        {
          label: "Request Access",
          variant: "default",
          handler: "requestAccess"
        },
        { label: "Go Back", variant: "outline", handler: "goBack" }
      ]
    },
    "not-found": {
      icon: <Search className="h-12 w-12" />,
      title: "Channel not found",
      description: resourceName
        ? `The ${resourceName} you're looking for doesn't exist or has been deleted.`
        : "The resource you're looking for doesn't exist or has been deleted.",
      severity: "warning",
      actions: [
        { label: "Browse Channels", variant: "default", handler: "goBack" },
        { label: "Go Home", variant: "outline", handler: "goBack" }
      ]
    },
    "rate-limit": {
      icon: <Clock className="h-12 w-12" />,
      title: "Slow down there!",
      description:
        "You're sending messages too quickly. Please wait a moment before trying again.",
      severity: "info",
      actions: [{ label: "Okay", variant: "default", handler: "goBack" }]
    },
    "server-error": {
      icon: <ServerCrash className="h-12 w-12" />,
      title: "Something went wrong",
      description:
        "We're having trouble processing your request. Our team has been notified and is working on it.",
      severity: "error",
      actions: [
        { label: "Retry", variant: "default", handler: "retry" },
        { label: "Contact Support", variant: "outline", handler: "goBack" }
      ]
    },
    "unknown-error": {
      icon: <AlertCircle className="h-12 w-12" />,
      title: "Unexpected error",
      description:
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "An unexpected error occurred. Please try again.",
      severity: "error",
      actions: [
        { label: "Retry", variant: "default", handler: "retry" },
        { label: "Go Back", variant: "outline", handler: "goBack" }
      ]
    }
  };

  const config = configs[type];

  const handleAction = (handler?: string) => {
    switch (handler) {
      case "retry":
        handleRetry();
        break;
      case "goBack":
        onGoBack?.();
        break;
      case "requestAccess":
        onRequestAccess?.();
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full items-center justify-center p-8",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Alert Container */}
        <Alert variant={config.severity === "error" ? "destructive" : "default"}>
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            {/* Icon */}
            <div
              className={cn(
                config.severity === "error" && "text-destructive",
                config.severity === "warning" && "text-orange-600",
                config.severity === "info" && "text-blue-600"
              )}
              aria-hidden="true"
            >
              {config.icon}
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <AlertTitle className="text-lg font-semibold">
                {config.title}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {config.description}
              </AlertDescription>
            </div>

            {/* Countdown timer for network errors */}
            {type === "network-error" && countdown > 0 && (
              <div className="text-sm text-muted-foreground">
                Reconnecting in{" "}
                <span className="font-mono font-semibold">{countdown}</span>{" "}
                seconds...
              </div>
            )}

            {/* Cooldown timer for rate limits */}
            {type === "rate-limit" && cooldownSeconds > 0 && (
              <div className="text-sm text-muted-foreground">
                Cooldown:{" "}
                <span className="font-mono font-semibold">
                  00:{cooldownSeconds.toString().padStart(2, "0")}
                </span>{" "}
                remaining
              </div>
            )}

            {/* Action Buttons */}
            {config.actions && (
              <div className="flex gap-2 pt-2">
                {config.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    onClick={() => handleAction(action.handler)}
                    disabled={
                      isRetrying ||
                      (action.handler === "retry" &&
                        type === "network-error" &&
                        countdown > 0)
                    }
                  >
                    {isRetrying && action.handler === "retry" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      action.label
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Alert>

        {/* Error details (for debugging) */}
        {error && typeof error !== "string" && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:underline">
              Technical details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
