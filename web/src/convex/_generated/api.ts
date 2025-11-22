/**
 * STUB: Convex API for chat components
 *
 * This is a temporary stub to allow the build to complete.
 * The chat components need proper integration with backend-agnostic hooks.
 *
 * TODO: Refactor chat components to use proper hooks pattern
 * See /web/src/lib/convex-api.ts for deprecation notice
 */

export const api = {
  queries: {
    getChannelMessages: "queries/chat:getChannelMessages",
    getThread: "queries/chat:getThread",
    getUserMentions: "queries/chat:getUserMentions",
    searchMessages: "queries/chat:searchMessages",
    searchMentionables: "queries/chat:searchMentionables",
    getTypingUsers: "queries/chat:getTypingUsers",
    getUserPresence: "queries/chat:getUserPresence",
  },
  mutations: {
    sendMessage: "mutations/chat:sendMessage",
    editMessage: "mutations/chat:editMessage",
    deleteMessage: "mutations/chat:deleteMessage",
    addReaction: "mutations/chat:addReaction",
    updatePresence: "mutations/chat:updatePresence",
    markMentionAsRead: "mutations/chat:markMentionAsRead",
    triggerAgentMention: "mutations/chat:triggerAgentMention",
  },
};

export type Id<T extends string> = string & { __tableName: T };
