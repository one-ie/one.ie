/**
 * TextField - Basic text input field
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { TextFieldProps } from './types';

export function TextField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  type = 'text',
  maxLength,
  minLength,
  pattern,
}: TextFieldProps) {
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
        pattern: pattern ? {
          value: pattern,
          message: 'Invalid format'
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
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
        </FormFieldWrapper>
      )}
    />
  );
}
