/**
 * ConditionalForm - Form with advanced conditional logic
 *
 * Extends DynamicForm with:
 * - Full conditional logic evaluation
 * - Real-time field visibility changes
 * - Dynamic required field updates
 * - Auto-fill based on conditions
 * - Step skipping
 */

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormInput, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { ConditionalRule } from "@/lib/forms/conditional-logic";
import { evaluateRules } from "@/lib/forms/conditional-logic";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
}

interface ConditionalFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  steps?: { title: string; fields: string[] }[];
  conditionalRules?: ConditionalRule[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onChange?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

export function ConditionalForm({
  title,
  description,
  fields,
  steps,
  conditionalRules = [],
  onSubmit,
  onChange,
  onCancel,
  submitLabel = "Submit",
  className,
}: ConditionalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() =>
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMultiStep = steps && steps.length > 0;
  const totalSteps = isMultiStep ? steps.length : 1;

  // Evaluate conditional rules
  const evaluationResult = useMemo(() => {
    return evaluateRules(
      conditionalRules,
      { formData, currentStep },
      fields.map((f) => f.name)
    );
  }, [formData, currentStep, conditionalRules, fields]);

  // Apply auto-fill values from conditional rules
  useEffect(() => {
    if (Object.keys(evaluationResult.fieldValues).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...evaluationResult.fieldValues,
      }));
    }
  }, [evaluationResult.fieldValues]);

  // Handle step skipping
  useEffect(() => {
    if (evaluationResult.targetStep !== undefined && isMultiStep) {
      setCurrentStep(evaluationResult.targetStep);
    }
  }, [evaluationResult.targetStep, isMultiStep]);

  // Notify parent of data changes
  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  // Get visible fields based on conditional rules
  const visibleFields = useMemo(() => {
    return fields.filter((f) => evaluationResult.visibleFields.has(f.name));
  }, [fields, evaluationResult.visibleFields]);

  // Enhance fields with conditional requirements
  const enhancedFields = useMemo(() => {
    return visibleFields.map((field) => ({
      ...field,
      required: field.required || evaluationResult.requiredFields.has(field.name),
    }));
  }, [visibleFields, evaluationResult.requiredFields]);

  // Get fields for current step
  const currentStepFields = useMemo(() => {
    if (!isMultiStep) {
      return enhancedFields;
    }

    const stepFieldNames = steps[currentStep].fields;
    return enhancedFields.filter((f) => stepFieldNames.includes(f.name));
  }, [currentStep, enhancedFields, steps, isMultiStep]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === "")) {
      return `${field.label} is required`;
    }

    if (field.type === "number" && value && isNaN(Number(value))) {
      return `${field.label} must be a number`;
    }

    return null;
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    currentStepFields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {field.type === "text" && (
          <Input
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && "border-destructive")}
          />
        )}

        {field.type === "textarea" && (
          <Textarea
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && "border-destructive")}
            rows={4}
          />
        )}

        {field.type === "number" && (
          <Input
            id={field.name}
            type="number"
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && "border-destructive")}
          />
        )}

        {field.type === "select" && field.options && (
          <Select
            value={formData[field.name] || ""}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger className={cn(hasError && "border-destructive")}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === "checkbox" && (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.name}
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <label htmlFor={field.name} className="text-sm cursor-pointer">
              {field.placeholder}
            </label>
          </div>
        )}

        {field.type === "date" && (
          <Input
            id={field.name}
            type="date"
            value={formData[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={cn(hasError && "border-destructive")}
          />
        )}

        {hasError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{errors[field.name]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FormInput className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {isMultiStep && (
            <Badge variant="secondary">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          )}
        </div>

        {/* Step progress */}
        {isMultiStep && (
          <div className="flex gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      index <= currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                  {index < currentStep && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-1",
                    index === currentStep ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {currentStepFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No fields visible for this step.</p>
              <p className="text-sm mt-2">This may be due to conditional logic rules.</p>
            </div>
          ) : (
            currentStepFields.map(renderField)
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t">
          <div>
            {isMultiStep && currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {isMultiStep && currentStep < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : submitLabel}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
