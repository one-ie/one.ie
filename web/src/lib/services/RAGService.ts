/**
 * RAG Service - Retrieval-Augmented Generation Pipeline
 *
 * Implements complete RAG pipeline for AI clones:
 * 1. RETRIEVAL - Semantic search for relevant knowledge chunks
 * 2. AUGMENTATION - Inject chunks into system prompt
 * 3. GENERATION - LLM call with augmented prompt
 *
 * Supports multiple LLM providers: OpenAI GPT-4, Anthropic Claude, OpenRouter
 * Tracks citations and logs all operations for debugging
 */

// Import Convex types (may need adjustment based on project structure)
// import { api } from '../../../backend/convex/_generated/api';
// import type { Id } from '../../../backend/convex/_generated/dataModel';

// Temporary type definitions until Convex types are generated
type Id<T extends string> = string & { __tableName: T };
import {
  type SystemPromptConfig,
  getBaseSystemPrompt,
  createAugmentedPrompt,
  type ContextChunk,
  formatCitations,
  type Citation,
} from '../ai/prompts/clone-system-prompts';

// ============================================================================
// TYPES
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic' | 'openrouter';

export interface RAGConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topK?: number; // Number of chunks to retrieve
  minScore?: number; // Minimum relevance score (0-1)
  stream?: boolean; // Enable streaming responses
  hybridSearch?: boolean; // Use hybrid semantic + keyword search
}

export interface RAGRequest {
  cloneId: Id<'things'>;
  groupId: Id<'groups'>;
  query: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPromptConfig?: SystemPromptConfig;
}

export interface RAGResponse {
  response: string;
  citations: Citation[];
  chunksUsed: string[]; // Chunk IDs that were retrieved
  metadata: {
    provider: LLMProvider;
    model: string;
    tokensUsed?: number;
    retrievalScore: number; // Average relevance score
    latencyMs: number;
    chunksRetrieved: number;
  };
}

export interface StreamingRAGResponse {
  stream: ReadableStream<string>;
  citations: Citation[];
  chunksUsed: string[];
  metadata: RAGResponse['metadata'];
}

// ============================================================================
// RAG SERVICE CLASS
// ============================================================================

export class RAGService {
  private config: RAGConfig;
  private convex: any; // Convex client instance

  constructor(config: RAGConfig, convexClient: any) {
    this.config = config;
    this.convex = convexClient;
  }

