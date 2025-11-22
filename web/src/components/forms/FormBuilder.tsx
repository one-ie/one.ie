/**
 * Form Builder Component
 *
 * Conversational form builder with AI integration.
 * Allows users to create forms through chat: "Add a contact form with name, email, phone"
 *
 * Features:
 * - AI-powered form generation
 * - Drag-and-drop field reordering
 * - Field property editing
 * - Live preview
 * - Support for: text, email, phone, textarea, select, checkbox, radio, file upload
 * - Form settings: submit button text, success message, redirect URL
 *
 * Part of Cycle 61: Form Builder UI
 */

import { useState, useCallback } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	GripVertical,
	Plus,
	Trash2,
	Settings,
	Eye,
	Code,
	Sparkles,
	FileText,
	Mail,
	Phone,
	ChevronDown,
	Square,
	Circle,
	Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormFieldConfig } from "@/types/funnel-builder";

export type ExtendedFieldType =
	| "text"
	| "email"
	| "phone"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio"
	| "file";

export interface ExtendedFormFieldConfig extends Omit<FormFieldConfig, "type"> {
	type: ExtendedFieldType;
	radioOptions?: string[]; // For radio buttons
	accept?: string; // For file upload
}

export interface FormSettings {
	title?: string;
	description?: string;
	submitButtonText: string;
	successMessage: string;
	redirectUrl?: string;
}

interface FormBuilderProps {
	/**
	 * Initial form configuration
	 */
	initialFields?: ExtendedFormFieldConfig[];
	initialSettings?: FormSettings;

	/**
	 * Callback when form is saved
	 */
	onSave?: (fields: ExtendedFormFieldConfig[], settings: FormSettings) => void;

	/**
	 * Enable AI chat interface
	 */
	enableAI?: boolean;
}

