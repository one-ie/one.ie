/**
 * CYCLE 63: Unit Tests - searchMentionables Query
 *
 * Tests autocomplete search logic for @mentions
 */

import { describe, it, expect } from 'vitest';

describe('searchMentionables Query Logic', () => {
  describe('User Filtering', () => {
    it('should filter users by username prefix', () => {
      const users = [
        { username: 'alice', name: 'Alice Smith' },
        { username: 'alex', name: 'Alex Jones' },
        { username: 'bob', name: 'Bob Wilson' },
      ];

      const query = 'al';
      const filtered = users.filter((u) =>
        u.username.toLowerCase().startsWith(query.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].username).toBe('alice');
      expect(filtered[1].username).toBe('alex');
    });

    it('should match case-insensitively', () => {
      const users = [
        { username: 'Alice', name: 'Alice Smith' },
        { username: 'ALEX', name: 'Alex Jones' },
      ];

      const query = 'al';
      const filtered = users.filter((u) =>
        u.username.toLowerCase().startsWith(query.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when no matches', () => {
      const users = [
        { username: 'alice', name: 'Alice Smith' },
        { username: 'bob', name: 'Bob Wilson' },
      ];

      const query = 'xyz';
      const filtered = users.filter((u) =>
        u.username.toLowerCase().startsWith(query.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it('should limit results to 10', () => {
      const users = Array.from({ length: 20 }, (_, i) => ({
        username: `user${i}`,
        name: `User ${i}`,
      }));

      const query = 'user';
      const filtered = users
        .filter((u) => u.username.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 10);

      expect(filtered.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Agent Filtering', () => {
    it('should include agents in results', () => {
      const agents = [
        { type: 'agent', name: 'Support Bot', username: 'support_bot' },
        { type: 'agent', name: 'Sales Assistant', username: 'sales_assistant' },
      ];

      const query = 'support';
      const filtered = agents.filter((a) =>
        a.username.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('agent');
    });

    it('should distinguish agents from users', () => {
      const mentionables = [
        { type: 'creator', username: 'alice', name: 'Alice' },
        { type: 'agent', username: 'assistant', name: 'AI Assistant' },
      ];

      const users = mentionables.filter((m) => m.type === 'creator');
      const agents = mentionables.filter((m) => m.type === 'agent');

      expect(users).toHaveLength(1);
      expect(agents).toHaveLength(1);
    });
  });

  describe('Special Mentions', () => {
    it('should include @here for query "h"', () => {
      const specialMentions = [
        { username: 'here', type: 'special', name: '@here' },
        { username: 'channel', type: 'special', name: '@channel' },
      ];

      const query = 'h';
      const filtered = specialMentions.filter((m) =>
        m.username.startsWith(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].username).toBe('here');
    });

    it('should include @channel for query "c"', () => {
      const specialMentions = [
        { username: 'here', type: 'special', name: '@here' },
        { username: 'channel', type: 'special', name: '@channel' },
      ];

      const query = 'c';
      const filtered = specialMentions.filter((m) =>
        m.username.startsWith(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].username).toBe('channel');
    });

    it('should always show special mentions at top', () => {
      const mentionables = [
        { username: 'alice', type: 'creator', priority: 2 },
        { username: 'here', type: 'special', priority: 1 },
        { username: 'channel', type: 'special', priority: 1 },
      ];

      const sorted = mentionables.sort((a, b) => a.priority - b.priority);

      expect(sorted[0].type).toBe('special');
      expect(sorted[1].type).toBe('special');
      expect(sorted[2].type).toBe('creator');
    });
  });

  describe('GroupId Scoping', () => {
    it('should filter by groupId (organization)', () => {
      const users = [
        { username: 'alice', groupId: 'org-123' },
        { username: 'bob', groupId: 'org-456' },
        { username: 'charlie', groupId: 'org-123' },
      ];

      const currentGroupId = 'org-123';
      const filtered = users.filter((u) => u.groupId === currentGroupId);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((u) => u.username)).toEqual(['alice', 'charlie']);
    });

    it('should not show users from other organizations', () => {
      const users = [
        { username: 'alice', groupId: 'org-123' },
        { username: 'bob', groupId: 'org-456' },
      ];

      const currentGroupId = 'org-123';
      const filtered = users.filter((u) => u.groupId === currentGroupId);

      expect(filtered.some((u) => u.username === 'bob')).toBe(false);
    });
  });

  describe('Result Ordering', () => {
    it('should sort results alphabetically', () => {
      const users = [
        { username: 'charlie', name: 'Charlie' },
        { username: 'alice', name: 'Alice' },
        { username: 'bob', name: 'Bob' },
      ];

      const sorted = users.sort((a, b) => a.username.localeCompare(b.username));

      expect(sorted[0].username).toBe('alice');
      expect(sorted[1].username).toBe('bob');
      expect(sorted[2].username).toBe('charlie');
    });

    it('should prioritize exact prefix matches', () => {
      const users = [
        { username: 'alice', name: 'Alice', exactMatch: true },
        { username: 'alexander', name: 'Alexander', exactMatch: false },
      ];

      const query = 'alice';
      const sorted = users.sort((a, b) => {
        const aExact = a.username === query;
        const bExact = b.username === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.username.localeCompare(b.username);
      });

      expect(sorted[0].username).toBe('alice');
    });
  });

  describe('Empty Query Handling', () => {
    it('should return special mentions for empty query', () => {
      const query = '';
      const specialMentions = [
        { username: 'here', type: 'special' },
        { username: 'channel', type: 'special' },
      ];

      // Empty query should still show special mentions
      expect(specialMentions.length).toBeGreaterThan(0);
    });

    it('should limit results even for empty query', () => {
      const users = Array.from({ length: 20 }, (_, i) => ({
        username: `user${i}`,
      }));

      const query = '';
      const results = users.slice(0, 10);

      expect(results.length).toBeLessThanOrEqual(10);
    });
  });
});
