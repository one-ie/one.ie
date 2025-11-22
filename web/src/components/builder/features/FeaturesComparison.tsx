/**
 * FeaturesComparison Component
 *
 * Side-by-side feature comparison (before/after, old vs new).
 * Perfect for showing improvements, upgrades, or differences.
 *
 * Features:
 * - Two-column comparison
 * - Before/After labels
 * - Visual indicators
 * - Icon support
 * - Responsive design
 *
 * Semantic tags: features, comparison, before-after, old-new, versus, difference
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';

export interface ComparisonItem {
  label: string;
  before: {
    value: string | boolean;
    description?: string;
  };
  after: {
    value: string | boolean;
    description?: string;
  };
}

export interface FeaturesComparisonProps {
  title?: string;
  subtitle?: string;
  beforeLabel?: string;
  afterLabel?: string;
  items: ComparisonItem[];
  highlightAfter?: boolean;
  className?: string;
}

export function FeaturesComparison({
  title,
  subtitle,
  beforeLabel = 'Before',
  afterLabel = 'After',
  items,
  highlightAfter = true,
  className = '',
}: FeaturesComparisonProps) {
  const renderValue = (value: string | boolean, description?: string) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Yes</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">No</span>
            </>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="text-sm font-medium">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
    );
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-4 mb-16">
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 relative">
          {/* Arrow indicator (desktop) */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>

          {/* Before Column */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge variant="outline" className="text-base px-4 py-2">
                {beforeLabel}
              </Badge>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderValue(item.before.value, item.before.description)}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* After Column */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge
                variant={highlightAfter ? 'default' : 'outline'}
                className="text-base px-4 py-2"
              >
                {afterLabel}
                {highlightAfter && <span className="ml-2">✨</span>}
              </Badge>
            </div>

            {items.map((item, index) => (
              <Card
                key={index}
                className={`${
                  highlightAfter
                    ? 'border-primary/50 bg-primary/5 shadow-lg'
                    : 'border-border/50'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderValue(item.after.value, item.after.description)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