export function FormBuilder({
	initialFields = [],
	initialSettings,
	onSave,
	enableAI = true,
}: FormBuilderProps) {
	const [fields, setFields] = useState<ExtendedFormFieldConfig[]>(initialFields);
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	const [mode, setMode] = useState<"builder" | "preview" | "code">("builder");
	const [showAI, setShowAI] = useState(false);

	const [settings, setSettings] = useState<FormSettings>(
		initialSettings || {
			submitButtonText: "Submit",
			successMessage: "Thank you! Your submission has been received.",
		}
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setFields((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const addField = (type: ExtendedFieldType) => {
		const newField: ExtendedFormFieldConfig = {
			id: `field_${Date.now()}`,
			type,
			label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
			placeholder: `Enter ${type}...`,
			required: false,
			...(type === "select" && { options: ["Option 1", "Option 2", "Option 3"] }),
			...(type === "radio" && {
				radioOptions: ["Option 1", "Option 2", "Option 3"],
			}),
			...(type === "file" && { accept: "*/*" }),
		};

		setFields([...fields, newField]);
		setSelectedFieldId(newField.id);
	};

	const updateField = (
		id: string,
		updates: Partial<ExtendedFormFieldConfig>
	) => {
		setFields(
			fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
		);
	};

	const deleteField = (id: string) => {
		setFields(fields.filter((field) => field.id !== id));
		if (selectedFieldId === id) {
			setSelectedFieldId(null);
		}
	};

	const handleSave = () => {
		onSave?.(fields, settings);
	};

	const selectedField = fields.find((f) => f.id === selectedFieldId);

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b">
				<div className="flex items-center gap-2">
					<FileText className="h-5 w-5" />
					<h2 className="text-lg font-semibold">Form Builder</h2>
				</div>

				<div className="flex items-center gap-2">
					{/* View mode toggle */}
					<div className="flex items-center gap-1 border rounded-lg p-1">
						<Button
							variant={mode === "builder" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setMode("builder")}
						>
							<Settings className="h-4 w-4 mr-1" />
							Builder
						</Button>
						<Button
							variant={mode === "preview" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setMode("preview")}
						>
							<Eye className="h-4 w-4 mr-1" />
							Preview
						</Button>
						<Button
							variant={mode === "code" ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setMode("code")}
						>
							<Code className="h-4 w-4 mr-1" />
							Code
						</Button>
					</div>

					{/* AI toggle */}
					{enableAI && (
						<Button
							variant={showAI ? "secondary" : "outline"}
							size="sm"
							onClick={() => setShowAI(!showAI)}
						>
							<Sparkles className="h-4 w-4 mr-1" />
							AI Assistant
						</Button>
					)}

					<Button onClick={handleSave}>Save Form</Button>
				</div>
			</div>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left: Fields list or AI chat */}
				{mode === "builder" && (
					<div className="w-80 border-r flex flex-col">
						{showAI ? (
							<FormBuilderAIChat
								onFieldsGenerated={(newFields) => setFields(newFields)}
								onSettingsGenerated={(newSettings) => setSettings(newSettings)}
							/>
						) : (
							<FieldsPalette onAddField={addField} />
						)}
					</div>
				)}

				{/* Center: Builder/Preview/Code */}
				<div className="flex-1 overflow-auto">
					{mode === "builder" && (
						<BuilderView
							fields={fields}
							selectedFieldId={selectedFieldId}
							onSelectField={setSelectedFieldId}
							onDragEnd={handleDragEnd}
							sensors={sensors}
							settings={settings}
							onUpdateSettings={setSettings}
						/>
					)}

					{mode === "preview" && (
						<PreviewView fields={fields} settings={settings} />
					)}

					{mode === "code" && <CodeView fields={fields} settings={settings} />}
				</div>

				{/* Right: Field properties */}
				{mode === "builder" && selectedField && (
					<div className="w-80 border-l overflow-auto">
						<FieldPropertiesPanel
							field={selectedField}
							onUpdate={(updates) => updateField(selectedField.id, updates)}
							onDelete={() => deleteField(selectedField.id)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Fields Palette - Available field types
 */
function FieldsPalette({ onAddField }: { onAddField: (type: ExtendedFieldType) => void }) {
	const fieldTypes: Array<{
		type: ExtendedFieldType;
		label: string;
		icon: React.ReactNode;
		description: string;
	}> = [
		{
			type: "text",
			label: "Text Input",
			icon: <FileText className="h-4 w-4" />,
			description: "Single line text",
		},
		{
			type: "email",
			label: "Email",
			icon: <Mail className="h-4 w-4" />,
			description: "Email address",
		},
		{
			type: "phone",
			label: "Phone",
			icon: <Phone className="h-4 w-4" />,
			description: "Phone number",
		},
		{
			type: "textarea",
			label: "Textarea",
			icon: <FileText className="h-4 w-4" />,
			description: "Multi-line text",
		},
		{
			type: "select",
			label: "Dropdown",
			icon: <ChevronDown className="h-4 w-4" />,
			description: "Select from options",
		},
		{
			type: "checkbox",
			label: "Checkbox",
			icon: <Square className="h-4 w-4" />,
			description: "Yes/No checkbox",
		},
		{
			type: "radio",
			label: "Radio Buttons",
			icon: <Circle className="h-4 w-4" />,
			description: "Choose one option",
		},
		{
			type: "file",
			label: "File Upload",
			icon: <Upload className="h-4 w-4" />,
			description: "Upload files",
		},
	];

	return (
		<div className="p-4">
			<h3 className="font-semibold mb-4">Add Fields</h3>
			<div className="space-y-2">
				{fieldTypes.map((fieldType) => (
					<Button
						key={fieldType.type}
						variant="outline"
						className="w-full justify-start"
						onClick={() => onAddField(fieldType.type)}
					>
						{fieldType.icon}
						<div className="ml-2 text-left flex-1">
							<div className="font-medium">{fieldType.label}</div>
							<div className="text-xs text-muted-foreground">
								{fieldType.description}
							</div>
						</div>
						<Plus className="h-4 w-4 ml-2" />
					</Button>
				))}
			</div>
		</div>
	);
}

/**
 * Builder View - Drag and drop form builder
 */
function BuilderView({
	fields,
	selectedFieldId,
	onSelectField,
	onDragEnd,
	sensors,
	settings,
	onUpdateSettings,
}: {
	fields: ExtendedFormFieldConfig[];
	selectedFieldId: string | null;
	onSelectField: (id: string) => void;
	onDragEnd: (event: DragEndEvent) => void;
	sensors: any;
	settings: FormSettings;
	onUpdateSettings: (settings: FormSettings) => void;
}) {
	return (
		<div className="p-8 max-w-3xl mx-auto">
			{/* Form settings */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Form Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="form-title">Form Title</Label>
						<Input
							id="form-title"
							value={settings.title || ""}
							onChange={(e) =>
								onUpdateSettings({ ...settings, title: e.target.value })
							}
							placeholder="Contact Form"
						/>
					</div>
					<div>
						<Label htmlFor="form-description">Description</Label>
						<Textarea
							id="form-description"
							value={settings.description || ""}
							onChange={(e) =>
								onUpdateSettings({ ...settings, description: e.target.value })
							}
							placeholder="We'll get back to you within 24 hours."
							rows={2}
						/>
					</div>
					<div>
						<Label htmlFor="submit-text">Submit Button Text</Label>
						<Input
							id="submit-text"
							value={settings.submitButtonText}
							onChange={(e) =>
								onUpdateSettings({
									...settings,
									submitButtonText: e.target.value,
								})
							}
						/>
					</div>
					<div>
						<Label htmlFor="success-message">Success Message</Label>
						<Input
							id="success-message"
							value={settings.successMessage}
							onChange={(e) =>
								onUpdateSettings({
									...settings,
									successMessage: e.target.value,
								})
							}
						/>
					</div>
					<div>
						<Label htmlFor="redirect-url">Redirect URL (optional)</Label>
						<Input
							id="redirect-url"
							value={settings.redirectUrl || ""}
							onChange={(e) =>
								onUpdateSettings({ ...settings, redirectUrl: e.target.value })
							}
							placeholder="https://example.com/thank-you"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Form fields */}
			<Card>
				<CardHeader>
					<CardTitle>Form Fields</CardTitle>
				</CardHeader>
				<CardContent>
					{fields.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
							<p>No fields yet. Add fields from the left panel.</p>
						</div>
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={onDragEnd}
						>
							<SortableContext
								items={fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<div className="space-y-4">
									{fields.map((field) => (
										<SortableFieldItem
											key={field.id}
											field={field}
											isSelected={selectedFieldId === field.id}
											onSelect={() => onSelectField(field.id)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Sortable Field Item - Draggable field in builder
 */
function SortableFieldItem({
	field,
	isSelected,
	onSelect,
}: {
	field: ExtendedFormFieldConfig;
	isSelected: boolean;
	onSelect: () => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: field.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			onClick={onSelect}
			className={cn(
				"flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
				isSelected
					? "ring-2 ring-primary ring-offset-2"
					: "hover:border-primary/50"
			)}
		>
			<div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
				<GripVertical className="h-5 w-5 text-muted-foreground" />
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2 mb-1">
					<Label>{field.label}</Label>
					{field.required && <Badge variant="secondary">Required</Badge>}
				</div>
				<FieldPreview field={field} />
			</div>
		</div>
	);
}

/**
 * Field Preview - Show what the field will look like
 */
function FieldPreview({ field }: { field: ExtendedFormFieldConfig }) {
	switch (field.type) {
		case "text":
		case "email":
		case "phone":
			return (
				<Input
					type={field.type}
					placeholder={field.placeholder}
					disabled
					className="opacity-60"
				/>
			);

		case "textarea":
			return (
				<Textarea
					placeholder={field.placeholder}
					disabled
					className="opacity-60"
					rows={3}
				/>
			);

		case "select":
			return (
				<Select disabled>
					<SelectTrigger className="opacity-60">
						<SelectValue placeholder={field.placeholder} />
					</SelectTrigger>
				</Select>
			);

		case "checkbox":
			return (
				<div className="flex items-center gap-2 opacity-60">
					<Checkbox disabled />
					<span className="text-sm">{field.placeholder}</span>
				</div>
			);

		case "radio":
			return (
				<RadioGroup disabled className="opacity-60">
					{field.radioOptions?.slice(0, 2).map((option, i) => (
						<div key={i} className="flex items-center gap-2">
							<RadioGroupItem value={option} id={`${field.id}-${i}`} />
							<Label htmlFor={`${field.id}-${i}`}>{option}</Label>
						</div>
					))}
				</RadioGroup>
			);

		case "file":
			return (
				<div className="border-2 border-dashed rounded-lg p-4 text-center opacity-60">
					<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Upload file</p>
				</div>
			);

		default:
			return null;
	}
}

/**
 * Field Properties Panel - Edit field settings
 */
function FieldPropertiesPanel({
	field,
	onUpdate,
	onDelete,
}: {
	field: ExtendedFormFieldConfig;
	onUpdate: (updates: Partial<ExtendedFormFieldConfig>) => void;
	onDelete: () => void;
}) {
	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold">Field Properties</h3>
				<Button variant="ghost" size="sm" onClick={onDelete}>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>

			<div className="space-y-4">
				<div>
					<Label htmlFor="field-label">Label</Label>
					<Input
						id="field-label"
						value={field.label}
						onChange={(e) => onUpdate({ label: e.target.value })}
					/>
				</div>

				<div>
					<Label htmlFor="field-placeholder">Placeholder</Label>
					<Input
						id="field-placeholder"
						value={field.placeholder || ""}
						onChange={(e) => onUpdate({ placeholder: e.target.value })}
					/>
				</div>

				<div className="flex items-center gap-2">
					<Checkbox
						id="field-required"
						checked={field.required}
						onCheckedChange={(checked) => onUpdate({ required: !!checked })}
					/>
					<Label htmlFor="field-required">Required field</Label>
				</div>

				{/* Select options */}
				{field.type === "select" && (
					<div>
						<Label>Options</Label>
						<div className="space-y-2 mt-2">
							{field.options?.map((option, i) => (
								<div key={i} className="flex gap-2">
									<Input
										value={option}
										onChange={(e) => {
											const newOptions = [...(field.options || [])];
											newOptions[i] = e.target.value;
											onUpdate({ options: newOptions });
										}}
									/>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											const newOptions = field.options?.filter(
												(_, idx) => idx !== i
											);
											onUpdate({ options: newOptions });
										}}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const newOptions = [...(field.options || []), "New Option"];
									onUpdate({ options: newOptions });
								}}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Option
							</Button>
						</div>
					</div>
				)}

				{/* Radio options */}
				{field.type === "radio" && (
					<div>
						<Label>Options</Label>
						<div className="space-y-2 mt-2">
							{field.radioOptions?.map((option, i) => (
								<div key={i} className="flex gap-2">
									<Input
										value={option}
										onChange={(e) => {
											const newOptions = [...(field.radioOptions || [])];
											newOptions[i] = e.target.value;
											onUpdate({ radioOptions: newOptions });
										}}
									/>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											const newOptions = field.radioOptions?.filter(
												(_, idx) => idx !== i
											);
											onUpdate({ radioOptions: newOptions });
										}}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const newOptions = [
										...(field.radioOptions || []),
										"New Option",
									];
									onUpdate({ radioOptions: newOptions });
								}}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Option
							</Button>
						</div>
					</div>
				)}

				{/* File accept types */}
				{field.type === "file" && (
					<div>
						<Label htmlFor="file-accept">Accepted File Types</Label>
						<Input
							id="file-accept"
							value={field.accept || "*/*"}
							onChange={(e) => onUpdate({ accept: e.target.value })}
							placeholder="image/*"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Examples: image/*, .pdf, .doc, */*
						</p>
					</div>
				)}

				{/* Validation */}
				{(field.type === "text" || field.type === "email" || field.type === "phone") && (
					<div>
						<Label htmlFor="field-validation">Validation Pattern (Regex)</Label>
						<Input
							id="field-validation"
							value={field.validation?.pattern || ""}
							onChange={(e) =>
								onUpdate({
									validation: {
										...field.validation,
										pattern: e.target.value,
									},
								})
							}
							placeholder="^[A-Za-z]+$"
						/>
						<Label htmlFor="field-validation-message" className="mt-2">
							Validation Error Message
						</Label>
						<Input
							id="field-validation-message"
							value={field.validation?.message || ""}
							onChange={(e) =>
								onUpdate({
									validation: {
										...field.validation,
										message: e.target.value,
									},
								})
							}
							placeholder="Please enter a valid value"
						/>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * Preview View - See how the form will look
 */
function PreviewView({
	fields,
	settings,
}: {
	fields: ExtendedFormFieldConfig[];
	settings: FormSettings;
}) {
	return (
		<div className="p-8 max-w-2xl mx-auto">
			<Card>
				<CardHeader>
					{settings.title && <CardTitle>{settings.title}</CardTitle>}
					{settings.description && (
						<p className="text-sm text-muted-foreground">{settings.description}</p>
					)}
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
						{fields.map((field) => (
							<div key={field.id} className="space-y-2">
								<Label htmlFor={field.id}>
									{field.label}
									{field.required && (
										<span className="text-destructive ml-1">*</span>
									)}
								</Label>

								{(field.type === "text" ||
									field.type === "email" ||
									field.type === "phone") && (
									<Input
										id={field.id}
										type={field.type}
										placeholder={field.placeholder}
										required={field.required}
									/>
								)}

								{field.type === "textarea" && (
									<Textarea
										id={field.id}
										placeholder={field.placeholder}
										required={field.required}
										rows={4}
									/>
								)}

								{field.type === "select" && (
									<Select required={field.required}>
										<SelectTrigger>
											<SelectValue placeholder={field.placeholder} />
										</SelectTrigger>
										<SelectContent>
											{field.options?.map((option, i) => (
												<SelectItem key={i} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}

								{field.type === "checkbox" && (
									<div className="flex items-center gap-2">
										<Checkbox id={field.id} required={field.required} />
										<Label htmlFor={field.id} className="font-normal">
											{field.placeholder}
										</Label>
									</div>
								)}

								{field.type === "radio" && (
									<RadioGroup required={field.required}>
										{field.radioOptions?.map((option, i) => (
											<div key={i} className="flex items-center gap-2">
												<RadioGroupItem
													value={option}
													id={`${field.id}-${i}`}
												/>
												<Label htmlFor={`${field.id}-${i}`}>{option}</Label>
											</div>
										))}
									</RadioGroup>
								)}

								{field.type === "file" && (
									<Input
										id={field.id}
										type="file"
										accept={field.accept}
										required={field.required}
									/>
								)}
							</div>
						))}

						<Button type="submit" className="w-full">
							{settings.submitButtonText}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Code View - Export form as code
 */
function CodeView({
	fields,
	settings,
}: {
	fields: ExtendedFormFieldConfig[];
	settings: FormSettings;
}) {
	const code = `// Form configuration
const formConfig = ${JSON.stringify({ fields, settings }, null, 2)};

// Use with DynamicForm component
<DynamicForm
  title="${settings.title || "Form"}"
  description="${settings.description || ""}"
  fields={formConfig.fields}
  submitLabel="${settings.submitButtonText}"
  onSubmit={async (data) => {
    console.log('Form submitted:', data);
    // Handle form submission
    ${settings.redirectUrl ? `window.location.href = '${settings.redirectUrl}';` : ""}
  }}
/>`;

	return (
		<div className="p-8">
			<Card>
				<CardHeader>
					<CardTitle>Generated Code</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
						<code>{code}</code>
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * AI Chat Interface - Conversational form creation
 */
function FormBuilderAIChat({
	onFieldsGenerated,
	onSettingsGenerated,
}: {
	onFieldsGenerated: (fields: ExtendedFormFieldConfig[]) => void;
	onSettingsGenerated: (settings: FormSettings) => void;
}) {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([
		{
			role: "assistant",
			content:
				"Hi! I can help you build a form. Just tell me what you need. For example:\n\n• Add a contact form with name, email, phone\n• Create a registration form\n• Add a feedback form with rating",
		},
	]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		// Add user message
		setMessages((prev) => [...prev, { role: "user", content: input }]);

		// Simple pattern matching for demo (replace with actual AI in production)
		const lowerInput = input.toLowerCase();

		let generatedFields: ExtendedFormFieldConfig[] = [];
		let response = "";

		// Contact form pattern
		if (
			lowerInput.includes("contact") ||
			(lowerInput.includes("name") &&
				lowerInput.includes("email") &&
				lowerInput.includes("phone"))
		) {
			generatedFields = [
				{
					id: "field_name",
					type: "text",
					label: "Name",
					placeholder: "Enter your name",
					required: true,
				},
				{
					id: "field_email",
					type: "email",
					label: "Email",
					placeholder: "your@email.com",
					required: true,
				},
				{
					id: "field_phone",
					type: "phone",
					label: "Phone",
					placeholder: "+1 (555) 000-0000",
					required: false,
				},
				{
					id: "field_message",
					type: "textarea",
					label: "Message",
					placeholder: "How can we help you?",
					required: true,
				},
			];
			response =
				"I've created a contact form with Name, Email, Phone, and Message fields. The form is ready to customize!";

			onSettingsGenerated({
				title: "Contact Us",
				description: "We'll get back to you within 24 hours.",
				submitButtonText: "Send Message",
				successMessage: "Thank you! We'll be in touch soon.",
			});
		}
		// Registration form pattern
		else if (lowerInput.includes("registration") || lowerInput.includes("signup")) {
			generatedFields = [
				{
					id: "field_fullname",
					type: "text",
					label: "Full Name",
					placeholder: "John Doe",
					required: true,
				},
				{
					id: "field_email",
					type: "email",
					label: "Email Address",
					placeholder: "john@example.com",
					required: true,
				},
				{
					id: "field_phone",
					type: "phone",
					label: "Phone Number",
					placeholder: "+1 (555) 000-0000",
					required: true,
				},
				{
					id: "field_company",
					type: "text",
					label: "Company",
					placeholder: "Acme Inc.",
					required: false,
				},
				{
					id: "field_terms",
					type: "checkbox",
					label: "Terms & Conditions",
					placeholder: "I agree to the terms and conditions",
					required: true,
				},
			];
			response =
				"I've created a registration form with Full Name, Email, Phone, Company, and Terms acceptance. Ready to use!";

			onSettingsGenerated({
				title: "Registration",
				description: "Join our platform today",
				submitButtonText: "Create Account",
				successMessage: "Welcome! Your account has been created.",
			});
		}
		// Feedback form pattern
		else if (lowerInput.includes("feedback") || lowerInput.includes("survey")) {
			generatedFields = [
				{
					id: "field_name",
					type: "text",
					label: "Name",
					placeholder: "Your name (optional)",
					required: false,
				},
				{
					id: "field_rating",
					type: "radio",
					label: "How would you rate your experience?",
					required: true,
					radioOptions: ["Excellent", "Good", "Fair", "Poor"],
				},
				{
					id: "field_comments",
					type: "textarea",
					label: "Comments",
					placeholder: "Tell us more about your experience...",
					required: true,
				},
			];
			response =
				"I've created a feedback form with Name, Rating (radio buttons), and Comments. Perfect for gathering customer feedback!";

			onSettingsGenerated({
				title: "Feedback Form",
				description: "We value your opinion",
				submitButtonText: "Submit Feedback",
				successMessage: "Thank you for your feedback!",
			});
		} else {
			response =
				"I can help you create various forms. Try saying:\n• 'Add a contact form'\n• 'Create a registration form'\n• 'Build a feedback form'\n\nOr describe the specific fields you need!";
		}

		// Add assistant response
		setMessages((prev) => [...prev, { role: "assistant", content: response }]);

		// Generate fields if pattern matched
		if (generatedFields.length > 0) {
			onFieldsGenerated(generatedFields);
		}

		setInput("");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b">
				<h3 className="font-semibold flex items-center gap-2">
					<Sparkles className="h-4 w-4 text-primary" />
					AI Form Assistant
				</h3>
			</div>

			<div className="flex-1 overflow-auto p-4 space-y-4">
				{messages.map((message, i) => (
					<div
						key={i}
						className={cn(
							"p-3 rounded-lg",
							message.role === "user"
								? "bg-primary text-primary-foreground ml-4"
								: "bg-muted mr-4"
						)}
					>
						<p className="text-sm whitespace-pre-line">{message.content}</p>
					</div>
				))}
			</div>

			<div className="p-4 border-t">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Describe your form..."
						className="flex-1"
					/>
					<Button type="submit" size="sm">
						Send
					</Button>
				</form>
			</div>
		</div>
	);
}
