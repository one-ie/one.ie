/**
 * CYCLE 52: Stream Section
 *
 * Shows all recent activity:
 * - Mentions
 * - Messages
 * - Events
 * - Unread count badge
 */

import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StreamSectionProps {
  collapsed: boolean;
}

export function StreamSection({ collapsed }: StreamSectionProps) {
  // TODO: Replace with real-time Convex query
  const unreadCount = 12;
  const recentActivity = [
    { id: '1', type: 'mention', text: '@you in #general' },
    { id: '2', type: 'message', text: 'New message in #random' },
    { id: '3', type: 'event', text: 'Meeting started' },
  ];

  const handleClick = () => {
    // Navigate to /app/stream
    window.location.href = '/app/stream';
  };

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              className="w-full h-12 relative"
            >
              <Activity className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">Stream</div>
              {unreadCount > 0 && (
                <div className="text-xs">{unreadCount} unread</div>
              )}
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
        onClick={handleClick}
        className={cn(
          'w-full justify-start gap-3 h-10',
          unreadCount > 0 && 'font-semibold'
        )}
      >
        <Activity className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left">Stream</span>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-[10px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Recent Activity Preview */}
      {!collapsed && unreadCount > 0 && (
        <div className="ml-7 space-y-1">
          {recentActivity.slice(0, 3).map((activity) => (
            <button
              key={activity.id}
              className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded hover:bg-accent"
            >
              {activity.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
