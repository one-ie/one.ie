/**
 * Form Validation Schemas - Cycle 63
 *
 * Common Zod schemas for all field types with real-time validation
 *
 * Usage:
 * ```typescript
 * import { emailSchema, phoneSchema, productFormSchema } from '@/lib/forms/schemas';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { useForm } from 'react-hook-form';
 *
 * const form = useForm({
 *   resolver: zodResolver(productFormSchema),
 *   mode: 'onBlur', // Validate on blur
 * });
 * ```
 */

import { z } from "zod";

// ============================================================================
// PRIMITIVE FIELD SCHEMAS
// ============================================================================

/**
 * Required text field (1-500 characters)
 */
export const requiredTextSchema = z
	.string()
	.min(1, "This field is required")
	.max(500, "Maximum 500 characters");

/**
 * Optional text field (0-500 characters)
 */
export const optionalTextSchema = z
	.string()
	.max(500, "Maximum 500 characters")
	.optional();

/**
 * Email validation with proper format checking
 */
export const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address")
	.toLowerCase();

/**
 * Optional email validation
 */
export const optionalEmailSchema = z
	.string()
	.email("Please enter a valid email address")
	.toLowerCase()
	.optional()
	.or(z.literal(""));

/**
 * US phone number validation (formats: 123-456-7890, (123) 456-7890, 1234567890)
 */
export const phoneSchema = z
	.string()
	.min(1, "Phone number is required")
	.regex(
		/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
		"Please enter a valid phone number",
	);

/**
 * Optional phone number
 */
export const optionalPhoneSchema = z
	.string()
	.regex(
		/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
		"Please enter a valid phone number",
	)
	.optional()
	.or(z.literal(""));

/**
 * URL validation with protocol requirement
 */
export const urlSchema = z
	.string()
	.min(1, "URL is required")
	.url("Please enter a valid URL (include https://)");

/**
 * Optional URL validation
 */
export const optionalUrlSchema = z
	.string()
	.url("Please enter a valid URL")
	.optional()
	.or(z.literal(""));

/**
 * Strong password validation
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character",
	);

/**
 * Number validation with min/max constraints
 */
export const numberSchema = (min = 0, max = 1000000) =>
	z
		.number({
			required_error: "This field is required",
			invalid_type_error: "Please enter a valid number",
		})
		.min(min, `Minimum value is ${min}`)
		.max(max, `Maximum value is ${max}`);

/**
 * Positive integer validation
 */
export const positiveIntegerSchema = z
	.number({
		required_error: "This field is required",
		invalid_type_error: "Please enter a valid number",
	})
	.int("Must be a whole number")
	.positive("Must be a positive number");

/**
 * Price validation (0.01 to 1,000,000)
 */
export const priceSchema = z
	.number({
		required_error: "Price is required",
		invalid_type_error: "Please enter a valid price",
	})
	.min(0.01, "Minimum price is $0.01")
	.max(1000000, "Maximum price is $1,000,000");

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
	.number({
		required_error: "Percentage is required",
		invalid_type_error: "Please enter a valid percentage",
	})
	.min(0, "Minimum is 0%")
	.max(100, "Maximum is 100%");

/**
 * Date validation (must be in the future)
 */
export const futureDateSchema = z
	.string()
	.min(1, "Date is required")
	.refine(
		(date) => new Date(date) > new Date(),
		"Date must be in the future",
	);

/**
 * Date validation (must be in the past)
 */
export const pastDateSchema = z
	.string()
	.min(1, "Date is required")
	.refine((date) => new Date(date) < new Date(), "Date must be in the past");

/**
 * Textarea with character limits
 */
export const textareaSchema = (min = 10, max = 5000) =>
	z
		.string()
		.min(min, `Minimum ${min} characters required`)
		.max(max, `Maximum ${max} characters allowed`);

/**
 * Slug validation (lowercase, alphanumeric, hyphens only)
 */
