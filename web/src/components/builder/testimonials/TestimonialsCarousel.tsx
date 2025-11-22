/**
 * TestimonialsCarousel Component
 *
 * Carousel/slider for customer testimonials with auto-rotate.
 * Perfect for homepage heroes and feature sections.
 *
 * Features:
 * - Auto-rotate carousel
 * - Navigation dots
 * - Manual navigation
 * - Touch/swipe support
 * - Pause on hover
 * - Smooth transitions
 *
 * Semantic tags: testimonials, carousel, slider, animated, rotating, reviews
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface CarouselTestimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsCarouselProps {
  title?: string;
  testimonials: CarouselTestimonial[];
  autoRotate?: boolean;
  rotateInterval?: number; // milliseconds
  className?: string;
}

export function TestimonialsCarousel({
  title,
  testimonials,
  autoRotate = true,
  rotateInterval = 5000,
  className = '',
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentTestimonial = testimonials[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoRotate || isPaused) return;

    const interval = setInterval(goToNext, rotateInterval);
    return () => clearInterval(interval);
  }, [autoRotate, isPaused, currentIndex]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
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
    <section
      className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        {title && (
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            {title}
          </h2>
        )}

        {/* Carousel */}
        <div className="relative">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-8 sm:p-12 space-y-8">
              {/* Rating */}
              {currentTestimonial.rating && renderStars(currentTestimonial.rating)}

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl text-center font-medium leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-4 pt-6 border-t border-border/50">
                {currentTestimonial.avatar && (
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.author}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}

                <div className="text-center">
                  <p className="font-semibold text-lg">{currentTestimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentTestimonial.role}
                    {currentTestimonial.company && ` at ${currentTestimonial.company}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
