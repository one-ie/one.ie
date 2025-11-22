/**
 * Template Card Component
 *
 * Displays a single funnel template with preview, stats, and action button.
 * Used in the template marketplace to showcase available funnel templates.
 */

import type { FunnelTemplate } from '@/lib/funnel-templates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TemplateCardProps {
  template: FunnelTemplate;
  onUseTemplate: (templateId: string) => void;
  onPreview: (template: FunnelTemplate) => void;
  usageCount?: number;
}

const categoryIcons: Record<string, string> = {
  'lead-gen': '📧',
  'product-launch': '🚀',
  'webinar': '🎥',
  'ecommerce': '🛍️',
  'membership': '🔑',
  'summit': '🎤',
};

const categoryColors: Record<string, string> = {
  'lead-gen': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'product-launch': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'webinar': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'ecommerce': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'membership': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'summit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const complexityColors: Record<string, string> = {
  'simple': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TemplateCard({ template, onUseTemplate, onPreview, usageCount = 0 }: TemplateCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[template.category]}</span>
            <Badge className={categoryColors[template.category]} variant="secondary">
              {template.category}
            </Badge>
          </div>
          <Badge className={complexityColors[template.complexity]} variant="outline">
            {template.complexity}
          </Badge>
        </div>
        <CardTitle className="text-xl">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Preview placeholder - would show actual preview image in production */}
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center border">
          <div className="text-center p-4">
            <div className="text-4xl mb-2">{categoryIcons[template.category]}</div>
            <p className="text-sm text-muted-foreground">{template.steps.length} Steps</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{template.conversionRate}%</div>
            <div className="text-xs text-muted-foreground">Conversion</div>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{usageCount}</div>
            <div className="text-xs text-muted-foreground">Uses</div>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{template.steps.length}</div>
            <div className="text-xs text-muted-foreground">Steps</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Setup Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Setup: {template.estimatedSetupTime}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onPreview(template)}
        >
          Preview
        </Button>
        <Button
          className="flex-1"
          onClick={() => onUseTemplate(template.id)}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
