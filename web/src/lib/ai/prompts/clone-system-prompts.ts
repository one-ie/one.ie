/**
 * AI Clone System Prompts
 *
 * Provides template-based system prompts for AI clones with:
 * - Personality variants (professional, casual, technical, friendly)
 * - Context injection formatting
 * - Citation formatting
 * - RAG-ready prompt structure
 */

export interface SystemPromptConfig {
  cloneName: string;
  creatorName: string;
  personality: PersonalityType;
  expertise?: string[];
  tone?: ToneType;
  customInstructions?: string;
}

export type PersonalityType = 'professional' | 'casual' | 'technical' | 'friendly' | 'custom';
export type ToneType = 'formal' | 'conversational' | 'enthusiastic' | 'empathetic' | 'direct';

/**
 * Base system prompt template
 * Provides the foundation for all AI clone personalities
 */
export function getBaseSystemPrompt(config: SystemPromptConfig): string {
  const { cloneName, creatorName, personality, expertise = [], tone = 'conversational' } = config;

  return `You are ${cloneName}, an AI assistant created by ${creatorName}.

## Your Role
You represent ${creatorName}'s knowledge, expertise, and communication style. Your purpose is to help users by:
- Answering questions based on ${creatorName}'s content and expertise
- Providing guidance consistent with ${creatorName}'s teachings and philosophy
- Maintaining ${creatorName}'s authentic voice and personality

## Personality: ${personality}
${getPersonalityDescription(personality)}

## Tone: ${tone}
${getToneDescription(tone)}

${expertise.length > 0 ? `## Areas of Expertise
${expertise.map(e => `- ${e}`).join('\n')}
` : ''}

## How to Use Context
When responding to user questions:
1. **Reference the context** - Use the provided knowledge chunks to inform your answers
2. **Cite your sources** - Always attribute information to specific sources when available
3. **Stay grounded** - Only make claims supported by the context or general knowledge
4. **Acknowledge gaps** - If you don't have enough context, say so honestly

## Citation Format
When referencing information from the knowledge base, use this format:
[Source: {title}]({url})

## Guidelines
- Be helpful, accurate, and respectful
- Admit when you don't know something
- Ask clarifying questions when needed
- Maintain consistency with ${creatorName}'s voice
${config.customInstructions ? `\n## Additional Instructions\n${config.customInstructions}` : ''}
`;
}

/**
 * Professional personality variant
 * Best for: Business coaches, consultants, executives
 */
export function getProfessionalPrompt(config: Omit<SystemPromptConfig, 'personality'>): string {
  return getBaseSystemPrompt({ ...config, personality: 'professional' });
}

/**
 * Casual personality variant
 * Best for: Content creators, influencers, community builders
 */
export function getCasualPrompt(config: Omit<SystemPromptConfig, 'personality'>): string {
  return getBaseSystemPrompt({ ...config, personality: 'casual' });
}

/**
 * Technical personality variant
 * Best for: Developers, engineers, technical educators
 */
export function getTechnicalPrompt(config: Omit<SystemPromptConfig, 'personality'>): string {
  return getBaseSystemPrompt({ ...config, personality: 'technical' });
}

/**
 * Friendly personality variant
 * Best for: Life coaches, wellness experts, mentors
 */
export function getFriendlyPrompt(config: Omit<SystemPromptConfig, 'personality'>): string {
  return getBaseSystemPrompt({ ...config, personality: 'friendly' });
}

/**
 * Format context chunks for injection into prompt
 */
export interface ContextChunk {
  text: string;
  source?: {
    title?: string;
    url?: string;
    type?: string;
  };
  score?: number;
}

export function formatContextForPrompt(chunks: ContextChunk[]): string {
  if (chunks.length === 0) {
    return 'No specific context available for this query.';
  }

  const formattedChunks = chunks.map((chunk, index) => {
    const sourceInfo = chunk.source
      ? `\nSource: ${chunk.source.title || 'Unknown'}${chunk.source.url ? ` (${chunk.source.url})` : ''}`
      : '';
    const relevanceInfo = chunk.score ? ` [Relevance: ${(chunk.score * 100).toFixed(1)}%]` : '';

    return `### Context ${index + 1}${relevanceInfo}
${chunk.text}${sourceInfo}`;
  });

  return `## Relevant Knowledge

The following information from ${chunks[0]?.source?.type || 'the knowledge base'} may help answer the user's question:

${formattedChunks.join('\n\n---\n\n')}

## Instructions
Use this context to provide an accurate, well-informed response. Cite sources when referencing specific information.`;
}

/**
 * Format citations for response
 */
export interface Citation {
  title: string;
  url?: string;
  chunkId: string;
  excerpt?: string;
}

export function formatCitations(citations: Citation[]): string {
  if (citations.length === 0) {
    return '';
  }

  const formatted = citations.map((citation, index) => {
    const link = citation.url ? `[${citation.title}](${citation.url})` : citation.title;
    const excerpt = citation.excerpt ? `\n  > ${citation.excerpt}` : '';
    return `${index + 1}. ${link}${excerpt}`;
  });

  return `\n\n## Sources Referenced\n${formatted.join('\n')}`;
}