export const slugSchema = z
	.string()
	.min(1, "Slug is required")
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		"Slug must be lowercase alphanumeric with hyphens only",
	);

/**
 * Hex color validation (#000000 or #FFF)
 */
export const hexColorSchema = z
	.string()
	.min(1, "Color is required")
	.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color");

/**
 * Credit card number validation (basic Luhn algorithm)
 */
export const creditCardSchema = z
	.string()
	.min(1, "Card number is required")
	.regex(/^[0-9]{13,19}$/, "Please enter a valid card number")
	.refine(
		(value) => {
			// Luhn algorithm
			let sum = 0;
			let isEven = false;
			for (let i = value.length - 1; i >= 0; i--) {
				let digit = parseInt(value.charAt(i), 10);
				if (isEven) {
					digit *= 2;
					if (digit > 9) digit -= 9;
				}
				sum += digit;
				isEven = !isEven;
			}
			return sum % 10 === 0;
		},
		{ message: "Invalid card number" },
	);

/**
 * CVV validation (3 or 4 digits)
 */
export const cvvSchema = z
	.string()
	.min(1, "CVV is required")
	.regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits");

/**
 * ZIP code validation (US format)
 */
export const zipCodeSchema = z
	.string()
	.min(1, "ZIP code is required")
	.regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code");

/**
 * Select/dropdown validation
 */
export const selectSchema = (options: string[]) =>
	z.enum(options as [string, ...string[]], {
		required_error: "Please select an option",
		invalid_type_error: "Please select a valid option",
	});

/**
 * Checkbox validation (must be checked)
 */
export const requiredCheckboxSchema = z
	.boolean()
	.refine((val) => val === true, "You must accept to continue");

/**
 * File upload validation
 */
export const fileSchema = (
	maxSizeMB = 5,
	allowedTypes = ["image/jpeg", "image/png", "image/webp"],
) =>
	z
		.custom<File>()
		.refine((file) => file instanceof File, "Please upload a file")
		.refine(
			(file) => file.size <= maxSizeMB * 1024 * 1024,
			`File size must be less than ${maxSizeMB}MB`,
		)
		.refine(
			(file) => allowedTypes.includes(file.type),
			`File type must be one of: ${allowedTypes.join(", ")}`,
		);

