/**
 * CYCLE 59: Sidebar Search & Quick Switcher
 *
 * Global search with Cmd+K shortcut
 * Searches across:
 * - Channels
 * - People
 * - Groups
 * - Messages
 * - Agents
 */

import { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sidebarSearchQuery } from '@/stores/chatSidebar';

export function SidebarSearch() {
  const [query, setQuery] = useState('');
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSwitcherOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    sidebarSearchQuery.set(value);
  };

  return (
    <>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClick={() => setQuickSwitcherOpen(true)}
          className="pl-9 pr-20 h-9"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>

      {/* Quick Switcher Modal */}
      <Dialog open={quickSwitcherOpen} onOpenChange={setQuickSwitcherOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Switcher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search channels, people, messages..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoFocus
            />
            {/* TODO: Add search results here */}
            <div className="text-sm text-muted-foreground text-center py-8">
              Search results will appear here
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
