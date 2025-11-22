/**
 * SaveAsTemplateModal - Dialog for saving funnels as reusable templates
 *
 * Features:
 * - Multi-step form (template info → category → tags → review)
 * - Captures complete funnel structure
 * - Sets conversion benchmarks
 * - Visibility control (private/public)
 * - Creates funnel_template thing
 *
 * @see /backend/convex/mutations/funnels.ts - saveAsTemplate mutation
 * @see /web/src/lib/funnel-templates/templates.ts - FunnelTemplate interface
 */

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";

interface SaveAsTemplateModalProps {
  funnelId: Id<"things">;
  funnelName: string;
  funnelDescription?: string;
  stepCount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (templateId: Id<"things">) => void;
}

type Step = "info" | "category" | "tags" | "review";

interface FormData {
  templateName: string;
  description: string;
  category: string;
  tags: string[];
  visibility: "private" | "public";
  conversionRate?: number;
}

const CATEGORY_OPTIONS = [
  { value: "lead-gen", label: "Lead Generation" },
  { value: "product-launch", label: "Product Launch" },
  { value: "webinar", label: "Webinar" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "membership", label: "Membership" },
  { value: "summit", label: "Summit/Event" },
  { value: "other", label: "Other" },
];

const SUGGESTED_TAGS = [
  "beginner-friendly",
  "high-converting",
  "quick-setup",
  "advanced",
  "automated",
  "interactive",
  "email-list",
  "sales",
  "upsell",
  "subscription",
];

export function SaveAsTemplateModal({
  funnelId,
  funnelName,
  funnelDescription,
  stepCount,
  isOpen,
  onClose,
  onSuccess,
}: SaveAsTemplateModalProps) {
  const { toast } = useToast();
  const saveAsTemplate = useMutation(api.mutations.funnels.saveAsTemplate);

  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    templateName: `${funnelName} Template`,
    description: funnelDescription || "",
    category: "",
    tags: [],
    visibility: "private",
    conversionRate: undefined,
  });
  const [tagInput, setTagInput] = useState("");

  const steps: Step[] = ["info", "category", "tags", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const canProceed = () => {
    switch (currentStep) {
      case "info":
        return formData.templateName.trim().length > 0;
      case "category":
        return formData.category.length > 0;
      case "tags":
        return true; // Tags are optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isLastStep && canProceed()) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSave = async () => {
    if (!canProceed()) return;

    setIsSaving(true);

    try {
      const templateId = await saveAsTemplate({
        funnelId,
        templateName: formData.templateName,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        visibility: formData.visibility,
        conversionRate: formData.conversionRate,
      });

      toast({
        title: "Template saved!",
        description: `"${formData.templateName}" is now available as a template.`,
      });

      onSuccess?.(templateId);
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast({
        title: "Failed to save template",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      // Reset form after close animation
      setTimeout(() => {
        setCurrentStep("info");
        setFormData({
          templateName: `${funnelName} Template`,
          description: funnelDescription || "",
          category: "",
          tags: [],
          visibility: "private",
          conversionRate: undefined,
        });
        setTagInput("");
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Save as Template</span>
            <div className="flex gap-1">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded ${
                    index <= currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[400px] py-4">
          {/* Step 1: Template Info */}
          {currentStep === "info" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Template Information</h3>
                <p className="text-sm text-muted-foreground">
                  Give your template a name and description to help others understand what it does.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name *</Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., High-Converting Webinar Funnel"
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, templateName: e.target.value }))
                    }
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this template does and when to use it..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conversionRate">
                    Conversion Rate (optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="conversionRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g., 35"
                      value={formData.conversionRate ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          conversionRate: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        }))
                      }
                      className="max-w-32"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If you have conversion data for this funnel, enter the average conversion rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {currentStep === "category" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose a Category</h3>
                <p className="text-sm text-muted-foreground">
                  Select the category that best describes this funnel template.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={(value: "private" | "public") =>
                    setFormData((prev) => ({ ...prev, visibility: value }))
                  }
                >
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="private" id="private" />
                    <div className="flex-1">
                      <Label htmlFor="private" className="font-medium cursor-pointer">
                        Private
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Only you can use this template
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="public" id="public" />
                    <div className="flex-1">
                      <Label htmlFor="public" className="font-medium cursor-pointer">
                        Public
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Share with your team and organization
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Tags */}
          {currentStep === "tags" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Add Tags (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Tags help you and others find this template more easily.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={formData.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (formData.tags.includes(tag)) {
                            removeTag(tag);
                          } else {
                            addTag(tag);
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagInput">Custom Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tagInput"
                      placeholder="Enter custom tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Tags ({formData.tags.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review and Save</h3>
                <p className="text-sm text-muted-foreground">
                  Review your template before saving it.
                </p>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold flex items-center gap-2">
                      {formData.templateName}
                      <Badge variant="outline" className="capitalize">
                        {formData.category}
                      </Badge>
                      <Badge variant={formData.visibility === "public" ? "default" : "secondary"}>
                        {formData.visibility}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">{formData.description}</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Based on:</span>
                      <span className="font-medium">{funnelName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Steps included:</span>
                      <span className="font-medium">{stepCount} steps</span>
                    </div>
                    {formData.conversionRate !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conversion rate:</span>
                        <span className="font-medium">{formData.conversionRate}%</span>
                      </div>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="pt-4 border-t">
                      <span className="text-sm font-medium mb-2 block">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 text-green-500" />
                      <span>
                        This template will capture all {stepCount} steps and their elements, settings, and styling.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {!isFirstStep && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSaving}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSave}
                disabled={!canProceed() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
