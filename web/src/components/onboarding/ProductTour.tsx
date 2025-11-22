/**
 * Product Tour Component
 *
 * Interactive tooltips that highlight key features and guide users
 * through the platform interface.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TourStep {
  id: number;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Welcome to Your Dashboard",
    description: "This is your central hub where you can view all your funnels, analytics, and quick actions.",
    target: "main",
    position: "bottom",
  },
  {
    id: 2,
    title: "Create Your First Funnel",
    description: "Click here to build a new funnel using our drag-and-drop builder or choose from pre-made templates.",
    target: "[data-tour='create-funnel']",
    position: "bottom",
  },
  {
    id: 3,
    title: "Funnel Builder",
    description: "Design your pages visually with our intuitive builder. Add elements, customize styles, and preview in real-time.",
    target: "[data-tour='funnel-builder']",
    position: "right",
  },
  {
    id: 4,
    title: "Analytics Dashboard",
    description: "Track conversions, visitors, and revenue. See what's working and optimize your funnels for better results.",
    target: "[data-tour='analytics']",
    position: "left",
  },
  {
    id: 5,
    title: "Settings & Integrations",
    description: "Configure payment providers, email services, and custom domains to power your funnels.",
    target: "[data-tour='settings']",
    position: "bottom",
  },
];

interface ProductTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function ProductTour({ onComplete, autoStart = false }: ProductTourProps) {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentTourStep = TOUR_STEPS[currentStep];

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!isActive || !currentTourStep) return;

    const element = document.querySelector(currentTourStep.target) as HTMLElement;
    if (!element) {
      console.warn(`Tour target not found: ${currentTourStep.target}`);
      return;
    }

    setTargetElement(element);

    const rect = element.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (currentTourStep.position) {
      case "top":
        top = rect.top - 200;
        left = rect.left + rect.width / 2 - 200;
        break;
      case "bottom":
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2 - 200;
        break;
      case "left":
        top = rect.top + rect.height / 2 - 100;
        left = rect.left - 420;
        break;
      case "right":
        top = rect.top + rect.height / 2 - 100;
        left = rect.right + 20;
        break;
    }

    setTooltipPosition({ top, left });

    // Highlight target element
    element.classList.add("tour-highlight");
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      element.classList.remove("tour-highlight");
    };
  }, [isActive, currentStep, currentTourStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);

    // Save tour completion to localStorage
    localStorage.setItem("productTourCompleted", "true");

    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("productTourSkipped", "true");
  };

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Start Product Tour
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50" />

      {/* Tour Tooltip */}
      <Card
        className="fixed z-50 w-96 shadow-2xl"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">
                  {currentStep + 1} of {TOUR_STEPS.length}
                </Badge>
              </div>
              <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="mt-2">
            {currentTourStep.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-1">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {currentStep < TOUR_STEPS.length - 1 ? (
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleComplete}>
                Finish Tour
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CSS for highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 41 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}
