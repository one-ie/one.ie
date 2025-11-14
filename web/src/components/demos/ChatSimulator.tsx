/**
 * Chat Simulator Component
 *
 * Simulates a ChatGPT-style interface with typing animations
 */

import { useStore } from '@nanostores/react';
import { useEffect, useRef, useState } from 'react';
import {
  messages,
  isTyping,
  demoStage,
  sendMessage,
  selectProduct,
  startCheckout,
  type Message,
} from '@/stores/buyInChatGPTDemo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Sparkles, User, ShoppingCart } from 'lucide-react';
import { ProductRecommendationCard } from './ProductRecommendationCard';

export function ChatSimulator() {
  const allMessages = useStore(messages);
  const typing = useStore(isTyping);
  const stage = useStore(demoStage);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, typing]);

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedResponse = (text: string) => {
    setInput(text);
  };

  // Suggested responses based on stage
  const getSuggestedResponses = () => {
    switch (stage) {
      case 'welcome':
        return [
          'I need a gift for a friend',
          'Looking for something under $50',
          'Help me find a unique present',
        ];
      case 'qualifying':
        return [
          'Budget: $50, Birthday gift, Loves coffee',
          'Around $40, Just because, Creative person',
          'Under $60, Thank you gift, Wellness focused',
        ];
      case 'selected':
        return ['Yes, proceed with checkout', 'Tell me more about shipping'];
      default:
        return [];
    }
  };

  const suggestedResponses = getSuggestedResponses();

  return (
    <Card className="h-[600px] flex flex-col shadow-xl">
      {/* Chat Header */}
      <div className="flex-none border-b p-4 bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="bg-gradient-to-br from-purple-500 to-blue-500">
            <AvatarFallback className="text-white">
              <Sparkles className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">AI Shopping Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Powered by GPT-4 • Always available
            </p>
          </div>
          <Badge className="ml-auto" variant="secondary">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none border-t p-4 bg-background">
        {/* Suggested Responses */}
        {suggestedResponses.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedResponse(response)}
                className="text-xs"
              >
                {response}
              </Button>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              stage === 'confirmed'
                ? 'Demo complete! Click Reset to try again.'
                : 'Type your message...'
            }
            disabled={typing || stage === 'confirmed'}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || typing || stage === 'confirmed'}
            size="icon"
          >
            {typing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const stage = useStore(demoStage);

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
    >
      <div
        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {/* Message Avatar */}
        <div className="flex items-start gap-2 mb-1">
          {!isUser && (
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-1" />
          )}
          {isUser && (
            <User className="w-4 h-4 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              {isUser ? 'You' : 'AI Assistant'}
            </p>
          </div>
        </div>

        {/* Message Content */}
        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

        {/* Product Recommendations */}
        {message.products && message.products.length > 0 && (
          <div className="mt-4 space-y-3">
            {message.products.map((product) => (
              <ProductRecommendationCard
                key={product.id}
                product={product}
                onSelect={() => selectProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Checkout Button */}
        {stage === 'selected' && !isUser && message.content.includes('proceed') && (
          <div className="mt-3">
            <Button
              onClick={() => startCheckout()}
              size="sm"
              className="w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Checkout Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
