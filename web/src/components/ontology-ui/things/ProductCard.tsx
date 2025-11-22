/**
 * ProductCard - Card for products and services
 *
 * Displays product information with price, stock status, and add to cart functionality.
 * Supports both physical products and services with thing-level branding.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "../universal/ThingCard";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "../utils";

interface ProductCardProps {
  product: Thing;
  price?: number;
  inStock?: boolean;
  onAddToCart?: (product: Thing) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({
  product,
  price,
  inStock = true,
  onAddToCart,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className = "",
}: ProductCardProps) {
  // Extract product data from properties
  const productPrice = price ?? (product.properties?.price as number);
  const productImage = product.properties?.image as string | undefined;
  const productCategory = product.properties?.category as string | undefined;
  const stockCount = product.properties?.stock as number | undefined;

  // Determine stock status
  const isInStock = inStock && (stockCount === undefined || stockCount > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={product}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md overflow-hidden", contentPadding[size])}
      >
        {productImage && (
          <div className="aspect-square overflow-hidden rounded-md -m-4 mb-4">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardHeader className="px-0 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">🛍️</span>
              <CardTitle className={cn(
                "text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                {product.name}
              </CardTitle>
            </div>
            {productCategory && (
              <Badge
                variant="secondary"
                className="shrink-0 bg-primary/10 text-primary border-primary/20"
              >
                {productCategory}
              </Badge>
            )}
          </div>
          {product.properties.description && (
            <CardDescription className="line-clamp-2 text-font/70">
              {product.properties.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex items-center justify-between">
            {productPrice !== undefined ? (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(productPrice)}
              </div>
            ) : (
              <div className="text-lg text-font/60">Price not set</div>
            )}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <Badge
                  variant="outline"
                  className="bg-tertiary/10 text-tertiary border-tertiary/30"
                >
                  ✓ In Stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30"
                >
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
          {stockCount !== undefined && isInStock && (
            <p className="text-sm text-font/60 mt-2">
              {stockCount} {stockCount === 1 ? "item" : "items"} available
            </p>
          )}
        </CardContent>

        <CardFooter className="px-0 pt-4">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleAddToCart}
            disabled={!isInStock || !onAddToCart}
          >
            {isInStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </CardFooter>
      </div>
    </ThingCard>
  );
}