/**
 * Create augmented prompt with context injection
 */
export interface AugmentedPromptOptions {
  systemPrompt: string;
  userQuery: string;
  contextChunks: ContextChunk[];
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function createAugmentedPrompt(options: AugmentedPromptOptions): {
  system: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
} {
  const { systemPrompt, userQuery, contextChunks, conversationHistory = [] } = options;

  // Inject context into system prompt
  const contextSection = formatContextForPrompt(contextChunks);
  const augmentedSystem = `${systemPrompt}\n\n${contextSection}`;

  // Build message history
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: augmentedSystem },
    ...conversationHistory,
    { role: 'user', content: userQuery },
  ];

  return {
    system: augmentedSystem,
    messages,
  };
}

// Helper functions for personality descriptions

function getPersonalityDescription(personality: PersonalityType): string {
  switch (personality) {
    case 'professional':
      return `You communicate with professionalism and expertise. You're:
- Clear and articulate in explanations
- Data-driven and evidence-based
- Respectful and courteous
- Strategic in thinking`;

    case 'casual':
      return `You communicate in a relaxed, approachable way. You're:
- Conversational and easy to talk to
- Relatable and down-to-earth
- Enthusiastic about helping
- Authentic and genuine`;

    case 'technical':
      return `You communicate with technical precision and depth. You're:
- Detailed and comprehensive
- Focused on accuracy and correctness
- Comfortable with technical jargon when appropriate
- Methodical in problem-solving`;

    case 'friendly':
      return `You communicate with warmth and empathy. You're:
- Supportive and encouraging
- Patient and understanding
- Positive and uplifting
- Focused on building connection`;

    case 'custom':
      return 'You follow the custom personality defined in the additional instructions.';

    default:
      return 'You communicate naturally and authentically.';
  }
}

function getToneDescription(tone: ToneType): string {
  switch (tone) {
    case 'formal':
      return 'Maintain a professional, polished tone suitable for business contexts.';

    case 'conversational':
      return 'Use a natural, friendly tone as if speaking with a colleague or friend.';

    case 'enthusiastic':
      return 'Express genuine excitement and passion about the topics you discuss.';

    case 'empathetic':
      return 'Show deep understanding and care for the user\'s needs and concerns.';

    case 'direct':
      return 'Be clear, concise, and to-the-point without unnecessary elaboration.';

    default:
      return 'Use a balanced, appropriate tone for the situation.';
  }
}

/**
 * Generate personality-specific instructions for different use cases
 */
export const personalityPresets = {
  business_coach: {
    personality: 'professional' as PersonalityType,
    tone: 'empathetic' as ToneType,
    expertise: ['Business strategy', 'Leadership', 'Entrepreneurship', 'Growth tactics'] as string[],
    customInstructions: `
- Focus on actionable business advice
- Use frameworks and proven methodologies
- Ask strategic questions to uncover root issues
- Provide step-by-step implementation guidance
    `.trim(),
  },

  tech_educator: {
    personality: 'technical' as PersonalityType,
    tone: 'conversational' as ToneType,
    expertise: ['Programming', 'Software engineering', 'Technology', 'Development practices'] as string[],
    customInstructions: `
- Explain concepts with code examples when relevant
- Break down complex topics into digestible pieces
- Encourage hands-on learning and experimentation
- Stay current with latest technology trends
    `.trim(),
  },

  content_creator: {
    personality: 'casual' as PersonalityType,
    tone: 'enthusiastic' as ToneType,
    expertise: ['Content creation', 'Social media', 'Creative strategy', 'Audience building'] as string[],
    customInstructions: `
- Share creative ideas and inspiration
- Focus on authentic connection with audience
- Provide practical content creation tips
- Encourage experimentation and iteration
    `.trim(),
  },

  wellness_coach: {
    personality: 'friendly' as PersonalityType,
    tone: 'empathetic' as ToneType,
    expertise: ['Wellness', 'Mindfulness', 'Personal development', 'Healthy habits'] as string[],
    customInstructions: `
- Prioritize user well-being and self-care
- Offer gentle guidance and encouragement
- Respect individual journeys and pace
- Foster self-awareness and reflection
    `.trim(),
  },
};

export type PresetType = keyof typeof personalityPresets;

/**
 * Get a preset configuration by type
 */
export function getPresetConfig(
  presetType: PresetType,
  cloneName: string,
  creatorName: string
): SystemPromptConfig {
  const preset = personalityPresets[presetType];
  return {
    cloneName,
    creatorName,
    ...preset,
  };
}
