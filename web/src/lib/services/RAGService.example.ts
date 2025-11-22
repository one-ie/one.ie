/**
 * RAG Service - Usage Examples
 *
 * Demonstrates how to use the RAG service in different scenarios
 */

import {
  createOpenAIRAG,
  createClaudeRAG,
  createOpenRouterRAG,
  type RAGRequest,
  type RAGResponse,
} from './RAGService';
import {
  getPresetConfig,
  type PersonalityType,
} from '../ai/prompts/clone-system-prompts';
import type { Id } from '../../../backend/convex/_generated/dataModel';

// ============================================================================
// EXAMPLE 1: Basic Query
// ============================================================================

export async function basicQueryExample(convexClient: any) {
  // Create RAG service with OpenAI GPT-4
  const rag = createOpenAIRAG(convexClient, {
    topK: 5,
    minScore: 0.3,
    temperature: 0.7,
  });

  // Execute RAG query
  const result = await rag.query({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'What are the best practices for content marketing?',
    systemPromptConfig: {
      cloneName: 'Marketing AI',
      creatorName: 'Sarah Johnson',
      personality: 'professional',
      expertise: ['Content Marketing', 'SEO', 'Social Media'],
    },
  });

  console.log('Response:', result.response);
  console.log('Citations:', result.citations);
  console.log('Relevance Score:', result.metadata.retrievalScore);
  console.log('Latency:', result.metadata.latencyMs, 'ms');

  return result;
}

// ============================================================================
// EXAMPLE 2: Streaming Response
// ============================================================================

export async function streamingExample(convexClient: any) {
  const rag = createClaudeRAG(convexClient, {
    stream: true,
    model: 'claude-3-opus-20240229',
  });

  const result = await rag.queryStream({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'Explain quantum computing in simple terms',
  });

  // Process streaming response
  const reader = result.stream.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      console.log('Chunk:', chunk);

      // In a real UI, you'd update the display here
      // updateUI(fullResponse);
    }
  } finally {
    reader.releaseLock();
  }

  console.log('Full Response:', fullResponse);
  console.log('Citations:', result.citations);

  return { response: fullResponse, citations: result.citations };
}

// ============================================================================
// EXAMPLE 3: Conversation with History
// ============================================================================

export async function conversationExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient);

  // First turn
  const turn1 = await rag.query({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'What is machine learning?',
  });

  console.log('Turn 1:', turn1.response);

  // Second turn with history
  const turn2 = await rag.query({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'How does it differ from traditional programming?',
    conversationHistory: [
      { role: 'user', content: 'What is machine learning?' },
      { role: 'assistant', content: turn1.response },
    ],
  });

  console.log('Turn 2:', turn2.response);

  // Third turn
  const turn3 = await rag.query({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'Can you give me an example?',
    conversationHistory: [
      { role: 'user', content: 'What is machine learning?' },
      { role: 'assistant', content: turn1.response },
      { role: 'user', content: 'How does it differ from traditional programming?' },
      { role: 'assistant', content: turn2.response },
    ],
  });

  console.log('Turn 3:', turn3.response);

  return [turn1, turn2, turn3];
}

// ============================================================================
// EXAMPLE 4: Different Personality Types
// ============================================================================

export async function personalityExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient);

  const query = 'How do I grow my business?';
  const cloneId = 'clone-123' as Id<'things'>;
  const groupId = 'group-456' as Id<'groups'>;

  // Professional personality
  const professional = await rag.query({
    cloneId,
    groupId,
    query,
    systemPromptConfig: {
      cloneName: 'Business Coach',
      creatorName: 'John Smith',
      personality: 'professional',
      tone: 'formal',
    },
  });

  // Casual personality
  const casual = await rag.query({
    cloneId,
    groupId,
    query,
    systemPromptConfig: {
      cloneName: 'Startup Buddy',
      creatorName: 'Jane Doe',
      personality: 'casual',
      tone: 'conversational',
    },
  });

  // Technical personality
  const technical = await rag.query({
    cloneId,
    groupId,
    query,
    systemPromptConfig: {
      cloneName: 'Strategy AI',
      creatorName: 'Alex Chen',
      personality: 'technical',
      tone: 'direct',
    },
  });

  console.log('Professional:', professional.response);
  console.log('Casual:', casual.response);
  console.log('Technical:', technical.response);

  return { professional, casual, technical };
}

