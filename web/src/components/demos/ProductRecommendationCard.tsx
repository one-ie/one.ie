/**
 * Product Recommendation Card
 *
 * Displays product recommendations within chat with match reasoning
 */

import type { Product } from '@/stores/buyInChatGPTDemo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, ShoppingBag } from 'lucide-react';

interface ProductRecommendationCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductRecommendationCard({
  product,
  onSelect,
}: ProductRecommendationCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/50">
      <CardContent className="p-0">
        <div className="flex gap-3 p-3">
          {/* Product Image */}
          <div className="flex-none w-24 h-24 bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm line-clamp-2">
                {product.name}
              </h4>
              {product.inStock && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  <Check className="w-3 h-3 mr-1" />
                  In Stock
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">(500+ reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-bold">${product.price}</span>
              <span className="text-xs text-muted-foreground line-through">
                ${(product.price * 1.3).toFixed(2)}
              </span>
              <Badge variant="destructive" className="text-xs">
                -23%
              </Badge>
            </div>

            {/* Match Reason */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-2 mb-2">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <span className="font-medium">Why this matches:</span>{' '}
                {product.matchReason}
              </p>
            </div>

            {/* Actions */}
            <Button
              size="sm"
              className="w-full"
              onClick={() => onSelect(product)}
            >
              <ShoppingBag className="w-3 h-3 mr-2" />
              Select This
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
