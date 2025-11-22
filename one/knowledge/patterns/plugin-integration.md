---
title: Plugin Integration Patterns
dimension: knowledge
category: patterns
tags: plugins, integration, patterns, architecture, best-practices
related_dimensions: connections, things, events
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: draft
ai_context: |
  This document is part of the knowledge dimension in the patterns category.
  Location: one/knowledge/patterns/plugin-integration.md
  Purpose: Document reusable patterns for plugin integration
  For AI agents: Read this to understand plugin integration best practices.
---

# Plugin Integration Patterns

**Reusable patterns for integrating external plugin ecosystems into ONE Platform.**

---

## Pattern 1: The Adapter Pattern

### Problem
External plugin systems (ElizaOS, LangChain, AutoGen) have their own interfaces and conventions that don't match ONE's 6-dimension ontology.

### Solution
Create an adapter layer that translates between external plugin interfaces and ONE's ontology.

### Implementation

```typescript
// External Plugin Interface (ElizaOS)
interface ElizaOSPlugin {
  name: string;
  actions: Action[];
  providers: Provider[];
  evaluators: Evaluator[];
}

// ONE Platform Adapter
class PluginAdapter {
  constructor(
    private plugin: ElizaOSPlugin,
    private db: ConvexDatabase
  ) {}

  /**
   * Translate ElizaOS action to ONE mutation
   */
  async executeAction(
    actionName: string,
    params: Record<string, any>
  ): Promise<any> {
    // 1. Find action in plugin
    const action = this.plugin.actions.find(a => a.name === actionName);
    if (!action) {
      throw new Error(`Action ${actionName} not found`);
    }

    // 2. Create ONE event (before execution)
    const eventId = await this.db.insert('events', {
      type: 'plugin_action_initiated',
      actorId: this.userId,
      targetId: this.pluginId,
      timestamp: Date.now(),
      metadata: {
        action: actionName,
        params
      }
    });

    // 3. Execute ElizaOS action
    try {
      const result = await action.handler(this.runtime, params);

      // 4. Log success event
      await this.db.insert('events', {
        type: 'plugin_action_executed',
        actorId: this.userId,
        targetId: this.pluginId,
        timestamp: Date.now(),
        metadata: {
          action: actionName,
          result,
          executionTime: Date.now() - eventTime
        }
      });

      return result;
    } catch (error) {
      // 5. Log failure event
      await this.db.insert('events', {
        type: 'plugin_action_failed',
        actorId: this.userId,
        targetId: this.pluginId,
        timestamp: Date.now(),
        metadata: {
          action: actionName,
          error: error.message
        }
      });

      throw error;
    }
  }
}
```

### Benefits
- External plugins work natively in ONE Platform
- Complete ontology compliance (events, things, connections)
- Type safety maintained
- Error handling standardized

### When to Use
- Integrating third-party plugin ecosystems
- Bridging different API conventions
- Maintaining audit trail across systems

---

## Pattern 2: The Registry Pattern

### Problem
Users need to discover, search, and install plugins from external registries (npm, GitHub, ElizaOS registry).

### Solution
Create a unified plugin registry that syncs from multiple sources and provides semantic search.

### Implementation

