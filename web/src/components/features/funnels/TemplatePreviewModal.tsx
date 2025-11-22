/**
 * Template Preview Modal
 *
 * Shows detailed view of a funnel template including all steps,
 * elements, best practices, and template metadata.
 */

import type { FunnelTemplate } from '@/lib/funnel-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TemplatePreviewModalProps {
  template: FunnelTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (templateId: string) => void;
}

const stepTypeIcons: Record<string, string> = {
  'landing': '🎯',
  'opt-in': '📝',
  'thank-you': '🎉',
  'sales': '💰',
  'upsell': '⬆️',
  'checkout': '💳',
  'confirmation': '✅',
  'webinar': '🎥',
  'replay': '🔄',
  'onboarding': '👋',
};

export function TemplatePreviewModal({ template, isOpen, onClose, onUseTemplate }: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {template.name}
            <Badge variant="outline">{template.category}</Badge>
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Template Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{template.conversionRate}%</div>
                <div className="text-xs text-muted-foreground">Avg. Conversion</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{template.steps.length}</div>
                <div className="text-xs text-muted-foreground">Steps</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{template.complexity}</div>
                <div className="text-xs text-muted-foreground">Complexity</div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{template.estimatedSetupTime}</div>
                <div className="text-xs text-muted-foreground">Setup Time</div>
              </div>
            </div>

            {/* Suggested Use Cases */}
            <div>
              <h3 className="font-semibold mb-2">Best For:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {template.suggestedFor.map((useCase, idx) => (
                  <li key={idx}>{useCase}</li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Steps */}
            <div>
              <h3 className="font-semibold mb-4">Funnel Steps ({template.steps.length})</h3>
              <div className="space-y-4">
                {template.steps.map((step, idx) => (
                  <div key={step.id} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{stepTypeIcons[step.type] || '📄'}</span>
                          <h4 className="font-semibold">{step.name}</h4>
                          <Badge variant="outline" className="text-xs">{step.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>

                    {/* Elements */}
                    <div className="ml-11 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Elements ({step.elements.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.elements.map((element, eIdx) => (
                          <Badge key={eIdx} variant="secondary" className="text-xs">
                            {element.type}
                          </Badge>
                        ))}
                      </div>

                      {/* Best Practices */}
                      {step.bestPractices.length > 0 && (
                        <details className="mt-3">
                          <summary className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground">
                            Best Practices ({step.bestPractices.length})
                          </summary>
                          <ul className="mt-2 ml-4 space-y-1 text-sm text-muted-foreground list-disc">
                            {step.bestPractices.map((practice, pIdx) => (
                              <li key={pIdx}>{practice}</li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {/* Color Scheme */}
                      {step.colorScheme && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Colors:</span>
                          <div className="flex gap-1">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: step.colorScheme.primary }}
                              title="Primary"
                            />
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: step.colorScheme.secondary }}
                              title="Secondary"
                            />
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: step.colorScheme.accent }}
                              title="Accent"
                            />
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: step.colorScheme.background }}
                              title="Background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            onClick={() => {
              onUseTemplate(template.id);
              onClose();
            }}
            className="flex-1"
          >
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
