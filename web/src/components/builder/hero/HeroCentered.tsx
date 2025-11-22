/**
 * HeroCentered Component
 *
 * A centered hero section with headline, subheadline, and CTA buttons.
 * Perfect for landing pages, product launches, and marketing pages.
 *
 * Features:
 * - Centered text layout
 * - Primary and secondary CTA buttons
 * - Optional badge/announcement
 * - Responsive design
 * - Dark mode support
 * - Gradient background overlay
 *
 * Semantic tags: hero, landing, centered, marketing, cta
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export interface HeroCenteredProps {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  className?: string;
}

export function HeroCentered({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  className = '',
}: HeroCenteredProps) {
  return (
    <section className={`relative min-h-[600px] flex items-center justify-center px-4 py-20 overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      {/* Content container */}
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        {badge && (
          <Badge variant="secondary" className="text-sm font-medium px-4 py-2">
            {badge}
          </Badge>
        )}

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          {headline}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {subheadline}
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
    </section>
  );
}
