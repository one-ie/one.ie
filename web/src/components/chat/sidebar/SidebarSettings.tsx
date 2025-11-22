/**
 * CYCLE 60: Sidebar Customization & Settings
 *
 * Features:
 * - Show/hide sections (toggle switches)
 * - Compact mode
 * - Layout presets (default, compact, minimal)
 * - Reset to defaults
 */

import { useState } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { chatSidebarStore, chatSidebarActions } from '@/stores/chatSidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const sectionLabels: Record<string, string> = {
  stream: 'Stream',
  organisations: 'Organisations',
  groups: 'Groups',
  channels: 'Channels',
  tools: 'Tools',
  agents: 'Agents',
  people: 'People',
};

export function SidebarSettings() {
  const state = useStore(chatSidebarStore);
  const { sectionOrder, hiddenSections, compactMode } = state;
  const [open, setOpen] = useState(false);

  const handleToggleSection = (sectionId: string) => {
    chatSidebarActions.toggleSection(sectionId);
  };

  const handleToggleCompactMode = () => {
    chatSidebarActions.toggleCompactMode();
  };

  const handleReset = () => {
    if (confirm('Reset sidebar to default settings?')) {
      chatSidebarActions.reset();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
          <Settings className="h-4 w-4" />
          <span className="text-xs">Sidebar Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Sidebar Settings</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="text-sm font-medium">
                Compact Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Smaller text and icons
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={handleToggleCompactMode}
            />
          </div>

          <Separator />

          {/* Section Visibility */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Visible Sections</Label>
            {sectionOrder.map((sectionId) => {
              const isHidden = hiddenSections.includes(sectionId);
              return (
                <div
                  key={sectionId}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={`section-${sectionId}`} className="text-sm">
                    {sectionLabels[sectionId]}
                  </Label>
                  <Switch
                    id={`section-${sectionId}`}
                    checked={!isHidden}
                    onCheckedChange={() => handleToggleSection(sectionId)}
                  />
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Layout Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Layout Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  chatSidebarActions.reset();
                  setOpen(false);
                }}
                className="text-xs"
              >
                Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  chatSidebarActions.toggleCompactMode();
                  setOpen(false);
                }}
                className="text-xs"
              >
                Compact
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  chatSidebarActions.setCollapsed(true);
                  setOpen(false);
                }}
                className="text-xs"
              >
                Minimal
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-[10px]">
                TIP
              </Badge>
              <p className="text-xs text-muted-foreground">
                Drag sections to reorder them (coming soon)
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
