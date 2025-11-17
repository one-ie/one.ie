/**
 * OnboardingCompleted - Success screen after completing onboarding
 *
 * Shows congratulations message and next steps
 */

import { ArrowRight, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OnboardingCompletedProps {
  userId: string;
  workspaceName?: string;
}

export function OnboardingCompleted({
  userId,
  workspaceName = "Your Workspace",
}: OnboardingCompletedProps) {
  return (
    <div className="space-y-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
          <CheckCircle className="w-20 h-20 text-primary relative" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">You're All Set!</h2>
        <p className="text-muted-foreground">Your Wave 1 creator profile is ready to go</p>
      </div>

      {/* What You've Created */}
      <Card className="p-6 bg-muted/50 border-primary/20">
        <h3 className="font-semibold mb-4">What You've Created</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Creator Profile</p>
              <p className="text-sm text-muted-foreground">
                Your public profile with skills and expertise
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Workspace</p>
              <p className="text-sm text-muted-foreground">{workspaceName} for your projects</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Team Invitations Sent</p>
              <p className="text-sm text-muted-foreground">Your team members can join anytime</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <div className="space-y-3">
        <h3 className="font-semibold">Next Steps</h3>
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Explore your dashboard to start creating content and managing your workspace.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = "/account/settings";
          }}
        >
          <Settings className="w-4 h-4 mr-2" />
          Review Settings
        </Button>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground pt-4 space-y-1">
        <p>
          Have questions? Visit our{" "}
          <a href="/help" className="text-primary hover:underline">
            help center
          </a>
        </p>
        <p>
          Learn more about{" "}
          <a href="/docs" className="text-primary hover:underline">
            Wave 1 features
          </a>
        </p>
      </div>
    </div>
  );
}