  /**
   * Execute complete RAG pipeline
   * Returns generated response with citations
   */
  async query(request: RAGRequest): Promise<RAGResponse> {
    const startTime = Date.now();

    try {
      // STEP 1: RETRIEVAL - Get relevant knowledge chunks
      const retrievalResult = await this.retrieve(
        request.query,
        request.cloneId,
        request.groupId
      );

      if (retrievalResult.chunks.length === 0) {
        // No relevant context found - use base knowledge only
        return this.generateWithoutContext(request, startTime);
      }

      // STEP 2: AUGMENTATION - Inject context into prompt
      const augmentedPrompt = this.augment(
        request,
        retrievalResult.chunks,
        retrievalResult.avgScore
      );

      // STEP 3: GENERATION - Call LLM with augmented prompt
      const generationResult = await this.generate(augmentedPrompt, this.config.stream || false);

      // STEP 4: CITATIONS - Build citation list
      const citations = await this.getCitations(retrievalResult.chunkIds);

      const latencyMs = Date.now() - startTime;

      // STEP 5: LOG - Track RAG operation for debugging
      await this.logRAGOperation({
        cloneId: request.cloneId,
        groupId: request.groupId,
        query: request.query,
        chunksRetrieved: retrievalResult.chunks.length,
        avgRelevance: retrievalResult.avgScore,
        provider: this.config.provider,
        model: this.config.model,
        latencyMs,
        success: true,
      });

      return {
        response: generationResult.text,
        citations,
        chunksUsed: retrievalResult.chunkIds,
        metadata: {
          provider: this.config.provider,
          model: this.config.model,
          tokensUsed: generationResult.tokensUsed,
          retrievalScore: retrievalResult.avgScore,
          latencyMs,
          chunksRetrieved: retrievalResult.chunks.length,
        },
      };
    } catch (error) {
      // Log failed operation
      await this.logRAGOperation({
        cloneId: request.cloneId,
        groupId: request.groupId,
        query: request.query,
        chunksRetrieved: 0,
        avgRelevance: 0,
        provider: this.config.provider,
        model: this.config.model,
        latencyMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Execute RAG pipeline with streaming response
   */
  async queryStream(request: RAGRequest): Promise<StreamingRAGResponse> {
    const startTime = Date.now();

    // STEP 1: RETRIEVAL
    const retrievalResult = await this.retrieve(request.query, request.cloneId, request.groupId);

    // STEP 2: AUGMENTATION
    const augmentedPrompt = this.augment(request, retrievalResult.chunks, retrievalResult.avgScore);

    // STEP 3: GENERATION (streaming)
    const stream = await this.generateStream(augmentedPrompt);

    // STEP 4: CITATIONS
    const citations = await this.getCitations(retrievalResult.chunkIds);

    const latencyMs = Date.now() - startTime;

    return {
      stream,
      citations,
      chunksUsed: retrievalResult.chunkIds,
      metadata: {
        provider: this.config.provider,
        model: this.config.model,
        retrievalScore: retrievalResult.avgScore,
        latencyMs,
        chunksRetrieved: retrievalResult.chunks.length,
      },
    };
  }

  // ==========================================================================
  // STEP 1: RETRIEVAL
  // ==========================================================================

  /**
   * Retrieve relevant knowledge chunks using semantic search
   */
  private async retrieve(
    query: string,
    cloneId: Id<'things'>,
    groupId: Id<'groups'>
  ): Promise<{
    chunks: ContextChunk[];
    chunkIds: string[];
    avgScore: number;
  }> {
    // Use hybrid search if enabled, otherwise semantic search
    const queryName = this.config.hybridSearch ? 'hybridSearch' : 'retrieveContext';

    // TODO: Replace with actual Convex query call once generated types are available
    // const result = await this.convex.query(api.queries['rag-retrieve'][queryName], {
    //   query,
    //   cloneId,
    //   groupId,
    //   topK: this.config.topK || 5,
    //   filters: {
    //     minScore: this.config.minScore || 0.3,
    //   },
    // });

    // Temporary mock for type checking
    const result: any = {
      chunks: [],
      totalFound: 0,
      query,
      retrievedAt: Date.now(),
    };

    // Transform to ContextChunk format
    const chunks: ContextChunk[] = result.chunks.map((chunk: any) => ({
      text: chunk.text,
      score: chunk.score,
      source: chunk.source
        ? {
            title: chunk.source.name,
            url: chunk.source.url,
            type: chunk.source.type,
          }
        : undefined,
    }));

    const chunkIds = result.chunks.map((chunk: any) => chunk.chunkId);

    const avgScore =
      chunks.length > 0 ? chunks.reduce((sum, c) => sum + (c.score || 0), 0) / chunks.length : 0;

    return {
      chunks,
      chunkIds,
      avgScore,
    };
  }

  // ==========================================================================
  // STEP 2: AUGMENTATION
  // ==========================================================================

  /**
   * Augment prompt with retrieved context
   */
  private augment(
    request: RAGRequest,
    chunks: ContextChunk[],
    avgScore: number
  ): {
    system: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  } {
    // Get system prompt (use provided config or default)
    const systemPrompt = request.systemPromptConfig
      ? getBaseSystemPrompt(request.systemPromptConfig)
      : this.getDefaultSystemPrompt();

    // Create augmented prompt with context injection
    return createAugmentedPrompt({
      systemPrompt,
      userQuery: request.query,
      contextChunks: chunks,
      conversationHistory: request.conversationHistory,
    });
  }

  // ==========================================================================
  // STEP 3: GENERATION
  // ==========================================================================

  /**
   * Generate response using configured LLM provider
   */
  private async generate(
    prompt: { system: string; messages: Array<{ role: string; content: string }> },
    stream: boolean
  ): Promise<{ text: string; tokensUsed?: number }> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAI(prompt, stream);

      case 'anthropic':
        return this.generateAnthropic(prompt, stream);

      case 'openrouter':
        return this.generateOpenRouter(prompt, stream);

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Generate streaming response
   */
  private async generateStream(prompt: {
    system: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<ReadableStream<string>> {
    switch (this.config.provider) {
      case 'openai':
        return this.generateOpenAIStream(prompt);

      case 'anthropic':
        return this.generateAnthropicStream(prompt);

      case 'openrouter':
        return this.generateOpenRouterStream(prompt);

      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * OpenAI GPT-4 generation
   */
  private async generateOpenAI(
    prompt: { system: string; messages: Array<{ role: string; content: string }> },
    stream: boolean
  ): Promise<{ text: string; tokensUsed?: number }> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: prompt.messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  /**
   * OpenAI streaming generation
   */
  private async generateOpenAIStream(prompt: {
    system: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<ReadableStream<string>> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: prompt.messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return this.transformStream(response.body!);
  }

  /**
   * Anthropic Claude generation
   */
  private async generateAnthropic(
    prompt: { system: string; messages: Array<{ role: string; content: string }> },
    stream: boolean
  ): Promise<{ text: string; tokensUsed?: number }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: prompt.messages.filter((m) => m.role !== 'system'),
        system: prompt.system,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.content[0].text,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  }

  /**
   * Anthropic streaming generation
   */
  private async generateAnthropicStream(prompt: {
    system: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<ReadableStream<string>> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: prompt.messages.filter((m) => m.role !== 'system'),
        system: prompt.system,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    return this.transformStream(response.body!);
  }

  /**
   * OpenRouter generation (access to multiple models)
   */
  private async generateOpenRouter(
    prompt: { system: string; messages: Array<{ role: string; content: string }> },
    stream: boolean
  ): Promise<{ text: string; tokensUsed?: number }> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://one.ie',
        'X-Title': 'ONE Platform AI Clone',
      },
      body: JSON.stringify({
        model: this.config.model || 'anthropic/claude-3-opus',
        messages: prompt.messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0].message.content,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  /**
   * OpenRouter streaming generation
   */
  private async generateOpenRouterStream(prompt: {
    system: string;
    messages: Array<{ role: string; content: string }>;
  }): Promise<ReadableStream<string>> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://one.ie',
        'X-Title': 'ONE Platform AI Clone',
      },
      body: JSON.stringify({
        model: this.config.model || 'anthropic/claude-3-opus',
        messages: prompt.messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    return this.transformStream(response.body!);
  }

  // ==========================================================================
  // STEP 4: CITATIONS
  // ==========================================================================

  /**
   * Get citation details for chunk IDs
   */
  private async getCitations(chunkIds: string[]): Promise<Citation[]> {
    if (chunkIds.length === 0) {
      return [];
    }

    // TODO: Replace with actual Convex query once types are available
    // const result = await this.convex.query(api.queries['rag-retrieve'].getCitations, {
    //   chunkIds,
    // });

    // Temporary mock for type checking
    const result: any[] = [];

    return result.map((c: any) => ({
      title: c.title,
      url: c.url,
      chunkId: c.chunkId,
      excerpt: c.excerpt,
    }));
  }

  /**
   * Transform Uint8Array stream to string stream
   */
  private transformStream(stream: ReadableStream<Uint8Array>): ReadableStream<string> {
    const decoder = new TextDecoder();
    return new ReadableStream<string>({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            controller.enqueue(text);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Generate response without context (fallback when no relevant chunks found)
   */
  private async generateWithoutContext(
    request: RAGRequest,
    startTime: number
  ): Promise<RAGResponse> {
    const systemPrompt = request.systemPromptConfig
      ? getBaseSystemPrompt(request.systemPromptConfig)
      : this.getDefaultSystemPrompt();

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(request.conversationHistory || []),
      { role: 'user' as const, content: request.query },
    ];

    const result = await this.generate({ system: systemPrompt, messages }, false);

    return {
      response: result.text,
      citations: [],
      chunksUsed: [],
      metadata: {
        provider: this.config.provider,
        model: this.config.model,
        tokensUsed: result.tokensUsed,
        retrievalScore: 0,
        latencyMs: Date.now() - startTime,
        chunksRetrieved: 0,
      },
    };
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(): string {
    return getBaseSystemPrompt({
      cloneName: 'AI Assistant',
      creatorName: 'Creator',
      personality: 'professional',
    });
  }

  /**
   * Log RAG operation for debugging and analytics
   */
  private async logRAGOperation(data: {
    cloneId: Id<'things'>;
    groupId: Id<'groups'>;
    query: string;
    chunksRetrieved: number;
    avgRelevance: number;
    provider: LLMProvider;
    model: string;
    latencyMs: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    // Log to console for debugging
    console.log('[RAG Operation]', {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // TODO: Log to Convex events table for analytics
    // await this.convex.mutation(api.mutations.events.logEvent, {
    //   type: 'rag_query',
    //   actorId: ...,
    //   targetId: data.cloneId,
    //   groupId: data.groupId,
    //   metadata: {
    //     query: data.query,
    //     chunksRetrieved: data.chunksRetrieved,
    //     avgRelevance: data.avgRelevance,
    //     provider: data.provider,
    //     model: data.model,
    //     latencyMs: data.latencyMs,
    //     success: data.success,
    //     error: data.error,
    //   },
    // });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create RAG service with OpenAI GPT-4
 */
export function createOpenAIRAG(convexClient: any, config?: Partial<RAGConfig>): RAGService {
  return new RAGService(
    {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 1500,
      topK: 5,
      minScore: 0.3,
      stream: false,
      hybridSearch: false,
      ...config,
    },
    convexClient
  );
}

/**
 * Create RAG service with Anthropic Claude
 */
export function createClaudeRAG(convexClient: any, config?: Partial<RAGConfig>): RAGService {
  return new RAGService(
    {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 1500,
      topK: 5,
      minScore: 0.3,
      stream: false,
      hybridSearch: false,
      ...config,
    },
    convexClient
  );
}

/**
 * Create RAG service with OpenRouter (access to multiple models)
 */
export function createOpenRouterRAG(convexClient: any, config?: Partial<RAGConfig>): RAGService {
  return new RAGService(
    {
      provider: 'openrouter',
      model: 'anthropic/claude-3-opus',
      temperature: 0.7,
      maxTokens: 1500,
      topK: 5,
      minScore: 0.3,
      stream: false,
      hybridSearch: false,
      ...config,
    },
    convexClient
  );
}
