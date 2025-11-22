/**
 * FileUploadField - File upload with drag & drop
 */

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormFieldWrapper } from './FormFieldWrapper';
import type { FileUploadFieldProps } from './types';
import { cn } from '@/lib/utils';
import { Upload, X, FileIcon } from 'lucide-react';

export function FileUploadField({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  multiple = false,
  maxFiles = 5,
}: FileUploadFieldProps) {
  const form = useFormContext();
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFiles = (files: FileList): string | null => {
    if (!files || files.length === 0) return null;

    if (multiple && files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`;
      }
    }

    return null;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{
        required: required ? `${label || name} is required` : undefined,
        validate: (value) => {
          if (!value) return true;
          const files = value as FileList;
          return validateFiles(files) || true;
        }
      }}
      render={({ field: { onChange, value, ...field }, fieldState }) => {
        const files = value as FileList | null;

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragging(false);

          if (!disabled && e.dataTransfer.files) {
            onChange(e.dataTransfer.files);
          }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
            onChange(e.target.files);
          }
        };

        const clearFiles = () => {
          onChange(null);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
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
                {/* Drag & Drop Zone */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragging && 'border-primary bg-primary/5',
                    !isDragging && 'border-muted-foreground/25 hover:border-primary/50',
                    fieldState.error && 'border-destructive',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !disabled && inputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {placeholder || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accept || 'Any file type'} • Max {formatFileSize(maxSize)}
                    {multiple && ` • Up to ${maxFiles} files`}
                  </p>
                  <Input
                    {...field}
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </div>

                {/* File List */}
                {files && files.length > 0 && (
                  <div className="space-y-2">
                    {Array.from(files).map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2 p-2 border rounded-md"
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFiles();
                          }}
                          disabled={disabled}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
