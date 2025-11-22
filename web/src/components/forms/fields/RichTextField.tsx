/**
 * RichTextField - Rich text editor (placeholder for future editor integration)
 *
 * TODO: Integrate with TipTap or similar rich text editor
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { BaseFieldProps } from './types';

export function RichTextField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
}: BaseFieldProps) {
  const form = useFormContext();

  // TODO: Replace with actual rich text editor (TipTap, Slate, etc.)
  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
      }}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          description={description}
          required={required}
          error={fieldState.error?.message}
          className={className}
        >
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder || 'Enter rich text...'}
              disabled={disabled}
              rows={8}
              aria-invalid={!!fieldState.error}
              className="font-mono text-sm"
            />
          </FormControl>
          <div className="text-xs text-muted-foreground">
            Rich text editor integration coming soon
          </div>
        </FormFieldWrapper>
      )}
    />
  );
}
