/**
 * Chat with Commerce Integration
 *
 * Enhanced chat that automatically detects product queries
 * and provides recommendations inline
 *
 * Use this as a reference for integrating commerce into existing chat
 */

import { useState, useRef, useEffect } from 'react';
import type {
  ConversationMessage,
  ProductRecommendation,
} from '@/lib/types/commerce';
import { RecommendationSection } from '@/components/commerce/RecommendationSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, ShoppingBag, MessageCircle } from 'lucide-react';

type ChatMode = 'general' | 'commerce' | 'auto';

export function ChatWithCommerce() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>('auto');
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session
    setSessionId(`session-${Date.now()}`);
    // Welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hi! I'm your AI assistant. I can help with general questions or product recommendations. What can I help you with today?",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectCommerceIntent = (message: string): boolean => {
    const commerceKeywords = [
      'buy',
      'purchase',
      'recommend',
      'looking for',
      'need',
      'racket',
      'course',
      'product',
      'shop',
      'price',
      'best',
      'compare',
    ];
    const lowerMessage = message.toLowerCase();
    return commerceKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine if this is a commerce query
      const isCommerce =
        mode === 'commerce' ||
        (mode === 'auto' && detectCommerceIntent(input));

      const endpoint = isCommerce
        ? '/api/commerce/chat'
        : '/api/chat/general'; // Your existing chat API

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: input.trim(),
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        recommendations: data.recommendations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProductAction = (action: string, productId: string) => {
    if (action === 'buy_now') {
      window.location.href = `/commerce-chat/checkout/${productId}?conv=${sessionId}`;
    } else if (action === 'view_details') {
      window.open(`/products/${productId}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with Mode Toggle */}
      <div className="flex-none p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI Chat</h2>
            <p className="text-sm text-muted-foreground">
              General assistance + product recommendations
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'general' ? 'default' : 'outline'}
              onClick={() => setMode('general')}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              General
            </Button>
            <Button
              size="sm"
              variant={mode === 'auto' ? 'default' : 'outline'}
              onClick={() => setMode('auto')}
            >
              ✨ Auto
            </Button>
            <Button
              size="sm"
              variant={mode === 'commerce' ? 'default' : 'outline'}
              onClick={() => setMode('commerce')}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Products
            </Button>
          </div>
        </div>

        {/* Mode Indicator */}
        {mode !== 'general' && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {mode === 'commerce'
                ? '🛍️ Product advisor mode active'
                : '✨ Auto-detecting product questions'}
            </Badge>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Product Recommendations (if any) */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3">
                  <RecommendationSection
                    recommendations={message.recommendations}
                    onAction={handleProductAction}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              mode === 'commerce'
                ? 'Tell me what product you\'re looking for...'
                : 'Ask me anything...'
            }
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('I need a padel racket for beginners')}
              className="text-xs"
            >
              🎾 Beginner racket
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('What\'s the weather like today?')}
              className="text-xs"
            >
              ☀️ Weather
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('I have tennis elbow, need soft racket')}
              className="text-xs"
            >
              🏥 Tennis elbow
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
