/**
 * HeroMinimal Component
 *
 * A minimalist hero section focused on typography and whitespace.
 * Perfect for blogs, portfolios, and content-focused websites.
 *
 * Features:
 * - Clean, minimal design
 * - Typography-focused
 * - Subtle animations
 * - Single CTA
 * - Maximum readability
 *
 * Semantic tags: hero, minimal, typography, blog, portfolio, simple
 */

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export interface HeroMinimalProps {
  headline: string;
  description: string;
  cta: {
    text: string;
    href: string;
  };
  className?: string;
}

export function HeroMinimal({
  headline,
  description,
  cta,
  className = '',
}: HeroMinimalProps) {
  return (
    <section className={`py-32 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          {headline}
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="pt-4">
          <a href={cta.href}>
            <Button size="lg" variant="ghost" className="text-lg group">
              {cta.text}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