// ============================================================================
// EXAMPLE 5: Using Personality Presets
// ============================================================================

export async function presetExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient);

  const cloneId = 'clone-123' as Id<'things'>;
  const groupId = 'group-456' as Id<'groups'>;

  // Business coach preset
  const businessCoach = await rag.query({
    cloneId,
    groupId,
    query: 'How do I scale my startup?',
    systemPromptConfig: getPresetConfig('business_coach', 'Coach AI', 'Sarah Johnson'),
  });

  // Tech educator preset
  const techEducator = await rag.query({
    cloneId,
    groupId,
    query: 'What is React Server Components?',
    systemPromptConfig: getPresetConfig('tech_educator', 'Tech AI', 'John Smith'),
  });

  // Content creator preset
  const contentCreator = await rag.query({
    cloneId,
    groupId,
    query: 'How do I grow my YouTube channel?',
    systemPromptConfig: getPresetConfig('content_creator', 'Creator AI', 'Jane Doe'),
  });

  console.log('Business Coach:', businessCoach.response);
  console.log('Tech Educator:', techEducator.response);
  console.log('Content Creator:', contentCreator.response);

  return { businessCoach, techEducator, contentCreator };
}

// ============================================================================
// EXAMPLE 6: Multi-Provider Comparison
// ============================================================================

export async function multiProviderExample(convexClient: any) {
  const query = 'Explain blockchain in simple terms';
  const cloneId = 'clone-123' as Id<'things'>;
  const groupId = 'group-456' as Id<'groups'>;

  const request: RAGRequest = { cloneId, groupId, query };

  // Try all providers
  const gpt4 = createOpenAIRAG(convexClient, {
    model: 'gpt-4-turbo-preview',
  });

  const claude = createClaudeRAG(convexClient, {
    model: 'claude-3-opus-20240229',
  });

  const openrouter = createOpenRouterRAG(convexClient, {
    model: 'anthropic/claude-3-opus',
  });

  // Run in parallel
  const [gpt4Result, claudeResult, openrouterResult] = await Promise.all([
    gpt4.query(request),
    claude.query(request),
    openrouter.query(request),
  ]);

  console.log('GPT-4:', gpt4Result.response);
  console.log('Claude:', claudeResult.response);
  console.log('OpenRouter:', openrouterResult.response);

  // Compare metrics
  console.log('GPT-4 latency:', gpt4Result.metadata.latencyMs);
  console.log('Claude latency:', claudeResult.metadata.latencyMs);
  console.log('OpenRouter latency:', openrouterResult.metadata.latencyMs);

  return { gpt4Result, claudeResult, openrouterResult };
}

// ============================================================================
// EXAMPLE 7: Hybrid Search
// ============================================================================

export async function hybridSearchExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient, {
    hybridSearch: true, // Enable semantic + keyword search
    topK: 10, // Retrieve more candidates for reranking
  });

  const result = await rag.query({
    cloneId: 'clone-123' as Id<'things'>,
    groupId: 'group-456' as Id<'groups'>,
    query: 'machine learning algorithms neural networks',
  });

  console.log('Hybrid search result:', result.response);
  console.log('Chunks retrieved:', result.metadata.chunksRetrieved);
  console.log('Average relevance:', result.metadata.retrievalScore);

  return result;
}

// ============================================================================
// EXAMPLE 8: Error Handling
// ============================================================================

export async function errorHandlingExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient);

  try {
    const result = await rag.query({
      cloneId: 'invalid-clone' as Id<'things'>,
      groupId: 'invalid-group' as Id<'groups'>,
      query: 'Test query',
    });

    console.log('Result:', result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        console.error('API key configuration error');
        // Handle missing API key
      } else if (error.message.includes('API error')) {
        console.error('LLM provider error:', error.message);
        // Handle API errors
      } else if (error.message.includes('not found')) {
        console.error('Clone or group not found');
        // Handle invalid IDs
      } else {
        console.error('Unknown error:', error);
        // Handle other errors
      }
    }
  }
}

