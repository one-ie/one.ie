/**
 * Preferences Display
 *
 * Shows extracted customer preferences/needs from conversation
 */

import type { CustomerNeeds } from '@/lib/types/commerce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { User, X } from 'lucide-react';

interface PreferencesDisplayProps {
  needs: CustomerNeeds;
  onUpdate?: (needs: CustomerNeeds) => void;
  editable?: boolean;
}

export function PreferencesDisplay({
  needs,
  onUpdate,
  editable = false,
}: PreferencesDisplayProps) {
  const hasNeeds =
    needs.skillLevel ||
    needs.budget ||
    needs.playingStyle ||
    (needs.painPoints && needs.painPoints.length > 0) ||
    (needs.preferences && needs.preferences.length > 0);

  if (!hasNeeds) return null;

  const removePainPoint = (point: string) => {
    if (!editable || !onUpdate) return;
    onUpdate({
      ...needs,
      painPoints: needs.painPoints?.filter((p) => p !== point),
    });
  };

  const removePreference = (pref: string) => {
    if (!editable || !onUpdate) return;
    onUpdate({
      ...needs,
      preferences: needs.preferences?.filter((p) => p !== pref),
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Your Profile
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">
              What I've learned about you:
            </h4>
          </div>

          {/* Skill Level */}
          {needs.skillLevel && (
            <div>
              <span className="text-xs text-muted-foreground">Skill Level:</span>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {needs.skillLevel}
                </Badge>
              </div>
            </div>
          )}

          {/* Budget */}
          {needs.budget && (
            <div>
              <span className="text-xs text-muted-foreground">Budget:</span>
              <div className="mt-1">
                <Badge variant="secondary">
                  €{needs.budget.min} - €{needs.budget.max}
                </Badge>
              </div>
            </div>
          )}

          {/* Playing Style */}
          {needs.playingStyle && (
            <div>
              <span className="text-xs text-muted-foreground">Style:</span>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {needs.playingStyle}
                </Badge>
              </div>
            </div>
          )}

          {/* Pain Points */}
          {needs.painPoints && needs.painPoints.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Concerns:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {needs.painPoints.map((point, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {point}
                    {editable && (
                      <button
                        onClick={() => removePainPoint(point)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {needs.preferences && needs.preferences.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">
                Preferences:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {needs.preferences.map((pref, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {pref}
                    {editable && (
                      <button
                        onClick={() => removePreference(pref)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground italic">
            I use this to make better recommendations for you.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
