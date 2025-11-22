/**
 * HeroGradient Component
 *
 * Hero section with animated gradient background.
 * Perfect for modern, eye-catching landing pages.
 *
 * Features:
 * - Animated gradient background
 * - Customizable colors
 * - Blur effects
 * - Dark mode support
 * - Responsive design
 *
 * Semantic tags: hero, gradient, animated, modern, colorful, dynamic
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface HeroGradientProps {
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
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
}

export function HeroGradient({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  gradientFrom = 'from-purple-600',
  gradientVia = 'via-pink-500',
  gradientTo = 'to-orange-500',
  className = '',
}: HeroGradientProps) {
  return (
    <section className={`relative min-h-[700px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} opacity-20 animate-gradient`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 space-y-8">
        {badge && (
          <Badge variant="secondary" className="text-sm font-medium bg-background/80 backdrop-blur">
            <Sparkles className="h-4 w-4 mr-2" />
            {badge}
          </Badge>
        )}

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          {headline}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <a href={primaryCTA.href}>
            <Button size="lg" className="text-lg px-8 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>

          {secondaryCTA && (
            <a href={secondaryCTA.href}>
              <Button size="lg" variant="outline" className="text-lg px-8 h-12 backdrop-blur">
                {secondaryCTA.text}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
