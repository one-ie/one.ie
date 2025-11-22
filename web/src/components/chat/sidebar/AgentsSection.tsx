/**
 * CYCLE 57: Agents Section
 *
 * Lists available AI agents with:
 * - Agent avatar + name
 * - Online status indicator (presence)
 * - Agent capabilities preview (tooltip on hover)
 * - Unread message count (if agent messaged you)
 * - Click → Direct message with agent
 */

import { useState } from 'react';
import { Bot, Plus } from 'lucide-react';
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

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  unreadCount: number;
  capabilities: string[];
  description: string;
}

interface AgentsSectionProps {
  collapsed: boolean;
}

function AgentItem({ agent, onClick }: {
  agent: Agent;
  onClick: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
              'hover:bg-accent',
              agent.unreadCount > 0 && 'font-semibold'
            )}
          >
            {/* Agent Avatar with Status */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-6 w-6">
                <AvatarImage src={agent.avatar} />
                <AvatarFallback className="text-xs">
                  <Bot className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
                  agent.isOnline ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
            </div>

            {/* Agent Name */}
            <span className="flex-1 text-left text-sm truncate">
              {agent.name}
            </span>

            {/* Unread Count */}
            {agent.unreadCount > 0 && (
              <Badge variant="default" className="h-5 min-w-[20px] px-1.5 text-[10px]">
                {agent.unreadCount > 99 ? '99+' : agent.unreadCount}
              </Badge>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{agent.name}</div>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.map((cap) => (
                <Badge key={cap} variant="outline" className="text-[10px]">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AgentsSection({ collapsed }: AgentsSectionProps) {
  // TODO: Replace with real-time Convex query
  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Code Assistant',
      isOnline: true,
      unreadCount: 0,
      capabilities: ['Code', 'Debug', 'Explain'],
      description: 'Helps with coding, debugging, and explaining code',
    },
    {
      id: '2',
      name: 'Writing Helper',
      isOnline: true,
      unreadCount: 2,
      capabilities: ['Writing', 'Editing', 'Grammar'],
      description: 'Assists with writing, editing, and grammar',
    },
    {
      id: '3',
      name: 'Research Bot',
      isOnline: false,
      unreadCount: 0,
      capabilities: ['Research', 'Summarize', 'Analyze'],
      description: 'Researches topics and provides summaries',
    },
    {
      id: '4',
      name: 'Task Manager',
      isOnline: true,
      unreadCount: 1,
      capabilities: ['Tasks', 'Planning', 'Reminders'],
      description: 'Manages tasks and sends reminders',
    },
  ]);

  const [expanded, setExpanded] = useState(true);

  const handleAgentClick = (agent: Agent) => {
    // Navigate to direct message with agent
    window.location.href = `/app/chat/agent-${agent.id}`;
  };

  const onlineCount = agents.filter(a => a.isOnline).length;
  const totalUnread = agents.reduce((sum, a) => sum + a.unreadCount, 0);

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
              <Bot className="h-5 w-5" />
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
              <div className="font-semibold">Agents</div>
              <div className="text-xs">{onlineCount} online</div>
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
        <Bot className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          Agents
        </span>
        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
          {onlineCount} online
        </Badge>
      </Button>

      {/* Agents List */}
      {expanded && (
        <div className="space-y-1">
          {agents.map((agent) => (
            <AgentItem
              key={agent.id}
              agent={agent}
              onClick={() => handleAgentClick(agent)}
            />
          ))}

          {/* Add Agent Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Add Agent</span>
          </Button>
        </div>
      )}
    </div>
  );
}
