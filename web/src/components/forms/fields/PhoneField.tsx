/**
 * PhoneField - Phone number input with validation
 */

import * as React from 'react';
import { TextField } from './TextField';
import type { BaseFieldProps } from './types';

// Basic phone regex (can be customized per country)
const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

export function PhoneField(props: BaseFieldProps) {
  return (
    <TextField
      {...props}
      type="tel"
      pattern={PHONE_REGEX}
      placeholder={props.placeholder || '+1 (555) 123-4567'}
    />
  );
}
