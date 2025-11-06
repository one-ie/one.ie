'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, DollarSign, TrendingDown } from 'lucide-react';

interface PricingComparisonProps {
  /** Show comparison details */
  showDetails?: boolean;
}

export function PricingComparison({ showDetails = true }: PricingComparisonProps) {
  const competitors = [
    { name: 'Vercel', price: 229, color: 'from-gray-900 to-gray-700' },
    { name: 'Netlify', price: 240, color: 'from-teal-600 to-teal-500' },
    { name: 'AWS', price: 350, color: 'from-orange-500 to-orange-400' },
  ];

  const savings = competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length;

  const features = [
    { icon: '∞', label: 'Unlimited Bandwidth', included: true },
    { icon: '🌍', label: '330+ Edge Locations', included: true },
    { icon: '🛡️', label: 'DDoS Protection', included: true },
    { icon: '🔒', label: 'SSL Certificates', included: true },
    { icon: '⚡', label: '100k Functions/day', included: true },
    { icon: '📊', label: 'Analytics Dashboard', included: true },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Main Comparison Card */}
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        {/* Our Offer - Featured */}
        <Card className="relative overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg">
          <div className="absolute -top-3 -right-3 h-20 w-20 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-3 -left-3 h-20 w-20 bg-primary/10 rounded-full blur-2xl" />

          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">ONE Platform</CardTitle>
                <CardDescription className="text-base mt-1">Powered by Cloudflare</CardDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-sm px-3 py-1">
                100% Free
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Price Display */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary">$0</span>
                <span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Forever free tier. No hidden costs.</p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 border-t border-primary/20 pt-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Value Highlight */}
            <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Save ${savings.toFixed(0)}/month
                </p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Compared to competitors
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Comparison */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Traditional Platforms Cost:</h3>

          {competitors.map((competitor, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur p-4 hover:border-border transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{competitor.name}</span>
                <span className="text-2xl font-bold text-muted-foreground">
                  ${competitor.price}
                </span>
              </div>

              {/* Mini Bar Chart */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute h-full bg-gradient-to-r ${competitor.color}`}
                  style={{ width: `${(competitor.price / 400) * 100}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                ${(competitor.price - 0).toFixed(0)} more per month
              </p>
            </div>
          ))}

          {/* Annual Savings */}
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
            <p className="text-2xl font-bold text-primary">
              ${(savings * 12).toFixed(0)}/year
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Zero Cost Breakdown
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-primary/10 bg-primary/5 p-4 space-y-2"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs text-green-600 font-semibold">✓ Included Free</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-gradient-to-r from-green-500/10 to-primary/10 p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Monthly Value</p>
              <p className="text-3xl font-bold text-primary mb-1">$229-350</p>
              <p className="text-xs text-muted-foreground">
                Typical pricing from competitors. You get this completely free.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
