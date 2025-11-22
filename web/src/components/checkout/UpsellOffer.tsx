/**
 * UpsellOffer Component (Cycle 84)
 * One-click upsell with countdown timer and urgency
 *
 * Features:
 * - One-click purchase using saved payment method
 * - Product image, headline, benefits, price display
 * - Countdown timer for urgency
 * - Limited quantity scarcity
 * - Clear Accept/Decline CTAs
 * - Analytics tracking
 * - Supports chained upsells
 *
 * Usage:
 * <UpsellOffer
 *   offer={upsellOffer}
 *   onAccept={(orderId) => router.push(`/upsell/${nextOfferId}`)}
 *   onDecline={() => router.push('/thankyou')}
 * />
 */

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export interface UpsellProduct {
  id: string;
  name: string;
  description: string;
  headline: string;
  benefits: string[];
  image?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  stockRemaining?: number;
}

export interface UpsellOffer {
  id: string;
  product: UpsellProduct;
  timerSeconds: number;
  nextOfferId?: string; // For chained upsells
}

interface UpsellOfferProps {
  offer: UpsellOffer;
  onAccept: (orderId: string) => void;
  onDecline: () => void;
  paymentMethodId?: string; // Saved payment method from initial purchase
}

export function UpsellOffer({
  offer,
  onAccept,
  onDecline,
  paymentMethodId,
}: UpsellOfferProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(offer.timerSeconds);
  const [hasViewed, setHasViewed] = useState(false);

  const { product } = offer;
  const savings = product.originalPrice - product.discountedPrice;
  const savingsPercent = Math.round(
    (savings / product.originalPrice) * 100
  );

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      onDecline(); // Auto-decline when timer expires
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onDecline]);

  // Track view event
  useEffect(() => {
    if (!hasViewed) {
      setHasViewed(true);
      trackAnalytics("upsell_viewed", {
        offer_id: offer.id,
        product_id: product.id,
        product_name: product.name,
        price: product.discountedPrice,
      });
    }
  }, [hasViewed, offer, product]);

  /**
   * Format time remaining as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Format price for display
   */
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  /**
   * Track analytics events
   */
  const trackAnalytics = (
    eventName: string,
    params: Record<string, unknown>
  ) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    }
  };

  /**
   * Handle one-click purchase
   */
  const handleAccept = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Process one-click payment
      const response = await fetch("/api/checkout/upsell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: offer.id,
          productId: product.id,
          amount: product.discountedPrice,
          paymentMethodId: paymentMethodId, // Use saved payment method
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      const data = await response.json();

      // Track acceptance
      trackAnalytics("upsell_accepted", {
        offer_id: offer.id,
        product_id: product.id,
        product_name: product.name,
        price: product.discountedPrice,
        time_remaining: timeRemaining,
        order_id: data.orderId,
      });

      // Calculate acceptance rate
      const acceptanceRate = await calculateAcceptanceRate(offer.id, true);
      trackAnalytics("upsell_acceptance_rate", {
        offer_id: offer.id,
        rate: acceptanceRate,
      });

      onAccept(data.orderId);
    } catch (err) {
      console.error("Upsell payment error:", err);
      setError(
        "Payment failed. Please try again or contact support if the issue persists."
      );
      trackAnalytics("upsell_payment_failed", {
        offer_id: offer.id,
        product_id: product.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle decline
   */
  const handleDecline = () => {
    trackAnalytics("upsell_declined", {
      offer_id: offer.id,
      product_id: product.id,
      product_name: product.name,
      time_remaining: timeRemaining,
    });

    // Calculate acceptance rate
    calculateAcceptanceRate(offer.id, false);

    onDecline();
  };

  /**
   * Calculate and store acceptance rate for analytics
   */
  const calculateAcceptanceRate = async (
    offerId: string,
    accepted: boolean
  ): Promise<number> => {
    if (typeof window === "undefined") return 0;

    try {
      const key = `upsell_stats_${offerId}`;
      const stored = localStorage.getItem(key);
      const stats = stored
        ? JSON.parse(stored)
        : { views: 0, accepts: 0 };

      stats.views += 1;
      if (accepted) {
        stats.accepts += 1;
      }

      localStorage.setItem(key, JSON.stringify(stats));

      return stats.views > 0 ? (stats.accepts / stats.views) * 100 : 0;
    } catch (error) {
      console.error("Failed to calculate acceptance rate:", error);
      return 0;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Urgency Banner */}
      <div className="rounded-lg bg-gradient-to-r from-orange-500 to-red-600 p-4 text-center text-white">
        <div className="flex items-center justify-center gap-2">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-bold">
            SPECIAL ONE-TIME OFFER - {formatTime(timeRemaining)}
          </p>
        </div>
        <p className="mt-1 text-sm opacity-90">
          This exclusive offer expires when the timer runs out!
        </p>
      </div>

      {/* Main Offer Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                EXCLUSIVE UPGRADE
              </Badge>
              <CardTitle className="text-3xl font-bold">
                {product.headline}
              </CardTitle>
            </div>
            {product.stockRemaining && product.stockRemaining <= 10 && (
              <Badge variant="destructive">
                Only {product.stockRemaining} left!
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Product Image and Description */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image */}
            {product.image && (
              <div className="overflow-hidden rounded-lg border">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="mb-3 font-semibold">What You'll Get:</h4>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular Price</p>
                <p className="text-2xl font-bold text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  One-Time Offer Price
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">
                    {formatPrice(product.discountedPrice)}
                  </p>
                  <Badge variant="secondary" className="text-lg">
                    Save {savingsPercent}%
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-center font-semibold text-green-800 dark:text-green-200">
                💰 You Save {formatPrice(savings)} Today!
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              size="lg"
              onClick={handleAccept}
              disabled={isProcessing || timeRemaining <= 0}
              className="w-full bg-green-600 text-lg font-bold hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  ✓ YES! Add to My Order
                  <span className="ml-2 text-sm font-normal">
                    ({formatPrice(product.discountedPrice)})
                  </span>
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full text-lg"
            >
              No Thanks, I'll Pass
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Checkout
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Money-Back Guarantee
            </div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Fast Delivery
            </div>
          </div>

          {/* Fine Print */}
          <p className="text-center text-xs text-muted-foreground">
            By clicking "YES! Add to My Order", you agree to be charged{" "}
            {formatPrice(product.discountedPrice)} using your saved payment method.
            No need to re-enter payment information.
          </p>
        </CardContent>
      </Card>

      {/* Social Proof / Scarcity */}
      {product.stockRemaining && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <p className="text-center text-sm font-medium text-orange-800 dark:text-orange-200">
            ⚡ {product.stockRemaining} items left at this price • {timeRemaining}{" "}
            customers viewing this offer
          </p>
        </div>
      )}
    </div>
  );
}
