/**
 * CreditCardField - Credit card number input with validation
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { CreditCardFieldProps } from './types';
import { CreditCard } from 'lucide-react';

// Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Detect card type
function detectCardType(cardNumber: string): string | null {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'Amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

  return null;
}

// Format card number with spaces
function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

export function CreditCardField({
  name,
  label = 'Card Number',
  description,
  placeholder = '1234 5678 9012 3456',
  required,
  disabled,
  className,
  showCardType = true,
}: CreditCardFieldProps) {
  const form = useFormContext();
  const [cardType, setCardType] = React.useState<string | null>(null);

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        validate: (value: string) => {
          if (!value) return true;

          const cleaned = value.replace(/\s/g, '');

          // Check length
          if (cleaned.length < 13 || cleaned.length > 19) {
            return 'Invalid card number length';
          }

          // Check if all digits
          if (!/^\d+$/.test(cleaned)) {
            return 'Card number must contain only digits';
          }

          // Luhn check
          if (!luhnCheck(cleaned)) {
            return 'Invalid card number';
          }

          return true;
        }
      }}
      render={({ field, fieldState }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const formatted = formatCardNumber(e.target.value);
          field.onChange(formatted);
          setCardType(detectCardType(formatted));
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
              <div className="relative">
                <Input
                  {...field}
                  onChange={handleChange}
                  placeholder={placeholder}
                  disabled={disabled}
                  maxLength={19}
                  aria-invalid={!!fieldState.error}
                  className="pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {showCardType && cardType && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {cardType}
                    </span>
                  )}
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
