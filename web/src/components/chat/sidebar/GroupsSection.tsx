/**
 * CYCLE 54: Groups Section
 *
 * Tree structure with:
 * - Expandable/collapsible groups
 * - Nested subgroups
 * - Group avatar + name + member count
 * - Create group button
 */

import { useState } from 'react';
import { Users, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { chatSidebarStore, chatSidebarActions } from '@/stores/chatSidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Group {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  subgroups?: Group[];
}

interface GroupsSectionProps {
  collapsed: boolean;
}

function GroupItem({ group, level = 0, activeGroupId, onSelect }: {
  group: Group;
  level?: number;
  activeGroupId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasSubgroups = group.subgroups && group.subgroups.length > 0;
  const isActive = activeGroupId === group.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(group.id);
          if (hasSubgroups) setExpanded(!expanded);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm',
          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasSubgroups && (
          <span className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}
        <Avatar className="h-5 w-5">
          <AvatarImage src={group.avatar} />
          <AvatarFallback className="text-[10px]">
            {group.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 text-left truncate">{group.name}</span>
        <span className="text-xs text-muted-foreground">
          {group.memberCount}
        </span>
      </button>

      {/* Nested Subgroups */}
      {hasSubgroups && expanded && (
        <div className="mt-1">
          {group.subgroups!.map((subgroup) => (
            <GroupItem
              key={subgroup.id}
              group={subgroup}
              level={level + 1}
              activeGroupId={activeGroupId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupsSection({ collapsed }: GroupsSectionProps) {
  const state = useStore(chatSidebarStore);
  const { activeGroupId, activeOrgId } = state;

  // TODO: Replace with real-time Convex query based on activeOrgId
  const [groups] = useState<Group[]>([
    {
      id: '1',
      name: 'Engineering',
      memberCount: 12,
      subgroups: [
        { id: '1-1', name: 'Frontend', memberCount: 5 },
        { id: '1-2', name: 'Backend', memberCount: 7 },
      ],
    },
    { id: '2', name: 'Marketing', memberCount: 8 },
    { id: '3', name: 'Sales', memberCount: 15 },
  ]);

  const [expanded, setExpanded] = useState(true);

  const handleGroupSelect = (groupId: string) => {
    chatSidebarActions.setActiveGroup(groupId);
  };

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-full h-12">
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">Groups</div>
              <div className="text-xs">{groups.length} groups</div>
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
        <Users className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          Groups
        </span>
        <span className="text-xs text-muted-foreground">
          {groups.length}
        </span>
      </Button>

      {/* Groups Tree */}
      {expanded && (
        <div className="space-y-1">
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              activeGroupId={activeGroupId}
              onSelect={handleGroupSelect}
            />
          ))}

          {/* Create Group Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Create Group</span>
          </Button>
        </div>
      )}
    </div>
  );
}
