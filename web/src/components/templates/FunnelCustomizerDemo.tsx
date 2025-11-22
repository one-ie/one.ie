/**
 * Funnel Customizer Demo
 *
 * Example implementation of the TemplateCustomizationWizard
 * Shows how to integrate with backend/state management
 */

import { useState } from "react";
import { TemplateCustomizationWizard } from "./TemplateCustomizationWizard";
import type { TemplateCustomization } from "./TemplateCustomizationWizard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Eye } from "lucide-react";

export function FunnelCustomizerDemo() {
  const [completedFunnel, setCompletedFunnel] = useState<TemplateCustomization | null>(null);
  const [showWizard, setShowWizard] = useState(true);

  const handleComplete = async (data: TemplateCustomization) => {
    console.log("Funnel customization complete:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save the data
    setCompletedFunnel(data);
    setShowWizard(false);

    // In a real app, you would:
    // 1. Save to Convex/backend
    // 2. Generate the funnel pages
    // 3. Redirect to the created funnel
  };

  const handleCancel = () => {
    console.log("Wizard cancelled");
    setShowWizard(false);
  };

  const handleStartOver = () => {
    setCompletedFunnel(null);
    setShowWizard(true);
  };

  if (!showWizard && completedFunnel) {
    return (
      <div className="space-y-6">
        {/* Success Message */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Funnel Created Successfully!</CardTitle>
                <CardDescription>Your funnel is ready to use</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{completedFunnel.name}</span>
                <Badge>{completedFunnel.templateType}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedFunnel.description || "No description provided"}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleStartOver} variant="outline">
                Create Another
              </Button>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View Funnel
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customization Details */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Details</CardTitle>
            <CardDescription>Review your funnel configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Colors */}
              <div>
                <h3 className="font-medium mb-3">Brand Colors</h3>
                <div className="grid grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <div
                      className="h-16 rounded-lg border"
                      style={{ backgroundColor: completedFunnel.primaryColor }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Primary</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="h-16 rounded-lg border"
                      style={{ backgroundColor: completedFunnel.secondaryColor }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Secondary</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="h-16 rounded-lg border"
                      style={{ backgroundColor: completedFunnel.accentColor }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Accent</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="h-16 rounded-lg border"
                      style={{ backgroundColor: completedFunnel.backgroundColor }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Background</p>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="h-16 rounded-lg border"
                      style={{ backgroundColor: completedFunnel.textColor }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Text</p>
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div>
                <h3 className="font-medium mb-3">Copy & Messaging</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Headline:</span>
                    <p className="font-medium">{completedFunnel.headline}</p>
                  </div>
                  {completedFunnel.subheadline && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Subheadline:</span>
                      <p className="font-medium">{completedFunnel.subheadline}</p>
                    </div>
                  )}
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Primary CTA:</span>
                    <p className="font-medium">{completedFunnel.ctaPrimary}</p>
                  </div>
                  {completedFunnel.ctaSecondary && (
                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Secondary CTA:</span>
                      <p className="font-medium">{completedFunnel.ctaSecondary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              {completedFunnel.benefitsList.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {completedFunnel.benefitsList.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Images */}
              <div>
                <h3 className="font-medium mb-3">Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {completedFunnel.heroImage && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Hero Image</p>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={completedFunnel.heroImage}
                          alt="Hero"
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400x200?text=Hero";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {completedFunnel.logoImage && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Logo</p>
                      <div className="border rounded-lg overflow-hidden bg-muted p-4">
                        <img
                          src={completedFunnel.logoImage}
                          alt="Logo"
                          className="h-16 object-contain mx-auto"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/200x100?text=Logo";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* JSON Export */}
              <div>
                <h3 className="font-medium mb-3">Configuration JSON</h3>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(completedFunnel, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TemplateCustomizationWizard
      templateId="product-landing"
      initialData={{
        name: "",
        templateType: "product",
      }}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
