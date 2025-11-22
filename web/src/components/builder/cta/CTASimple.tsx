/**
 * CTASimple Component
 *
 * Simple call-to-action section with headline, description, and button.
 * Perfect for page endings, content breaks, and conversion points.
 *
 * Features:
 * - Clean, focused design
 * - Single or dual CTA buttons
 * - Background variants (solid, gradient, image)
 * - Centered layout
 * - Dark mode support
 *
 * Semantic tags: cta, call-to-action, conversion, button, signup, action
 */

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export interface CTASimpleProps {
  headline: string;
  description?: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  variant?: 'default' | 'gradient' | 'minimal';
  className?: string;
}

export function CTASimple({
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  variant = 'default',
  className = '',
}: CTASimpleProps) {
  const variantStyles = {
    default: 'bg-muted/50',
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10',
    minimal: 'bg-background',
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${variantStyles[variant]} ${className}`}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {headline}
        </h2>

        {description && (
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}

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
