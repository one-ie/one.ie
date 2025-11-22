/**
 * AI Clone Chat Interface
 *
 * Beautiful chat interface for interacting with AI clones.
 * Features:
 * - Streaming LLM responses
 * - Real-time message sync with Convex
 * - Thinking/reasoning process display
 * - Citation tracking and display
 * - Voice/video playback (if clone has those features)
 * - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Play, Volume2, X } from 'lucide-react';
import { MessageWithCitations } from './MessageWithCitations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/elements/conversation';
import {
  Message,
  MessageContent,
} from '@/components/ai/elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai/elements/prompt-input';

interface CloneChatInterfaceProps {
  cloneId: string;
}

interface CloneMetadata {
  name: string;
  voiceId?: string;
  appearanceId?: string;
  systemPrompt?: string;
  status: 'training' | 'ready' | 'error';
}

interface MessageCitation {
  chunkId: string;
  text: string;
  sourceId: string;
  sourceTitle: string;
  relevance: number;
}

interface ChatMessage {
  key: string;
  from: 'user' | 'assistant' | 'system';
  versions: {
    id: string;
    content: string;
    citations?: MessageCitation[];
    reasoning?: string;
    audioUrl?: string;
    videoUrl?: string;
  }[];
}

export function CloneChatInterface({ cloneId }: CloneChatInterfaceProps) {
  const [clone, setClone] = useState<CloneMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch clone metadata on mount
  useEffect(() => {
    const fetchClone = async () => {
      try {
        // TODO: Replace with actual Convex query
        // const cloneData = await convex.query(api.queries.aiClones.get, { cloneId });

        // Mock data for now
        const mockClone: CloneMetadata = {
          name: 'My AI Clone',
          voiceId: 'voice_123',
          appearanceId: 'appearance_456',
          systemPrompt: 'You are a helpful AI assistant.',
          status: 'ready',
        };

        setClone(mockClone);
      } catch (err) {
        console.error('Failed to load clone:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClone();
  }, [cloneId]);

  // Stream response content word by word
  const streamResponse = useCallback(
    async (messageId: string, content: string, citations?: MessageCitation[], reasoning?: string) => {
      setStatus('streaming');
      setStreamingMessageId(messageId);

      const words = content.split(' ');
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.versions.some((v) => v.id === messageId)) {
              return {
                ...msg,
                versions: msg.versions.map((v) =>
                  v.id === messageId
                    ? { ...v, content: currentContent, citations, reasoning }
                    : v
                ),
              };
            }
            return msg;
          })
        );

        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 25));
      }

      setStatus('ready');
      setStreamingMessageId(null);
    },
    []
  );

  // Add user message and get AI response
  const addUserMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        key: `user-${Date.now()}`,
        from: 'user',
        versions: [
          {
            id: `user-${Date.now()}`,
            content,
          },
        ],
      };

      setMessages((prev) => [...prev, userMessage]);

      // Call API to get response
      try {
        const response = await fetch(`/api/clone/${cloneId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.from,
              content: m.versions[0].content,
            })),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const assistantMessageId = `assistant-${Date.now()}`;
          const assistantMessage: ChatMessage = {
            key: `assistant-${Date.now()}`,
            from: 'assistant',
            versions: [
              {
                id: assistantMessageId,
                content: '',
                citations: data.citations,
                reasoning: data.reasoning,
              },
            ],
          };

          setMessages((prev) => [...prev, assistantMessage]);
          streamResponse(assistantMessageId, data.content, data.citations, data.reasoning);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Failed to get response:', error);
        setStatus('error');
      }
    },
    [cloneId, messages, streamResponse]
  );

  // Handle form submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (message: any) => {
    const hasText = Boolean(message.text);

    if (!hasText) {
      return;
    }

    setStatus('submitted');
    addUserMessage(message.text || '');
    setText('');
  };

  // Play audio response
  const playAudio = useCallback(
    (audioUrl: string, messageId: string) => {
      if (playingAudio === messageId) {
        audioRef.current?.pause();
        setPlayingAudio(null);
      } else {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setPlayingAudio(messageId);
        }
      }
    },
    [playingAudio]
  );

  // Play video response
  const playVideo = useCallback(
    (videoUrl: string, messageId: string) => {
      if (playingVideo === messageId) {
        videoRef.current?.pause();
        setPlayingVideo(null);
      } else {
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
          videoRef.current.play();
          setPlayingVideo(messageId);
        }
      }
    },
    [playingVideo]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!clone) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Clone Not Found</h2>
          <p className="text-muted-foreground">
            The AI clone you're looking for doesn't exist or you don't have access to it.
          </p>
        </Card>
      </div>
    );
  }

  if (clone.status === 'training') {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-6 max-w-md text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-bold">Clone Training in Progress</h2>
          <p className="text-muted-foreground">
            Your AI clone is currently being trained. This usually takes 5-10 minutes.
            We'll notify you when it's ready!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{clone.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {clone.status}
                </Badge>
                {clone.voiceId && (
                  <Badge variant="outline" className="text-xs">
                    <Volume2 className="size-3 mr-1" />
                    Voice
                  </Badge>
                )}
                {clone.appearanceId && (
                  <Badge variant="outline" className="text-xs">
                    <Play className="size-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Bot className="size-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
              <p className="text-muted-foreground max-w-md">
                Ask me anything! I have access to your knowledge base and can help with questions,
                provide insights, and more.
              </p>
            </div>
          )}

          {messages.map(({ versions, ...message }) =>
            versions.map((version) => (
              <Message from={message.from} key={`${message.key}-${version.id}`}>
                <MessageContent>
                  {message.from === 'user' ? (
                    <div className="prose dark:prose-invert max-w-none">{version.content}</div>
                  ) : (
                    <MessageWithCitations
                      content={version.content}
                      citations={version.citations}
                      reasoning={version.reasoning}
                    />
                  )}

                  {/* Voice playback button */}
                  {message.from === 'assistant' && version.audioUrl && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(version.audioUrl!, version.id)}
                        className="gap-2"
                      >
                        {playingAudio === version.id ? (
                          <>
                            <X className="size-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-4" />
                            Play Voice
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Video playback button */}
                  {message.from === 'assistant' && version.videoUrl && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playVideo(version.videoUrl!, version.id)}
                        className="gap-2"
                      >
                        {playingVideo === version.id ? (
                          <>
                            <X className="size-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="size-4" />
                            Play Video
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Streaming indicator */}
                  {streamingMessageId === version.id && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}

          <div ref={messagesEndRef} />
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask me anything..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={status === 'streaming'}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                {/* Keyboard shortcut hint */}
                <span className="text-xs text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send,{' '}
                  <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift+Enter</kbd> for
                  newline
                </span>
              </PromptInputTools>
              <PromptInputSubmit
                status={status}
                disabled={!text.trim() || status === 'streaming'}
              />
            </PromptInputFooter>
          </PromptInput>

          {status === 'error' && (
            <div className="mt-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <strong>Error:</strong> Failed to get response. Please try again.
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio/video players */}
      <audio ref={audioRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}
