/**
 * ValidatedForm - Example Component (Cycle 63)
 *
 * Comprehensive example showing all validation features:
 * - Real-time validation (onBlur and onChange)
 * - Visual feedback (red borders for errors, green for valid)
 * - Success indicators (checkmarks)
 * - Custom validators
 * - All field types
 *
 * Usage:
 * ```astro
 * ---
 * import { ValidatedForm } from '@/components/forms/ValidatedForm';
 * ---
 *
 * <ValidatedForm client:load />
 * ```
 */

import { useFormValidation, getValidationState } from "@/lib/forms/validation";
import { productFormSchema, type ProductFormData } from "@/lib/forms/schemas";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Validation indicator component
 */
function ValidationIndicator({
	state,
}: {
	state: "idle" | "validating" | "valid" | "invalid";
}) {
	if (state === "validating") {
		return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
	}

	if (state === "valid") {
		return <CheckCircle2 className="h-4 w-4 text-green-600" />;
	}

	if (state === "invalid") {
		return <XCircle className="h-4 w-4 text-red-600" />;
	}

	return null;
}

export function ValidatedForm() {
	const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

	// Initialize form with validation
	const form = useFormValidation<ProductFormData>({
		schema: productFormSchema,
		mode: "onBlur", // Validate when field loses focus
		revalidateMode: "onChange", // Re-validate on every change after first validation
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			price: 0,
			sku: "",
			inventory: 0,
			category: "",
			images: [],
			featured: false,
			published: false,
		},
	});

	const {
		formState: { errors, dirtyFields, touchedFields },
		control,
	} = form;

	// Handle form submission
	async function onSubmit(data: ProductFormData) {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log("Form submitted:", data);
			toast.success("Product created successfully!");

			// Reset form after successful submission
			form.reset();
		} catch (error) {
			toast.error("Failed to create product");
			console.error(error);
		}
	}

	// Handle slug generation from name
	function generateSlug(name: string) {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Create Product</h1>
				<p className="text-muted-foreground mt-2">
					Form with comprehensive validation and real-time feedback
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Product Name - Required text with auto-slug generation */}
					<FormField
						control={control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Product Name
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<div className="relative">
									<FormControl>
										<Input
											placeholder="Enter product name"
											{...field}
											onChange={(e) => {
												field.onChange(e);
												// Auto-generate slug from name
												const slug = generateSlug(e.target.value);
												form.setValue("slug", slug);
											}}
											className={cn(
												errors.name && "border-red-500 focus-visible:ring-red-500",
												!errors.name &&
													dirtyFields.name &&
													touchedFields.name &&
													"border-green-500",
											)}
										/>
									</FormControl>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ValidationIndicator
											state={getValidationState(
												!!errors.name,
												isValidating.name,
												dirtyFields.name,
												touchedFields.name,
											)}
										/>
									</div>
								</div>
								<FormDescription>
									This will be displayed as the product title
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Slug - Auto-generated from name */}
					<FormField
						control={control}
						name="slug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									URL Slug
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<div className="relative">
									<FormControl>
										<Input
											placeholder="product-slug"
											{...field}
											className={cn(
												errors.slug && "border-red-500 focus-visible:ring-red-500",
												!errors.slug &&
													dirtyFields.slug &&
													touchedFields.slug &&
													"border-green-500",
											)}
										/>
									</FormControl>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ValidationIndicator
											state={getValidationState(
												!!errors.slug,
												isValidating.slug,
												dirtyFields.slug,
												touchedFields.slug,
											)}
										/>
									</div>
								</div>
								<FormDescription>
									Lowercase alphanumeric with hyphens only
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Description - Textarea with character limits */}
					<FormField
						control={control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Description
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe your product..."
										{...field}
										className={cn(
											"min-h-[100px]",
											errors.description &&
												"border-red-500 focus-visible:ring-red-500",
											!errors.description &&
												dirtyFields.description &&
												touchedFields.description &&
												"border-green-500",
										)}
									/>
								</FormControl>
								<FormDescription>
									{field.value?.length || 0} / 2000 characters (minimum 10)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Price - Number with validation */}
					<FormField
						control={control}
						name="price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Price
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<div className="relative">
									<FormControl>
										<Input
											type="number"
											step="0.01"
											placeholder="0.00"
											{...field}
											onChange={(e) => field.onChange(parseFloat(e.target.value))}
											className={cn(
												errors.price && "border-red-500 focus-visible:ring-red-500",
												!errors.price &&
													dirtyFields.price &&
													touchedFields.price &&
													"border-green-500",
											)}
										/>
									</FormControl>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ValidationIndicator
											state={getValidationState(
												!!errors.price,
												isValidating.price,
												dirtyFields.price,
												touchedFields.price,
											)}
										/>
									</div>
								</div>
								<FormDescription>$0.01 - $1,000,000</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* SKU - Required text */}
					<FormField
						control={control}
						name="sku"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									SKU
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<div className="relative">
									<FormControl>
										<Input
											placeholder="PROD-001"
											{...field}
											className={cn(
												errors.sku && "border-red-500 focus-visible:ring-red-500",
												!errors.sku &&
													dirtyFields.sku &&
													touchedFields.sku &&
													"border-green-500",
											)}
										/>
									</FormControl>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ValidationIndicator
											state={getValidationState(
												!!errors.sku,
												isValidating.sku,
												dirtyFields.sku,
												touchedFields.sku,
											)}
										/>
									</div>
								</div>
								<FormDescription>Stock keeping unit (max 50 characters)</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Inventory - Positive integer */}
					<FormField
						control={control}
						name="inventory"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Inventory
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<div className="relative">
									<FormControl>
										<Input
											type="number"
											placeholder="0"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value))}
											className={cn(
												errors.inventory &&
													"border-red-500 focus-visible:ring-red-500",
												!errors.inventory &&
													dirtyFields.inventory &&
													touchedFields.inventory &&
													"border-green-500",
											)}
										/>
									</FormControl>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										<ValidationIndicator
											state={getValidationState(
												!!errors.inventory,
												isValidating.inventory,
												dirtyFields.inventory,
												touchedFields.inventory,
											)}
										/>
									</div>
								</div>
								<FormDescription>Number of items in stock</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Category - Select dropdown */}
					<FormField
						control={control}
						name="category"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Category
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger
											className={cn(
												errors.category &&
													"border-red-500 focus-visible:ring-red-500",
												!errors.category &&
													dirtyFields.category &&
													touchedFields.category &&
													"border-green-500",
											)}
										>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="electronics">Electronics</SelectItem>
										<SelectItem value="clothing">Clothing</SelectItem>
										<SelectItem value="books">Books</SelectItem>
										<SelectItem value="home">Home & Garden</SelectItem>
										<SelectItem value="sports">Sports & Outdoors</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>Product category</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Image URL - Array input */}
					<FormField
						control={control}
						name="images"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Image URL
									<span className="text-destructive ml-1">*</span>
								</FormLabel>
								<FormControl>
									<Input
										type="url"
										placeholder="https://example.com/image.jpg"
										value={field.value?.[0] || ""}
										onChange={(e) => field.onChange([e.target.value])}
										className={cn(
											errors.images && "border-red-500 focus-visible:ring-red-500",
											!errors.images &&
												dirtyFields.images &&
												touchedFields.images &&
												"border-green-500",
										)}
									/>
								</FormControl>
								<FormDescription>At least one image is required</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Featured - Checkbox */}
					<FormField
						control={control}
						name="featured"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Featured Product</FormLabel>
									<FormDescription>
										This product will appear in featured sections
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					{/* Published - Checkbox */}
					<FormField
						control={control}
						name="published"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Publish Product</FormLabel>
									<FormDescription>
										Make this product visible to customers
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					{/* Submit Button */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
						>
							Reset
						</Button>
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								"Create Product"
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
