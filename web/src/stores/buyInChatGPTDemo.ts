/**
 * Buy in ChatGPT Demo Store
 *
 * Manages the complete demo flow with nanostores (frontend-only, no backend)
 */

import { atom, computed } from 'nanostores';

export type DemoStage =
  | 'welcome'
  | 'qualifying'
  | 'recommendations'
  | 'selected'
  | 'checkout'
  | 'confirmed';

export type SpeedSetting = 'slow' | 'normal' | 'fast';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  products?: Product[];
  typing?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  matchReason: string;
  inStock: boolean;
}

export interface Metrics {
  timeElapsed: number;
  stepsCompleted: number;
  conversionProbability: number;
}

// Core state
export const demoStage = atom<DemoStage>('welcome');
export const messages = atom<Message[]>([]);
export const selectedProduct = atom<Product | null>(null);
export const speedSetting = atom<SpeedSetting>('normal');
export const isTyping = atom(false);
export const showComparison = atom(false);

// Metrics
export const startTime = atom<number>(0);
export const metrics = atom<Metrics>({
  timeElapsed: 0,
  stepsCompleted: 0,
  conversionProbability: 0,
});

// Mock products
const mockProducts: Product[] = [
  {
    id: 'gift-1',
    name: 'Artisan Coffee Gift Set',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
    rating: 4.8,
    matchReason: 'Perfect for coffee lovers, beautifully packaged, under your budget',
    inStock: true,
  },
  {
    id: 'gift-2',
    name: 'Handcrafted Leather Journal',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop',
    rating: 4.9,
    matchReason: 'Thoughtful gift, high quality, great for creative minds',
    inStock: true,
  },
  {
    id: 'gift-3',
    name: 'Organic Tea Collection',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1597318281830-f3b8c41c8d74?w=400&h=400&fit=crop',
    rating: 4.7,
    matchReason: 'Wellness-focused, beautiful presentation, unique varieties',
    inStock: true,
  },
];

// Timing based on speed setting
const getTypingDelay = (setting: SpeedSetting): number => {
  switch (setting) {
    case 'slow': return 2000;
    case 'normal': return 1000;
    case 'fast': return 500;
  }
};

const getMessageDelay = (setting: SpeedSetting): number => {
  switch (setting) {
    case 'slow': return 3000;
    case 'normal': return 1500;
    case 'fast': return 750;
  }
};

// Actions
export function resetDemo() {
  demoStage.set('welcome');
  messages.set([]);
  selectedProduct.set(null);
  startTime.set(0);
  isTyping.set(false);
  metrics.set({
    timeElapsed: 0,
    stepsCompleted: 0,
    conversionProbability: 0,
  });
}

export function startDemo() {
  startTime.set(Date.now());
  demoStage.set('welcome');

  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm your shopping assistant. I can help you find the perfect product. What are you looking for today?",
    timestamp: Date.now(),
  };

  messages.set([welcomeMessage]);
  updateMetrics();
}

export async function sendMessage(content: string) {
  const currentMessages = messages.get();
  const speed = speedSetting.get();

  // Add user message
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: 'user',
    content,
    timestamp: Date.now(),
  };

  messages.set([...currentMessages, userMessage]);

  // Show typing indicator
  isTyping.set(true);
  await new Promise(resolve => setTimeout(resolve, getTypingDelay(speed)));

  // Determine response based on stage
  const stage = demoStage.get();
  let response: Message;

  if (stage === 'welcome') {
    // Move to qualifying
    demoStage.set('qualifying');
    response = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "Great! I'd love to help. A few quick questions:\n\n1. What's your budget?\n2. What's the occasion?\n3. Any preferences (hobbies, interests)?",
      timestamp: Date.now(),
    };
    updateMetrics(1, 20);
  } else if (stage === 'qualifying') {
    // Move to recommendations
    demoStage.set('recommendations');
    await new Promise(resolve => setTimeout(resolve, getMessageDelay(speed)));

    response = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "Perfect! Based on what you told me, I found 3 great options that match your needs:",
      timestamp: Date.now(),
      products: mockProducts,
    };
    updateMetrics(2, 50);
  } else {
    // Generic response
    response = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "I'm here to help! Feel free to ask anything.",
      timestamp: Date.now(),
    };
  }

  isTyping.set(false);
  messages.set([...messages.get(), response]);
}

export function selectProduct(product: Product) {
  selectedProduct.set(product);
  demoStage.set('selected');

  const selectedMessage: Message = {
    id: `selected-${Date.now()}`,
    role: 'assistant',
    content: `Excellent choice! The ${product.name} is perfect. Would you like to proceed with checkout?`,
    timestamp: Date.now(),
  };

  messages.set([...messages.get(), selectedMessage]);
  updateMetrics(3, 75);
}

export async function startCheckout() {
  demoStage.set('checkout');
  const speed = speedSetting.get();

  const checkoutMessage: Message = {
    id: `checkout-${Date.now()}`,
    role: 'assistant',
    content: "Great! I'll process your order now. Your address is pre-filled from your profile. Processing payment...",
    timestamp: Date.now(),
  };

  messages.set([...messages.get(), checkoutMessage]);

  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, getMessageDelay(speed) * 2));

  demoStage.set('confirmed');

  const confirmMessage: Message = {
    id: `confirm-${Date.now()}`,
    role: 'assistant',
    content: "🎉 Order confirmed! Your order will arrive in 2-3 business days. Thank you for shopping!",
    timestamp: Date.now(),
  };

  messages.set([...messages.get(), confirmMessage]);
  updateMetrics(4, 100);
}

function updateMetrics(stepsCompleted?: number, conversionProbability?: number) {
  const start = startTime.get();
  const current = metrics.get();

  metrics.set({
    timeElapsed: start ? Math.floor((Date.now() - start) / 1000) : 0,
    stepsCompleted: stepsCompleted ?? current.stepsCompleted,
    conversionProbability: conversionProbability ?? current.conversionProbability,
  });
}

// Update time elapsed every second
if (typeof window !== 'undefined') {
  setInterval(() => {
    const start = startTime.get();
    if (start > 0 && demoStage.get() !== 'confirmed') {
      updateMetrics();
    }
  }, 1000);
}

// Computed values
export const timeFormatted = computed(metrics, (m) => {
  const minutes = Math.floor(m.timeElapsed / 60);
  const seconds = m.timeElapsed % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

export const progressPercentage = computed(metrics, (m) => {
  return (m.stepsCompleted / 4) * 100;
});
