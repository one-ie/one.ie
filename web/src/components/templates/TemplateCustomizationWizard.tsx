/**
 * Template Customization Wizard
 *
 * Multi-step wizard for customizing funnel templates
 *
 * Features:
 * - 5-step customization process
 * - Real-time preview
 * - Brand colors, copy, images
 * - Integration with DynamicForm
 * - Template selection
 *
 * Cycle 56: Template customization wizard for funnel builder
 */

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Wand2,
  ChevronLeft,
  ChevronRight,
  Check,
  Palette,
  Type,
  Image as ImageIcon,
  Eye,
  Sparkles,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface TemplateCustomization {
  // Step 1: Name
  name: string;
  description?: string;

  // Step 2: Brand Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Step 3: Copy
  headline: string;
  subheadline?: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  benefitsList: string[];

  // Step 4: Images
  heroImage?: string;
  logoImage?: string;
  productImages: string[];

  // Template selection
  templateId?: string;
  templateType?: "product" | "course" | "service" | "event";
}

interface TemplateCustomizationWizardProps {
  templateId?: string;
  initialData?: Partial<TemplateCustomization>;
  onComplete: (data: TemplateCustomization) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// Step Definitions
// ============================================================================

const WIZARD_STEPS = [
  {
    id: "name",
    title: "Name Your Funnel",
    description: "Give your funnel a memorable name",
    icon: Type,
  },
  {
    id: "colors",
    title: "Choose Brand Colors",
    description: "Select colors that match your brand",
    icon: Palette,
  },
  {
    id: "copy",
    title: "Customize Copy",
    description: "Write compelling headlines and CTAs",
    icon: Sparkles,
  },
  {
    id: "images",
    title: "Select Images",
    description: "Add visuals to your funnel",
    icon: ImageIcon,
  },
  {
    id: "review",
    title: "Review & Create",
    description: "Preview your customized funnel",
    icon: Eye,
  },
];

// Default color presets
const COLOR_PRESETS = [
  {
    name: "Ocean Blue",
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#06b6d4",
    background: "#f0f9ff",
    text: "#0c4a6e",
  },
  {
    name: "Forest Green",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#f0fdf4",
    text: "#064e3b",
  },
  {
    name: "Sunset Orange",
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fb923c",
    background: "#fff7ed",
    text: "#7c2d12",
  },
  {
    name: "Royal Purple",
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    background: "#faf5ff",
    text: "#581c87",
  },
  {
    name: "Modern Gray",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#94a3b8",
    background: "#f8fafc",
    text: "#1e293b",
  },
];

// ============================================================================
// Component
// ============================================================================

export function TemplateCustomizationWizard({
  templateId,
  initialData,
  onComplete,
  onCancel,
  className,
}: TemplateCustomizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<TemplateCustomization>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    primaryColor: initialData?.primaryColor || "#0ea5e9",
    secondaryColor: initialData?.secondaryColor || "#0284c7",
    accentColor: initialData?.accentColor || "#06b6d4",
    backgroundColor: initialData?.backgroundColor || "#f0f9ff",
    textColor: initialData?.textColor || "#0c4a6e",
    headline: initialData?.headline || "Transform Your Business Today",
    subheadline: initialData?.subheadline || "Join thousands of successful customers",
    ctaPrimary: initialData?.ctaPrimary || "Get Started Now",
    ctaSecondary: initialData?.ctaSecondary || "Learn More",
    benefitsList: initialData?.benefitsList || [
      "Benefit 1: Save time and money",
      "Benefit 2: Get results fast",
      "Benefit 3: Easy to use",
    ],
    heroImage: initialData?.heroImage || "",
    logoImage: initialData?.logoImage || "",
    productImages: initialData?.productImages || [],
    templateId: templateId || initialData?.templateId,
    templateType: initialData?.templateType || "product",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form field
  const updateField = <K extends keyof TemplateCustomization>(
    field: K,
    value: TemplateCustomization[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Apply color preset
  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      textColor: preset.text,
    }));
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Name
        if (!formData.name.trim()) {
          newErrors.name = "Funnel name is required";
        }
        break;
      case 1: // Colors
        // Colors have defaults, always valid
        break;
      case 2: // Copy
        if (!formData.headline.trim()) {
          newErrors.headline = "Headline is required";
        }
        if (!formData.ctaPrimary.trim()) {
          newErrors.ctaPrimary = "Primary CTA is required";
        }
        break;
      case 3: // Images
        // Images are optional
        break;
      case 4: // Review
        // Final validation happens on submit
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Failed to create funnel:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute progress percentage
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // ============================================================================
  // Render Steps
  // ============================================================================

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderNameStep();
      case 1:
        return renderColorsStep();
      case 2:
        return renderCopyStep();
      case 3:
        return renderImagesStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Step 1: Name
  const renderNameStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Funnel Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g., Holiday Sale 2024"
          className={cn(errors.name && "border-destructive")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe what this funnel is for..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="templateType">Template Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["product", "course", "service", "event"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateField("templateType", type)}
              className={cn(
                "p-4 border rounded-lg text-left transition-all",
                formData.templateType === type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="font-medium capitalize">{type}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {type === "product" && "Sell physical or digital products"}
                {type === "course" && "Online courses and lessons"}
                {type === "service" && "Services and consultations"}
                {type === "event" && "Events and webinars"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Colors
  const renderColorsStep = () => (
    <div className="space-y-6">
      {/* Color Presets */}
      <div className="space-y-2">
        <Label>Quick Color Presets</Label>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyColorPreset(preset)}
              className="p-3 border rounded-lg hover:border-primary transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-sm font-medium">{preset.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Colors */}
      <div className="space-y-4">
        <Label>Custom Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-xs">
              Primary Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor" className="text-xs">
              Secondary Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateField("secondaryColor", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => updateField("secondaryColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor" className="text-xs">
              Accent Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={formData.accentColor}
                onChange={(e) => updateField("accentColor", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.accentColor}
                onChange={(e) => updateField("accentColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor" className="text-xs">
              Background Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => updateField("backgroundColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor" className="text-xs">
              Text Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={formData.textColor}
                onChange={(e) => updateField("textColor", e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.textColor}
                onChange={(e) => updateField("textColor", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Copy
  const renderCopyStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="headline">
          Main Headline <span className="text-destructive">*</span>
        </Label>
        <Input
          id="headline"
          value={formData.headline}
          onChange={(e) => updateField("headline", e.target.value)}
          placeholder="e.g., Transform Your Business Today"
          className={cn(errors.headline && "border-destructive")}
        />
        {errors.headline && (
          <p className="text-sm text-destructive">{errors.headline}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subheadline">Subheadline (Optional)</Label>
        <Input
          id="subheadline"
          value={formData.subheadline}
          onChange={(e) => updateField("subheadline", e.target.value)}
          placeholder="e.g., Join thousands of successful customers"
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="ctaPrimary">
          Primary Call-to-Action <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ctaPrimary"
          value={formData.ctaPrimary}
          onChange={(e) => updateField("ctaPrimary", e.target.value)}
          placeholder="e.g., Get Started Now"
          className={cn(errors.ctaPrimary && "border-destructive")}
        />
        {errors.ctaPrimary && (
          <p className="text-sm text-destructive">{errors.ctaPrimary}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctaSecondary">Secondary Call-to-Action (Optional)</Label>
        <Input
          id="ctaSecondary"
          value={formData.ctaSecondary}
          onChange={(e) => updateField("ctaSecondary", e.target.value)}
          placeholder="e.g., Learn More"
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Benefits List</Label>
        <p className="text-xs text-muted-foreground">
          Add 3-5 key benefits (one per line)
        </p>
        <Textarea
          value={formData.benefitsList.join("\n")}
          onChange={(e) =>
            updateField(
              "benefitsList",
              e.target.value.split("\n").filter((line) => line.trim())
            )
          }
          placeholder="Benefit 1: Save time and money&#10;Benefit 2: Get results fast&#10;Benefit 3: Easy to use"
          rows={6}
        />
      </div>
    </div>
  );

  // Step 4: Images
  const renderImagesStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="heroImage">Hero Image URL</Label>
        <Input
          id="heroImage"
          value={formData.heroImage}
          onChange={(e) => updateField("heroImage", e.target.value)}
          placeholder="https://example.com/hero.jpg"
        />
        {formData.heroImage && (
          <div className="mt-2 border rounded-lg overflow-hidden">
            <img
              src={formData.heroImage}
              alt="Hero preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Image";
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoImage">Logo Image URL</Label>
        <Input
          id="logoImage"
          value={formData.logoImage}
          onChange={(e) => updateField("logoImage", e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        {formData.logoImage && (
          <div className="mt-2 border rounded-lg overflow-hidden bg-muted p-4">
            <img
              src={formData.logoImage}
              alt="Logo preview"
              className="h-16 object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/200x100?text=Invalid+Image";
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Product Images (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Add product image URLs (one per line)
        </p>
        <Textarea
          value={formData.productImages.join("\n")}
          onChange={(e) =>
            updateField(
              "productImages",
              e.target.value.split("\n").filter((line) => line.trim())
            )
          }
          placeholder="https://example.com/product1.jpg&#10;https://example.com/product2.jpg"
          rows={4}
        />
        {formData.productImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {formData.productImages.map((url, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300x200?text=Invalid";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Step 5: Review
  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Live Preview */}
      <div
        className="border rounded-lg overflow-hidden"
        style={{ backgroundColor: formData.backgroundColor }}
      >
        <div className="p-8 text-center space-y-6">
          {/* Logo */}
          {formData.logoImage && (
            <div className="flex justify-center">
              <img
                src={formData.logoImage}
                alt="Logo"
                className="h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/200x100?text=Logo";
                }}
              />
            </div>
          )}

          {/* Hero Image */}
          {formData.heroImage && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={formData.heroImage}
                alt="Hero"
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/800x400?text=Hero+Image";
                }}
              />
            </div>
          )}

          {/* Headline */}
          <div className="space-y-2">
            <h1
              className="text-4xl font-bold"
              style={{ color: formData.textColor }}
            >
              {formData.headline}
            </h1>
            {formData.subheadline && (
              <p className="text-xl opacity-80" style={{ color: formData.textColor }}>
                {formData.subheadline}
              </p>
            )}
          </div>

          {/* Benefits */}
          {formData.benefitsList.length > 0 && (
            <div className="space-y-2 text-left max-w-md mx-auto">
              {formData.benefitsList.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: formData.accentColor }}
                  />
                  <span style={{ color: formData.textColor }}>{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: formData.primaryColor,
                color: "#ffffff",
              }}
            >
              {formData.ctaPrimary}
            </button>
            {formData.ctaSecondary && (
              <button
                type="button"
                className="px-6 py-3 rounded-lg font-medium border-2 transition-opacity hover:opacity-90"
                style={{
                  borderColor: formData.secondaryColor,
                  color: formData.secondaryColor,
                }}
              >
                {formData.ctaSecondary}
              </button>
            )}
          </div>

          {/* Product Images */}
          {formData.productImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {formData.productImages.slice(0, 3).map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/300x200?text=Product";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <h3 className="font-medium">Customization Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium capitalize">{formData.templateType}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Primary Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.primaryColor }}
              />
              <span className="font-mono text-xs">{formData.primaryColor}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Benefits:</span>
            <p className="font-medium">{formData.benefitsList.length} listed</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>Customize Your Funnel</CardTitle>
            <CardDescription>
              Follow the steps to create your perfect sales funnel
            </CardDescription>
          </div>
          <Badge variant="secondary">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStep}
                  className={cn(
                    "flex flex-col items-center gap-2 flex-1 transition-all",
                    index <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      !isCompleted && !isCurrent && "border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-xs text-center">
                    <div className={cn("font-medium", isCurrent && "text-primary")}>
                      {step.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress Line */}
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-[400px]">{renderStep()}</CardContent>

      <CardFooter className="flex justify-between border-t">
        <div>
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Funnel
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
