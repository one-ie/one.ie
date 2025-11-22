/**
 * MultiSelectField - Multiple selection dropdown
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { MultiSelectFieldProps } from './types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function MultiSelectField({
  name,
  label,
  description,
  placeholder = 'Select options',
  required,
  disabled,
  className,
  options,
  maxSelections,
}: MultiSelectFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        validate: (value: string[]) => {
          if (maxSelections && value?.length > maxSelections) {
            return `Maximum ${maxSelections} selections allowed`;
          }
          return true;
        }
      }}
      render={({ field, fieldState }) => {
        const selectedValues = field.value || [];

        const toggleOption = (optionValue: string) => {
          const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v: string) => v !== optionValue)
            : [...selectedValues, optionValue];
          field.onChange(newValues);
        };

        const removeOption = (optionValue: string) => {
          field.onChange(selectedValues.filter((v: string) => v !== optionValue));
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
              <div className="space-y-3">
                {/* Selected badges */}
                {selectedValues.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedValues.map((value: string) => {
                      const option = options.find(opt => opt.value === value);
                      return option ? (
                        <Badge key={value} variant="secondary" className="gap-1">
                          {option.label}
                          <button
                            type="button"
                            onClick={() => removeOption(value)}
                            className="ml-1 hover:bg-destructive/20 rounded-full"
                            disabled={disabled}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Options list */}
                <div className={cn(
                  'space-y-2 border rounded-md p-3',
                  fieldState.error && 'border-destructive'
                )}>
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${name}-${option.value}`}
                        checked={selectedValues.includes(option.value)}
                        onCheckedChange={() => toggleOption(option.value)}
                        disabled={disabled || option.disabled ||
                          (maxSelections !== undefined &&
                           selectedValues.length >= maxSelections &&
                           !selectedValues.includes(option.value))}
                      />
                      <label
                        htmlFor={`${name}-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
