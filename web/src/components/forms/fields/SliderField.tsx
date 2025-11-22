/**
 * SliderField - Range slider input
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { SliderFieldProps } from './types';

export function SliderField({
  name,
  label,
  description,
  required,
  disabled,
  className,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
}: SliderFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
      }}
      render={({ field, fieldState }) => {
        const value = field.value ?? min;

        return (
          <FormFieldWrapper
            label={label}
            description={description}
            required={required}
            error={fieldState.error?.message}
            className={className}
          >
            <FormControl>
              <div className="space-y-3">
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[value]}
                  onValueChange={(values) => field.onChange(values[0])}
                  disabled={disabled}
                  aria-label={label || name}
                />
                {showValue && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{min}</span>
                    <span className="font-medium text-foreground">{value}</span>
                    <span>{max}</span>
                  </div>
                )}
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
