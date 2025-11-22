/**
 * FeaturesWithImages Component
 *
 * Features section with alternating image and text layout.
 * Perfect for detailed feature explanations with visual demonstrations.
 *
 * Features:
 * - Alternating layout (zigzag)
 * - Image on left/right alternates
 * - Detailed descriptions
 * - Bullet points support
 * - Dark mode support
 *
 * Semantic tags: features, images, detailed, zigzag, showcase, visual
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

export interface FeatureWithImage {
  title: string;
  description: string;
  benefits?: string[];
  image: {
    src: string;
    alt: string;
  };
  cta?: {
    text: string;
    href: string;
  };
}

export interface FeaturesWithImagesProps {
  title?: string;
  subtitle?: string;
  features: FeatureWithImage[];
  className?: string;
}

export function FeaturesWithImages({
  title,
  subtitle,
  features,
  className = '',
}: FeaturesWithImagesProps) {
  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-4 mb-20">
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

        {/* Features List */}
        <div className="space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Image */}
                <div className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <img
                      src={feature.image.src}
                      alt={feature.image.alt}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 blur-3xl rounded-full" />
                </div>

                {/* Content */}
                <div className={`space-y-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  {feature.benefits && feature.benefits.length > 0 && (
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-base text-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  {feature.cta && (
                    <div className="pt-2">
                      <a href={feature.cta.href}>
                        <Button variant="ghost" className="group">
                          {feature.cta.text}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
