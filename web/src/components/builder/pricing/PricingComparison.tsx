/**
 * PricingComparison Component
 *
 * Detailed feature comparison table for pricing plans.
 * Perfect for complex products with many features to compare.
 *
 * Features:
 * - Feature-by-feature comparison
 * - Multiple plans comparison
 * - Checkmarks and values
 * - Sticky header
 * - Responsive table design
 *
 * Semantic tags: pricing, comparison, table, features, detailed, plans
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus } from 'lucide-react';

export interface ComparisonFeature {
  category?: string;
  name: string;
  plans: Array<boolean | string | number>; // true/false for checkmark, string for value
}

export interface ComparisonPlan {
  name: string;
  price: number;
  period: string;
  featured?: boolean;
  cta: {
    text: string;
    href: string;
  };
}

export interface PricingComparisonProps {
  title?: string;
  subtitle?: string;
  plans: ComparisonPlan[];
  features: ComparisonFeature[];
  className?: string;
}

export function PricingComparison({
  title,
  subtitle,
  plans,
  features,
  className = '',
}: PricingComparisonProps) {
  const renderFeatureValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-primary mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-4 mb-12">
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

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <Card className="min-w-[800px]">
            {/* Plan Headers */}
            <div className="grid grid-cols-4 gap-4 p-6 border-b">
              <div className="font-semibold text-sm text-muted-foreground">
                Features
              </div>

              {plans.map((plan, index) => (
                <div key={index} className="text-center space-y-4">
                  {plan.featured && (
                    <Badge className="mb-2">Most Popular</Badge>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground text-sm">/{plan.period}</span>
                    </div>
                  </div>
                  <a href={plan.cta.href}>
                    <Button
                      variant={plan.featured ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {plan.cta.text}
                    </Button>
                  </a>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            <div className="divide-y">
              {features.map((feature, index) => {
                // Render category header
                if (feature.category) {
                  return (
                    <div key={index} className="px-6 py-4 bg-muted/50">
                      <h4 className="font-semibold text-sm">{feature.category}</h4>
                    </div>
                  );
                }

                return (
                  <div key={index} className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-muted/30">
                    <div className="text-sm font-medium">{feature.name}</div>

                    {feature.plans.map((value, planIndex) => (
                      <div key={planIndex} className="text-center">
                        {renderFeatureValue(value)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
