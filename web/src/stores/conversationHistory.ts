/**
 * Conversation History Store
 *
 * Manages conversation history with:
 * - Persistent storage in localStorage
 * - Multiple conversation threads
 * - Version tracking for code changes
 * - Search functionality
 * - Export/import capabilities
 */

import { atom, map } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

// Extended message type with versioning
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'reasoning' | 'tool_call' | 'tool_result' | 'ui';
  payload?: any;
  timestamp: number;
  reasoning?: {
    content: string;
    duration?: number;
  };
  isReasoningComplete?: boolean;
  isReasoningStreaming?: boolean;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
    result?: any;
    state: string;
  }>;
  // Version tracking for code changes
  codeVersion?: {
    version: number;
    previousCode?: string;
    currentCode?: string;
    fileChanged?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  // Track code versions across conversation
  codeVersions: Array<{
    messageId: string;
    version: number;
    code: string;
    file: string;
    timestamp: number;
  }>;
}

// Current conversation ID
export const currentConversationId = persistentAtom<string | null>(
  'current-conversation-id',
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

// All conversations (stored in localStorage)
export const conversations = persistentAtom<Record<string, Conversation>>(
  'conversations',
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

// Search query
export const searchQuery = atom<string>('');

// History sidebar state
export const historySidebarOpen = atom<boolean>(false);

/**
 * Create a new conversation
 */
export function createConversation(title: string = 'New Conversation', model?: string): string {
  const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const newConversation: Conversation = {
    id,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
    model,
    codeVersions: [],
  };

  const current = conversations.get();
  conversations.set({
    ...current,
    [id]: newConversation,
  });

  currentConversationId.set(id);
  return id;
}

/**
 * Add message to current conversation
 */
export function addMessage(message: ConversationMessage): void {
  const convId = currentConversationId.get();
  if (!convId) {
    // Create new conversation if none exists
    const newId = createConversation('New Conversation');
    addMessage(message);
    return;
  }

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) {
    console.error('Conversation not found:', convId);
    return;
  }

  conversation.messages.push(message);
  conversation.updatedAt = Date.now();

  // Update title based on first user message
  if (conversation.messages.length === 1 && message.role === 'user') {
    conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }

  conversations.set({
    ...current,
    [convId]: conversation,
  });
}

/**
 * Update message in current conversation
 */
export function updateMessage(messageId: string, updates: Partial<ConversationMessage>): void {
  const convId = currentConversationId.get();
  if (!convId) return;

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) return;

  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex === -1) return;

  conversation.messages[messageIndex] = {
    ...conversation.messages[messageIndex],
    ...updates,
  };
  conversation.updatedAt = Date.now();

  conversations.set({
    ...current,
    [convId]: conversation,
  });
}

/**
 * Track code version change
 */
export function trackCodeVersion(
  messageId: string,
  code: string,
  file: string
): void {
  const convId = currentConversationId.get();
  if (!convId) return;

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) return;

  const version = conversation.codeVersions.length + 1;

  conversation.codeVersions.push({
    messageId,
    version,
    code,
    file,
    timestamp: Date.now(),
  });

  // Update message with version info
  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex !== -1) {
    const previousVersion = conversation.codeVersions[conversation.codeVersions.length - 2];
    conversation.messages[messageIndex].codeVersion = {
      version,
      previousCode: previousVersion?.code,
      currentCode: code,
      fileChanged: file,
    };
  }

  conversations.set({
    ...current,
    [convId]: conversation,
  });
}

/**
 * Revert to a specific code version
 */
export function revertToVersion(version: number): { code: string; file: string } | null {
  const convId = currentConversationId.get();
  if (!convId) return null;

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) return null;

  const codeVersion = conversation.codeVersions.find(v => v.version === version);
  if (!codeVersion) return null;

  return {
    code: codeVersion.code,
    file: codeVersion.file,
  };
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  const current = conversations.get();
  const { [id]: deleted, ...rest } = current;

  conversations.set(rest);

  // If deleted current conversation, clear it
  if (currentConversationId.get() === id) {
    currentConversationId.set(null);
  }
}

/**
 * Clear current conversation
 */
export function clearCurrentConversation(): void {
  const convId = currentConversationId.get();
  if (!convId) return;

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) return;

  conversation.messages = [];
  conversation.codeVersions = [];
  conversation.updatedAt = Date.now();

  conversations.set({
    ...current,
    [convId]: conversation,
  });
}

/**
 * Load messages from a specific conversation
 */
export function loadConversation(id: string): ConversationMessage[] {
  const current = conversations.get();
  const conversation = current[id];

  if (!conversation) return [];

  currentConversationId.set(id);
  return conversation.messages;
}

/**
 * Resume conversation from a specific message
 */
export function resumeFromMessage(messageId: string): ConversationMessage[] {
  const convId = currentConversationId.get();
  if (!convId) return [];

  const current = conversations.get();
  const conversation = current[convId];

  if (!conversation) return [];

  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex === -1) return conversation.messages;

  // Return messages up to and including the selected message
  return conversation.messages.slice(0, messageIndex + 1);
}

/**
 * Export conversation as markdown
 */
export function exportAsMarkdown(id: string): string {
  const current = conversations.get();
  const conversation = current[id];

  if (!conversation) return '';

  let markdown = `# ${conversation.title}\n\n`;
  markdown += `*Created: ${new Date(conversation.createdAt).toLocaleString()}*\n`;
  markdown += `*Updated: ${new Date(conversation.updatedAt).toLocaleString()}*\n\n`;

  if (conversation.model) {
    markdown += `**Model:** ${conversation.model}\n\n`;
  }

  markdown += '---\n\n';

  conversation.messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? '**You**' : '**Assistant**';
    const timestamp = new Date(msg.timestamp).toLocaleTimeString();

    markdown += `### ${role} (${timestamp})\n\n`;

    if (msg.type === 'reasoning' && msg.reasoning) {
      markdown += `*[Reasoning]*\n\n${msg.reasoning.content}\n\n`;
    }

    if (msg.toolCalls && msg.toolCalls.length > 0) {
      markdown += '*[Tool Calls]*\n\n';
      msg.toolCalls.forEach(tool => {
        markdown += `- **${tool.name}**\n`;
        markdown += `  - Args: \`${JSON.stringify(tool.args)}\`\n`;
        if (tool.result) {
          markdown += `  - Result: \`${JSON.stringify(tool.result)}\`\n`;
        }
      });
      markdown += '\n';
    }

    if (msg.content) {
      markdown += `${msg.content}\n\n`;
    }

    if (msg.codeVersion) {
      markdown += `*[Code Version ${msg.codeVersion.version}]*\n`;
      markdown += `File: \`${msg.codeVersion.fileChanged}\`\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Search conversations
 */
export function searchConversations(query: string): Conversation[] {
  const current = conversations.get();
  const lowerQuery = query.toLowerCase();

  return Object.values(current).filter(conv => {
    // Search in title
    if (conv.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in messages
    return conv.messages.some(msg =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get all conversations sorted by update time
 */
export function getAllConversations(): Conversation[] {
  const current = conversations.get();
  return Object.values(current).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get current conversation
 */
export function getCurrentConversation(): Conversation | null {
  const convId = currentConversationId.get();
  if (!convId) return null;

  const current = conversations.get();
  return current[convId] || null;
}
