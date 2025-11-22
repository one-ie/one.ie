/**
 * NumberField - Numeric input with min/max validation
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { NumberFieldProps } from './types';

export function NumberField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        min: min !== undefined ? {
          value: min,
          message: `Minimum value is ${min}`
        } : undefined,
        max: max !== undefined ? {
          value: max,
          message: `Maximum value is ${max}`
        } : undefined,
        validate: (value) => {
          if (value !== '' && isNaN(Number(value))) {
            return 'Must be a valid number';
          }
          return true;
        }
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
              type="number"
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              aria-invalid={!!fieldState.error}
              onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </FormControl>
        </FormFieldWrapper>
      )}
    />
  );
}
