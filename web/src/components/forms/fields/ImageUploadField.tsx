/**
 * ImageUploadField - Image upload with preview
 */

import * as React from 'react';
import { FileUploadField } from './FileUploadField';
import type { FileUploadFieldProps } from './types';

export function ImageUploadField(props: Omit<FileUploadFieldProps, 'accept'>) {
  return (
    <FileUploadField
      {...props}
      accept="image/*"
      placeholder={props.placeholder || 'Click to upload image or drag and drop'}
    />
  );
}
