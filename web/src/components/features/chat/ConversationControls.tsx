/**
 * Conversation Controls
 *
 * Provides controls for:
 * - Clear conversation
 * - Export as markdown
 * - Toggle history sidebar
 * - Search within conversation
 */

import { useStore } from '@nanostores/react';
import {
  Download,
  History,
  Search,
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  clearCurrentConversation,
  exportAsMarkdown,
  getCurrentConversation,
  historySidebarOpen,
  currentConversationId,
} from '@/stores/conversationHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ConversationControlsProps {
  messageCount?: number;
  onClear?: () => void;
  onSearchResults?: (results: any[]) => void;
}

export function ConversationControls({
  messageCount = 0,
  onClear,
  onSearchResults,
}: ConversationControlsProps) {
  const { toast } = useToast();
  const $historySidebarOpen = useStore(historySidebarOpen);
  const $currentConversationId = useStore(currentConversationId);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const conversation = getCurrentConversation();

  const handleClear = () => {
    clearCurrentConversation();
    onClear?.();
    toast({
      title: 'Conversation cleared',
      description: 'All messages have been removed',
    });
  };

  const handleExport = () => {
    if (!$currentConversationId) {
      toast({
        title: 'No conversation',
        description: 'Start a conversation first',
        variant: 'destructive',
      });
      return;
    }

    const markdown = exportAsMarkdown($currentConversationId);
    const conv = getCurrentConversation();

    if (!conv) return;

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Conversation exported',
      description: 'Downloaded as markdown file',
    });
  };

  const handleSearch = () => {
    if (!conversation || !searchQuery.trim()) return;

    const results = conversation.messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    onSearchResults?.(results);

    toast({
      title: 'Search complete',
      description: `Found ${results.length} matching messages`,
    });
  };

  const toggleHistorySidebar = () => {
    historySidebarOpen.set(!$historySidebarOpen);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Message count badge */}
      {messageCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {messageCount} messages
        </Badge>
      )}

      {/* Search */}
      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Search conversation">
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Search Conversation</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} size="sm">
                Search
              </Button>
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  onSearchResults?.([]);
                }}
                className="w-full"
              >
                <X className="h-3 w-3 mr-2" />
                Clear search
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Export */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExport}
        disabled={messageCount === 0}
        title="Export as markdown"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* History Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleHistorySidebar}
        title="Toggle conversation history"
        className={$historySidebarOpen ? 'bg-accent' : ''}
      >
        <History className="h-4 w-4" />
      </Button>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="More options">
            <FileText className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={messageCount === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleHistorySidebar}>
            <History className="h-4 w-4 mr-2" />
            {$historySidebarOpen ? 'Hide' : 'Show'} History
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={messageCount === 0}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Conversation
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Conversation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all messages from the current conversation.
                  The conversation will remain in history but will be empty.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
