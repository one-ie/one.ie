/**
 * Add to Cart Card Component
 *
 * Displays product purchase card inline in chat messages
 * Includes quantity selector and buy button
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AddToCartCardProps {
  productName: string;
  productPrice: number;
  productImage?: string;
  stripeEnabled?: boolean;
}

export function AddToCartCard({
  productName,
  productPrice,
  productImage,
  stripeEnabled = false
}: AddToCartCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const subtotal = productPrice * quantity;

  const handleBuyNow = async () => {
    if (stripeEnabled) {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('quantity', String(quantity));
        formData.append('email', 'customer@example.com');

        const response = await fetch(window.location.pathname, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Payment processing failed');
        }

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Payment processing failed. Please try again.');
        setProcessing(false);
      }
    } else {
      // Store quantity in window for ProductHeader to use
      (window as any).orderQuantity = quantity;

      // Dispatch event to open buy dialog in ProductHeader
      window.dispatchEvent(new Event('openBuyDialog'));
    }
  };

  return (
    <Card className="border-2 border-black dark:border-white bg-white dark:bg-black my-4 max-w-sm">
      <CardContent className="p-4 space-y-4">
        {/* Product Info */}
        <div className="flex items-start gap-3">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-16 h-16 object-cover border-2 border-black dark:border-white"
            />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-sm leading-tight tracking-wide">{productName}</h4>
            <p className="text-lg font-bold mt-1 tabular-nums">${productPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.2em]">Quantity</label>
          <div className="flex items-center border-2 border-black dark:border-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-r-2 border-black dark:border-white flex-1"
              aria-label="Decrease quantity"
            >
              <span className="text-lg font-light">−</span>
            </button>
            <div className="px-6 py-3 min-w-[60px] text-center">
              <span className="text-base font-medium tabular-nums">{quantity}</span>
            </div>
            <button
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l-2 border-black dark:border-white flex-1"
              aria-label="Increase quantity"
            >
              <span className="text-lg font-light">+</span>
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-2 pt-2 border-t-2 border-black dark:border-white">
          <div className="flex justify-between text-sm">
            <span className="text-xs tracking-[0.2em] uppercase opacity-60">Subtotal</span>
            <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-xs tracking-[0.2em] uppercase opacity-60">Shipping</span>
            <span className="font-bold tracking-wide">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-black dark:border-white">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Total</span>
            <span className="text-xl font-light tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuyNow}
          disabled={processing}
          className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          <span className="text-xs font-bold tracking-[0.3em] uppercase">
            {processing ? 'Processing...' : 'Buy Now'}
          </span>
        </button>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs tracking-wide opacity-60 pt-2">
          <div>Free Shipping</div>
          <div>90-Day Returns</div>
          <div>3-Year Warranty</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AddToCartCard;
