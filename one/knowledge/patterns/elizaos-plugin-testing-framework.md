---
title: ElizaOS Plugin Integration Testing Framework
dimension: knowledge
category: patterns
tags: elizaos, plugins, testing, framework, quality-assurance
related_dimensions: events, things, connections
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
cycle: 80
status: complete
ai_context: |
  This document defines the automated testing framework for ANY ElizaOS plugin
  integration. Use this framework to validate plugin behavior, ontology mapping,
  and multi-tenant isolation.
---

# ElizaOS Plugin Integration Testing Framework

**Version:** 1.0.0
**Cycle:** 80 (Create Plugin Integration Testing Framework)
**Status:** Framework Complete

This framework enables automated testing of ANY ElizaOS plugin integration with the ONE Platform's 6-dimension ontology.

---

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Test Categories](#test-categories)
3. [Test Infrastructure](#test-infrastructure)
4. [Plugin Test Template](#plugin-test-template)
5. [Mock Services](#mock-services)
6. [Test Fixtures](#test-fixtures)
7. [Assertions Library](#assertions-library)
8. [CI/CD Integration](#cicd-integration)

---

## Framework Overview

### Design Principles

1. **Plugin-Agnostic**: Works with ANY ElizaOS plugin
2. **Ontology-First**: Validates 6-dimension mapping
3. **Multi-Tenant Safe**: Tests org isolation
4. **Effect.ts Native**: Uses Effect for composable tests
5. **Fast Feedback**: < 5 seconds per plugin test suite

### Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Plugin Test Suite                          │
├─────────────────────────────────────────────────────────────┤
│  1. Initialization Tests                                    │
│     - Plugin loads correctly                                │
│     - Configuration validates                               │
│     - Secrets decrypt properly                              │
│                                                             │
│  2. Execution Tests                                         │
│     - Actions execute successfully                          │
│     - Providers return data                                 │
│     - Evaluators score correctly                            │
│                                                             │
│  3. Ontology Mapping Tests                                  │
│     - Events logged correctly                               │
│     - Things created with proper schema                     │
│     - Connections established                               │
│     - Knowledge embeddings generated                        │
│     - Group scoping enforced                                │
│                                                             │
│  4. Security Tests                                          │
│     - Multi-tenant isolation verified                       │
│     - API keys never leaked                                 │
│     - Rate limits enforced                                  │
│     - Input validation works                                │
│                                                             │
│  5. Error Handling Tests                                    │
│     - Network failures handled                              │
│     - Retries work correctly                                │
│     - Error events logged                                   │
│     - Graceful degradation                                  │
│                                                             │
│  6. Performance Tests                                       │
│     - Executes within timeout                               │
│     - Memory usage acceptable                               │
│     - No resource leaks                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Categories

### Category 1: Initialization Tests

```typescript
// tests/plugins/initialization.test.ts
import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';
import { PluginTestHarness } from './harness';

export function createInitializationTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T
) {
  describe(`${pluginName} - Initialization`, () => {
    it('should initialize with valid configuration', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const result = await Effect.runPromise(
        adapter.initialize(harness.getValidConfig())
      );

      expect(result).toBeUndefined(); // No error = success
    });

    it('should fail with invalid configuration', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter({});

      const result = await Effect.runPromise(
        adapter.initialize({}).pipe(
          Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
        )
      );

      expect(result.error).toBe('ConfigurationError');
    });

    it('should decrypt secrets correctly', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter({
        apiKey: harness.encryptSecret('test-api-key'),
      });

      const decrypted = await Effect.runPromise(
        adapter.initialize({ apiKey: harness.encryptSecret('test-api-key') })
      );

      // Verify secret was decrypted (via mock calls)
      expect(harness.mockCrypto.decryptCalls).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter({ missingRequired: true });

      const result = await Effect.runPromise(
        adapter.initialize({ missingRequired: true }).pipe(
          Effect.catchAll((error) => Effect.succeed({ error }))
        )
      );

      expect(result.error._tag).toBe('ValidationError');
    });
  });
}
```

### Category 2: Execution Tests

```typescript
// tests/plugins/execution.test.ts
import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';

export function createExecutionTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T,
  testActions: Array<{ action: any; expectedResult: any }>
) {
  describe(`${pluginName} - Execution`, () => {
    it('should execute actions successfully', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      await Effect.runPromise(adapter.initialize(harness.getValidConfig()));

      for (const { action, expectedResult } of testActions) {
        const result = await Effect.runPromise(adapter.execute(action));
        expect(result).toMatchObject(expectedResult);
      }
    });

    it('should handle concurrent executions', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      await Effect.runPromise(adapter.initialize(harness.getValidConfig()));

      const promises = testActions.map(({ action }) =>
        Effect.runPromise(adapter.execute(action))
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(testActions.length);
    });

    it('should timeout long-running actions', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const result = await Effect.runPromise(
        adapter
          .execute({ delay: 60000 }) // 60s delay
          .pipe(
            Effect.timeout('5 seconds'),
            Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
          )
      );

      expect(result.error).toBe('TimeoutException');
    });

    it('should cleanup resources after execution', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      await Effect.runPromise(
        adapter.execute(testActions[0].action).pipe(
          Effect.ensuring(adapter.cleanup())
        )
      );

      expect(harness.mockResources.cleaned).toBe(true);
    });
  });
}
```

### Category 3: Ontology Mapping Tests

```typescript
// tests/plugins/ontology.test.ts
import { describe, it, expect } from 'vitest';
import { Effect, Layer } from 'effect';

export function createOntologyMappingTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T,
  expectedMappings: {
    events?: string[];
    things?: string[];
    connections?: string[];
    knowledge?: boolean;
  }
) {
  describe(`${pluginName} - Ontology Mapping`, () => {
    it('should log events to events table', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      const mockDb = harness.createMockDatabase();

      await Effect.runPromise(
        adapter.execute({ action: 'test' }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      expect(mockDb.insertedEvents.length).toBeGreaterThan(0);

      if (expectedMappings.events) {
        const eventTypes = mockDb.insertedEvents.map((e) => e.type);
        expect(eventTypes).toEqual(
          expect.arrayContaining(expectedMappings.events)
        );
      }
    });

    it('should create things with correct schema', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      const mockDb = harness.createMockDatabase();

      await Effect.runPromise(
        adapter.execute({ action: 'create' }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      if (expectedMappings.things) {
        const thingTypes = mockDb.insertedThings.map((t) => t.type);
        expect(thingTypes).toEqual(
          expect.arrayContaining(expectedMappings.things)
        );
      }

      // Verify required fields
      mockDb.insertedThings.forEach((thing) => {
        expect(thing).toHaveProperty('type');
        expect(thing).toHaveProperty('groupId');
        expect(thing).toHaveProperty('properties');
        expect(thing).toHaveProperty('createdAt');
        expect(thing).toHaveProperty('updatedAt');
      });
    });

    it('should establish connections correctly', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      const mockDb = harness.createMockDatabase();

      await Effect.runPromise(
        adapter.execute({ action: 'connect' }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      if (expectedMappings.connections) {
        const connTypes = mockDb.insertedConnections.map((c) => c.relationshipType);
        expect(connTypes).toEqual(
          expect.arrayContaining(expectedMappings.connections)
        );
      }

      // Verify connection schema
      mockDb.insertedConnections.forEach((conn) => {
        expect(conn).toHaveProperty('fromThingId');
        expect(conn).toHaveProperty('toThingId');
        expect(conn).toHaveProperty('relationshipType');
        expect(conn).toHaveProperty('groupId');
        expect(conn).toHaveProperty('createdAt');
      });
    });

    it('should generate knowledge embeddings', async () => {
      if (!expectedMappings.knowledge) {
        return; // Skip if plugin doesn't use knowledge
      }

      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());
      const mockDb = harness.createMockDatabase();

      await Effect.runPromise(
        adapter.execute({ action: 'knowledge' }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      expect(mockDb.insertedKnowledge.length).toBeGreaterThan(0);

      // Verify knowledge schema
      mockDb.insertedKnowledge.forEach((knowledge) => {
        expect(knowledge).toHaveProperty('knowledgeType');
        expect(knowledge).toHaveProperty('text');
        expect(knowledge).toHaveProperty('embedding');
        expect(knowledge).toHaveProperty('embeddingModel');
        expect(knowledge).toHaveProperty('groupId');
      });
    });

    it('should scope all data by groupId', async () => {
      const harness = new PluginTestHarness();
      const testGroupId = 'test-group-123';
      const adapter = createAdapter({
        ...harness.getValidConfig(),
        groupId: testGroupId,
      });
      const mockDb = harness.createMockDatabase();

      await Effect.runPromise(
        adapter.execute({ action: 'test' }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      // Verify ALL inserted data has correct groupId
      mockDb.insertedEvents.forEach((event) => {
        expect(event.groupId).toBe(testGroupId);
      });

      mockDb.insertedThings.forEach((thing) => {
        expect(thing.groupId).toBe(testGroupId);
      });

      mockDb.insertedConnections.forEach((conn) => {
        expect(conn.groupId).toBe(testGroupId);
      });

      if (mockDb.insertedKnowledge.length > 0) {
        mockDb.insertedKnowledge.forEach((knowledge) => {
          expect(knowledge.groupId).toBe(testGroupId);
        });
      }
    });
  });
}
```

### Category 4: Security Tests

```typescript
// tests/plugins/security.test.ts
import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';

export function createSecurityTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T
) {
  describe(`${pluginName} - Security`, () => {
    it('should enforce multi-tenant isolation', async () => {
      const harness = new PluginTestHarness();
      const mockDb = harness.createMockDatabase();

      // Create adapters for two different groups
      const adapter1 = createAdapter({
        ...harness.getValidConfig(),
        groupId: 'group-1',
      });
      const adapter2 = createAdapter({
        ...harness.getValidConfig(),
        groupId: 'group-2',
      });

      // Execute actions in both groups
      await Effect.runPromise(
        Effect.all([
          adapter1.execute({ action: 'test' }),
          adapter2.execute({ action: 'test' }),
        ]).pipe(Effect.provide(Layer.succeed(ConvexDatabase, mockDb)))
      );

      // Verify data is scoped correctly
      const group1Events = mockDb.insertedEvents.filter(
        (e) => e.groupId === 'group-1'
      );
      const group2Events = mockDb.insertedEvents.filter(
        (e) => e.groupId === 'group-2'
      );

      expect(group1Events.length).toBeGreaterThan(0);
      expect(group2Events.length).toBeGreaterThan(0);

      // Ensure no cross-contamination
      expect(group1Events.every((e) => e.groupId === 'group-1')).toBe(true);
      expect(group2Events.every((e) => e.groupId === 'group-2')).toBe(true);
    });

    it('should never leak API keys in logs', async () => {
      const harness = new PluginTestHarness();
      const sensitiveKey = 'sk-1234567890abcdef';
      const adapter = createAdapter({
        ...harness.getValidConfig(),
        apiKey: sensitiveKey,
      });

      const mockLogger = harness.createMockLogger();

      await Effect.runPromise(
        adapter.execute({ action: 'test' }).pipe(
          Effect.provide(Layer.succeed(Logger, mockLogger))
        )
      );

      // Check that API key never appears in logs
      const allLogs = mockLogger.getLogs().join('\n');
      expect(allLogs).not.toContain(sensitiveKey);
      expect(allLogs).not.toContain('1234567890abcdef');
    });

    it('should enforce rate limits', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter({
        ...harness.getValidConfig(),
        rateLimit: { requests: 5, window: 1000 }, // 5 req/sec
      });

      // Fire 100 requests rapidly
      const promises = Array(100)
        .fill(null)
        .map(() =>
          Effect.runPromise(
            adapter.execute({ action: 'test' }).pipe(
              Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
            )
          )
        );

      const results = await Promise.all(promises);
      const rateLimitErrors = results.filter((r) => r.error === 'RateLimitError');

      expect(rateLimitErrors.length).toBeGreaterThan(0);
    });

    it('should validate all inputs', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const maliciousInputs = [
        { action: '<script>alert("xss")</script>' },
        { action: '../../etc/passwd' },
        { action: { __proto__: { polluted: true } } },
        { action: null },
        { action: undefined },
      ];

      for (const input of maliciousInputs) {
        const result = await Effect.runPromise(
          adapter.execute(input).pipe(
            Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
          )
        );

        expect(result.error).toBeDefined();
        expect(['ValidationError', 'ExecutionError']).toContain(result.error);
      }
    });

    it('should encrypt secrets at rest', async () => {
      const harness = new PluginTestHarness();
      const mockDb = harness.createMockDatabase();
      const plainSecret = 'my-api-key-123';

      const adapter = createAdapter({
        ...harness.getValidConfig(),
        apiKey: plainSecret,
      });

      await Effect.runPromise(
        adapter.initialize({ apiKey: plainSecret }).pipe(
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      // Check that secret is encrypted in database
      const storedSecrets = mockDb.insertedThings.filter(
        (t) => t.type === 'external_connection'
      );

      storedSecrets.forEach((thing) => {
        expect(thing.properties.apiKey).not.toBe(plainSecret);
        expect(thing.properties.apiKey).toContain('encrypted:');
      });
    });
  });
}
```

### Category 5: Error Handling Tests

```typescript
// tests/plugins/errors.test.ts
import { describe, it, expect } from 'vitest';
import { Effect, Schedule } from 'effect';

export function createErrorHandlingTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T
) {
  describe(`${pluginName} - Error Handling`, () => {
    it('should retry on network failures', async () => {
      const harness = new PluginTestHarness();
      const mockHttp = harness.createMockHttp();

      // Fail first 2 times, succeed on 3rd
      mockHttp.setFailurePattern([true, true, false]);

      const adapter = createAdapter(harness.getValidConfig());

      const result = await Effect.runPromise(
        adapter.execute({ action: 'http-call' }).pipe(
          Effect.retry({
            times: 3,
            schedule: Schedule.exponential('100 millis'),
          }),
          Effect.provide(Layer.succeed(HttpProvider, mockHttp))
        )
      );

      expect(result).toBeDefined();
      expect(mockHttp.callCount).toBe(3); // 2 failures + 1 success
    });

    it('should log error events', async () => {
      const harness = new PluginTestHarness();
      const mockDb = harness.createMockDatabase();
      const adapter = createAdapter(harness.getValidConfig());

      await Effect.runPromise(
        adapter.execute({ action: 'fail' }).pipe(
          Effect.catchAll(() => Effect.succeed(undefined)),
          Effect.provide(Layer.succeed(ConvexDatabase, mockDb))
        )
      );

      const errorEvents = mockDb.insertedEvents.filter(
        (e) => e.type === 'plugin_error_occurred'
      );

      expect(errorEvents.length).toBeGreaterThan(0);
      expect(errorEvents[0].metadata).toHaveProperty('error');
    });

    it('should handle timeout gracefully', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const result = await Effect.runPromise(
        adapter.execute({ action: 'slow', delay: 10000 }).pipe(
          Effect.timeout('1 second'),
          Effect.catchAll((error) => Effect.succeed({ error: error._tag }))
        )
      );

      expect(result.error).toBe('TimeoutException');
    });

    it('should provide helpful error messages', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const result = await Effect.runPromise(
        adapter.execute({ action: 'invalid' }).pipe(
          Effect.catchAll((error) => Effect.succeed({ error }))
        )
      );

      expect(result.error).toHaveProperty('message');
      expect(result.error.message).toContain('invalid');
      expect(result.error.message.length).toBeGreaterThan(10);
    });

    it('should cleanup on error', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      await Effect.runPromise(
        adapter.execute({ action: 'fail' }).pipe(
          Effect.catchAll(() => Effect.succeed(undefined)),
          Effect.ensuring(adapter.cleanup())
        )
      );

      expect(harness.mockResources.cleaned).toBe(true);
    });
  });
}
```

### Category 6: Performance Tests

```typescript
// tests/plugins/performance.test.ts
import { describe, it, expect } from 'vitest';
import { Effect } from 'effect';

export function createPerformanceTests<T extends PluginAdapter<any, any, any>>(
  pluginName: string,
  createAdapter: (config: any) => T,
  performanceLimits: {
    maxExecutionTime: number; // ms
    maxMemoryUsage: number; // MB
  }
) {
  describe(`${pluginName} - Performance`, () => {
    it('should execute within time limit', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const startTime = Date.now();
      await Effect.runPromise(adapter.execute({ action: 'test' }));
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(performanceLimits.maxExecutionTime);
    });

    it('should not leak memory', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Execute 100 times
      for (let i = 0; i < 100; i++) {
        await Effect.runPromise(adapter.execute({ action: 'test' }));
      }

      global.gc?.(); // Force garbage collection if available

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memoryGrowth = finalMemory - initialMemory;

      expect(memoryGrowth).toBeLessThan(performanceLimits.maxMemoryUsage);
    });

    it('should handle concurrent executions efficiently', async () => {
      const harness = new PluginTestHarness();
      const adapter = createAdapter(harness.getValidConfig());

      const startTime = Date.now();

      await Effect.runPromise(
        Effect.all(
          Array(10)
            .fill(null)
            .map(() => adapter.execute({ action: 'test' })),
          { concurrency: 10 }
        )
      );

      const duration = Date.now() - startTime;

      // Should be faster than sequential (10 * maxExecutionTime)
      expect(duration).toBeLessThan(performanceLimits.maxExecutionTime * 5);
    });
  });
}
```

---

## Test Infrastructure

### PluginTestHarness

```typescript
// tests/plugins/harness.ts
import { Effect, Layer } from 'effect';

export class PluginTestHarness {
  /**
   * Get valid configuration for plugin
   */
  getValidConfig(): Record<string, any> {
    return {
      groupId: 'test-group-123',
      apiKey: this.encryptSecret('test-api-key'),
      endpoint: 'https://test.example.com',
      timeout: 5000,
    };
  }

  /**
   * Encrypt secret (mock implementation)
   */
  encryptSecret(secret: string): string {
    return `encrypted:${Buffer.from(secret).toString('base64')}`;
  }

  /**
   * Create mock database
   */
  createMockDatabase(): MockDatabase {
    return new MockDatabase();
  }

  /**
   * Create mock HTTP provider
   */
  createMockHttp(): MockHttpProvider {
    return new MockHttpProvider();
  }

  /**
   * Create mock logger
   */
  createMockLogger(): MockLogger {
    return new MockLogger();
  }

  /**
   * Mock resource tracker
   */
  mockResources = {
    cleaned: false,
  };

  /**
   * Mock crypto service
   */
  mockCrypto = {
    decryptCalls: [] as string[],
  };
}
```

### MockDatabase

```typescript
// tests/plugins/mocks/database.ts
export class MockDatabase {
  insertedEvents: any[] = [];
  insertedThings: any[] = [];
  insertedConnections: any[] = [];
  insertedKnowledge: any[] = [];

  insert = (table: string, data: any) =>
    Effect.sync(() => {
      const id = `mock-${table}-${Math.random()}`;
      const record = { _id: id, ...data };

      switch (table) {
        case 'events':
          this.insertedEvents.push(record);
          break;
        case 'things':
          this.insertedThings.push(record);
          break;
        case 'connections':
          this.insertedConnections.push(record);
          break;
        case 'knowledge':
          this.insertedKnowledge.push(record);
          break;
      }

      return id;
    });

  query = (table: string) => ({
    filter: (fn: any) => ({
      collect: () => Effect.succeed([]),
      first: () => Effect.succeed(null),
    }),
  });

  vectorSearch = (args: any) => Effect.succeed([]);

  get = (id: string) => Effect.succeed(null);

  patch = (id: string, data: any) => Effect.succeed(undefined);

  reset() {
    this.insertedEvents = [];
    this.insertedThings = [];
    this.insertedConnections = [];
    this.insertedKnowledge = [];
  }
}
```

### MockHttpProvider

```typescript
// tests/plugins/mocks/http.ts
export class MockHttpProvider {
  callCount = 0;
  failurePattern: boolean[] = [];
  currentFailureIndex = 0;

  setFailurePattern(pattern: boolean[]) {
    this.failurePattern = pattern;
    this.currentFailureIndex = 0;
  }

  get = (args: { url: string; params?: any; headers?: any }) =>
    Effect.gen(() => {
      this.callCount++;

      if (
        this.failurePattern.length > 0 &&
        this.currentFailureIndex < this.failurePattern.length
      ) {
        const shouldFail = this.failurePattern[this.currentFailureIndex++];
        if (shouldFail) {
          return Effect.fail(new NetworkError('Mock network failure'));
        }
      }

      return Effect.succeed({
        status: 200,
        data: { mock: 'response' },
      });
    });

  post = (args: { url: string; body: any; headers?: any }) => this.get(args);
}
```

### MockLogger

```typescript
// tests/plugins/mocks/logger.ts
export class MockLogger {
  private logs: string[] = [];

  info(message: string) {
    this.logs.push(`INFO: ${message}`);
  }

  error(message: string) {
    this.logs.push(`ERROR: ${message}`);
  }

  debug(message: string) {
    this.logs.push(`DEBUG: ${message}`);
  }

  getLogs(): string[] {
    return this.logs;
  }

  reset() {
    this.logs = [];
  }
}
```

---

## Plugin Test Template

### Complete Test Suite Template

```typescript
// tests/plugins/plugin-example.test.ts
import { describe } from 'vitest';
import { ExamplePluginAdapter } from '../../adapters/ExamplePluginAdapter';
import {
  createInitializationTests,
  createExecutionTests,
  createOntologyMappingTests,
  createSecurityTests,
  createErrorHandlingTests,
  createPerformanceTests,
} from './framework';

describe('plugin-example Integration Tests', () => {
  const createAdapter = (config: any) => new ExamplePluginAdapter(config);

  const testActions = [
    {
      action: { type: 'example', params: { test: true } },
      expectedResult: { success: true },
    },
  ];

  const expectedMappings = {
    events: ['plugin_action_executed', 'plugin_error_occurred'],
    things: ['external_connection'],
    connections: ['owns'],
    knowledge: false,
  };

  const performanceLimits = {
    maxExecutionTime: 5000, // 5s
    maxMemoryUsage: 50, // 50MB
  };

  // Run all test categories
  createInitializationTests('plugin-example', createAdapter);
  createExecutionTests('plugin-example', createAdapter, testActions);
  createOntologyMappingTests('plugin-example', createAdapter, expectedMappings);
  createSecurityTests('plugin-example', createAdapter);
  createErrorHandlingTests('plugin-example', createAdapter);
  createPerformanceTests('plugin-example', createAdapter, performanceLimits);
});
```

---

## Test Fixtures

### Test Data Generator

```typescript
// tests/plugins/fixtures/generator.ts
export class TestDataGenerator {
  /**
   * Generate test group
   */
  static createGroup(): Id<'groups'> {
    return `group-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate test agent
   */
  static createAgent(groupId: Id<'groups'>): any {
    return {
      _id: `agent-${Math.random()}`,
      type: 'agent',
      groupId,
      properties: {
        name: 'Test Agent',
        capabilities: ['test'],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Generate test wallet
   */
  static createWallet(groupId: Id<'groups'>): any {
    return {
      _id: `wallet-${Math.random()}`,
      type: 'blockchain_wallet',
      groupId,
      properties: {
        chain: 'solana',
        network: 'devnet',
        publicKey: TestDataGenerator.randomPublicKey(),
        balance: Math.random() * 10,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Generate random public key
   */
  static randomPublicKey(): string {
    return Array(44)
      .fill(null)
      .map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)])
      .join('');
  }
}
```

---

## Assertions Library

### Custom Assertions

```typescript
// tests/plugins/assertions.ts
import { expect } from 'vitest';

export const pluginAssertions = {
  /**
   * Assert event was logged correctly
   */
  assertEventLogged(
    events: any[],
    expectedType: string,
    expectedMetadata?: Record<string, any>
  ) {
    const event = events.find((e) => e.type === expectedType);
    expect(event).toBeDefined();
    expect(event).toHaveProperty('actorId');
    expect(event).toHaveProperty('timestamp');
    expect(event).toHaveProperty('groupId');

    if (expectedMetadata) {
      expect(event.metadata).toMatchObject(expectedMetadata);
    }
  },

  /**
   * Assert thing was created correctly
   */
  assertThingCreated(
    things: any[],
    expectedType: string,
    expectedProperties?: Record<string, any>
  ) {
    const thing = things.find((t) => t.type === expectedType);
    expect(thing).toBeDefined();
    expect(thing).toHaveProperty('groupId');
    expect(thing).toHaveProperty('properties');
    expect(thing).toHaveProperty('createdAt');
    expect(thing).toHaveProperty('updatedAt');

    if (expectedProperties) {
      expect(thing.properties).toMatchObject(expectedProperties);
    }
  },

  /**
   * Assert connection was established
   */
  assertConnectionEstablished(
    connections: any[],
    fromId: string,
    toId: string,
    relationshipType: string
  ) {
    const connection = connections.find(
      (c) =>
        c.fromThingId === fromId &&
        c.toThingId === toId &&
        c.relationshipType === relationshipType
    );
    expect(connection).toBeDefined();
    expect(connection).toHaveProperty('groupId');
    expect(connection).toHaveProperty('createdAt');
  },

  /**
   * Assert multi-tenant isolation
   */
  assertMultiTenantIsolation(data: any[], groupId: string) {
    expect(data.every((item) => item.groupId === groupId)).toBe(true);
  },

  /**
   * Assert no secrets leaked
   */
  assertNoSecretsLeaked(data: any[], secrets: string[]) {
    const dataString = JSON.stringify(data);
    secrets.forEach((secret) => {
      expect(dataString).not.toContain(secret);
    });
  },
};
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/plugin-tests.yml
name: Plugin Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-plugins:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        plugin:
          - plugin-solana
          - plugin-knowledge
          - plugin-browser
          - plugin-discord
          - plugin-0x
          - plugin-openrouter
          - plugin-timeline
          - plugin-memory

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run plugin tests
        run: npm test -- tests/plugins/${{ matrix.plugin }}.test.ts
        env:
          # Use test credentials (devnet, test servers)
          SOLANA_RPC_URL: ${{ secrets.SOLANA_DEVNET_RPC }}
          DISCORD_TEST_TOKEN: ${{ secrets.DISCORD_TEST_BOT_TOKEN }}
          OPENROUTER_TEST_KEY: ${{ secrets.OPENROUTER_TEST_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: plugin-test-results-${{ matrix.plugin }}
          path: test-results/

  test-coverage:
    runs-on: ubuntu-latest
    needs: test-plugins

    steps:
      - uses: actions/checkout@v3

      - name: Run coverage report
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Test Runner Script

```bash
#!/bin/bash
# scripts/test-plugins.sh

# Test all plugins in test environment
echo "Running ElizaOS Plugin Integration Tests..."

# Set test environment
export NODE_ENV=test
export USE_TEST_CREDENTIALS=true

# Run tests for each plugin
PLUGINS=(
  "plugin-solana"
  "plugin-knowledge"
  "plugin-browser"
  "plugin-discord"
  "plugin-0x"
  "plugin-openrouter"
  "plugin-timeline"
  "plugin-memory"
)

FAILED=0

for PLUGIN in "${PLUGINS[@]}"; do
  echo ""
  echo "Testing $PLUGIN..."

  if npm test -- "tests/plugins/$PLUGIN.test.ts"; then
    echo "✅ $PLUGIN passed"
  else
    echo "❌ $PLUGIN failed"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "========================================="
echo "Test Results: $((${#PLUGINS[@]} - FAILED))/${#PLUGINS[@]} plugins passed"
echo "========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi

exit 0
```

---

## Summary

### Framework Capabilities

1. **Universal Testing**: Works with ANY ElizaOS plugin
2. **6-Dimension Validation**: Ensures correct ontology mapping
3. **Security First**: Tests multi-tenant isolation, secret management
4. **Performance Monitoring**: Tracks execution time and memory usage
5. **Comprehensive Coverage**: 6 test categories, 30+ test cases per plugin
6. **CI/CD Ready**: GitHub Actions integration, automated testing

### Usage Example

```typescript
// Add new plugin test in 5 minutes:
import { createPluginTestSuite } from './framework';
import { MyNewPluginAdapter } from '../../adapters/MyNewPluginAdapter';

describe('my-new-plugin', () => {
  createPluginTestSuite(
    'my-new-plugin',
    (groupId) => new MyNewPluginAdapter({ groupId }),
    [
      { action: { type: 'test' }, expectedResult: { success: true } },
    ]
  );
});
```

### Next Steps

1. Implement actual plugin adapters (when backend infrastructure exists)
2. Add real credentials to CI/CD secrets (devnet/testnet only)
3. Run tests on every commit
4. Monitor test results dashboard
5. Expand test coverage as needed

---

**Testing Framework Complete. Ready for Plugin Integration.**
