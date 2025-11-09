import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Code } from "lucide-react";

interface FeatureDemoProps {
  title: string;
  description?: string;
  demoUrl?: string;
  codeUrl?: string;
  children?: React.ReactNode;
}

/**
 * Interactive Feature Demo Component
 *
 * Embeds interactive demos directly in feature pages.
 * Shows live preview with optional code view.
 *
 * Usage in MDX:
 * <FeatureDemo
 *   title="Try Authentication"
 *   description="See magic link login in action"
 *   demoUrl="/demo/auth/magic-link"
 * >
 *   Custom demo content here
 * </FeatureDemo>
 */
export function FeatureDemo({
  title,
  description,
  demoUrl,
  codeUrl,
  children
}: FeatureDemoProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 my-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {demoUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Live Demo
                </a>
              </Button>
            )}
            {codeUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={codeUrl} target="_blank" rel="noopener noreferrer">
                  <Code className="h-4 w-4 mr-2" />
                  View Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-background p-6 border">
          {children || (
            <div className="text-center py-12 text-muted-foreground">
              Interactive demo placeholder
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
