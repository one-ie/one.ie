/**
 * PricingThreeTier Component
 *
 * Classic 3-tier pricing table (Basic, Pro, Enterprise).
 * Perfect for SaaS products, subscription services, and tiered offerings.
 *
 * Features:
 * - 3 pricing tiers
 * - Popular/featured tier highlight
 * - Feature comparison lists
 * - Monthly/annual toggle support
 * - CTA buttons per tier
 * - Dark mode support
 *
 * Semantic tags: pricing, tiers, subscription, saas, comparison, plans
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  featured?: boolean;
  features: Array<{
    text: string;
    included: boolean;
  }>;
  cta: {
    text: string;
    href: string;
  };
}

export interface PricingThreeTierProps {
  title?: string;
  subtitle?: string;
  tiers: [PricingTier, PricingTier, PricingTier];
  defaultBilling?: 'monthly' | 'annual';
  showToggle?: boolean;
  className?: string;
}

export function PricingThreeTier({
  title,
  subtitle,
  tiers,
  defaultBilling = 'monthly',
  showToggle = true,
  className = '',
}: PricingThreeTierProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(defaultBilling);

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

          {/* Billing Toggle */}
          {showToggle && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-sm ${billingPeriod === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingPeriod === 'annual' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                Annual
                {billingPeriod === 'annual' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Save 20%
                  </Badge>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {tiers.map((tier, index) => {
            const price = billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice;

            return (
              <Card
                key={index}
                className={`relative flex flex-col ${
                  tier.featured
                    ? 'border-primary shadow-xl scale-105'
                    : 'border-border/50'
                }`}
              >
                {tier.featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-muted-foreground">
                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingPeriod === 'annual' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${(price / 12).toFixed(2)}/month billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <a href={tier.cta.href} className="w-full">
                    <Button
                      className="w-full"
                      variant={tier.featured ? 'default' : 'outline'}
                      size="lg"
                    >
                      {tier.cta.text}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
