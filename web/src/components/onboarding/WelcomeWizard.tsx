/**
 * Welcome Wizard Component
 *
 * 5-step onboarding wizard that guides new users through initial setup:
 * 1. Account setup
 * 2. Create first funnel
 * 3. Customize design
 * 4. Publish funnel
 * 5. Integration setup
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const INITIAL_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Account Setup",
    description: "Tell us about yourself and your business",
    completed: false,
  },
  {
    id: 2,
    title: "Create First Funnel",
    description: "Choose a template to get started",
    completed: false,
  },
  {
    id: 3,
    title: "Customize Design",
    description: "Make it yours with colors and branding",
    completed: false,
  },
  {
    id: 4,
    title: "Publish Funnel",
    description: "Set up your domain and go live",
    completed: false,
  },
  {
    id: 5,
    title: "Integration Setup",
    description: "Connect payment and email services",
    completed: false,
  },
];

export function WelcomeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    funnelTemplate: "",
    primaryColor: "#000000",
    domain: "",
    paymentProvider: "",
  });

  const progress = ((currentStep - 1) / steps.length) * 100;

  const handleNext = () => {
    // Mark current step as completed
    setSteps((prev) =>
      prev.map((step) =>
        step.id === currentStep ? { ...step, completed: true } : step
      )
    );

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark final step as completed
    setSteps((prev) =>
      prev.map((step) =>
        step.id === currentStep ? { ...step, completed: true } : step
      )
    );

    // Redirect to dashboard or show completion message
    window.location.href = "/dashboard";
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Welcome to ONE Funnels</h1>
        <p className="mt-2 text-muted-foreground">
          Let's get you set up in just 5 easy steps
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              {step.completed ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : step.id === currentStep ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {step.id}
                </div>
              ) : (
                <Circle className="h-8 w-8 text-muted-foreground" />
              )}
              <span
                className={`text-xs ${
                  step.id === currentStep
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <Separator className="flex-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Account Setup */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Acme Corporation"
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateFormData("industry", value)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Create First Funnel */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a template that matches your goal:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { id: "product-launch", name: "Product Launch", description: "Sell a product or service" },
                  { id: "lead-magnet", name: "Lead Magnet", description: "Collect email addresses" },
                  { id: "webinar", name: "Webinar Funnel", description: "Promote and run webinars" },
                  { id: "sales-page", name: "Sales Page", description: "Long-form sales letter" },
                ].map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer border-2 transition-colors hover:border-primary ${
                      formData.funnelTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => updateFormData("funnelTemplate", template.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customize Design */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => updateFormData("primaryColor", e.target.value)}
                    className="h-12 w-24"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => updateFormData("primaryColor", e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <Badge>Pro Tip</Badge> You can customize fonts, layouts, and more
                  in the funnel builder after completing setup.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Publish Funnel */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  placeholder="yourdomain.com"
                  value={formData.domain}
                  onChange={(e) => updateFormData("domain", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use our default domain: {formData.businessName.toLowerCase().replace(/\s+/g, "-")}.onefunnels.io
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Integration Setup */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentProvider">Payment Provider</Label>
                <Select
                  value={formData.paymentProvider}
                  onValueChange={(value) => updateFormData("paymentProvider", value)}
                >
                  <SelectTrigger id="paymentProvider">
                    <SelectValue placeholder="Select payment provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="later">Set up later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Don't worry! You can configure payment providers and email
                  integrations in the Settings page anytime.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Complete Setup
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Skip Option */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/dashboard"}>
          Skip setup for now
        </Button>
      </div>
    </div>
  );
}
