/**
 * CYCLE 53: Organisations Section
 *
 * Lists user's organizations with:
 * - Org avatar + name
 * - Active org highlighting
 * - Org switching
 * - Create organization button
 */

import { useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
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

interface Organisation {
  id: string;
  name: string;
  avatar?: string;
}

interface OrganisationsSectionProps {
  collapsed: boolean;
}

export function OrganisationsSection({ collapsed }: OrganisationsSectionProps) {
  const state = useStore(chatSidebarStore);
  const { activeOrgId } = state;

  // TODO: Replace with real-time Convex query
  const [organisations] = useState<Organisation[]>([
    { id: '1', name: 'Acme Corp', avatar: undefined },
    { id: '2', name: 'Tech Startup', avatar: undefined },
    { id: '3', name: 'My Company', avatar: undefined },
  ]);

  const [expanded, setExpanded] = useState(true);

  const handleOrgClick = (orgId: string) => {
    chatSidebarActions.setActiveOrg(orgId);
  };

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-12"
            >
              <Briefcase className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">Organisations</div>
              <div className="text-xs">{organisations.length} total</div>
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
        <Briefcase className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          Organisations
        </span>
        <span className="text-xs text-muted-foreground">
          {organisations.length}
        </span>
      </Button>

      {/* Organisation List */}
      {expanded && (
        <div className="space-y-1">
          {organisations.map((org) => {
            const isActive = activeOrgId === org.id;
            return (
              <button
                key={org.id}
                onClick={() => handleOrgClick(org.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={org.avatar} />
                  <AvatarFallback className="text-xs">
                    {org.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left text-sm truncate">
                  {org.name}
                </span>
              </button>
            );
          })}

          {/* Create Organisation Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Create Organisation</span>
          </Button>
        </div>
      )}
    </div>
  );
}
