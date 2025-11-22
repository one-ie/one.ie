/**
 * TestimonialsGrid Component
 *
 * Grid layout for customer testimonials with ratings, photos, and quotes.
 * Perfect for social proof, customer reviews, and case studies.
 *
 * Features:
 * - Responsive grid (1-3 columns)
 * - Star ratings
 * - Customer photos
 * - Company logos
 * - Hover effects
 * - Dark mode support
 *
 * Semantic tags: testimonials, reviews, social-proof, customers, ratings, quotes
 */

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number; // 1-5
  companyLogo?: string;
}

export interface TestimonialsGridProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  testimonials: Testimonial[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function TestimonialsGrid({
  title,
  subtitle,
  badge,
  testimonials,
  columns = 3,
  className = '',
}: TestimonialsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 ${className}`}>
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

        {/* Testimonials Grid */}
        <div className={`grid ${gridCols[columns]} gap-6`}>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-border/50 bg-card/50 backdrop-blur transition-all hover:scale-[1.02] hover:border-primary/20 hover:bg-card hover:shadow-lg"
            >
              <CardHeader className="space-y-4">
                {/* Rating */}
                {testimonial.rating && renderStars(testimonial.rating)}

                {/* Quote */}
                <p className="text-base leading-relaxed italic text-foreground">
                  "{testimonial.quote}"
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  {/* Avatar */}
                  {testimonial.avatar && (
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}

                  {/* Author Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </p>
                  </div>

                  {/* Company Logo */}
                  {testimonial.companyLogo && (
                    <img
                      src={testimonial.companyLogo}
                      alt={testimonial.company}
                      className="h-8 w-auto opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
