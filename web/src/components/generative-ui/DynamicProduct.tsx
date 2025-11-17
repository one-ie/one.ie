/**
 * DynamicProduct Component
 *
 * Product card for generative UI with working Add to Cart functionality
 * Uses design system colors and follows 6-dimension ontology (Things)
 */

import { Package, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ProductData {
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  badge?: string;
  category?: string;
}

export function DynamicProduct({ data }: { data: ProductData }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    // Simulate adding to cart
    setAddedToCart(true);

    // Show success state for 2 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const discount = data.originalPrice
    ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden">
      {/* Product Image */}
      {data.image && (
        <div className="relative aspect-square overflow-hidden bg-foreground/5">
          <img
            src={data.image}
            alt={data.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {discount > 0 && (
            <Badge
              className="absolute top-3 right-3 bg-destructive text-white"
              variant="destructive"
            >
              -{discount}%
            </Badge>
          )}
          {data.badge && (
            <Badge className="absolute top-3 left-3 bg-tertiary text-white">{data.badge}</Badge>
          )}
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-font line-clamp-2">{data.title}</CardTitle>
            {data.category && (
              <CardDescription className="text-font/60 mt-1">{data.category}</CardDescription>
            )}
          </div>
        </div>

        {/* Rating */}
        {data.rating !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(data.rating!)
                      ? "fill-primary text-primary"
                      : "fill-font/10 text-font/20"
                  }`}
                />
              ))}
            </div>
            {data.reviewCount !== undefined && (
              <span className="text-xs text-font/60">({data.reviewCount} reviews)</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {data.description && (
          <p className="text-sm text-font/80 line-clamp-2">{data.description}</p>
        )}

        {/* Stock Status */}
        {data.stock !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-font/60" />
            <span className={`text-font/80 ${data.stock < 10 ? "text-destructive" : ""}`}>
              {data.stock > 0 ? `${data.stock} in stock` : "Out of stock"}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">${data.price.toFixed(2)}</span>
          {data.originalPrice && data.originalPrice > data.price && (
            <span className="text-sm text-font/40 line-through">
              ${data.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {/* Quantity Selector */}
        <div className="flex w-full items-center gap-2">
          <label className="text-sm text-font/80 font-medium">Qty:</label>
          <div className="flex items-center border border-border rounded-md bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0 text-font"
              disabled={quantity <= 1 || (data.stock !== undefined && data.stock === 0)}
            >
              −
            </Button>
            <span className="w-12 text-center text-sm text-font font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.min(data.stock || 999, quantity + 1))}
              className="h-8 w-8 p-0 text-font"
              disabled={data.stock !== undefined && quantity >= data.stock}
            >
              +
            </Button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={addedToCart || (data.stock !== undefined && data.stock === 0)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {addedToCart ? "✓ Added to Cart!" : data.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
