/**
 * HeroSplit Component
 *
 * A split-screen hero section with content on one side and image/visual on the other.
 * Perfect for SaaS products, app showcases, and feature highlights.
 *
 * Features:
 * - Split layout (50/50)
 * - Image with responsive sizing
 * - Reversible layout (image left or right)
 * - Trust indicators/badges
 * - Dark mode support
 * - Mobile responsive (stacks vertically)
 *
 * Semantic tags: hero, split, saas, product, showcase, image
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export interface HeroSplitProps {
  badge?: string;
  headline: string;
  description: string;
  features?: string[];
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
  };
  imagePosition?: 'left' | 'right';
  className?: string;
}

export function HeroSplit({
  badge,
  headline,
  description,
  features = [],
  primaryCTA,
  secondaryCTA,
  image,
  imagePosition = 'right',
  className = '',
}: HeroSplitProps) {
  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${imagePosition === 'left' ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className={`space-y-6 ${imagePosition === 'left' ? 'lg:order-2' : ''}`}>
            {badge && (
              <Badge variant="secondary" className="text-sm font-medium">
                {badge}
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {headline}
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Features list */}
            {features.length > 0 && (
              <ul className="space-y-3 pt-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-base text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href={primaryCTA.href}>
                <Button size="lg" className="w-full sm:w-auto">
                  {primaryCTA.text}
                </Button>
              </a>

              {secondaryCTA && (
                <a href={secondaryCTA.href}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {secondaryCTA.text}
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          <div className={`relative ${imagePosition === 'left' ? 'lg:order-1' : ''}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
            {/* Decorative gradient */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-3xl rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
