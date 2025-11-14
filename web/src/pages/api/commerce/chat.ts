/**
 * Commerce Chat API
 *
 * Handles conversation messages, intent parsing, and product recommendations
 */

import type { APIRoute } from 'astro';
import type {
  ChatResponse,
  CustomerNeeds,
  Product,
  ProductRecommendation,
  ConversationMessage,
} from '@/lib/types/commerce';
import { getAllProducts, getProductsByCategory } from '@/lib/data/products-multi-category';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, message, conversationHistory, category } = body;

    // Extract intent and needs from message
    const extractedNeeds = extractCustomerNeeds(message, conversationHistory);

    // Detect category if not provided
    const detectedCategory = category || detectProductCategory(message);

    // Get product recommendations
    const recommendations = await getProductRecommendations(
      message,
      extractedNeeds,
      conversationHistory,
      detectedCategory
    );

    // Generate response
    const response = generateResponse(
      message,
      extractedNeeds,
      recommendations,
      detectedCategory
    );

    const chatResponse: ChatResponse = {
      message: response,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      extractedNeeds,
    };

    return new Response(JSON.stringify(chatResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({
        message:
          "I'm sorry, I'm having trouble processing that. Could you rephrase?",
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Detect product category from message
function detectProductCategory(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  // Padel/racket keywords
  if (
    lowerMessage.includes('racket') ||
    lowerMessage.includes('padel') ||
    lowerMessage.includes('tennis elbow')
  ) {
    return 'padel_racket';
  }

  // Course/learning keywords
  if (
    lowerMessage.includes('course') ||
    lowerMessage.includes('learn') ||
    lowerMessage.includes('tutorial') ||
    lowerMessage.includes('bootcamp') ||
    lowerMessage.includes('programming') ||
    lowerMessage.includes('web dev')
  ) {
    return 'course';
  }

  // Software/SaaS keywords
  if (
    lowerMessage.includes('software') ||
    lowerMessage.includes('saas') ||
    lowerMessage.includes('project management') ||
    lowerMessage.includes('tool')
  ) {
    return 'software';
  }

  return undefined;
}

// Extract customer needs from message
function extractCustomerNeeds(
  message: string,
  history: ConversationMessage[]
): Partial<CustomerNeeds> {
  const needs: Partial<CustomerNeeds> = {};
  const lowerMessage = message.toLowerCase();

  // Extract skill level
  if (
    lowerMessage.includes('beginner') ||
    lowerMessage.includes('new to') ||
    lowerMessage.includes('first time') ||
    lowerMessage.includes('starting out')
  ) {
    needs.skillLevel = 'beginner';
  } else if (
    lowerMessage.includes('intermediate') ||
    lowerMessage.includes('regular player') ||
    lowerMessage.includes('play weekly')
  ) {
    needs.skillLevel = 'intermediate';
  } else if (
    lowerMessage.includes('advanced') ||
    lowerMessage.includes('pro') ||
    lowerMessage.includes('competitive') ||
    lowerMessage.includes('tournament')
  ) {
    needs.skillLevel = 'advanced';
  }

  // Extract budget
  const budgetMatch = message.match(/\$?€?(\d+)/g);
  if (budgetMatch) {
    const amounts = budgetMatch.map((m) =>
      parseInt(m.replace(/\$|€/g, ''))
    );
    if (amounts.length === 1) {
      needs.budget = { min: 0, max: amounts[0] };
    } else if (amounts.length >= 2) {
      needs.budget = { min: Math.min(...amounts), max: Math.max(...amounts) };
    }
  }

  // Extract playing style
  if (
    lowerMessage.includes('aggressive') ||
    lowerMessage.includes('attack') ||
    lowerMessage.includes('power')
  ) {
    needs.playingStyle = 'aggressive';
  } else if (
    lowerMessage.includes('defensive') ||
    lowerMessage.includes('control') ||
    lowerMessage.includes('consistent')
  ) {
    needs.playingStyle = 'defensive';
  } else if (
    lowerMessage.includes('balanced') ||
    lowerMessage.includes('all-around') ||
    lowerMessage.includes('versatile')
  ) {
    needs.playingStyle = 'balanced';
  }

  // Extract pain points
  const painPoints: string[] = [];
  if (
    lowerMessage.includes('tennis elbow') ||
    lowerMessage.includes('arm pain') ||
    lowerMessage.includes('elbow')
  ) {
    painPoints.push('tennis elbow');
  }
  if (
    lowerMessage.includes('wrist') ||
    lowerMessage.includes('shoulder pain')
  ) {
    painPoints.push('joint pain');
  }
  if (lowerMessage.includes('control') && lowerMessage.includes('lack')) {
    painPoints.push('lack of control');
  }
  if (painPoints.length > 0) {
    needs.painPoints = painPoints;
  }

  // Extract preferences
  const preferences: string[] = [];
  if (lowerMessage.includes('lightweight') || lowerMessage.includes('light')) {
    preferences.push('lightweight');
  }
  if (lowerMessage.includes('spin')) {
    preferences.push('good spin');
  }
  if (lowerMessage.includes('durable') || lowerMessage.includes('last long')) {
    preferences.push('durable');
  }
  if (lowerMessage.includes('soft')) {
    preferences.push('soft feel');
  }
  if (preferences.length > 0) {
    needs.preferences = preferences;
  }

  return needs;
}

// Get product recommendations based on needs
async function getProductRecommendations(
  message: string,
  needs: Partial<CustomerNeeds>,
  history: ConversationMessage[],
  category?: string
): Promise<ProductRecommendation[]> {
  // Get products from database based on category
  const products = category ? getProductsByCategory(category) : getAllProducts();

  if (products.length === 0) {
    return [];
  }

  // Remove mock data - using real products now
  /* OLD MOCK DATA:
  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'StarVie Metheora Warrior',
      price: 139,
      currency: '€',
      description:
        'Unique carbon-fiber racket with soft core for power without harsh vibrations',
      image: '/images/products/racket-1.jpg',
      category: 'padel_racket',
      rating: 4.9,
      reviewCount: 127,
      inStock: true,
      aiDescription:
        'Perfect for aggressive intermediate players with elbow sensitivity',
      aiUseCases: ['aggressive play', 'elbow-friendly', 'power with control'],
      aiTargetAudience: ['intermediate', 'advanced'],
      aiBestFor:
        'Aggressive players who need power without vibration-induced injuries',
      aiAvoidWhen: 'Looking for maximum control over power',
      aiComparisonPoints: {
        weight: '360g - lighter than average for faster swings',
        sweetSpot: 'Large sweet spot - very forgiving',
        balance: 'Head-light - easier maneuverability',
        vibration: 'Soft core - minimal arm stress',
      },
      aiKeywords: [
        'power',
        'soft',
        'elbow-friendly',
        'intermediate',
        'carbon fiber',
      ],
      aiSimilarProducts: ['prod-2', 'prod-3'],
      aiOftenBoughtWith: ['grip-1', 'strings-1', 'bag-1'],
      aiUpgradeTo: [],
      attributes: {
        weight: '360g',
        balance: 'head-light',
        core: 'soft EVA',
        material: 'carbon fiber',
      },
    },
    {
      id: 'prod-2',
      name: 'Bullpadel Vertex 03',
      price: 179,
      currency: '€',
      description:
        'Premium diamond-shaped racket for maximum power and aggressive play',
      image: '/images/products/racket-2.jpg',
      category: 'padel_racket',
      rating: 4.7,
      reviewCount: 89,
      inStock: true,
      aiDescription: 'Top choice for advanced aggressive players',
      aiUseCases: ['competitive play', 'maximum power', 'offensive game'],
      aiTargetAudience: ['advanced'],
      aiBestFor: 'Advanced players seeking maximum power',
      aiAvoidWhen: 'Beginner or have elbow issues',
      aiComparisonPoints: {
        weight: '385g - heavier for more power',
        sweetSpot: 'Small sweet spot - requires precision',
        balance: 'Head-heavy - maximum power',
        vibration: 'Firm - more feedback but harsh on arm',
      },
      aiKeywords: ['power', 'advanced', 'diamond', 'competition'],
      aiSimilarProducts: ['prod-1'],
      aiOftenBoughtWith: ['grip-2', 'strings-2'],
      aiUpgradeTo: [],
      attributes: {
        weight: '385g',
        balance: 'head-heavy',
        core: 'hard EVA',
        material: 'carbon fiber',
      },
    },
    {
      id: 'prod-3',
      name: 'Nox ML10 Pro Cup',
      price: 99,
      currency: '€',
      description:
        'Excellent beginner to intermediate racket with forgiving sweet spot',
      image: '/images/products/racket-3.jpg',
      category: 'padel_racket',
      rating: 4.6,
      reviewCount: 203,
      inStock: true,
      aiDescription: 'Best value for beginners and intermediate players',
      aiUseCases: ['learning', 'recreational play', 'budget-friendly'],
      aiTargetAudience: ['beginner', 'intermediate'],
      aiBestFor: 'Beginners or budget-conscious intermediate players',
      aiAvoidWhen: 'Looking for competition-level performance',
      aiComparisonPoints: {
        weight: '365g - comfortable for extended play',
        sweetSpot: 'Extra-large sweet spot - very forgiving',
        balance: 'Balanced - versatile for all styles',
        vibration: 'Medium soft - good comfort',
      },
      aiKeywords: ['beginner', 'value', 'forgiving', 'versatile'],
      aiSimilarProducts: ['prod-1'],
      aiOftenBoughtWith: ['grip-1', 'strings-3'],
      aiUpgradeTo: ['prod-1', 'prod-2'],
      attributes: {
        weight: '365g',
        balance: 'balanced',
        core: 'medium EVA',
        material: 'fiberglass',
      },
    },
  ]; */

  // Score products based on needs
  const scoredProducts = products.map((product) => {
    let score = 0;
    let reasoning = '';

    // Skill level matching
    if (needs.skillLevel && product.aiTargetAudience.includes(needs.skillLevel)) {
      score += 30;
    }

    // Budget matching
    if (needs.budget && product.price <= needs.budget.max) {
      score += 20;
      if (product.price >= needs.budget.min) {
        score += 10;
      }
    }

    // Pain point addressing
    if (needs.painPoints?.includes('tennis elbow')) {
      if (product.aiKeywords.includes('elbow-friendly') || product.aiKeywords.includes('soft')) {
        score += 40;
        reasoning =
          "This racket has a soft core that dampens vibrations, making it perfect for players with tennis elbow. The carbon fiber construction provides power without harsh impact on your arm.";
      } else if (product.attributes.core === 'hard EVA') {
        score -= 30; // Penalize hard rackets for elbow issues
      }
    }

    // Playing style matching
    if (needs.playingStyle === 'aggressive' && product.aiKeywords.includes('power')) {
      score += 25;
    }
    if (needs.playingStyle === 'defensive' && product.aiKeywords.includes('control')) {
      score += 25;
    }

    // Default reasoning if not set
    if (!reasoning) {
      reasoning = `${product.aiBestFor}. ${product.aiDescription}`;
    }

    return {
      product,
      score,
      reasoning,
      confidenceScore: Math.min(score / 100, 1),
    };
  });

  // Sort by score and take top 3
  const topProducts = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter((p) => p.score > 20); // Only include if reasonable match

  // Convert to recommendations
  const recommendations: ProductRecommendation[] = topProducts.map((p, index) => ({
    product: p.product,
    reasoning: p.reasoning,
    confidenceScore: p.confidenceScore,
    type: index === 0 ? 'primary' : 'alternative',
  }));

  return recommendations;
}

// Generate conversational response
function generateResponse(
  message: string,
  needs: Partial<CustomerNeeds>,
  recommendations: ProductRecommendation[],
  category?: string
): string {
  const lowerMessage = message.toLowerCase();

  // Detect conflicts (e.g., power + tennis elbow)
  if (
    needs.playingStyle === 'aggressive' &&
    needs.painPoints?.includes('tennis elbow')
  ) {
    return "Great question! For aggressive players with elbow sensitivity, the key is finding a 'soft power' racket. You want the ability to hit hard without the harsh vibrations that aggravate tennis elbow. Let me show you some options that balance both needs.";
  }

  // Budget question
  if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
    if (needs.budget) {
      return `I understand budget is important. Based on your range of €${needs.budget.min}-€${needs.budget.max}, here are the best options that don't compromise on quality:`;
    }
    return "I can help you find great value! What's your budget range?";
  }

  // First-time buyer
  if (needs.skillLevel === 'beginner') {
    return "Perfect! For beginners, you want a racket with a large sweet spot that's forgiving on mis-hits, and not too heavy so you can play longer without fatigue. Here are my top recommendations:";
  }

  // Has specific needs
  if (recommendations.length > 0) {
    let response = "Based on what you've told me, here's what I recommend:\n\n";

    if (needs.skillLevel) {
      response += `For a ${needs.skillLevel} player`;
      if (needs.playingStyle) {
        response += ` with an ${needs.playingStyle} style`;
      }
      response += ', ';
    }

    if (needs.painPoints && needs.painPoints.length > 0) {
      response += `and considering your ${needs.painPoints.join(', ')}, `;
    }

    response += "I've found some excellent matches:";

    return response;
  }

  // Need more information
  return "I'd love to help you find the perfect racket! To make the best recommendation, could you tell me:\n\n1. What's your skill level? (beginner, intermediate, advanced)\n2. Do you play more aggressively or defensively?\n3. What's your budget range?\n4. Any specific concerns? (e.g., arm pain, control, power)";
}
