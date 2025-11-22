/**
 * FeaturesGrid Component
 *
 * A responsive grid layout for displaying features with icons, titles, and descriptions.
 * Perfect for showcasing product features, service offerings, and benefits.
 *
 * Features:
 * - 2, 3, or 4 column layouts
 * - Icon support (lucide-react)
 * - Hover effects
 * - Dark mode support
 * - Responsive design
 *
 * Semantic tags: features, grid, icons, benefits, services, product
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

export interface Feature {
  icon?: LucideIcon;
  title: string;
  description: string;
}

export interface FeaturesGridProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FeaturesGrid({
  title,
  subtitle,
  badge,
  features,
  columns = 3,
  className = '',
}: FeaturesGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle || badge) && (
          <div className="text-center space-y-4 mb-16">
            {badge && (
              <Badge variant="outline" className="text-sm font-medium">
                {badge}
              </Badge>
            )}

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

        {/* Features Grid */}
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur transition-all hover:scale-[1.02] hover:border-primary/20 hover:bg-card hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  {Icon && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  )}

                  <CardTitle className="text-xl">{feature.title}</CardTitle>

                  <CardDescription className="leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
