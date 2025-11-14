/**
 * Commerce Chat Interface
 *
 * Conversational commerce chat component with product recommendations,
 * intent parsing, and purchase facilitation
 */

import { useState, useEffect, useRef } from 'react';
import type {
  ConversationSession,
  ConversationMessage,
  ChatResponse,
  Product,
  ProductRecommendation,
} from '@/lib/types/commerce';
import { ProductCardChat } from './ProductCardChat';
import { RecommendationSection } from './RecommendationSection';
import { PreferencesDisplay } from './PreferencesDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, ShoppingCart } from 'lucide-react';

interface CommerceChatInterfaceProps {
  sessionId?: string;
  platform?: 'web' | 'chatgpt' | 'claude' | 'gemini';
  category?: string;
  onPurchase?: (productId: string) => void;
}

export function CommerceChatInterface({
  sessionId,
  platform = 'web',
  category,
  onPurchase,
}: CommerceChatInterfaceProps) {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session
    initializeSession();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/commerce/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, category }),
      });
      const data = await response.json();
      setSession(data.session);

      // Add welcome message
      const welcomeMessage: ConversationMessage = {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(category),
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const getWelcomeMessage = (category?: string): string => {
    if (category === 'padel_racket') {
      return "Hi! I'm your padel equipment advisor. I'll help you find the perfect racket. Tell me what you're looking for, or I can ask you a few questions to understand your needs better.";
    }
    if (category === 'course') {
      return "Hi! I'm your learning path advisor. I'll help you find the perfect course to achieve your goals. What skills are you looking to develop?";
    }
    return "Hi! I'm your product advisor. How can I help you find exactly what you need today?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !session) return;

    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/commerce/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: input.trim(),
          conversationHistory: messages,
        }),
      });

      const data: ChatResponse = await response.json();

      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        recommendations: data.recommendations,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update session with extracted needs
      if (data.extractedNeeds) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                inferredNeeds: { ...prev.inferredNeeds, ...data.extractedNeeds },
              }
            : null
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ConversationMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProductAction = (action: string, productId: string) => {
    if (action === 'buy_now' && onPurchase) {
      onPurchase(productId);
    } else if (action === 'view_details') {
      window.open(`/products/${productId}`, '_blank');
    } else if (action === 'add_to_cart') {
      // Add to cart logic
      console.log('Add to cart:', productId);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-none p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Product Advisor</h2>
            <p className="text-sm text-muted-foreground">
              Get expert recommendations through conversation
            </p>
          </div>
          {session && session.inferredNeeds && (
            <PreferencesDisplay needs={session.inferredNeeds} />
          )}
        </div>
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

              {/* Product Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <RecommendationSection
                  recommendations={message.recommendations}
                  onAction={handleProductAction}
                />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what you're looking for..."
              disabled={isLoading}
              className="resize-none"
            />
          </div>
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
            {getSuggestedPrompts(category).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getSuggestedPrompts(category?: string): string[] {
  if (category === 'padel_racket') {
    return [
      "I'm a beginner looking for my first racket",
      "I need a racket for aggressive play",
      "I have tennis elbow, what do you recommend?",
      "What's the best racket under €100?",
    ];
  }
  if (category === 'course') {
    return [
      "I want to learn web development",
      "Best course for career change to tech",
      "I'm a beginner with limited time",
      "Advanced JavaScript courses",
    ];
  }
  return [
    "What's popular right now?",
    "I'm looking for something specific",
    "Can you help me compare options?",
    "What do you recommend for beginners?",
  ];
}
