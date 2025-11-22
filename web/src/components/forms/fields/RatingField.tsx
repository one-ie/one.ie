/**
 * RatingField - Star/heart rating selector
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { RatingFieldProps } from './types';
import { cn } from '@/lib/utils';
import { Star, Heart, Circle } from 'lucide-react';

export function RatingField({
  name,
  label,
  description,
  required,
  disabled,
  className,
  max = 5,
  icon = 'star',
}: RatingFieldProps) {
  const form = useFormContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const IconComponent = {
    star: Star,
    heart: Heart,
    circle: Circle,
  }[icon];

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
      }}
      render={({ field, fieldState }) => {
        const currentValue = field.value || 0;
        const displayValue = hoverValue ?? currentValue;

        return (
          <FormFieldWrapper
            label={label}
            description={description}
            required={required}
            error={fieldState.error?.message}
            className={className}
          >
            <FormControl>
              <div className="flex items-center gap-1">
                {Array.from({ length: max }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    onMouseEnter={() => !disabled && setHoverValue(value)}
                    onMouseLeave={() => !disabled && setHoverValue(null)}
                    disabled={disabled}
                    className={cn(
                      'transition-all hover:scale-110',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                    aria-label={`Rate ${value} out of ${max}`}
                  >
                    <IconComponent
                      className={cn(
                        'h-8 w-8 transition-colors',
                        value <= displayValue
                          ? 'fill-primary text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                ))}
                {currentValue > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {currentValue} / {max}
                  </span>
                )}
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
