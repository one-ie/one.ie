/**
 * Form Builder Integration Example
 *
 * Shows how to integrate FormBuilder with the Funnel Page Builder.
 * Converts FormBuilder output to PageElement format.
 *
 * Part of Cycle 61: Form Builder UI
 */

import { useState } from "react";
import { FormBuilder } from "./FormBuilder";
import type { ExtendedFormFieldConfig, FormSettings } from "./FormBuilder";
import type {
	FormElementProperties,
	FormFieldConfig,
} from "@/types/funnel-builder";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface FormBuilderIntegrationProps {
	/**
	 * Callback when form is added to page
	 */
	onFormAdded?: (formElement: FormElementProperties) => void;

	/**
	 * Button variant
	 */
	variant?: "default" | "outline" | "ghost";
}

export function FormBuilderIntegration({
	onFormAdded,
	variant = "default",
}: FormBuilderIntegrationProps) {
	const [showBuilder, setShowBuilder] = useState(false);

	const handleFormSave = (
		fields: ExtendedFormFieldConfig[],
		settings: FormSettings
	) => {
		// Convert FormBuilder config to PageElement format
		const formElement: FormElementProperties = {
			id: `form_${Date.now()}`,
			type: "form",
			position: {
				row: 0,
				col: 0,
				width: 12,
				height: 1,
			},
			visible: true,
			title: settings.title,
			description: settings.description,
			fields: convertFields(fields),
			submitText: settings.submitButtonText,
			successMessage: settings.successMessage,
			redirectUrl: settings.redirectUrl,
		};

		// Notify parent
		onFormAdded?.(formElement);

		// Close builder
		setShowBuilder(false);
	};

	return (
		<>
			<Button variant={variant} onClick={() => setShowBuilder(true)}>
				<Plus className="h-4 w-4 mr-2" />
				Add Form
			</Button>

			<Dialog open={showBuilder} onOpenChange={setShowBuilder}>
				<DialogContent className="max-w-7xl h-[90vh] p-0">
					<DialogHeader className="sr-only">
						<DialogTitle>Form Builder</DialogTitle>
						<DialogDescription>
							Create a form using AI or drag-and-drop
						</DialogDescription>
					</DialogHeader>
					<FormBuilder onSave={handleFormSave} enableAI={true} />
				</DialogContent>
			</Dialog>
		</>
	);
}

/**
 * Convert FormBuilder fields to PageElement FormFieldConfig
 */
function convertFields(
	fields: ExtendedFormFieldConfig[]
): FormFieldConfig[] {
	return fields.map((field) => {
		const baseField: FormFieldConfig = {
			id: field.id,
			type: mapFieldType(field.type),
			label: field.label,
			placeholder: field.placeholder,
			required: field.required,
			validation: field.validation,
		};

		// Add options for select fields
		if (field.type === "select" && field.options) {
			baseField.options = field.options;
		}

		// Convert radio options to select options
		if (field.type === "radio" && field.radioOptions) {
			baseField.type = "select";
			baseField.options = field.radioOptions;
		}

		return baseField;
	});
}

/**
 * Map ExtendedFieldType to FormFieldConfig type
 */
function mapFieldType(
	type: ExtendedFormFieldConfig["type"]
): FormFieldConfig["type"] {
	switch (type) {
		case "text":
		case "email":
		case "phone":
			return "text";
		case "textarea":
			return "textarea";
		case "select":
		case "radio": // Radio becomes select in PageElement
			return "select";
		case "checkbox":
			return "checkbox";
		case "file":
			return "text"; // File upload shown as text in PageElement
		default:
			return "text";
	}
}
