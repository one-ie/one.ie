import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap } from "lucide-react";

interface FeatureCTAProps {
  title: string;
  description?: string;
  primaryText?: string;
  primaryUrl?: string;
  secondaryText?: string;
  secondaryUrl?: string;
  variant?: "default" | "gradient" | "minimal";
}

/**
 * Feature Call-to-Action Component
 *
 * Sticky or inline CTA to drive conversions.
 * Appears between content sections to encourage action.
 *
 * Usage in MDX:
 * <FeatureCTA
 *   title="Ready to add authentication?"
 *   description="Get started in under 5 minutes"
 *   primaryText="Start Free Trial"
 *   primaryUrl="/signup"
 *   secondaryText="View Pricing"
 *   secondaryUrl="/pricing"
 *   variant="gradient"
 * />
 */
export function FeatureCTA({
  title,
  description,
  primaryText = "Get Started",
  primaryUrl = "/signup",
  secondaryText,
  secondaryUrl,
  variant = "default"
}: FeatureCTAProps) {
  const gradientClass = variant === "gradient"
    ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground"
    : variant === "minimal"
    ? "border-2 border-primary/20 bg-background"
    : "bg-primary/5 border border-primary/20";

  return (
    <Card className={`my-12 ${gradientClass}`}>
      <CardContent className="py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Zap className="h-5 w-5" />
              <h3 className="text-2xl font-bold">{title}</h3>
            </div>
            {description && (
              <p className={variant === "gradient" ? "text-primary-foreground/90" : "text-muted-foreground"}>
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              variant={variant === "gradient" ? "secondary" : "default"}
              asChild
            >
              <a href={primaryUrl}>
                {primaryText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            {secondaryText && secondaryUrl && (
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <a href={secondaryUrl}>{secondaryText}</a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