// ============================================================================
// COMPOSITE FORM SCHEMAS (Common Use Cases)
// ============================================================================

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
	name: requiredTextSchema,
	email: emailSchema,
	phone: optionalPhoneSchema,
	subject: requiredTextSchema,
	message: textareaSchema(10, 1000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * User registration form schema
 */
export const registrationFormSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
		firstName: requiredTextSchema,
		lastName: requiredTextSchema,
		terms: requiredCheckboxSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Product creation form schema
 */
export const productFormSchema = z.object({
	name: requiredTextSchema,
	slug: slugSchema,
	description: textareaSchema(10, 2000),
	price: priceSchema,
	compareAtPrice: z.number().optional(),
	sku: z.string().min(1, "SKU is required").max(50),
	inventory: positiveIntegerSchema,
	category: z.string().min(1, "Category is required"),
	tags: z.array(z.string()).optional(),
	images: z.array(z.string().url()).min(1, "At least one image is required"),
	featured: z.boolean().default(false),
	published: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

/**
 * User profile update schema
 */
export const profileFormSchema = z.object({
	displayName: requiredTextSchema,
	email: emailSchema,
	phone: optionalPhoneSchema,
	bio: optionalTextSchema,
	website: optionalUrlSchema,
	location: optionalTextSchema,
	avatarUrl: optionalUrlSchema,
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

/**
 * Address form schema
 */
export const addressFormSchema = z.object({
	line1: requiredTextSchema,
	line2: optionalTextSchema,
	city: requiredTextSchema,
	state: requiredTextSchema,
	zipCode: zipCodeSchema,
	country: z.string().default("US"),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;

/**
 * Payment form schema
 */
export const paymentFormSchema = z.object({
	cardNumber: creditCardSchema,
	cardName: requiredTextSchema,
	expiryMonth: z
		.string()
		.regex(/^(0[1-9]|1[0-2])$/, "Invalid month (01-12)"),
	expiryYear: z
		.string()
		.regex(/^20[2-9][0-9]$/, "Invalid year"),
	cvv: cvvSchema,
	billingAddress: addressFormSchema,
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

/**
 * Course creation form schema
 */
export const courseFormSchema = z.object({
	title: requiredTextSchema,
	slug: slugSchema,
	description: textareaSchema(50, 5000),
	price: priceSchema,
	instructor: requiredTextSchema,
	category: z.string().min(1, "Category is required"),
	level: z.enum(["beginner", "intermediate", "advanced"]),
	duration: positiveIntegerSchema,
	thumbnail: urlSchema,
	published: z.boolean().default(false),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

/**
 * Team member invitation schema
 */
export const inviteFormSchema = z.object({
	email: emailSchema,
	role: z.enum(["org_owner", "org_user"]),
	firstName: requiredTextSchema,
	lastName: requiredTextSchema,
	message: optionalTextSchema,
});

export type InviteFormData = z.infer<typeof inviteFormSchema>;

/**
 * Settings form schema
 */
export const settingsFormSchema = z.object({
	organizationName: requiredTextSchema,
	primaryColor: hexColorSchema,
	logo: optionalUrlSchema,
	timezone: z.string().min(1, "Timezone is required"),
	emailNotifications: z.boolean().default(true),
	marketingEmails: z.boolean().default(false),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;

// ============================================================================
// CUSTOM VALIDATORS (For Complex Rules)
// ============================================================================

/**
 * Async validator for checking if email exists
 * @param email Email to check
 * @returns True if email is available, error message if taken
 */
export async function validateEmailAvailability(
	email: string,
): Promise<boolean | string> {
	try {
		const response = await fetch(`/api/check-email?email=${email}`);
		const data = await response.json();
		return data.available ? true : "Email is already taken";
	} catch {
		return "Could not verify email availability";
	}
}

/**
 * Async validator for checking if slug is unique
 * @param slug Slug to check
 * @returns True if slug is available, error message if taken
 */
export async function validateSlugAvailability(
	slug: string,
): Promise<boolean | string> {
	try {
		const response = await fetch(`/api/check-slug?slug=${slug}`);
		const data = await response.json();
		return data.available ? true : "Slug is already taken";
	} catch {
		return "Could not verify slug availability";
	}
}

/**
 * Validator for matching passwords
 * @param password Password
 * @param confirmPassword Confirmation password
 * @returns True if passwords match, error message otherwise
 */
export function validatePasswordMatch(
	password: string,
	confirmPassword: string,
): boolean | string {
	return password === confirmPassword ? true : "Passwords do not match";
}

/**
 * Validator for minimum age requirement
 * @param birthdate Date of birth
 * @param minAge Minimum age required (default 18)
 * @returns True if age requirement met, error message otherwise
 */
export function validateMinAge(
	birthdate: string,
	minAge = 18,
): boolean | string {
	const today = new Date();
	const birth = new Date(birthdate);
	const age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birth.getDate())
	) {
		return age - 1 >= minAge ? true : `You must be at least ${minAge} years old`;
	}

	return age >= minAge ? true : `You must be at least ${minAge} years old`;
}

/**
 * Custom regex validator factory
 * @param pattern Regex pattern
 * @param message Error message
 * @returns Zod schema with custom regex
 */
export function createRegexValidator(pattern: RegExp, message: string) {
	return z.string().regex(pattern, message);
}

/**
 * Custom async validator factory
 * @param validatorFn Async validation function
 * @param errorMessage Error message if validation fails
 * @returns Zod schema with async refinement
 */
export function createAsyncValidator(
	validatorFn: (value: string) => Promise<boolean>,
	errorMessage: string,
) {
	return z.string().refine(validatorFn, { message: errorMessage });
}