// ============================================================================
// EXAMPLE 9: Real-time Chat Integration
// ============================================================================

export class RAGChatSession {
  private rag: ReturnType<typeof createOpenAIRAG>;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private cloneId: Id<'things'>;
  private groupId: Id<'groups'>;

  constructor(
    convexClient: any,
    cloneId: Id<'things'>,
    groupId: Id<'groups'>,
    personality: PersonalityType = 'professional'
  ) {
    this.rag = createOpenAIRAG(convexClient, {
      stream: true,
    });
    this.cloneId = cloneId;
    this.groupId = groupId;
  }

  async sendMessage(message: string): Promise<RAGResponse> {
    // Query with conversation history
    const result = await this.rag.query({
      cloneId: this.cloneId,
      groupId: this.groupId,
      query: message,
      conversationHistory: this.conversationHistory,
    });

    // Update conversation history
    this.conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: result.response }
    );

    // Keep only last 10 turns to prevent context overflow
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return result;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return this.conversationHistory;
  }
}

// Usage:
export async function chatSessionExample(convexClient: any) {
  const chat = new RAGChatSession(
    convexClient,
    'clone-123' as Id<'things'>,
    'group-456' as Id<'groups'>,
    'friendly'
  );

  const msg1 = await chat.sendMessage('Hello! What topics can you help me with?');
  console.log('Bot:', msg1.response);

  const msg2 = await chat.sendMessage('Tell me about machine learning');
  console.log('Bot:', msg2.response);

  const msg3 = await chat.sendMessage('What are some practical applications?');
  console.log('Bot:', msg3.response);

  console.log('Full history:', chat.getHistory());

  return chat;
}

// ============================================================================
// EXAMPLE 10: Citation Display
// ============================================================================

export function displayCitations(result: RAGResponse) {
  console.log('\n=== Response ===');
  console.log(result.response);

  if (result.citations.length > 0) {
    console.log('\n=== Sources Referenced ===');
    result.citations.forEach((citation, index) => {
      console.log(`${index + 1}. ${citation.title}`);
      if (citation.url) {
        console.log(`   URL: ${citation.url}`);
      }
      if (citation.excerpt) {
        console.log(`   Excerpt: ${citation.excerpt.slice(0, 100)}...`);
      }
    });
  }

  console.log('\n=== Metadata ===');
  console.log(`Provider: ${result.metadata.provider}`);
  console.log(`Model: ${result.metadata.model}`);
  console.log(`Tokens Used: ${result.metadata.tokensUsed || 'N/A'}`);
  console.log(`Retrieval Score: ${(result.metadata.retrievalScore * 100).toFixed(1)}%`);
  console.log(`Latency: ${result.metadata.latencyMs}ms`);
  console.log(`Chunks Retrieved: ${result.metadata.chunksRetrieved}`);
}

// ============================================================================
// EXAMPLE 11: Performance Monitoring
// ============================================================================

export async function performanceMonitoringExample(convexClient: any) {
  const rag = createOpenAIRAG(convexClient);

  const queries = [
    'What is AI?',
    'How does machine learning work?',
    'Explain neural networks',
    'What are transformers in NLP?',
    'Tell me about GPT models',
  ];

  const results = [];

  for (const query of queries) {
    const result = await rag.query({
      cloneId: 'clone-123' as Id<'things'>,
      groupId: 'group-456' as Id<'groups'>,
      query,
    });

    results.push({
      query,
      latency: result.metadata.latencyMs,
      retrievalScore: result.metadata.retrievalScore,
      tokensUsed: result.metadata.tokensUsed,
      chunksRetrieved: result.metadata.chunksRetrieved,
    });
  }

  // Calculate averages
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  const avgRetrievalScore =
    results.reduce((sum, r) => sum + r.retrievalScore, 0) / results.length;
  const avgTokens =
    results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0) / results.length;

  console.log('Performance Summary:');
  console.log(`Average Latency: ${avgLatency.toFixed(0)}ms`);
  console.log(`Average Retrieval Score: ${(avgRetrievalScore * 100).toFixed(1)}%`);
  console.log(`Average Tokens: ${avgTokens.toFixed(0)}`);

  return { results, avgLatency, avgRetrievalScore, avgTokens };
}
