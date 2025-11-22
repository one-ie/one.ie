/**
 * Chat Sidebar Store
 *
 * Manages sidebar state:
 * - Collapsed/expanded state (persisted to localStorage)
 * - Active organization selection
 * - Section visibility customization
 */

import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';

export interface ChatSidebarState {
  collapsed: boolean;
  activeOrgId: string | null;
  activeGroupId: string | null;
  sectionOrder: string[];
  hiddenSections: string[];
  compactMode: boolean;
}

// Default sidebar state
const defaultState: ChatSidebarState = {
  collapsed: false,
  activeOrgId: null,
  activeGroupId: null,
  sectionOrder: ['stream', 'organisations', 'groups', 'channels', 'tools', 'agents', 'people'],
  hiddenSections: [],
  compactMode: false,
};

// Persistent sidebar state (saved to localStorage)
export const chatSidebarStore = persistentAtom<ChatSidebarState>('chatSidebar', defaultState, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// In-memory search query state
export const sidebarSearchQuery = atom<string>('');

// Sidebar actions
export const chatSidebarActions = {
  toggleCollapsed() {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, collapsed: !current.collapsed });
  },

  setCollapsed(collapsed: boolean) {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, collapsed });
  },

  setActiveOrg(orgId: string) {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, activeOrgId: orgId });
  },

  setActiveGroup(groupId: string) {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, activeGroupId: groupId });
  },

  toggleSection(sectionId: string) {
    const current = chatSidebarStore.get();
    const hidden = current.hiddenSections.includes(sectionId)
      ? current.hiddenSections.filter(id => id !== sectionId)
      : [...current.hiddenSections, sectionId];
    chatSidebarStore.set({ ...current, hiddenSections: hidden });
  },

  reorderSections(newOrder: string[]) {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, sectionOrder: newOrder });
  },

  toggleCompactMode() {
    const current = chatSidebarStore.get();
    chatSidebarStore.set({ ...current, compactMode: !current.compactMode });
  },

  reset() {
    chatSidebarStore.set(defaultState);
  },
};
