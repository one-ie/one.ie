/**
 * CYCLE 56: Tools Section
 *
 * Lists available integrations:
 * - File Browser
 * - Screen Share
 * - Calendar
 * - AI Assistant
 * - Custom integrations
 *
 * Shows tool usage indicators (active/inactive)
 */

import { useState } from 'react';
import {
  Wrench,
  FileText,
  Monitor,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  isActive: boolean;
  description: string;
}

interface ToolsSectionProps {
  collapsed: boolean;
}

function ToolItem({ tool, onClick }: {
  tool: Tool;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
        'hover:bg-accent'
      )}
    >
      {/* Tool Icon */}
      <span className="flex-shrink-0 text-muted-foreground">
        {tool.icon}
      </span>

      {/* Tool Name */}
      <span className="flex-1 text-left text-sm truncate">
        {tool.name}
      </span>

      {/* Active Indicator */}
      {tool.isActive && (
        <div className="w-2 h-2 rounded-full bg-green-500" />
      )}
    </button>
  );
}

export function ToolsSection({ collapsed }: ToolsSectionProps) {
  // TODO: Replace with real-time Convex query
  const [tools] = useState<Tool[]>([
    {
      id: '1',
      name: 'File Browser',
      icon: <FileText className="h-4 w-4" />,
      isActive: false,
      description: 'Browse and share files',
    },
    {
      id: '2',
      name: 'Screen Share',
      icon: <Monitor className="h-4 w-4" />,
      isActive: true,
      description: 'Share your screen',
    },
    {
      id: '3',
      name: 'Calendar',
      icon: <Calendar className="h-4 w-4" />,
      isActive: false,
      description: 'Schedule meetings',
    },
    {
      id: '4',
      name: 'AI Assistant',
      icon: <Sparkles className="h-4 w-4" />,
      isActive: true,
      description: 'Get AI help',
    },
  ]);

  const [expanded, setExpanded] = useState(true);

  const handleToolClick = (tool: Tool) => {
    // Open tool modal or navigate to tool page
    console.log('Open tool:', tool.name);
  };

  const activeCount = tools.filter(t => t.isActive).length;

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-12 relative"
            >
              <Wrench className="h-5 w-5" />
              {activeCount > 0 && (
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-green-500" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">Tools</div>
              <div className="text-xs">{activeCount} active</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {/* Section Header */}
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-start gap-3 h-10"
      >
        <Wrench className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          Tools
        </span>
        {activeCount > 0 && (
          <Badge variant="secondary" className="h-5 px-2 text-[10px]">
            {activeCount} active
          </Badge>
        )}
      </Button>

      {/* Tools List */}
      {expanded && (
        <div className="space-y-1">
          {tools.map((tool) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              onClick={() => handleToolClick(tool)}
            />
          ))}

          {/* Browse Tools Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Browse Tools</span>
          </Button>
        </div>
      )}
    </div>
  );
}
