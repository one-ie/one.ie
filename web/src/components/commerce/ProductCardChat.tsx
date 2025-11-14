/**
 * Product Card for Chat
 *
 * Compact product display for use in chat interface
 */

import type { Product } from '@/lib/types/commerce';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardChatProps {
  product: Product;
  reasoning?: string;
  onAction?: (action: string, productId: string) => void;
  compact?: boolean;
}

export function ProductCardChat({
  product,
  reasoning,
  onAction,
  compact = false,
}: ProductCardChatProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="flex-none w-20 h-20 bg-muted rounded-md overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{product.name}</h4>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="mt-1">
              <span className="text-lg font-bold">
                {product.currency}
                {product.price}
              </span>
              {product.inStock ? (
                <span className="ml-2 text-xs text-green-600">In Stock</span>
              ) : (
                <span className="ml-2 text-xs text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Reasoning (if provided) */}
            {reasoning && !compact && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {reasoning}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onAction?.('view_details', product.id)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Details
              </Button>
              {product.inStock && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAction?.('buy_now', product.id)}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
