/**
 * Conversational Commerce Types
 *
 * Types for the ACP ChatGPT commerce system
 * Based on 6-dimension ontology
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  inStock: boolean;

  // AI-optimized fields
  aiDescription: string;
  aiUseCases: string[];
  aiTargetAudience: string[];
  aiBestFor: string;
  aiAvoidWhen: string;
  aiComparisonPoints: Record<string, string>;
  aiKeywords: string[];

  // Relationships
  aiSimilarProducts: string[];
  aiOftenBoughtWith: string[];
  aiUpgradeTo: string[];

  // Category-specific attributes
  attributes?: Record<string, any>;
}

export type ProductCategory =
  | 'padel_racket'
  | 'course'
  | 'clothing'
  | 'software'
  | 'electronics'
  | 'other';

export interface CustomerNeeds {
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  budget?: { min: number; max: number };
  playingStyle?: 'aggressive' | 'defensive' | 'balanced';
  painPoints?: string[];
  preferences?: string[];
  concerns?: string[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mentionedProducts?: string[];
  recommendations?: ProductRecommendation[];
}

export interface ProductRecommendation {
  product: Product;
  reasoning: string;
  confidenceScore: number;
  type: 'primary' | 'alternative' | 'upgrade' | 'complementary';
}

export interface ConversationSession {
  id: string;
  userId: string | null;
  platform: 'web' | 'chatgpt' | 'claude' | 'gemini';
  messages: ConversationMessage[];
  inferredNeeds: CustomerNeeds;
  suggestedProducts: string[];
  productsViewed: string[];
  productsAddedToCart: string[];
  ordersCompleted: string[];
  totalValue: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: number;
  endedAt?: number;
}

export interface ChatResponse {
  message: string;
  products?: Product[];
  recommendations?: ProductRecommendation[];
  clarifyingQuestion?: string;
  suggestedActions?: SuggestedAction[];
  extractedNeeds?: Partial<CustomerNeeds>;
}

export interface SuggestedAction {
  type: 'view_details' | 'add_to_cart' | 'buy_now' | 'compare' | 'ask_question';
  label: string;
  productId?: string;
}

export interface Conflict {
  type: 'style_vs_health' | 'budget_vs_preference' | 'skill_vs_product';
  description: string;
  clarifyingQuestion: string;
  resolution: string;
}

export interface AnalyticsMetrics {
  conversationsStarted: number;
  conversionsCompleted: number;
  conversionRate: number;
  averageOrderValue: number;
  averageConversationDuration: number;
  topProducts: Array<{ productId: string; mentions: number; purchases: number }>;
  customerSatisfaction: number;
}

export interface SalesAgentPersona {
  name: string;
  category: ProductCategory;
  tone: string;
  expertise: string[];
  questions: string[];
  systemPrompt: string;
}
