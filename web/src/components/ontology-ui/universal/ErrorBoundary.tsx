/**
 * ErrorBoundary - Catches and displays errors in child components
 *
 * Uses 6-token design system for consistent error displays.
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - React error boundary with design system styling
 *
 * @example
 * ```tsx
 * <ErrorBoundary onReset={() => window.location.reload()}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-font">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-foreground p-6 rounded-md">
            <p className="text-sm text-font/80 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="text-xs bg-background p-4 rounded-md overflow-auto mb-4 text-font">
                {this.state.error.stack}
              </pre>
            )}

            <Button
              onClick={this.handleReset}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