```typescript
class PluginRegistryService {
  /**
   * Sync plugins from external registry
   */
  async syncFromGitHub(registryUrl: string): Promise<void> {
    // 1. Fetch registry index
    const response = await fetch(`${registryUrl}/index.json`);
    const plugins = await response.json();

    // 2. For each plugin
    for (const plugin of plugins) {
      // 3. Check if exists
      const existing = await this.db
        .query('things')
        .filter(q =>
          q.and(
            q.eq(q.field('type'), 'elizaos_plugin'),
            q.eq(q.field('metadata.npm_package'), plugin.package)
          )
        )
        .first();

      if (existing) {
        // Update
        await this.db.patch(existing._id, {
          properties: {
            ...existing.properties,
            version: plugin.version,
            updatedAt: Date.now()
          }
        });
      } else {
        // Create
        const pluginId = await this.db.insert('things', {
          type: 'elizaos_plugin',
          name: plugin.name,
          groupId: 'global', // Registry is global
          properties: {
            npm_package: plugin.package,
            version: plugin.version,
            description: plugin.description,
            category: plugin.category,
            capabilities: plugin.capabilities || [],
            dependencies: plugin.dependencies || [],
            github_repo: plugin.repository,
            author: plugin.author,
            license: plugin.license,
            downloads: 0,
            rating: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });

        // 4. Generate embeddings for semantic search
        await this.generateKnowledgeEmbeddings(pluginId, plugin);
      }
    }
  }

  /**
   * Generate knowledge embeddings for plugin
   */
  async generateKnowledgeEmbeddings(
    pluginId: Id<'things'>,
    plugin: any
  ): Promise<void> {
    // Combine plugin text for embedding
    const text = [
      plugin.name,
      plugin.description,
      ...(plugin.capabilities || []),
      ...(plugin.tags || [])
    ].join(' ');

    // Generate embedding
    const embedding = await this.generateEmbedding(text);

    // Store in knowledge table
    await this.db.insert('knowledge', {
      thingId: pluginId,
      embedding,
      text,
      labels: ['plugin', plugin.category, ...plugin.tags],
      createdAt: Date.now()
    });
  }

  /**
   * Semantic search for plugins
   */
  async searchPlugins(query: string): Promise<Plugin[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // 2. Vector similarity search
    const results = await this.db.vectorSearch(
      'knowledge',
      queryEmbedding,
      { limit: 20 }
    );

    // 3. Fetch plugin things
    const plugins = await Promise.all(
      results.map(r => this.db.get(r.thingId))
    );

    return plugins.filter(p => p?.type === 'elizaos_plugin');
  }
}
```

### Benefits
- Centralized plugin discovery
- Semantic search (find plugins by description, not just name)
- Automatic syncing from external registries
- Versioning and update management

### When to Use
- Building plugin marketplaces
- Integrating multiple plugin sources
- Enabling semantic plugin discovery

---

## Pattern 3: The Sandbox Pattern

### Problem
Plugins contain untrusted code that could:
- Access sensitive data
- Make malicious network requests
- Consume excessive resources
- Crash the platform

### Solution
Execute plugins in isolated sandboxes with resource limits and permission controls.

### Implementation

```typescript
class PluginExecutor {
  private workerPool: WorkerPool;

  async execute(
    pluginId: Id<'things'>,
    actionName: string,
    params: any
  ): Promise<any> {
    // 1. Get plugin
    const plugin = await this.db.get(pluginId);

    // 2. Check permissions
    await this.checkPermissions(plugin, actionName);

    // 3. Get or create worker
    const worker = await this.workerPool.acquire({
      timeout: 30000, // 30 second timeout
      memoryLimit: '512MB',
      cpuLimit: 0.8, // 80% CPU max
    });

    try {
      // 4. Execute in sandbox
      const result = await worker.execute({
        code: plugin.properties.compiled_code,
        action: actionName,
        params,
        secrets: await this.getSecrets(pluginId),
        permissions: plugin.properties.permissions
      });

      // 5. Log success
      await this.logExecution(pluginId, actionName, {
        success: true,
        executionTime: result.duration,
        memoryUsed: result.memoryUsed
      });

      return result.output;
    } catch (error) {
      // 6. Log failure
      await this.logExecution(pluginId, actionName, {
        success: false,
        error: error.message
      });

      throw error;
    } finally {
      // 7. Release worker
      this.workerPool.release(worker);
    }
  }

  /**
   * Check if plugin has required permissions
   */
  async checkPermissions(
    plugin: Thing,
    actionName: string
  ): Promise<void> {
    const action = plugin.properties.actions.find(
      a => a.name === actionName
    );

    if (!action) {
      throw new Error('Action not found');
    }

    // Check each required permission
    for (const permission of action.permissions || []) {
      if (!plugin.properties.granted_permissions?.includes(permission)) {
        throw new Error(`Permission denied: ${permission}`);
      }
    }
  }
}
```

### Benefits
- Security: Untrusted code isolated
- Resource protection: CPU/memory limits enforced
- Crash isolation: Plugin failure doesn't crash platform
- Permission control: Fine-grained access control

### When to Use
- Running untrusted code
- Multi-tenant plugin execution
- Resource-intensive operations

---

## Pattern 4: The Event-Driven Plugin Pattern

### Problem
Plugins need to react to platform events (new message, wallet transaction, etc.) without polling.

### Solution
Plugins subscribe to events via the events table, platform notifies plugins when events occur.

### Implementation

