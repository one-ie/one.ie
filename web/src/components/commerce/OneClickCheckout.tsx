/**
 * One-Click Checkout Component
 *
 * Pre-filled checkout optimized for conversational commerce
 * Minimizes friction from chat to purchase
 */

import { useState } from 'react';
import type { Product } from '@/lib/types/commerce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, ShoppingCart, Sparkles } from 'lucide-react';

interface OneClickCheckoutProps {
  product: Product;
  conversationId?: string;
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
}

export function OneClickCheckout({
  product,
  conversationId,
  onComplete,
  onCancel,
}: OneClickCheckoutProps) {
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const subtotal = product.price * quantity;
  const shipping = product.price > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Create order
      const response = await fetch('/api/commerce/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          email,
          name,
          conversationId,
          source: 'commerce_chat',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.(data.orderId);
        }, 2000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground mb-4">
          Thank you for your purchase. You'll receive a confirmation email at{' '}
          {email}
        </p>
        <Badge variant="outline" className="mb-6">
          Order tracking available in your email
        </Badge>
        <Button onClick={() => onComplete?.('order-123')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Recommended Badge */}
      {conversationId && (
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">
            Recommended by your Product Advisor
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product */}
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-none">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.category}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm">
                    {product.currency}
                    {product.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quantity" className="text-sm">
                      Qty:
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {product.currency}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      FREE
                    </Badge>
                  ) : (
                    `${product.currency}${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>
                  {product.currency}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600" />
                <span>Estimated delivery: 3-5 business days</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600" />
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-600" />
                <span>Secure checkout</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send your order confirmation here
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Card Details (Simplified for demo) */}
              <div className="space-y-2">
                <Label htmlFor="card">Card Information</Label>
                <Input
                  id="card"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="text" placeholder="MM / YY" />
                  <Input type="text" placeholder="CVC" />
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Back to Chat
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!email || !name || isProcessing}
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    `Pay ${product.currency}${total.toFixed(2)}`
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By completing this purchase you agree to our Terms of Service
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
