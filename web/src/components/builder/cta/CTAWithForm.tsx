/**
 * CTAWithForm Component
 *
 * Call-to-action section with inline email signup form.
 * Perfect for newsletter signups, waitlists, and lead generation.
 *
 * Features:
 * - Email input with validation
 * - Inline form design
 * - Privacy policy link
 * - Success/error states
 * - Responsive design
 * - Dark mode support
 *
 * Semantic tags: cta, form, email, signup, newsletter, waitlist, leads
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export interface CTAWithFormProps {
  badge?: string;
  headline: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  privacyText?: string;
  onSubmit?: (email: string) => Promise<void>;
  className?: string;
}

export function CTAWithForm({
  badge,
  headline,
  description,
  placeholder = 'Enter your email',
  buttonText = 'Get Started',
  privacyText = 'We respect your privacy. Unsubscribe at any time.',
  onSubmit,
  className = '',
}: CTAWithFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(email);
      }
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 ${className}`}>
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {badge && (
          <Badge variant="secondary" className="text-sm font-medium">
            {badge}
          </Badge>
        )}

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {headline}
        </h2>

        {description && (
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 text-base"
              disabled={status === 'loading' || status === 'success'}
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Submitting...' : buttonText}
            </Button>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Success! Check your email for confirmation.</span>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Privacy Text */}
          {privacyText && status !== 'success' && (
            <p className="text-xs text-muted-foreground">
              {privacyText}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
