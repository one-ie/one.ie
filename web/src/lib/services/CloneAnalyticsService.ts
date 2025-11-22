/**
 * Clone Analytics Service
 *
 * Advanced analytics for AI clones using LLM and embeddings
 *
 * Features:
 * - Sentiment analysis using LLM (OpenAI/Anthropic)
 * - Topic extraction using embeddings clustering
 * - Knowledge gap detection (low confidence responses)
 * - Suggest new training content based on gaps
 * - Generate weekly insights report
 *
 * Follows Effect.ts pattern for composable error handling
 */

import { Effect, pipe } from 'effect';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
}

export interface Topic {
  name: string;
  keywords: string[];
  count: number;
  sampleMessages: string[];
}

export interface KnowledgeGap {
  question: string;
  context: string;
  suggestedContent: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WeeklyReport {
  cloneId: string;
  period: {
    start: number;
    end: number;
  };
  metrics: {
    totalConversations: number;
    totalMessages: number;
    avgResponseTime: number;
    satisfactionScore: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topTopics: Topic[];
  knowledgeGaps: KnowledgeGap[];
  recommendations: string[];
}

// ============================================================================
// ERRORS
// ============================================================================

export class SentimentAnalysisError {
  readonly _tag = 'SentimentAnalysisError';
  constructor(readonly message: string) {}
}

export class TopicExtractionError {
  readonly _tag = 'TopicExtractionError';
  constructor(readonly message: string) {}
}

export class ReportGenerationError {
  readonly _tag = 'ReportGenerationError';
  constructor(readonly message: string) {}
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze sentiment of a message using LLM
 *
 * Uses OpenAI/Anthropic to classify sentiment with high accuracy
 */
export const analyzeSentiment = (
  message: string,
  apiKey?: string
): Effect.Effect<SentimentResult, SentimentAnalysisError> =>
  Effect.gen(function* () {
    try {
      // Use OpenAI API for sentiment analysis
      const openaiKey = apiKey || import.meta.env.PUBLIC_OPENAI_API_KEY;

      if (!openaiKey) {
        // Fallback to heuristic-based sentiment if no API key
        return yield* heuristicSentiment(message);
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Analyze the sentiment of the following message. Respond with JSON: { "sentiment": "positive" | "neutral" | "negative", "score": number from -1 to 1, "confidence": number from 0 to 1 }',
            },
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        sentiment: result.sentiment,
        score: result.score,
        confidence: result.confidence,
      };
    } catch (error) {
      return yield* Effect.fail(
        new SentimentAnalysisError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  });

/**
 * Heuristic-based sentiment analysis (fallback)
 */
const heuristicSentiment = (
  message: string
): Effect.Effect<SentimentResult, SentimentAnalysisError> =>
  Effect.gen(function* () {
    const lower = message.toLowerCase();

    const positiveWords = [
      'great',
      'awesome',
      'excellent',
      'perfect',
      'thanks',
      'helpful',
      'love',
      'wonderful',
      'amazing',
      'fantastic',
      'good',
      'nice',
    ];
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'horrible',
      'useless',
      'disappointed',
      'frustrating',
      'confusing',
      'wrong',
      'error',
      'hate',
      'worse',
    ];

    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lower.includes(word)) {
        positiveCount++;
        score += 0.5;
      }
    }

    for (const word of negativeWords) {
      if (lower.includes(word)) {
        negativeCount++;
        score -= 0.5;
      }
    }

    const normalizedScore = Math.max(-1, Math.min(1, score));
    const sentiment =
      normalizedScore > 0.2 ? 'positive' : normalizedScore < -0.2 ? 'negative' : 'neutral';

    return {
      sentiment,
      score: normalizedScore,
      confidence: 0.6, // Lower confidence for heuristic
    };
  });

/**
 * Analyze sentiment for multiple messages in batch
 */
export const batchAnalyzeSentiment = (
  messages: string[],
  apiKey?: string
): Effect.Effect<SentimentResult[], SentimentAnalysisError> =>
  Effect.gen(function* () {
    const results = yield* Effect.all(
      messages.map((msg) => analyzeSentiment(msg, apiKey)),
      { concurrency: 5 } // Process 5 at a time
    );
    return results;
  });

// ============================================================================
// TOPIC EXTRACTION
// ============================================================================

/**
 * Extract topics from messages using keyword clustering
 *
 * For production, integrate with embeddings clustering
 */
export const extractTopics = (
  messages: Message[],
  limit = 10
): Effect.Effect<Topic[], TopicExtractionError> =>
  Effect.gen(function* () {
    try {
      // Predefined topic categories with keywords
      const topicCategories: Record<string, string[]> = {
        Pricing: ['price', 'cost', 'pricing', 'payment', 'subscription', 'tier', 'plan'],
        Features: ['feature', 'functionality', 'capability', 'can you', 'does it', 'support'],
        Integration: [
          'integrate',
          'api',
          'webhook',
          'connect',
          'import',
          'export',
          'sync',
        ],
        Support: ['help', 'support', 'problem', 'issue', 'error', 'fix', 'troubleshoot'],
        Setup: [
          'install',
          'setup',
          'configure',
          'start',
          'deploy',
          'getting started',
          'initialize',
        ],
        Customization: [
          'customize',
          'personalize',
          'modify',
          'change',
          'settings',
          'options',
        ],
        Performance: ['slow', 'fast', 'speed', 'performance', 'optimize', 'lag'],
        Security: ['secure', 'security', 'encrypt', 'privacy', 'safe', 'permission'],
      };

      const topics: Record<
        string,
        { count: number; keywords: string[]; messages: string[] }
      > = {};

      // Initialize topics
      for (const [name, keywords] of Object.entries(topicCategories)) {
        topics[name] = { count: 0, keywords, messages: [] };
      }

      // Count topic occurrences
      for (const message of messages) {
        const content = message.content.toLowerCase();

        for (const [name, data] of Object.entries(topics)) {
          if (data.keywords.some((keyword) => content.includes(keyword))) {
            data.count++;
            if (data.messages.length < 3) {
              data.messages.push(
                message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '')
              );
            }
          }
        }
      }

      // Convert to array and sort by count
      const topicArray: Topic[] = Object.entries(topics)
        .map(([name, data]) => ({
          name,
          keywords: data.keywords,
          count: data.count,
          sampleMessages: data.messages,
        }))
        .filter((t) => t.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return topicArray;
    } catch (error) {
      return yield* Effect.fail(
        new TopicExtractionError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  });

/**
 * Extract topics using embeddings clustering (advanced)
 *
 * Requires OpenAI embeddings API
 */
export const extractTopicsWithEmbeddings = (
  messages: Message[],
  apiKey?: string,
  limit = 10
): Effect.Effect<Topic[], TopicExtractionError> =>
  Effect.gen(function* () {
    // TODO: Implement embeddings-based clustering
    // 1. Generate embeddings for all messages
    // 2. Cluster embeddings using k-means or DBSCAN
    // 3. Extract representative keywords from each cluster
    // 4. Return topics with cluster labels

    // For now, fall back to keyword-based extraction
    return yield* extractTopics(messages, limit);
  });

// ============================================================================
// KNOWLEDGE GAP DETECTION
// ============================================================================

/**
 * Detect knowledge gaps from low-confidence responses
 */
export const detectKnowledgeGaps = (
  conversations: Array<{ question: string; answer: string }>
): Effect.Effect<KnowledgeGap[], never> =>
  Effect.gen(function* () {
    const gaps: KnowledgeGap[] = [];

    const lowConfidenceIndicators = [
      "i don't know",
      "i'm not sure",
      "i don't have information",
      'i cannot answer',
      'unclear',
      'insufficient information',
      "i'm not certain",
      'i lack data',
    ];

    for (const conv of conversations) {
      const answerLower = conv.answer.toLowerCase();
      const hasLowConfidence = lowConfidenceIndicators.some((indicator) =>
        answerLower.includes(indicator)
      );

      if (hasLowConfidence) {
        const topic = extractMainTopic(conv.question);
        const priority = determinePriority(conv.question);

        gaps.push({
          question: conv.question,
          context: conv.answer.slice(0, 200),
          suggestedContent: `Create training content about: ${topic}`,
          priority,
        });
      }
    }

    return gaps;
  });

/**
 * Helper: Extract main topic from question
 */
function extractMainTopic(question: string): string {
  const lower = question.toLowerCase();

  if (lower.includes('price') || lower.includes('cost')) {
    return 'pricing and payment';
  }
  if (lower.includes('integrate') || lower.includes('api')) {
    return 'integration capabilities';
  }
  if (lower.includes('setup') || lower.includes('configure')) {
    return 'setup and configuration';
  }
  if (lower.includes('feature') || lower.includes('can you')) {
    return 'feature capabilities';
  }

  // Default: use first few words
  return question.split(' ').slice(0, 5).join(' ');
}

/**
 * Helper: Determine gap priority based on question patterns
 */
function determinePriority(question: string): 'low' | 'medium' | 'high' {
  const lower = question.toLowerCase();

  // High priority: payment, security, critical features
  if (
    lower.includes('payment') ||
    lower.includes('security') ||
    lower.includes('data loss') ||
    lower.includes('critical')
  ) {
    return 'high';
  }

  // Medium priority: common questions
  if (
    lower.includes('how') ||
    lower.includes('setup') ||
    lower.includes('integrate')
  ) {
    return 'medium';
  }

  // Low priority: everything else
  return 'low';
}

// ============================================================================
// WEEKLY REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive weekly insights report
 */
export const generateWeeklyReport = (
  cloneId: string,
  startDate: number,
  endDate: number,
  data: {
    conversations: number;
    messages: Message[];
    avgResponseTime: number;
    satisfactionScore: number;
    gaps: KnowledgeGap[];
  }
): Effect.Effect<WeeklyReport, ReportGenerationError> =>
  Effect.gen(function* () {
    try {
      // 1. Analyze sentiment
      const userMessages = data.messages.filter((m) => m.role === 'user');
      const sentimentResults = yield* batchAnalyzeSentiment(
        userMessages.map((m) => m.content)
      );

      const sentimentCounts = {
        positive: sentimentResults.filter((s) => s.sentiment === 'positive').length,
        neutral: sentimentResults.filter((s) => s.sentiment === 'neutral').length,
        negative: sentimentResults.filter((s) => s.sentiment === 'negative').length,
      };

      // 2. Extract topics
      const topics = yield* extractTopics(data.messages, 5);

      // 3. Generate recommendations
      const recommendations: string[] = [];

      if (data.avgResponseTime > 5000) {
        recommendations.push(
          'Optimize response time: Current avg is ' +
            Math.round(data.avgResponseTime / 1000) +
            's'
        );
      }

      if (sentimentCounts.negative > sentimentCounts.positive) {
        recommendations.push(
          'Address negative sentiment: Review recent conversations for improvement'
        );
      }

      if (data.gaps.length > 10) {
        recommendations.push(
          'Add training content: ' +
            data.gaps.length +
            ' knowledge gaps detected'
        );
      }

      if (data.satisfactionScore < 3.5) {
        recommendations.push(
          'Improve satisfaction: Current score is ' + data.satisfactionScore + '/5'
        );
      }

      // 4. Build report
      const report: WeeklyReport = {
        cloneId,
        period: {
          start: startDate,
          end: endDate,
        },
        metrics: {
          totalConversations: data.conversations,
          totalMessages: data.messages.length,
          avgResponseTime: data.avgResponseTime,
          satisfactionScore: data.satisfactionScore,
        },
        sentiment: sentimentCounts,
        topTopics: topics,
        knowledgeGaps: data.gaps.slice(0, 10),
        recommendations,
      };

      return report;
    } catch (error) {
      return yield* Effect.fail(
        new ReportGenerationError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  });

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Export report as JSON
 */
export const exportReportAsJSON = (report: WeeklyReport): string => {
  return JSON.stringify(report, null, 2);
};

/**
 * Export report as Markdown
 */
export const exportReportAsMarkdown = (report: WeeklyReport): string => {
  const startDate = new Date(report.period.start).toLocaleDateString();
  const endDate = new Date(report.period.end).toLocaleDateString();

  return `# AI Clone Weekly Report

**Clone ID:** ${report.cloneId}
**Period:** ${startDate} - ${endDate}

## Key Metrics

- **Total Conversations:** ${report.metrics.totalConversations}
- **Total Messages:** ${report.metrics.totalMessages}
- **Avg Response Time:** ${Math.round(report.metrics.avgResponseTime / 1000)}s
- **Satisfaction Score:** ${report.metrics.satisfactionScore}/5

## Sentiment Analysis

- **Positive:** ${report.sentiment.positive} (${Math.round((report.sentiment.positive / (report.sentiment.positive + report.sentiment.neutral + report.sentiment.negative)) * 100)}%)
- **Neutral:** ${report.sentiment.neutral} (${Math.round((report.sentiment.neutral / (report.sentiment.positive + report.sentiment.neutral + report.sentiment.negative)) * 100)}%)
- **Negative:** ${report.sentiment.negative} (${Math.round((report.sentiment.negative / (report.sentiment.positive + report.sentiment.neutral + report.sentiment.negative)) * 100)}%)

## Top Topics

${report.topTopics
  .map(
    (topic, i) =>
      `${i + 1}. **${topic.name}** (${topic.count} mentions)\n   - Keywords: ${topic.keywords.slice(0, 5).join(', ')}`
  )
  .join('\n')}

## Knowledge Gaps

${report.knowledgeGaps
  .map(
    (gap, i) =>
      `${i + 1}. **Priority: ${gap.priority.toUpperCase()}**\n   - Question: ${gap.question}\n   - Suggestion: ${gap.suggestedContent}`
  )
  .join('\n\n')}

## Recommendations

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*Generated on ${new Date().toLocaleString()}*
`;
};
