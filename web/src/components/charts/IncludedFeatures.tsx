'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Globe,
  Shield,
  Lock,
  Cpu,
  BarChart3,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  name: string;
  description: string;
  included: boolean;
}

const features: Feature[] = [
  {
    icon: <Zap className="h-6 w-6" />,
    name: 'Unlimited Bandwidth',
    description: 'Transfer unlimited data globally',
    included: true,
  },
  {
    icon: <Globe className="h-6 w-6" />,
    name: '330+ Edge Locations',
    description: 'Deploy to any location worldwide',
    included: true,
  },
  {
    icon: <Shield className="h-6 w-6" />,
    name: 'DDoS Protection',
    description: 'Enterprise-grade security included',
    included: true,
  },
  {
    icon: <Lock className="h-6 w-6" />,
    name: 'SSL Certificates',
    description: 'Free HTTPS for all domains',
    included: true,
  },
  {
    icon: <Cpu className="h-6 w-6" />,
    name: '100k Functions/day',
    description: 'Serverless computing included',
    included: true,
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    name: 'Analytics Dashboard',
    description: 'Real-time performance metrics',
    included: true,
  },
];

interface IncludedFeaturesProps {
  /** Grid columns */
  columns?: 1 | 2 | 3;
  /** Show footer summary */
  showFooter?: boolean;
  /** Show descriptions */
  showDescriptions?: boolean;
}

export function IncludedFeatures({
  columns = 3,
  showFooter = true,
  showDescriptions = true,
}: IncludedFeaturesProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
  }[columns] || 'md:grid-cols-3';

  const savings = 229 + 240 + 350; // Sum of competitor prices
  const monthlyValue = Math.round(savings / 3);

  return (
    <div className="w-full space-y-8">
      {/* Features Grid */}
      <div className={`grid gap-6 ${gridClass}`}>
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/5 via-background to-background hover:border-green-500/40 transition-colors group"
          >
            {/* Animated Corner Accent */}
            <div className="absolute -top-8 -right-8 h-16 w-16 bg-green-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all" />

            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-600 to-green-500 text-white flex items-center justify-center text-green-500">
                  {feature.icon}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs font-bold"
                >
                  ✓ Free
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3">
                {feature.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-2">
              {showDescriptions && (
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              )}

              {/* Status Indicator */}
              <div className="flex items-center gap-2 pt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Included in free tier
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Value Proposition Card */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5">
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-primary/20 rounded-full blur-3xl" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Zero Cost Breakdown
              </CardTitle>
              <CardDescription className="text-base mt-2">
                All features are completely free. No hidden costs, ever.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Feature Checklist - Organized */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-3">What You Get</h4>
              {features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm mb-3">Plus More</h4>
              {features.slice(3).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-primary/20" />

          {/* Monthly Savings Highlight */}
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-6 space-y-3">
            <p className="text-sm text-muted-foreground">Typical Monthly Value</p>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-sm">Vercel comparable plan</span>
                <span className="font-semibold">$229/mo</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm">Netlify comparable plan</span>
                <span className="font-semibold">$240/mo</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm">AWS comparable plan</span>
                <span className="font-semibold">$350/mo</span>
              </div>
            </div>

            <div className="border-t border-green-500/20 pt-3 flex justify-between items-baseline">
              <p className="font-bold text-green-700 dark:text-green-400">ONE Platform Total</p>
              <p className="text-3xl font-bold text-green-600">$0</p>
            </div>

            <p className="text-xs text-green-700 dark:text-green-400 pt-2">
              You save an average of ${monthlyValue}/month compared to competitors
            </p>
          </div>

          {/* Annual Savings */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Annual Savings</p>
            <p className="text-4xl font-bold text-primary">
              ${(monthlyValue * 12).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Keep this money. Grow your business.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Summary */}
      {showFooter && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">Ready to Deploy?</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                All features above are included in your free tier. No credit card required. No trial limits.
                Deploy unlimited apps. Scale globally. Keep 100% of your revenue.
              </p>

              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {[
                  { label: 'No Credit Card', icon: '💳' },
                  { label: 'No Trial Limits', icon: '⏱️' },
                  { label: 'Production Ready', icon: '🚀' },
                ].map((item, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs px-3 py-1 gap-1.5"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
