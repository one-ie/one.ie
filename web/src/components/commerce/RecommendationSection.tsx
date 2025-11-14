/**
 * Recommendation Section
 *
 * Displays AI-generated product recommendations with reasoning
 */

import type { ProductRecommendation } from '@/lib/types/commerce';
import { ProductCardChat } from './ProductCardChat';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface RecommendationSectionProps {
  recommendations: ProductRecommendation[];
  onAction?: (action: string, productId: string) => void;
}

export function RecommendationSection({
  recommendations,
  onAction,
}: RecommendationSectionProps) {
  const primary = recommendations.find((r) => r.type === 'primary');
  const alternatives = recommendations.filter((r) => r.type === 'alternative');

  return (
    <div className="mt-4 space-y-3">
      {/* Primary Recommendation */}
      {primary && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">
              My Top Recommendation
            </span>
            <Badge variant="secondary" className="text-xs">
              {Math.round(primary.confidenceScore * 100)}% Match
            </Badge>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-3">
              {primary.reasoning}
            </p>
            <ProductCardChat
              product={primary.product}
              onAction={onAction}
            />
          </div>
        </div>
      )}

      {/* Alternative Recommendations */}
      {alternatives.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Other Great Options</span>
          </div>

          <div className="space-y-2">
            {alternatives.map((rec, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs text-muted-foreground px-1">
                  {rec.reasoning}
                </p>
                <ProductCardChat
                  product={rec.product}
                  onAction={onAction}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
