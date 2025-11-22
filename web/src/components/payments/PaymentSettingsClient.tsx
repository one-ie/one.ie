/**
 * PaymentSettingsClient - React component for managing Stripe settings
 *
 * Features:
 * - Create Stripe product
 * - Configure pricing
 * - View current settings
 * - Test payment flow
 *
 * @see /web/CLAUDE.md - Frontend patterns
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, DollarSign, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isStripeConfigured, formatCurrency } from "@/lib/stripe/stripe-client";

export interface PaymentSettingsClientProps {
  funnelId: string;
}

export function PaymentSettingsClient({ funnelId }: PaymentSettingsClientProps) {
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isCreatingPrice, setIsCreatingPrice] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);

  // Form state
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("usd");
  const [priceType, setPriceType] = useState<"one_time" | "recurring">("one_time");
  const [recurringInterval, setRecurringInterval] = useState<"month" | "year">("month");

  // Convex hooks
  const settings = useQuery(api.queries.payments.getFunnelPaymentSettings, {
    funnelId: funnelId as Id<"things">,
  });

  const createProduct = useMutation(api.mutations.payments.createStripeProduct);
  const createPrice = useMutation(api.mutations.payments.createStripePrice);

  // Check if Stripe is configured
  const stripeConfigured = isStripeConfigured();

  // Auto-populate product name from funnel
  useEffect(() => {
    if (settings && !productName) {
      setProductName(settings.funnelName);
    }
  }, [settings, productName]);

  const handleCreateProduct = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsCreatingProduct(true);

    try {
      const result = await createProduct({
        funnelId: funnelId as Id<"things">,
        name: productName,
        description: productDescription || undefined,
      });

      toast.success("Stripe product created successfully!");
      setShowPriceForm(true);
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleCreatePrice = async () => {
    if (!priceAmount || parseFloat(priceAmount) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!settings?.stripeProductId) {
      toast.error("Please create a product first");
      return;
    }

    setIsCreatingPrice(true);

    try {
      const unitAmount = Math.round(parseFloat(priceAmount) * 100); // Convert to cents

      const result = await createPrice({
        funnelId: funnelId as Id<"things">,
        productId: settings.stripeProductId,
        unitAmount,
        currency: priceCurrency,
        recurring:
          priceType === "recurring"
            ? {
                interval: recurringInterval,
              }
            : undefined,
      });

      toast.success("Price created successfully!");
      setShowPriceForm(false);
    } catch (error: any) {
      console.error("Failed to create price:", error);
      toast.error(error.message || "Failed to create price");
    } finally {
      setIsCreatingPrice(false);
    }
  };

  if (!stripeConfigured) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Stripe is not configured. Please set <code>PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your
          environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  if (settings === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Funnel not found or you don't have access to this funnel.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Payment Settings
          </CardTitle>
          <CardDescription>
            Stripe configuration for <strong>{settings.funnelName}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Stripe Product</div>
              <div className="text-sm text-muted-foreground">
                {settings.stripeProductId || "Not configured"}
              </div>
            </div>
            {settings.stripeProductId && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                <Check className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Stripe Price</div>
              <div className="text-sm text-muted-foreground">
                {settings.stripePriceId || "Not configured"}
              </div>
            </div>
            {settings.stripePriceId && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950">
                <Check className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            )}
          </div>

          {settings.hasStripeSetup && (
            <>
              <Separator />
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Payment processing is fully configured and ready to accept payments!
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Product */}
      {!settings.stripeProductId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Create Stripe Product
            </CardTitle>
            <CardDescription>
              Create a product in Stripe for this funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Description (Optional)</Label>
              <Input
                id="productDescription"
                type="text"
                placeholder="Enter product description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateProduct}
              disabled={isCreatingProduct || !productName.trim()}
              className="w-full"
            >
              {isCreatingProduct ? "Creating..." : "Create Product"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Create Price */}
      {settings.stripeProductId && (!settings.stripePriceId || showPriceForm) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {settings.stripePriceId ? "Create Additional Price" : "Configure Pricing"}
            </CardTitle>
            <CardDescription>
              Set up pricing for your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priceAmount">Price Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="priceAmount"
                  type="number"
                  placeholder="0.00"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
                <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceType">Price Type</Label>
              <Select
                value={priceType}
                onValueChange={(value: any) => setPriceType(value)}
              >
                <SelectTrigger id="priceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time payment</SelectItem>
                  <SelectItem value="recurring">Recurring subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {priceType === "recurring" && (
              <div className="space-y-2">
                <Label htmlFor="recurringInterval">Billing Interval</Label>
                <Select
                  value={recurringInterval}
                  onValueChange={(value: any) => setRecurringInterval(value)}
                >
                  <SelectTrigger id="recurringInterval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {priceAmount && (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground mb-1">Preview</div>
                <div className="text-xl font-bold">
                  {formatCurrency(
                    Math.round(parseFloat(priceAmount) * 100),
                    priceCurrency
                  )}
                  {priceType === "recurring" && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {recurringInterval}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {settings.stripePriceId && (
              <Button
                variant="outline"
                onClick={() => setShowPriceForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleCreatePrice}
              disabled={isCreatingPrice || !priceAmount}
              className="flex-1"
            >
              {isCreatingPrice ? "Creating..." : "Create Price"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Add Price Button */}
      {settings.stripePriceId && !showPriceForm && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              onClick={() => setShowPriceForm(true)}
              className="w-full"
            >
              Add Additional Price
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
