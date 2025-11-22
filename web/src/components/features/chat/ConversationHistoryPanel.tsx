/**
 * Conversation History Panel
 *
 * Shows messages in a conversation with:
 * - Resume from any message
 * - View code versions
 * - Undo/redo code changes
 */

import { useStore } from '@nanostores/react';
import {
  ArrowRight,
  Clock,
  Code2,
  History,
  Undo2,
  Redo2,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  getCurrentConversation,
  resumeFromMessage,
  revertToVersion,
} from '@/stores/conversationHistory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ConversationHistoryPanelProps {
  onResumeFromMessage?: (messages: any[]) => void;
  onRevertToVersion?: (code: string, file: string) => void;
}

export function ConversationHistoryPanel({
  onResumeFromMessage,
  onRevertToVersion,
}: ConversationHistoryPanelProps) {
  const { toast } = useToast();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const conversation = getCurrentConversation();

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No active conversation</p>
          <p className="text-sm mt-1">Start a new conversation to see history</p>
        </div>
      </div>
    );
  }

  const handleResumeFromMessage = (messageId: string) => {
    const messages = resumeFromMessage(messageId);
    onResumeFromMessage?.(messages);
    toast({
      title: 'Conversation resumed',
      description: 'Conversation resumed from selected message',
    });
  };

  const handleRevertToVersion = (version: number) => {
    const result = revertToVersion(version);
    if (result) {
      onRevertToVersion?.(result.code, result.file);
      toast({
        title: 'Code reverted',
        description: `Reverted to version ${version}`,
      });
    }
  };

  const toggleVersionExpanded = (messageId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedVersions(newExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          {conversation.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(conversation.updatedAt).toLocaleString()}
          </span>
          <span>•</span>
          <span>{conversation.messages.length} messages</span>
          {conversation.codeVersions.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Code2 className="h-3 w-3" />
                {conversation.codeVersions.length} versions
              </span>
            </>
          )}
        </div>
      </div>

      {/* Code Versions Section */}
      {conversation.codeVersions.length > 0 && (
        <div className="p-4 border-b border-border bg-muted/50">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Code Versions
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {conversation.codeVersions.map((version) => (
              <TooltipProvider key={version.version}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevertToVersion(version.version)}
                      className="flex items-center gap-2 min-w-fit"
                    >
                      <Undo2 className="h-3 w-3" />
                      v{version.version}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-medium">{version.file}</p>
                      <p className="text-muted-foreground">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                      <p className="mt-1">Click to revert</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {conversation.messages.map((message, index) => (
            <div
              key={message.id}
              className="group relative border rounded-lg p-3 hover:border-primary/50 transition-colors"
            >
              {/* Message Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.type && message.type !== 'text' && (
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                  )}
                </div>

                {/* Resume button (shown on hover) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleResumeFromMessage(message.id)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Resume from here
                </Button>
              </div>

              {/* Message Content */}
              <div className="text-sm">
                {message.reasoning && (
                  <div className="mb-2 p-2 bg-muted rounded text-xs">
                    <div className="font-medium mb-1">Reasoning:</div>
                    <div className="text-muted-foreground">
                      {message.reasoning.content}
                    </div>
                  </div>
                )}

                {message.toolCalls && message.toolCalls.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {message.toolCalls.map((tool, toolIndex) => (
                      <div
                        key={toolIndex}
                        className="p-2 bg-muted rounded text-xs"
                      >
                        <div className="font-medium">Tool: {tool.name}</div>
                        <div className="text-muted-foreground mt-1">
                          Args: {JSON.stringify(tool.args)}
                        </div>
                        {tool.result && (
                          <div className="text-muted-foreground mt-1">
                            Result: {JSON.stringify(tool.result)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Code Version Info */}
                {message.codeVersion && (
                  <Collapsible
                    open={expandedVersions.has(message.id)}
                    onOpenChange={() => toggleVersionExpanded(message.id)}
                    className="mt-3"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Code2 className="h-3 w-3" />
                          Code Version {message.codeVersion.version}
                          <Badge variant="outline" className="text-xs">
                            {message.codeVersion.fileChanged}
                          </Badge>
                        </span>
                        {expandedVersions.has(message.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {message.codeVersion.previousCode && (
                        <div>
                          <div className="text-xs font-medium mb-1">Previous:</div>
                          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                            {message.codeVersion.previousCode}
                          </pre>
                        </div>
                      )}
                      {message.codeVersion.currentCode && (
                        <div>
                          <div className="text-xs font-medium mb-1">Current:</div>
                          <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                            {message.codeVersion.currentCode}
                          </pre>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRevertToVersion(message.codeVersion!.version)
                        }
                        className="w-full"
                      >
                        <Undo2 className="h-3 w-3 mr-2" />
                        Revert to this version
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
