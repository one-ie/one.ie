/**
 * CTABanner Component
 *
 * Eye-catching banner for announcements, promotions, and urgent CTAs.
 * Perfect for sticky top/bottom bars and flash sales.
 *
 * Features:
 * - Sticky positioning (top or bottom)
 * - Dismissible with cookie storage
 * - Icon support
 * - Countdown timer (optional)
 * - Mobile responsive
 * - Dark mode support
 *
 * Semantic tags: banner, cta, announcement, promotion, sticky, urgent, flash-sale
 */

'use client';

import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface CTABannerProps {
  message: string;
  cta: {
    text: string;
    href: string;
  };
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: React.ReactNode;
  countdownTo?: Date;
  className?: string;
}

export function CTABanner({
  message,
  cta,
  position = 'top',
  dismissible = true,
  variant = 'primary',
  icon,
  countdownTo,
  className = '',
}: CTABannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (countdownTo) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownTo.getTime() - now;

        if (distance < 0) {
          setTimeLeft('Ended');
          clearInterval(timer);
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdownTo]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store in localStorage to remember dismissal
    localStorage.setItem('banner-dismissed', 'true');
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 sticky ${variantStyles[variant]} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Message */}
          <div className="flex items-center gap-3 text-center sm:text-left">
            {icon && <div className="flex-shrink-0">{icon}</div>}

            <span className="text-sm sm:text-base font-medium">
              {message}
            </span>

            {/* Countdown */}
            {countdownTo && timeLeft && (
              <span className="text-sm font-mono bg-black/10 px-3 py-1 rounded-md">
                {timeLeft}
              </span>
            )}
          </div>

          {/* CTA and Dismiss */}
          <div className="flex items-center gap-3">
            <a href={cta.href}>
              <Button
                size="sm"
                variant="secondary"
                className="font-semibold"
              >
                {cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-black/10 rounded-md transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
