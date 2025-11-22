/**
 * CheckoutForm Component (Cycle 82)
 * Complete checkout form with Stripe Elements integration
 *
 * Features:
 * - Billing address collection
 * - Stripe Payment Element for card input
 * - Real-time validation
 * - Error handling and display
 * - Loading states during payment processing
 * - Success callback on payment completion
 *
 * Usage:
 * <StripeProvider clientSecret={clientSecret}>
 *   <CheckoutForm
 *     funnelId="funnel-123"
 *     stepId="step-456"
 *     total={9900}
 *     onSuccess={(orderId) => router.push(`/success?order=${orderId}`)}
 *   />
 * </StripeProvider>
 */

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillingAddress, StripeError } from "@/types/stripe";

interface CheckoutFormProps {
  funnelId: string;
  stepId: string;
  total: number;
  onSuccess: (orderId: string) => void;
  onError?: (error: StripeError) => void;
  returnUrl?: string;
}

export function CheckoutForm({
  funnelId,
  stepId,
  total,
  onSuccess,
  onError,
  returnUrl,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Billing address state
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  // Track when payment element is ready
  useEffect(() => {
    if (!elements) return;

    const paymentElement = elements.getElement("payment");
    if (paymentElement) {
      paymentElement.on("ready", () => {
        setIsReady(true);
      });
    }
  }, [elements]);

  /**
   * Handle billing address field changes
   */
  const handleAddressChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Validate billing address
   */
  const validateBillingAddress = (): boolean => {
    const required = ["name", "email", "line1", "city", "state", "postal_code"];
    for (const field of required) {
      if (!billingAddress[field as keyof BillingAddress]) {
        setError(`Please enter your ${field.replace("_", " ")}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingAddress.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  /**
   * Handle payment submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stripe is loaded
    if (!stripe || !elements) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    // Validate billing address
    if (!validateBillingAddress()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url:
              returnUrl ||
              `${window.location.origin}/checkout/success?funnel=${funnelId}`,
            payment_method_data: {
              billing_details: {
                name: billingAddress.name,
                email: billingAddress.email,
                address: {
                  line1: billingAddress.line1,
                  line2: billingAddress.line2 || undefined,
                  city: billingAddress.city,
                  state: billingAddress.state,
                  postal_code: billingAddress.postal_code,
                  country: billingAddress.country,
                },
              },
            },
          },
          redirect: "if_required",
        }
      );

      if (stripeError) {
        // Payment failed - handle different error types
        const errorObj: StripeError = {
          type: stripeError.type as StripeError["type"],
          code: stripeError.code,
          message: getErrorMessage(stripeError),
          param: stripeError.param,
        };

        setError(errorObj.message);
        if (onError) {
          onError(errorObj);
        }
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - confirm with backend
        try {
          const response = await fetch("/api/checkout/confirm", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              billingAddress,
              metadata: {
                funnelId,
                stepId,
                total,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to confirm order");
          }

          const data = await response.json();
          onSuccess(data.orderId || paymentIntent.id);
        } catch (err) {
          setError(
            "Payment succeeded but order confirmation failed. Please contact support."
          );
          console.error("Order confirmation error:", err);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get user-friendly error message from Stripe error
   */
  const getErrorMessage = (stripeError: any): string => {
    switch (stripeError.code) {
      case "card_declined":
        return "Your card was declined. Please try a different payment method.";
      case "insufficient_funds":
        return "Your card has insufficient funds. Please try a different card.";
      case "expired_card":
        return "Your card has expired. Please use a different card.";
      case "incorrect_cvc":
        return "The security code (CVC) is incorrect. Please check and try again.";
      case "processing_error":
        return "An error occurred while processing your card. Please try again.";
      case "rate_limit":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return stripeError.message || "Payment failed. Please try again.";
    }
  };

  /**
   * Format total for display
   */
  const formatTotal = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold">Payment Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your billing information to complete your purchase
        </p>
      </div>

      {/* Billing Address Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Billing Address</h3>

        {/* Name & Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={billingAddress.name}
              onChange={(e) => handleAddressChange("name", e.target.value)}
              disabled={isProcessing}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={billingAddress.email}
              onChange={(e) => handleAddressChange("email", e.target.value)}
              disabled={isProcessing}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="line1">Address *</Label>
          <Input
            id="line1"
            type="text"
            placeholder="123 Main Street"
            value={billingAddress.line1}
            onChange={(e) => handleAddressChange("line1", e.target.value)}
            disabled={isProcessing}
            required
            autoComplete="address-line1"
          />
        </div>

        {/* Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="line2">Apartment, suite, etc. (optional)</Label>
          <Input
            id="line2"
            type="text"
            placeholder="Apt 4B"
            value={billingAddress.line2 || ""}
            onChange={(e) => handleAddressChange("line2", e.target.value)}
            disabled={isProcessing}
            autoComplete="address-line2"
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              type="text"
              placeholder="New York"
              value={billingAddress.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              disabled={isProcessing}
              required
              autoComplete="address-level2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              type="text"
              placeholder="NY"
              value={billingAddress.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              disabled={isProcessing}
              required
              autoComplete="address-level1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">ZIP Code *</Label>
            <Input
              id="postal_code"
              type="text"
              placeholder="10001"
              value={billingAddress.postal_code}
              onChange={(e) =>
                handleAddressChange("postal_code", e.target.value)
              }
              disabled={isProcessing}
              required
              autoComplete="postal-code"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="space-y-4">
        <h3 className="font-semibold">Payment Method</h3>

        {/* Stripe Payment Element */}
        <div className="rounded-lg border p-4 bg-muted/20">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>

        {/* Payment Info */}
        <p className="text-xs text-muted-foreground">
          Your payment information is encrypted and secure. We never store your
          card details.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Order Total Summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Amount</span>
          <span className="text-xl font-bold">{formatTotal(total)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !isReady || isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Processing Payment...
          </>
        ) : (
          <>Pay {formatTotal(total)}</>
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-center text-xs text-muted-foreground">
        Secured by Stripe • 256-bit SSL encryption • PCI DSS compliant
      </p>
    </form>
  );
}
