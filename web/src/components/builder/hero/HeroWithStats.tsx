/**
 * HeroWithStats Component
 *
 * Hero section with impressive statistics and social proof.
 * Perfect for showcasing achievements, users, or metrics.
 *
 * Features:
 * - Headline and description
 * - Statistics grid (3-4 metrics)
 * - CTA buttons
 * - Animated counters (optional)
 * - Responsive layout
 *
 * Semantic tags: hero, stats, metrics, social-proof, numbers, achievements
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export interface HeroWithStatsProps {
  badge?: string;
  headline: string;
  description: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  stats: Stat[];
  className?: string;
}

export function HeroWithStats({
  badge,
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  stats,
  className = '',
}: HeroWithStatsProps) {
  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Content */}
        <div className="text-center max-w-4xl mx-auto space-y-8 mb-16">
          {badge && (
            <Badge variant="secondary" className="text-sm font-medium">
              {badge}
            </Badge>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            {headline}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href={primaryCTA.href}>
              <Button size="lg" className="text-lg px-8 h-12">
                {primaryCTA.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>

            {secondaryCTA && (
              <a href={secondaryCTA.href}>
                <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                  {secondaryCTA.text}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base font-medium text-foreground">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