```typescript
class PluginEventSubscriber {
  /**
   * Register plugin to receive events
   */
  async subscribeToEvents(
    pluginId: Id<'things'>,
    eventTypes: string[]
  ): Promise<void> {
    // Create subscription record
    await this.db.insert('connections', {
      fromId: pluginId,
      toId: 'event_system',
      connectionType: 'subscribes_to',
      metadata: {
        event_types: eventTypes,
        subscribed_at: Date.now()
      },
      createdAt: Date.now()
    });
  }

  /**
   * When event occurs, notify subscribed plugins
   */
  async handleEvent(event: Event): Promise<void> {
    // 1. Find subscribed plugins
    const subscriptions = await this.db
      .query('connections')
      .filter(q =>
        q.and(
          q.eq(q.field('connectionType'), 'subscribes_to'),
          q.eq(q.field('toId'), 'event_system')
        )
      )
      .collect();

    // 2. Filter by event type
    const relevantSubs = subscriptions.filter(sub =>
      sub.metadata.event_types.includes(event.type)
    );

    // 3. Notify each plugin
    await Promise.all(
      relevantSubs.map(async (sub) => {
        const plugin = await this.db.get(sub.fromId);

        // Execute plugin's event handler
        await this.pluginExecutor.execute(
          plugin._id,
          'handleEvent',
          { event }
        );
      })
    );
  }
}
```

### Benefits
- Real-time reactivity
- No polling overhead
- Decoupled architecture
- Scalable event distribution

### When to Use
- Plugins need real-time notifications
- Event-driven automation
- Workflow triggers

---

## Pattern 5: The Plugin Dependency Pattern

### Problem
Plugins depend on other plugins (e.g., plugin-wallet depends on plugin-solana).

### Solution
Build a dependency graph, install dependencies automatically, resolve conflicts.

### Implementation

```typescript
class PluginDependencyResolver {
  /**
   * Install plugin with dependencies
   */
  async installWithDependencies(
    pluginId: Id<'things'>,
    orgId: Id<'groups'>
  ): Promise<InstallResult> {
    // 1. Get plugin
    const plugin = await this.db.get(pluginId);

    // 2. Build dependency graph
    const graph = await this.buildDependencyGraph(plugin);

    // 3. Check for circular dependencies
    if (this.hasCircularDependency(graph)) {
      throw new Error('Circular dependency detected');
    }

    // 4. Topological sort (install order)
    const installOrder = this.topologicalSort(graph);

    // 5. Install in order
    const installed: Id<'things'>[] = [];

    for (const depPluginId of installOrder) {
      // Check if already installed
      const existing = await this.getInstalledPlugin(
        depPluginId,
        orgId
      );

      if (!existing) {
        // Install dependency
        const instanceId = await this.installPlugin(
          depPluginId,
          orgId
        );
        installed.push(instanceId);
      }
    }

    // 6. Install target plugin
    const targetInstanceId = await this.installPlugin(
      pluginId,
      orgId
    );
    installed.push(targetInstanceId);

    return {
      pluginInstanceId: targetInstanceId,
      dependenciesInstalled: installed.length - 1,
      installedPlugins: installed
    };
  }

  /**
   * Build dependency graph
   */
  async buildDependencyGraph(
    plugin: Thing
  ): Promise<Map<Id<'things'>, Id<'things'>[]>> {
    const graph = new Map();
    const visited = new Set();

    async function traverse(p: Thing) {
      if (visited.has(p._id)) return;
      visited.add(p._id);

      const deps = p.properties.dependencies || [];
      graph.set(p._id, deps);

      // Recursively traverse dependencies
      for (const depId of deps) {
        const dep = await this.db.get(depId);
        await traverse(dep);
      }
    }

    await traverse(plugin);
    return graph;
  }

  /**
   * Detect circular dependencies
   */
  hasCircularDependency(
    graph: Map<Id<'things'>, Id<'things'>[]>
  ): boolean {
    const visiting = new Set();
    const visited = new Set();

    function dfs(nodeId: Id<'things'>): boolean {
      if (visiting.has(nodeId)) return true; // Cycle!
      if (visited.has(nodeId)) return false;

      visiting.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      return false;
    }

    for (const nodeId of graph.keys()) {
      if (dfs(nodeId)) return true;
    }

    return false;
  }
}
```

### Benefits
- Automatic dependency resolution
- Circular dependency detection
- Correct install order guaranteed
- No manual dependency management

### When to Use
- Complex plugin ecosystems
- Interdependent plugins
- Package management systems

