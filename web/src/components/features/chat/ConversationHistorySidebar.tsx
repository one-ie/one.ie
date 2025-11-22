/**
 * Conversation History Sidebar
 *
 * Shows list of previous conversations with:
 * - Search functionality
 * - Delete conversation
 * - Load conversation
 * - Export as markdown
 */

import { useStore } from '@nanostores/react';
import {
  Archive,
  Download,
  MessageSquare,
  Search,
  Trash2,
  X,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import {
  conversations,
  currentConversationId,
  historySidebarOpen,
  searchQuery,
  deleteConversation,
  loadConversation,
  exportAsMarkdown,
  searchConversations,
  getAllConversations,
  createConversation,
} from '@/stores/conversationHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ConversationHistorySidebarProps {
  onConversationLoad?: (messages: any[]) => void;
}

export function ConversationHistorySidebar({ onConversationLoad }: ConversationHistorySidebarProps) {
  const $conversations = useStore(conversations);
  const $currentConversationId = useStore(currentConversationId);
  const $historySidebarOpen = useStore(historySidebarOpen);
  const $searchQuery = useStore(searchQuery);
  const { toast } = useToast();

  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Get conversations to display
  const conversationsToShow = localSearchQuery
    ? searchConversations(localSearchQuery)
    : getAllConversations();

  const handleLoadConversation = (id: string) => {
    const messages = loadConversation(id);
    onConversationLoad?.(messages);
    toast({
      title: 'Conversation loaded',
      description: 'Previous conversation has been loaded',
    });
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    toast({
      title: 'Conversation deleted',
      description: 'Conversation has been permanently deleted',
    });
  };

  const handleExportConversation = (id: string) => {
    const markdown = exportAsMarkdown(id);
    const conversation = $conversations[id];

    if (!conversation) return;

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Conversation exported',
      description: 'Downloaded as markdown file',
    });
  };

  const handleNewConversation = () => {
    createConversation('New Conversation');
    onConversationLoad?.([]);
    toast({
      title: 'New conversation',
      description: 'Started a new conversation',
    });
  };

  if (!$historySidebarOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold">Conversation History</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => historySidebarOpen.set(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* New Conversation Button */}
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={handleNewConversation}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversationsToShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {localSearchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            conversationsToShow.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative rounded-lg border p-3 hover:bg-accent transition-colors',
                  $currentConversationId === conv.id && 'bg-accent border-primary'
                )}
              >
                {/* Conversation Info */}
                <button
                  onClick={() => handleLoadConversation(conv.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm line-clamp-2 flex-1">
                      {conv.title}
                    </h3>
                    {$currentConversationId === conv.id && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{conv.messages.length} messages</span>
                  </div>

                  {conv.model && (
                    <Badge variant="outline" className="text-xs">
                      {conv.model}
                    </Badge>
                  )}

                  {conv.codeVersions.length > 0 && (
                    <Badge variant="outline" className="text-xs ml-1">
                      {conv.codeVersions.length} versions
                    </Badge>
                  )}
                </button>

                {/* Actions (shown on hover) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportConversation(conv.id);
                    }}
                    title="Export as markdown"
                  >
                    <Download className="h-3 w-3" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{conv.title}" and all its messages.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteConversation(conv.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <FileText className="h-3 w-3 inline mr-1" />
          {Object.keys($conversations).length} total conversations
        </div>
      </div>
    </div>
  );
}
