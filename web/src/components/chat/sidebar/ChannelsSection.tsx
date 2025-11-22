/**
 * CYCLE 55: Channels Section
 *
 * Lists channels with:
 * - Public channels (# icon)
 * - Private channels (lock icon)
 * - Direct messages (user icon)
 * - Unread count badges
 * - Typing indicators
 * - Star/favorite channels (pinned to top)
 */

import { useState } from 'react';
import { Hash, Lock, User, Star, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  unreadCount: number;
  isTyping: boolean;
  isPinned: boolean;
  avatar?: string;
}

interface ChannelsSectionProps {
  collapsed: boolean;
}

function ChannelItem({ channel, isActive, onClick }: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}) {
  const icon = {
    public: <Hash className="h-4 w-4" />,
    private: <Lock className="h-4 w-4" />,
    dm: <Avatar className="h-4 w-4"><AvatarFallback className="text-[10px]">{channel.name[0]}</AvatarFallback></Avatar>,
  }[channel.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
        channel.unreadCount > 0 && 'font-semibold'
      )}
    >
      {/* Channel Icon */}
      <span className="flex-shrink-0">
        {icon}
      </span>

      {/* Channel Name */}
      <span className="flex-1 text-left text-sm truncate">
        {channel.name}
      </span>

      {/* Pinned Star */}
      {channel.isPinned && (
        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
      )}

      {/* Typing Indicator */}
      {channel.isTyping && (
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Unread Count */}
      {channel.unreadCount > 0 && (
        <Badge
          variant={isActive ? 'secondary' : 'default'}
          className="h-5 min-w-[20px] px-1.5 text-[10px]"
        >
          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
        </Badge>
      )}
    </button>
  );
}

export function ChannelsSection({ collapsed }: ChannelsSectionProps) {
  const [activeChannelId, setActiveChannelId] = useState<string>('1');

  // TODO: Replace with real-time Convex query
  const [channels] = useState<Channel[]>([
    { id: '1', name: 'general', type: 'public', unreadCount: 5, isTyping: true, isPinned: true },
    { id: '2', name: 'random', type: 'public', unreadCount: 0, isTyping: false, isPinned: false },
    { id: '3', name: 'team-updates', type: 'private', unreadCount: 2, isTyping: false, isPinned: true },
    { id: '4', name: 'Alice Johnson', type: 'dm', unreadCount: 1, isTyping: false, isPinned: false },
    { id: '5', name: 'Bob Smith', type: 'dm', unreadCount: 0, isTyping: true, isPinned: false },
  ]);

  const [expanded, setExpanded] = useState(true);

  // Sort: Pinned → Unread → Recent → Alphabetical
  const sortedChannels = [...channels].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    // Navigate to /app/chat/[channelId]
    window.location.href = `/app/chat/${channelId}`;
  };

  if (collapsed) {
    const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-12 relative"
            >
              <MessageSquare className="h-5 w-5" />
              {totalUnread > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {totalUnread > 9 ? '9+' : totalUnread}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">Channels</div>
              <div className="text-xs">{totalUnread} unread</div>
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
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          Channels
        </span>
        <span className="text-xs text-muted-foreground">
          {channels.length}
        </span>
      </Button>

      {/* Channel List */}
      {expanded && (
        <div className="space-y-1">
          {sortedChannels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isActive={activeChannelId === channel.id}
              onClick={() => handleChannelClick(channel.id)}
            />
          ))}

          {/* Create Channel Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Create Channel</span>
          </Button>
        </div>
      )}
    </div>
  );
}
