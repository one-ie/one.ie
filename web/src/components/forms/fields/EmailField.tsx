/**
 * EmailField - Email input with validation
 */

import * as React from 'react';
import { TextField } from './TextField';
import type { BaseFieldProps } from './types';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function EmailField(props: BaseFieldProps) {
  return (
    <TextField
      {...props}
      type="email"
      pattern={EMAIL_REGEX}
      placeholder={props.placeholder || 'you@example.com'}
    />
  );
}
