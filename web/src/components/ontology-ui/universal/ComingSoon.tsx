/**
 * ComingSoon - Coming soon page component
 *
 * Uses 6-token design system for consistent coming soon pages.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import { Sparkles, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export interface ComingSoonProps {
  title?: string;
  description?: string;
  features?: string[];
  showEmailCapture?: boolean;
  onEmailSubmit?: (email: string) => void;
  className?: string;
}

/**
 * ComingSoon - Feature coming soon page
 *
 * @example
 * ```tsx
 * <ComingSoon
 *   title="Advanced Analytics"
 *   description="Get insights into your data"
 *   features={["Real-time dashboards", "Custom reports", "Export tools"]}
 *   onEmailSubmit={(email) => saveToWaitlist(email)}
 * />
 * ```
 */
export function ComingSoon({
  title = "Coming soon",
  description = "We're working on something exciting. Stay tuned for updates!",
  features = [],
  showEmailCapture = true,
  onEmailSubmit,
  className,
}: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && onEmailSubmit) {
      onEmailSubmit(email);
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <Card className={cn("bg-background p-1 shadow-md rounded-md max-w-2xl mx-auto mt-16", className)}>
      <CardContent className="bg-foreground p-12 rounded-md text-center">
        {/* Sparkles Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-tertiary/10 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-tertiary" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4 flex justify-center">
          <Badge variant="outline" className="gap-2 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
            Coming Soon
          </Badge>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-font mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-font/60 mb-6 max-w-md mx-auto">
          {description}
        </p>

        {/* Features List */}
        {features.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-font/60 uppercase tracking-wide mb-3">
              What to expect
            </p>
            <ul className="space-y-2 text-left max-w-sm mx-auto">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-font/80">
                  <ArrowRight className="h-4 w-4 text-tertiary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email Capture */}
        {showEmailCapture && (
          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="bg-tertiary/10 text-tertiary p-4 rounded-md">
                <Mail className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm font-medium">Thanks! We'll keep you updated.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="default">
                  Notify Me
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
