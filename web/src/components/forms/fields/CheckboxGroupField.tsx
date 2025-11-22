/**
 * CheckboxGroupField - Multiple checkboxes
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { MultiSelectFieldProps } from './types';

export function CheckboxGroupField({
  name,
  label,
  description,
  required,
  disabled,
  className,
  options,
}: MultiSelectFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
      }}
      render={({ field, fieldState }) => {
        const selectedValues = field.value || [];

        const toggleOption = (optionValue: string) => {
          const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v: string) => v !== optionValue)
            : [...selectedValues, optionValue];
          field.onChange(newValues);
        };

        return (
          <FormFieldWrapper
            label={label}
            description={description}
            required={required}
            error={fieldState.error?.message}
            className={className}
          >
            <FormControl>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${name}-${option.value}`}
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => toggleOption(option.value)}
                      disabled={disabled || option.disabled}
                    />
                    <Label
                      htmlFor={`${name}-${option.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