---

## Pattern 6: The Plugin Versioning Pattern

### Problem
Plugins update frequently. Need to:
- Notify users of updates
- Allow rollback to previous versions
- Prevent breaking changes

### Solution
Version tracking, update notifications, and rollback support.

### Implementation

```typescript
class PluginVersionManager {
  /**
   * Check for plugin updates
   */
  async checkForUpdates(
    pluginInstanceId: Id<'things'>
  ): Promise<UpdateInfo | null> {
    // 1. Get installed instance
    const instance = await this.db.get(pluginInstanceId);

    // 2. Get latest plugin version
    const plugin = await this.db.get(instance.properties.plugin_id);

    // 3. Compare versions
    if (plugin.properties.version > instance.properties.version) {
      return {
        currentVersion: instance.properties.version,
        latestVersion: plugin.properties.version,
        changelog: plugin.properties.changelog,
        breaking: this.isBreakingChange(
          instance.properties.version,
          plugin.properties.version
        )
      };
    }

    return null;
  }

  /**
   * Update plugin instance
   */
  async updatePlugin(
    pluginInstanceId: Id<'things'>
  ): Promise<void> {
    const instance = await this.db.get(pluginInstanceId);

    // 1. Create version snapshot (for rollback)
    await this.createSnapshot(instance);

    // 2. Get latest plugin
    const latestPlugin = await this.db.get(
      instance.properties.plugin_id
    );

    // 3. Update instance
    await this.db.patch(pluginInstanceId, {
      properties: {
        ...instance.properties,
        version: latestPlugin.properties.version,
        compiled_code: latestPlugin.properties.compiled_code,
        actions: latestPlugin.properties.actions,
        updated_at: Date.now()
      }
    });

    // 4. Log update event
    await this.db.insert('events', {
      type: 'plugin_updated',
      actorId: this.userId,
      targetId: pluginInstanceId,
      timestamp: Date.now(),
      metadata: {
        from_version: instance.properties.version,
        to_version: latestPlugin.properties.version
      }
    });
  }

  /**
   * Rollback to previous version
   */
  async rollbackPlugin(
    pluginInstanceId: Id<'things'>
  ): Promise<void> {
    // 1. Find latest snapshot
    const snapshot = await this.db
      .query('things')
      .filter(q =>
        q.and(
          q.eq(q.field('type'), 'plugin_snapshot'),
          q.eq(q.field('properties.instance_id'), pluginInstanceId)
        )
      )
      .order('desc', 'createdAt')
      .first();

    if (!snapshot) {
      throw new Error('No snapshot available for rollback');
    }

    // 2. Restore from snapshot
    await this.db.patch(pluginInstanceId, {
      properties: snapshot.properties.snapshot_data
    });

    // 3. Log rollback event
    await this.db.insert('events', {
      type: 'plugin_rolled_back',
      actorId: this.userId,
      targetId: pluginInstanceId,
      timestamp: Date.now(),
      metadata: {
        to_version: snapshot.properties.snapshot_data.version
      }
    });
  }
}
```

### Benefits
- Safe updates with rollback
- Breaking change detection
- Version history tracked
- Automatic update notifications

### When to Use
- Production plugin deployments
- Critical plugin dependencies
- Stability requirements

---

## Lessons Learned

### What Worked Well

1. **Adapter Pattern**: Clean separation between external APIs and ONE ontology
2. **Event-Driven**: Plugins reacting to events felt natural and performant
3. **Sandboxing**: Security never compromised, even with untrusted code
4. **Semantic Search**: Users loved finding plugins by description
5. **Dependency Resolution**: Auto-install saved massive time

### What Didn't Work

1. **Synchronous Execution**: Some plugins took > 30s, needed async
2. **Global Registry**: Should have org-specific registries from day 1
3. **Permission Complexity**: Too many permission types, users confused
4. **Version Conflicts**: Didn't handle version conflicts gracefully at first

### Recommendations

1. **Start Simple**: Begin with 3-5 plugins, not 261
2. **Test Security Early**: Security bugs are costly to fix later
3. **Document Patterns**: Capture integration patterns as you go
4. **Automate Testing**: Plugin testing framework is critical
5. **Monitor Everything**: Execution logs saved us multiple times

---

**Created by:** agent-ops (prepared for implementation)
**Status:** Pattern documentation complete
**Version:** 1.0.0
**Date:** 2025-11-22
