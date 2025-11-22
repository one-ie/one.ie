/**
 * HeroWithForm Component
 *
 * Hero section with inline signup or contact form.
 * Perfect for lead generation, waitlists, and direct conversions.
 *
 * Features:
 * - Split layout (content + form)
 * - Form validation
 * - Multiple input fields
 * - Success/error states
 * - Privacy compliance
 * - Responsive design
 *
 * Semantic tags: hero, form, signup, contact, leads, conversion, waitlist
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export interface HeroWithFormProps {
  badge?: string;
  headline: string;
  description: string;
  benefits?: string[];
  formTitle: string;
  buttonText?: string;
  onSubmit?: (data: Record<string, string>) => Promise<void>;
  className?: string;
}

export function HeroWithForm({
  badge,
  headline,
  description,
  benefits = [],
  formTitle,
  buttonText = 'Get Started',
  onSubmit,
  className = '',
}: HeroWithFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setStatus('success');
      setFormData({ name: '', email: '', company: '' });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
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

            {/* Benefits List */}
            {benefits.length > 0 && (
              <ul className="space-y-3 pt-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-base text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Form */}
          <div className="bg-muted/50 p-8 rounded-2xl border border-border/50">
            {status === 'success' ? (
              <div className="text-center space-y-4 py-8">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">Success!</h3>
                <p className="text-muted-foreground">
                  We'll be in touch shortly.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">{formTitle}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={status === 'loading'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={status === 'loading'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      disabled={status === 'loading'}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      buttonText
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By signing up, you agree to our Terms and Privacy Policy
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
