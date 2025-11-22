/**
 * ColorPickerField - Color picker input
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { BaseFieldProps } from './types';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#FFC0CB', '#A52A2A', '#808080', '#FFD700',
];

export function ColorPickerField({
  name,
  label,
  description,
  placeholder = '#000000',
  required,
  disabled,
  className,
}: BaseFieldProps) {
  const form = useFormContext();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        pattern: {
          value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
          message: 'Invalid color format (use #RRGGBB)',
        },
      }}
      render={({ field, fieldState }) => {
        const currentColor = field.value || '#000000';

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
                {/* Color input with preview */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      {...field}
                      placeholder={placeholder}
                      disabled={disabled}
                      aria-invalid={!!fieldState.error}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={disabled}
                      className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2',
                        'h-7 w-7 rounded border-2 border-input shadow-sm',
                        'transition-transform hover:scale-110'
                      )}
                      style={{ backgroundColor: currentColor }}
                      aria-label="Pick color"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>

                {/* Native color picker (hidden) */}
                <input
                  ref={inputRef}
                  type="color"
                  value={currentColor}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={disabled}
                  className="sr-only"
                />

                {/* Preset colors */}
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      disabled={disabled}
                      className={cn(
                        'h-8 w-8 rounded border-2 transition-transform hover:scale-110',
                        currentColor.toUpperCase() === color.toUpperCase()
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-input'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color}`}
                    />
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
