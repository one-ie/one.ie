/**
 * PostalCodeField - ZIP/Postal code input with validation
 */

import * as React from 'react';
import { TextField } from './TextField';
import type { BaseFieldProps } from './types';

// US ZIP code: 5 digits or 5+4 format
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

// Canadian postal code: A1A 1A1 format
const CA_POSTAL_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

// UK postcode
const UK_POSTAL_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

interface PostalCodeFieldProps extends BaseFieldProps {
  country?: 'US' | 'CA' | 'GB' | 'INTL';
}

export function PostalCodeField({ country = 'US', ...props }: PostalCodeFieldProps) {
  const patterns = {
    US: { regex: US_ZIP_REGEX, placeholder: '12345 or 12345-6789' },
    CA: { regex: CA_POSTAL_REGEX, placeholder: 'A1A 1A1' },
    GB: { regex: UK_POSTAL_REGEX, placeholder: 'SW1A 1AA' },
    INTL: { regex: undefined, placeholder: 'Postal code' },
  };

  const config = patterns[country];

  return (
    <TextField
      {...props}
      pattern={config.regex}
      placeholder={props.placeholder || config.placeholder}
      label={props.label || (country === 'US' ? 'ZIP Code' : 'Postal Code')}
    />
  );
}
