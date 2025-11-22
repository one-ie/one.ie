/**
 * Stripe Client - Frontend utilities for Stripe payment processing
 *
 * This module provides utilities for initializing Stripe.js and handling
 * payment operations on the frontend.
 *
 * Key Features:
 * - Stripe.js initialization
 * - Payment Element mounting
 * - Checkout redirection
 * - Error handling
 *
 * @see /web/CLAUDE.md - Frontend patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";

// ============================================================================
// Stripe Initialization
// ============================================================================

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe.js instance (singleton pattern)
 *
 * @returns Promise resolving to Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error(
        "Stripe publishable key not found. Set PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable."
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// ============================================================================
// Payment Intent Handling
// ============================================================================

export interface PaymentIntentOptions {
  amount: number;
  currency: string;
  funnelId: string;
  description?: string;
}

export interface CheckoutOptions {
  funnelId: string;
  priceId: string;
  quantity: number;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a payment intent via backend
 *
 * @param options - Payment intent options
 * @param createPaymentIntentMutation - Convex mutation function
 * @returns Promise resolving to client secret
 */
export async function createPaymentIntent(
  options: PaymentIntentOptions,
  createPaymentIntentMutation: (args: any) => Promise<any>
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  try {
    const result = await createPaymentIntentMutation({
      funnelId: options.funnelId,
      amount: options.amount,
      currency: options.currency,
      description: options.description,
    });

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    return null;
  }
}

/**
 * Create a checkout session and redirect to Stripe Checkout
 *
 * @param options - Checkout options
 * @param createCheckoutSessionMutation - Convex mutation function
 * @returns Promise resolving when redirect is complete
 */
export async function createCheckoutSession(
  options: CheckoutOptions,
  createCheckoutSessionMutation: (args: any) => Promise<any>
): Promise<void> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe.js not initialized");
    }

    // Get current URL for success/cancel redirects
    const baseUrl = window.location.origin;
    const successUrl =
      options.successUrl || `${baseUrl}/funnels/${options.funnelId}/success`;
    const cancelUrl =
      options.cancelUrl || `${baseUrl}/funnels/${options.funnelId}/cancel`;

    // Create checkout session via backend
    const { sessionId } = await createCheckoutSessionMutation({
      funnelId: options.funnelId,
      priceId: options.priceId,
      quantity: options.quantity,
      successUrl,
      cancelUrl,
    });

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("Stripe redirect error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
}

// ============================================================================
// Payment Element Mounting
// ============================================================================

export interface MountPaymentElementOptions {
  clientSecret: string;
  elementId: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
}

/**
 * Mount Stripe Payment Element to DOM
 *
 * @param options - Mount options
 * @returns Promise resolving to Stripe Elements instance
 */
export async function mountPaymentElement(
  options: MountPaymentElementOptions
): Promise<StripeElements | null> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe.js not initialized");
    }

    // Create Stripe Elements instance
    const elements = stripe.elements({
      clientSecret: options.clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "hsl(var(--primary))",
          colorBackground: "hsl(var(--background))",
          colorText: "hsl(var(--foreground))",
          colorDanger: "hsl(var(--destructive))",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "0.5rem",
        },
      },
    });

    // Create and mount Payment Element
    const paymentElement = elements.create("payment");
    paymentElement.mount(`#${options.elementId}`);

    return elements;
  } catch (error) {
    console.error("Failed to mount payment element:", error);
    if (options.onError) {
      options.onError(error);
    }
    return null;
  }
}

/**
 * Confirm payment with mounted Payment Element
 *
 * @param elements - Stripe Elements instance
 * @param returnUrl - URL to return to after payment
 * @returns Promise resolving to payment confirmation result
 */
export async function confirmPayment(
  elements: StripeElements,
  returnUrl?: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe.js not initialized");
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || window.location.href,
      },
    });

    if (error) {
      console.error("Payment confirmation error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    return { success: false, error };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency amount for display
 *
 * @param amount - Amount in cents
 * @param currency - Currency code (e.g., "usd")
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Parse Stripe error message for user-friendly display
 *
 * @param error - Stripe error object
 * @returns User-friendly error message
 */
export function parseStripeError(error: any): string {
  if (!error) return "An unknown error occurred";

  if (error.type === "card_error") {
    return error.message || "Your card was declined";
  }

  if (error.type === "validation_error") {
    return error.message || "Please check your payment information";
  }

  return error.message || "Payment processing failed. Please try again.";
}

/**
 * Check if Stripe is configured
 *
 * @returns True if Stripe publishable key is set
 */
export function isStripeConfigured(): boolean {
  return !!import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

// ============================================================================
// React Hook for Payment Element
// ============================================================================

/**
 * React hook for managing Stripe Payment Element
 *
 * Usage:
 * ```tsx
 * const { mount, confirm, isLoading, error } = useStripePayment({
 *   clientSecret: "pi_xxx_secret_xxx",
 *   onSuccess: (paymentIntent) => { ... },
 *   onError: (error) => { ... }
 * });
 *
 * useEffect(() => {
 *   mount("payment-element");
 * }, [mount]);
 *
 * const handleSubmit = async () => {
 *   await confirm("/success");
 * };
 * ```
 */
export interface UseStripePaymentOptions {
  clientSecret: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
}

export function useStripePayment(options: UseStripePaymentOptions) {
  let elements: StripeElements | null = null;
  let isLoading = false;
  let error: string | null = null;

  const mount = async (elementId: string) => {
    isLoading = true;
    error = null;

    elements = await mountPaymentElement({
      clientSecret: options.clientSecret,
      elementId,
      onSuccess: options.onSuccess,
      onError: (err) => {
        error = parseStripeError(err);
        if (options.onError) {
          options.onError(err);
        }
      },
    });

    isLoading = false;
  };

  const confirm = async (returnUrl?: string) => {
    if (!elements) {
      error = "Payment element not mounted";
      return { success: false, error };
    }

    isLoading = true;
    error = null;

    const result = await confirmPayment(elements, returnUrl);

    if (!result.success) {
      error = parseStripeError(result.error);
      if (options.onError) {
        options.onError(result.error);
      }
    } else {
      if (options.onSuccess) {
        options.onSuccess(null);
      }
    }

    isLoading = false;
    return result;
  };

  return {
    mount,
    confirm,
    isLoading,
    error,
  };
}
