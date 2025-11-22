/**
 * CYCLE 58: People Section
 *
 * Lists organization members with:
 * - Avatar + name + status (online/away/offline)
 * - Sort: Online → Away → Offline → Alphabetical
 * - Search/filter input at top
 * - Role badges (admin, owner, member)
 * - Click → Direct message with person
 * - Hover → Show user card with quick actions
 */

import { useState } from 'react';
import { User, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type UserStatus = 'online' | 'away' | 'offline';
type UserRole = 'org_owner' | 'org_admin' | 'org_user' | 'customer';

interface Person {
  id: string;
  name: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  title?: string;
}

interface PeopleSectionProps {
  collapsed: boolean;
}

const statusColors: Record<UserStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-300',
};

const roleLabels: Record<UserRole, string> = {
  org_owner: 'Owner',
  org_admin: 'Admin',
  org_user: 'Member',
  customer: 'Guest',
};

const roleColors: Record<UserRole, string> = {
  org_owner: 'bg-purple-100 text-purple-800',
  org_admin: 'bg-blue-100 text-blue-800',
  org_user: 'bg-gray-100 text-gray-800',
  customer: 'bg-green-100 text-green-800',
};

function PersonItem({ person, onClick }: {
  person: Person;
  onClick: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-accent"
          >
            {/* Avatar with Status */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-6 w-6">
                <AvatarImage src={person.avatar} />
                <AvatarFallback className="text-xs">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Status Indicator */}
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
                  statusColors[person.status]
                )}
              />
            </div>

            {/* Name */}
            <span className="flex-1 text-left text-sm truncate">
              {person.name}
            </span>

            {/* Role Badge (only for non-members) */}
            {person.role !== 'org_user' && (
              <Badge variant="outline" className={cn('text-[10px] px-1.5 h-4', roleColors[person.role])}>
                {roleLabels[person.role]}
              </Badge>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="space-y-1">
            <div className="font-semibold">{person.name}</div>
            {person.title && (
              <div className="text-xs text-muted-foreground">{person.title}</div>
            )}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px]">
                {person.status}
              </Badge>
              <Badge variant="outline" className={cn('text-[10px]', roleColors[person.role])}>
                {roleLabels[person.role]}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function PeopleSection({ collapsed }: PeopleSectionProps) {
  // TODO: Replace with real-time Convex query with presence
  const [people] = useState<Person[]>([
    { id: '1', name: 'Alice Johnson', status: 'online', role: 'org_owner', title: 'CEO' },
    { id: '2', name: 'Bob Smith', status: 'online', role: 'org_admin', title: 'CTO' },
    { id: '3', name: 'Carol Davis', status: 'away', role: 'org_user', title: 'Developer' },
    { id: '4', name: 'David Wilson', status: 'online', role: 'org_user', title: 'Designer' },
    { id: '5', name: 'Eve Martinez', status: 'offline', role: 'org_user', title: 'Product Manager' },
    { id: '6', name: 'Frank Brown', status: 'online', role: 'customer', title: 'Guest' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);

  // Filter by search query
  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: Online → Away → Offline → Alphabetical
  const sortedPeople = [...filteredPeople].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, offline: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.name.localeCompare(b.name);
  });

  const handlePersonClick = (person: Person) => {
    // Navigate to direct message with person
    window.location.href = `/app/chat/user-${person.id}`;
  };

  const onlineCount = people.filter(p => p.status === 'online').length;

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
              <User className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-semibold">People</div>
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
        <User className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left font-semibold text-xs uppercase text-muted-foreground">
          People
        </span>
        <Badge variant="secondary" className="h-5 px-2 text-[10px]">
          {onlineCount}/{people.length}
        </Badge>
      </Button>

      {/* People List */}
      {expanded && (
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>

          {/* People List */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sortedPeople.map((person) => (
              <PersonItem
                key={person.id}
                person={person}
                onClick={() => handlePersonClick(person)}
              />
            ))}

            {sortedPeople.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-4">
                No people found
              </div>
            )}
          </div>

          {/* Invite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="text-xs">Invite People</span>
          </Button>
        </div>
      )}
    </div>
  );
}
