/**
 * CYCLE 51: ChatSidebar Component
 *
 * Discord/WhatsApp-like sidebar with 7 sections:
 * - Stream
 * - Organisations
 * - Groups
 * - Channels
 * - Tools
 * - Agents
 * - People
 *
 * Features:
 * - Collapsible (280px expanded, 72px collapsed)
 * - Icon-only mode when collapsed
 * - Persistent state in localStorage
 * - Mobile responsive (full overlay)
 */

import { useStore } from '@nanostores/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { chatSidebarStore, chatSidebarActions } from '@/stores/chatSidebar';
import { ProfileHeader } from '@/components/app/ProfileHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SidebarSearch } from './sidebar/SidebarSearch';
import { StreamSection } from './sidebar/StreamSection';
import { OrganisationsSection } from './sidebar/OrganisationsSection';
import { GroupsSection } from './sidebar/GroupsSection';
import { ChannelsSection } from './sidebar/ChannelsSection';
import { ToolsSection } from './sidebar/ToolsSection';
import { AgentsSection } from './sidebar/AgentsSection';
import { PeopleSection } from './sidebar/PeopleSection';
import { SidebarSettings } from './sidebar/SidebarSettings';

export function ChatSidebar() {
  const state = useStore(chatSidebarStore);
  const { collapsed, sectionOrder, hiddenSections } = state;

  // Section components map
  const sectionComponents: Record<string, JSX.Element> = {
    stream: <StreamSection collapsed={collapsed} />,
    organisations: <OrganisationsSection collapsed={collapsed} />,
    groups: <GroupsSection collapsed={collapsed} />,
    channels: <ChannelsSection collapsed={collapsed} />,
    tools: <ToolsSection collapsed={collapsed} />,
    agents: <AgentsSection collapsed={collapsed} />,
    people: <PeopleSection collapsed={collapsed} />,
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-200',
        collapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Profile Header */}
      <div className="flex h-16 items-center border-b px-3">
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-sm font-semibold">
            A
          </div>
        ) : (
          <ProfileHeader name="Anthony O'Connell" initial="A" />
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="flex justify-end px-3 py-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => chatSidebarActions.toggleCollapsed()}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Global Search */}
      {!collapsed && (
        <>
          <div className="px-3 py-2">
            <SidebarSearch />
          </div>
          <Separator />
        </>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sectionOrder.map(sectionId => {
          // Skip hidden sections
          if (hiddenSections.includes(sectionId)) return null;

          return (
            <div key={sectionId}>
              {sectionComponents[sectionId]}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Settings */}
      {!collapsed && (
        <>
          <Separator />
          <div className="p-3">
            <SidebarSettings />
          </div>
        </>
      )}
    </div>
  );
}
