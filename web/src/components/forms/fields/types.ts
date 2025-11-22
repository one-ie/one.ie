/**
 * Form field types and interfaces
 */

import type { ControllerRenderProps, FieldValues } from 'react-hook-form';

export interface BaseFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FieldError {
  type: string;
  message: string;
}

// Field-specific props
export interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
}

export interface NumberFieldProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[];
  searchable?: boolean;
}

export interface MultiSelectFieldProps extends BaseFieldProps {
  options: SelectOption[];
  maxSelections?: number;
}

export interface FileUploadFieldProps extends BaseFieldProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  maxFiles?: number;
}

export interface RatingFieldProps extends BaseFieldProps {
  max?: number;
  icon?: 'star' | 'heart' | 'circle';
}

export interface SliderFieldProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

export interface CountryFieldProps extends BaseFieldProps {
  searchable?: boolean;
}

export interface StateFieldProps extends BaseFieldProps {
  country?: string;
}

export interface CreditCardFieldProps extends BaseFieldProps {
  showCardType?: boolean;
}
