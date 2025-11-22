/**
 * TextareaField - Multi-line text input
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { TextFieldProps } from './types';

interface TextareaFieldProps extends TextFieldProps {
  rows?: number;
}

export function TextareaField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  maxLength,
  minLength,
  rows = 4,
}: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        maxLength: maxLength ? {
          value: maxLength,
          message: `Maximum ${maxLength} characters allowed`
        } : undefined,
        minLength: minLength ? {
          value: minLength,
          message: `Minimum ${minLength} characters required`
        } : undefined,
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
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          {maxLength && (
            <div className="text-xs text-muted-foreground text-right">
              {field.value?.length || 0} / {maxLength}
            </div>
          )}
        </FormFieldWrapper>
      )}
    />
  );
}
