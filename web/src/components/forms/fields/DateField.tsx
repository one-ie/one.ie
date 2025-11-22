/**
 * DateField - Date picker with calendar
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { BaseFieldProps } from './types';

export function DateField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
}: BaseFieldProps) {
  const form = useFormContext();

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
            <Input
              {...field}
              type="date"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
        </FormFieldWrapper>
      )}
    />
  );
}
