/**
 * Form Validation Utilities - Cycle 63
 *
 * Utilities for real-time validation with visual feedback
 *
 * Usage:
 * ```typescript
 * import { useFormValidation } from '@/lib/forms/validation';
 * import { productFormSchema } from '@/lib/forms/schemas';
 *
 * const form = useFormValidation({
 *   schema: productFormSchema,
 *   mode: 'onBlur', // or 'onChange' for instant feedback
 * });
 * ```
 */

import { useForm, type UseFormProps, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Validation mode for form fields
 */
export type ValidationMode =
	| "onChange" // Validate on every change (instant feedback)
	| "onBlur" // Validate when field loses focus
	| "onSubmit" // Validate only on form submit
	| "onTouched" // Validate after field is touched
	| "all"; // Validate on all events

/**
 * Field validation state
 */
export type FieldValidationState = "idle" | "validating" | "valid" | "invalid";

/**
 * Validation error with field-specific details
 */
export interface ValidationError {
	field: string;
	message: string;
	type?: string;
}

/**
 * Form validation hook props
 */
export interface UseFormValidationProps<T extends FieldValues>
	extends Omit<UseFormProps<T>, "resolver"> {
	schema: ZodSchema<T>;
	mode?: ValidationMode;
	revalidateMode?: ValidationMode;
}

// ============================================================================
// VALIDATION HOOKS
// ============================================================================

/**
 * Enhanced useForm hook with Zod validation
 *
 * Provides real-time validation with visual feedback
 *
 * @example
 * ```typescript
 * const form = useFormValidation({
 *   schema: productFormSchema,
 *   mode: 'onBlur',
 *   defaultValues: { name: '', price: 0 }
 * });
 *
 * <Form {...form}>
 *   <FormField
 *     control={form.control}
 *     name="name"
 *     render={({ field }) => (
 *       <FormItem>
 *         <FormLabel>Name</FormLabel>
 *         <FormControl>
 *           <Input {...field} />
 *         </FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )}
 *   />
 * </Form>
 * ```
 */
export function useFormValidation<T extends FieldValues>({
	schema,
	mode = "onBlur",
	revalidateMode = "onChange",
	...props
}: UseFormValidationProps<T>) {
	return useForm<T>({
		...props,
		resolver: zodResolver(schema),
		mode,
		revalidateMode,
	});
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Get field validation class names for visual feedback
 *
 * @param hasError Whether field has an error
 * @param isDirty Whether field has been modified
 * @param isTouched Whether field has been focused
 * @returns className string for input styling
 *
 * @example
 * ```typescript
 * <Input
 *   {...field}
 *   className={getFieldClassName(!!errors.name, dirtyFields.name, touchedFields.name)}
 * />
 * ```
 */
export function getFieldClassName(
	hasError: boolean,
	isDirty?: boolean,
	isTouched?: boolean,
): string {
	if (hasError) {
		return "border-red-500 focus-visible:ring-red-500";
	}

	if (isDirty && isTouched) {
		return "border-green-500 focus-visible:ring-green-500";
	}

	return "";
}

/**
 * Get validation state icon
 *
 * @param hasError Whether field has an error
 * @param isValidating Whether field is currently validating
 * @param isDirty Whether field has been modified
 * @param isTouched Whether field has been focused
 * @returns Icon component or null
 *
 * @example
 * ```typescript
 * const Icon = getValidationIcon(
 *   !!errors.email,
 *   isValidating.email,
 *   dirtyFields.email,
 *   touchedFields.email
 * );
 * {Icon && <Icon className="h-4 w-4" />}
 * ```
 */
export function getValidationState(
	hasError: boolean,
	isValidating?: boolean,
	isDirty?: boolean,
	isTouched?: boolean,
): FieldValidationState {
	if (isValidating) return "validating";
	if (hasError) return "invalid";
	if (isDirty && isTouched) return "valid";
	return "idle";
}

/**
 * Format validation errors for display
 *
 * @param errors Form errors object from react-hook-form
 * @returns Array of formatted validation errors
 *
 * @example
 * ```typescript
 * const errors = formatValidationErrors(form.formState.errors);
 * errors.forEach(error => {
 *   console.log(`${error.field}: ${error.message}`);
 * });
 * ```
 */
export function formatValidationErrors(errors: Record<string, any>): ValidationError[] {
	return Object.entries(errors).map(([field, error]) => ({
		field,
		message: error?.message || "Validation failed",
		type: error?.type,
	}));
}

/**
 * Check if form has any errors
 *
 * @param errors Form errors object
 * @returns true if any errors exist
 */
export function hasFormErrors(errors: Record<string, any>): boolean {
	return Object.keys(errors).length > 0;
}

/**
 * Get first error message from form
 *
 * @param errors Form errors object
 * @returns First error message or null
 */
export function getFirstError(errors: Record<string, any>): string | null {
	const firstError = Object.values(errors)[0];
	return firstError?.message || null;
}

/**
 * Validate single field value against schema
 *
 * @param schema Zod schema
 * @param value Field value
 * @returns Error message or null
 *
 * @example
 * ```typescript
 * const error = await validateField(emailSchema, 'invalid-email');
 * if (error) {
 *   console.error(error); // "Please enter a valid email"
 * }
 * ```
 */
export async function validateField(
	schema: ZodSchema,
	value: any,
): Promise<string | null> {
	try {
		await schema.parseAsync(value);
		return null;
	} catch (error: any) {
		return error.errors?.[0]?.message || "Validation failed";
	}
}

/**
 * Debounce validation for real-time fields
 *
 * @param validationFn Validation function
 * @param delay Delay in milliseconds (default 500ms)
 * @returns Debounced validation function
 *
 * @example
 * ```typescript
 * const debouncedValidate = debounceValidation(
 *   async (value) => validateField(emailSchema, value),
 *   300
 * );
 *
 * onChange={async (e) => {
 *   const error = await debouncedValidate(e.target.value);
 *   if (error) setError('email', { message: error });
 * }}
 * ```
 */
export function debounceValidation<T>(
	validationFn: (value: T) => Promise<string | null>,
	delay = 500,
) {
	let timeoutId: NodeJS.Timeout;

	return (value: T): Promise<string | null> => {
		return new Promise((resolve) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(async () => {
				const result = await validationFn(value);
				resolve(result);
			}, delay);
		});
	};
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Common regex patterns for validation
 */
export const validationPatterns = {
	/**
	 * Email pattern (basic)
	 */
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

	/**
	 * Phone number pattern (US)
	 */
	phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,

	/**
	 * URL pattern
	 */
	url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

	/**
	 * Slug pattern (lowercase, alphanumeric, hyphens)
	 */
	slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

	/**
	 * Hex color pattern (#000 or #000000)
	 */
	hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

	/**
	 * Credit card pattern
	 */
	creditCard: /^[0-9]{13,19}$/,

	/**
	 * CVV pattern (3 or 4 digits)
	 */
	cvv: /^[0-9]{3,4}$/,

	/**
	 * ZIP code pattern (US)
	 */
	zipCode: /^\d{5}(-\d{4})?$/,

	/**
	 * Username pattern (alphanumeric, underscore, hyphen, 3-20 chars)
	 */
	username: /^[a-zA-Z0-9_-]{3,20}$/,

	/**
	 * Strong password pattern
	 */
	strongPassword:
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

	/**
	 * Date pattern (YYYY-MM-DD)
	 */
	date: /^\d{4}-\d{2}-\d{2}$/,

	/**
	 * Time pattern (HH:MM)
	 */
	time: /^([01]\d|2[0-3]):([0-5]\d)$/,
};

/**
 * Common error messages
 */
export const validationMessages = {
	required: "This field is required",
	email: "Please enter a valid email address",
	phone: "Please enter a valid phone number",
	url: "Please enter a valid URL",
	minLength: (min: number) => `Minimum ${min} characters required`,
	maxLength: (max: number) => `Maximum ${max} characters allowed`,
	min: (min: number) => `Minimum value is ${min}`,
	max: (max: number) => `Maximum value is ${max}`,
	password: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
	passwordMatch: "Passwords do not match",
	invalidFormat: "Invalid format",
	invalidDate: "Please enter a valid date",
	futureDate: "Date must be in the future",
	pastDate: "Date must be in the past",
};

// ============================================================================
// FIELD VALIDATORS (For Custom Validation)
// ============================================================================

/**
 * Validate required field
 */
export const validateRequired = (value: any): boolean => {
	if (typeof value === "string") return value.trim().length > 0;
	if (typeof value === "number") return !isNaN(value);
	if (Array.isArray(value)) return value.length > 0;
	return !!value;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
	return validationPatterns.email.test(email);
};

/**
 * Validate phone format
 */
export const validatePhone = (phone: string): boolean => {
	return validationPatterns.phone.test(phone);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

/**
 * Validate min length
 */
export const validateMinLength = (value: string, min: number): boolean => {
	return value.trim().length >= min;
};

/**
 * Validate max length
 */
export const validateMaxLength = (value: string, max: number): boolean => {
	return value.trim().length <= max;
};

/**
 * Validate number range
 */
export const validateRange = (
	value: number,
	min: number,
	max: number,
): boolean => {
	return value >= min && value <= max;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): boolean => {
	return validationPatterns.strongPassword.test(password);
};

/**
 * Validate file size
 */
export const validateFileSize = (
	file: File,
	maxSizeMB: number,
): boolean => {
	return file.size <= maxSizeMB * 1024 * 1024;
};

/**
 * Validate file type
 */
export const validateFileType = (
	file: File,
	allowedTypes: string[],
): boolean => {
	return allowedTypes.includes(file.type);
};

// ============================================================================
// ASYNC VALIDATORS
// ============================================================================

/**
 * Create async validator with debounce
 *
 * @param validatorFn Async validation function
 * @param debounceMs Debounce delay in milliseconds
 * @returns Debounced async validator
 */
export function createAsyncValidator(
	validatorFn: (value: any) => Promise<boolean | string>,
	debounceMs = 500,
) {
	let timeoutId: NodeJS.Timeout;

	return (value: any): Promise<boolean | string> => {
		return new Promise((resolve) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(async () => {
				const result = await validatorFn(value);
				resolve(result);
			}, debounceMs);
		});
	};
}

/**
 * Validate email availability (async)
 */
export const validateEmailAvailability = createAsyncValidator(
	async (email: string): Promise<boolean | string> => {
		try {
			const response = await fetch(`/api/check-email?email=${email}`);
			const data = await response.json();
			return data.available ? true : "Email is already taken";
		} catch {
			return "Could not verify email availability";
		}
	},
);

/**
 * Validate username availability (async)
 */
export const validateUsernameAvailability = createAsyncValidator(
	async (username: string): Promise<boolean | string> => {
		try {
			const response = await fetch(`/api/check-username?username=${username}`);
			const data = await response.json();
			return data.available ? true : "Username is already taken";
		} catch {
			return "Could not verify username availability";
		}
	},
);

/**
 * Validate slug availability (async)
 */
export const validateSlugAvailability = createAsyncValidator(
	async (slug: string): Promise<boolean | string> => {
		try {
			const response = await fetch(`/api/check-slug?slug=${slug}`);
			const data = await response.json();
			return data.available ? true : "Slug is already taken";
		} catch {
			return "Could not verify slug availability";
		}
	},
);
