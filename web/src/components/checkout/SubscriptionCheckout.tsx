/**
 * SubscriptionCheckout Component (Cycle 86)
 *
 * Stripe subscription checkout with trial periods, plan selection,
 * upgrade/downgrade, and cancellation management.
 *
 * Features:
 * - Multiple subscription plans
 * - Trial periods (7, 14, 30 days)
 * - Billing intervals (daily, weekly, monthly, quarterly, yearly)
 * - Upgrade/downgrade with proration
 * - Cancel anytime or at period end
 * - Dunning management (retry failed payments)
 *
 * @see /backend/convex/mutations/payments.ts - Backend mutations
 * @see /backend/convex/services/payments/subscriptions.ts - Subscription service
 */

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Types
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: "day" | "week" | "month" | "year";
  stripePriceId: string;
  features: string[];
  recommended?: boolean;
}

export interface SubscriptionCheckoutProps {
  plans: SubscriptionPlan[];
  productId?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SubscriptionCheckout({
  plans,
  productId,
  onSuccess,
  onError,
  className,
}: SubscriptionCheckoutProps) {
  // State
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "");
  const [trialPeriodDays, setTrialPeriodDays] = useState<number | undefined>(
    undefined
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const userSubscriptions = useQuery(api.queries.payments.getUserSubscriptions);

  // Mutations
  const createSubscription = useMutation(api.mutations.payments.createSubscription);
  const updateSubscription = useMutation(api.mutations.payments.updateSubscription);
  const cancelSubscription = useMutation(api.mutations.payments.cancelSubscription);
  const resumeSubscription = useMutation(api.mutations.payments.resumeSubscription);

  // Derived state
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const activeSubscription = userSubscriptions?.find(
    (s: any) =>
      s.status === "active" &&
      s.properties?.productId === productId &&
      !s.properties?.cancelAtPeriodEnd
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleCreateSubscription = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createSubscription({
        priceId: selectedPlan.stripePriceId,
        productId: productId as any,
        trialPeriodDays,
      });

      onSuccess?.(result.subscriptionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create subscription";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeDowngrade = async () => {
    if (!activeSubscription) return;

    setIsProcessing(true);
    setError(null);

    try {
      await updateSubscription({
        subscriptionId: activeSubscription._id,
        newPriceId: selectedPlan.stripePriceId,
        prorationBehavior: "create_prorations",
      });

      onSuccess?.(activeSubscription._id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update subscription";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async (cancelAtPeriodEnd: boolean) => {
    if (!activeSubscription) return;

    setIsProcessing(true);
    setError(null);

    try {
      await cancelSubscription({
        subscriptionId: activeSubscription._id,
        cancelAtPeriodEnd,
        cancellationReason: "user_requested",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!activeSubscription) return;

    setIsProcessing(true);
    setError(null);

    try {
      await resumeSubscription({
        subscriptionId: activeSubscription._id,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resume subscription";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getIntervalLabel = (interval: string) => {
    const labels: Record<string, string> = {
      day: "Daily",
      week: "Weekly",
      month: "Monthly",
      year: "Yearly",
    };
    return labels[interval] || interval;
  };

  const getDaysUntilNextBilling = () => {
    if (!activeSubscription?.properties?.currentPeriodEnd) return 0;
    return Math.ceil(
      (activeSubscription.properties.currentPeriodEnd - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (userSubscriptions === undefined) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {activeSubscription ? "Manage Subscription" : "Choose Your Plan"}
        </CardTitle>
        <CardDescription>
          {activeSubscription
            ? "Upgrade, downgrade, or cancel your subscription"
            : "Select a subscription plan and start your journey"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Active Subscription Info */}
        {activeSubscription && (
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {activeSubscription.properties?.stripePriceId}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Next Billing</p>
                <p className="font-medium">
                  {activeSubscription.properties?.currentPeriodEnd
                    ? new Date(
                        activeSubscription.properties.currentPeriodEnd
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  in {getDaysUntilNextBilling()} days
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {activeSubscription.properties?.cancelAtPeriodEnd
                    ? "Cancelling at period end"
                    : "Active"}
                </p>
              </div>
            </div>

            {activeSubscription.properties?.cancelAtPeriodEnd && (
              <Alert>
                <AlertDescription>
                  Your subscription will be cancelled at the end of the current
                  billing period. You can resume it anytime before then.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Plan Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            {activeSubscription ? "Change Plan" : "Select Plan"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all relative ${
                  selectedPlanId === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {plan.recommended && (
                  <Badge className="absolute -top-2 -right-2">
                    Recommended
                  </Badge>
                )}
                <h4 className="font-semibold text-lg mb-1">{plan.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {plan.description}
                </p>
                <div className="mb-3">
                  <span className="text-2xl font-bold">
                    ${plan.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{getIntervalLabel(plan.interval).toLowerCase()}
                  </span>
                </div>
                <ul className="space-y-1 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        {/* Trial Period Selection (new subscriptions only) */}
        {!activeSubscription && (
          <>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Trial Period</label>
              <Select
                value={trialPeriodDays?.toString() || "none"}
                onValueChange={(value) =>
                  setTrialPeriodDays(value === "none" ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No trial</SelectItem>
                  <SelectItem value="7">7-day free trial</SelectItem>
                  <SelectItem value="14">14-day free trial</SelectItem>
                  <SelectItem value="30">30-day free trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {trialPeriodDays && (
              <Alert>
                <AlertDescription>
                  You'll get {trialPeriodDays} days free. Your first payment of $
                  {selectedPlan.amount.toFixed(2)} will be charged on{" "}
                  {new Date(
                    Date.now() + trialPeriodDays * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                  .
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Subscription Info */}
        {!activeSubscription && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Subscription Details</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                ✓ Automatic renewal every{" "}
                {getIntervalLabel(selectedPlan.interval).toLowerCase()}
              </li>
              <li>
                ✓{" "}
                {trialPeriodDays
                  ? `First payment after ${trialPeriodDays}-day trial`
                  : `First payment of $${selectedPlan.amount.toFixed(2)} charged immediately`}
              </li>
              <li>✓ Cancel anytime before next billing cycle</li>
              <li>✓ Upgrade or downgrade with proration</li>
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {activeSubscription ? (
          <>
            {activeSubscription.properties?.cancelAtPeriodEnd ? (
              <Button
                className="flex-1"
                onClick={handleResumeSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Resume Subscription"}
              </Button>
            ) : (
              <>
                {selectedPlan.stripePriceId !==
                  activeSubscription.properties?.stripePriceId && (
                  <Button
                    className="flex-1"
                    onClick={handleUpgradeDowngrade}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Change Plan"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCancelSubscription(true)}
                  disabled={isProcessing}
                >
                  Cancel at Period End
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleCancelSubscription(false)}
                  disabled={isProcessing}
                >
                  Cancel Now
                </Button>
              </>
            )}
          </>
        ) : (
          <Button
            className="flex-1"
            onClick={handleCreateSubscription}
            disabled={isProcessing}
          >
            {isProcessing
              ? "Processing..."
              : trialPeriodDays
              ? `Start ${trialPeriodDays}-Day Trial`
              : `Subscribe - $${selectedPlan.amount.toFixed(2)}/${getIntervalLabel(selectedPlan.interval).toLowerCase()}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
