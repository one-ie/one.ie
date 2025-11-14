/**
 * Product Comparison Component
 *
 * Side-by-side comparison of products with AI-generated insights
 */

import type { Product } from '@/lib/types/commerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star } from 'lucide-react';

interface ProductComparisonProps {
  products: Product[];
  onSelect?: (productId: string) => void;
  highlightBest?: boolean;
}

export function ProductComparison({
  products,
  onSelect,
  highlightBest = true,
}: ProductComparisonProps) {
  if (products.length === 0) return null;

  // Find best product (highest rating * price ratio)
  const bestProduct = highlightBest
    ? products.reduce((best, product) =>
        product.rating > best.rating ? product : best
      )
    : null;

  const attributes = [
    'price',
    'rating',
    'weight',
    'sweetSpot',
    'balance',
    'vibration',
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Product Comparison</h3>
        <p className="text-sm text-muted-foreground">
          See how these options stack up
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className={
              bestProduct && product.id === bestProduct.id
                ? 'border-primary border-2'
                : ''
            }
          >
            <CardHeader>
              {bestProduct && product.id === bestProduct.id && (
                <Badge className="w-fit mb-2">Best Match</Badge>
              )}
              <CardTitle className="text-base">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <div className="w-full h-32 bg-muted rounded-md overflow-hidden">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Price */}
              <div>
                <div className="text-2xl font-bold">
                  {product.currency}
                  {product.price}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Attributes */}
              <div className="space-y-2 text-sm">
                {product.attributes &&
                  Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key}:
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
              </div>

              {/* Best For */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium mb-1">Best for:</p>
                <p className="text-xs text-muted-foreground">
                  {product.aiBestFor}
                </p>
              </div>

              {/* Action */}
              {onSelect && (
                <Button
                  onClick={() => onSelect(product.id)}
                  className="w-full"
                  variant={
                    bestProduct && product.id === bestProduct.id
                      ? 'default'
                      : 'outline'
                  }
                >
                  {product.inStock ? 'Select' : 'Out of Stock'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  {products.map((product) => (
                    <th key={product.id} className="text-left py-2 px-2">
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attributes.map((attr) => (
                  <tr key={attr} className="border-b">
                    <td className="py-2 capitalize text-muted-foreground">
                      {attr}
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="py-2 px-2">
                        {attr === 'price'
                          ? `${product.currency}${product.price}`
                          : attr === 'rating'
                            ? product.rating.toFixed(1)
                            : product.attributes?.[attr] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
