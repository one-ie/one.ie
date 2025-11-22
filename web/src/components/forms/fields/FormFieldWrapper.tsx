/**
 * FormFieldWrapper - Base wrapper for all form fields
 *
 * Provides consistent styling, label, description, and error display
 */

import * as React from 'react';
import { FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FormFieldWrapperProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormFieldWrapper({
  label,
  description,
  required,
  error,
  className,
  children,
}: FormFieldWrapperProps) {
  return (
    <FormItem className={cn('space-y-2', className)}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}
      {children}
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
