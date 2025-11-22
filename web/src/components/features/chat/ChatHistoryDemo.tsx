/**
 * Chat History Demo
 *
 * Interactive demo showing all conversation history features
 */

import { useState, useRef } from 'react';
import { ChatWithHistory, useConversationHistory } from './ChatWithHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Code2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/stores/conversationHistory';

const DEMO_RESPONSES = [
  "I understand you'd like to see the conversation history features in action! Let me show you how they work.",
  "Here's a code example:\n\n```typescript\nfunction greet(name: string) {\n  return `Hello, ${name}!`;\n}\n```\n\nThis creates a simple greeting function.",
  "You can resume the conversation from any previous message by clicking the 'Resume from here' button in the history panel.",
  "Each code change is tracked as a version. You can revert to any previous version using the undo/redo controls.",
  "Try exporting this conversation as markdown using the controls at the top!",
];

export function ChatHistoryDemo() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { addMessage, trackCodeVersion } = useConversationHistory();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = addMessage({
      role: 'user',
      content: input.trim(),
      type: 'text',
    });

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responseIndex = messages.filter((m) => m.role === 'assistant').length;
    const response = DEMO_RESPONSES[responseIndex % DEMO_RESPONSES.length];

    const assistantMessage = addMessage({
      role: 'assistant',
      content: response,
      type: 'text',
    });

    // If response contains code, track it as a version
    if (response.includes('```')) {
      const codeMatch = response.match(/```(\w+)?\n([\s\S]+?)\n```/);
      if (codeMatch) {
        trackCodeVersion(assistantMessage.id, codeMatch[2], 'demo.ts');
      }
    }

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  const handleMessagesChange = (updatedMessages: ConversationMessage[]) => {
    setMessages(updatedMessages);
  };

  const handleCodeRevert = (code: string, file: string) => {
    const message = addMessage({
      role: 'system',
      content: `Code reverted in ${file}:\n\n\`\`\`typescript\n${code}\n\`\`\``,
      type: 'text',
    });
    setMessages((prev) => [...prev, message]);
  };

  return (
    <ChatWithHistory
      onMessagesChange={handleMessagesChange}
      onCodeRevert={handleCodeRevert}
    >
      <div className="flex flex-col h-full bg-background">
        {/* Demo Instructions */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Conversation History Demo
                </CardTitle>
                <CardDescription>
                  Try out the conversation history features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Features to Try:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <span>Send messages and watch them get saved automatically</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <span>Click the History icon to view all your conversations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <span>Resume from any message using the history panel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <span>Code changes are tracked - try the undo/redo features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">5</Badge>
                      <span>Export your conversation as markdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">6</Badge>
                      <span>Search within your conversations</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    All conversations are stored in your browser's localStorage, so they persist even after you close the tab!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-muted border border-border'
                        : 'bg-muted'
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    {message.codeVersion && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Code2 className="h-3 w-3 mr-1" />
                        Version {message.codeVersion.version}
                      </Badge>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                placeholder="Try asking something... (e.g., 'Show me a code example')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[60px] resize-none"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </ChatWithHistory>
  );
}
