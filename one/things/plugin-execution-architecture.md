---
title: Plugin Execution Engine Architecture
dimension: things
category: specification
tags: elizaos, plugins, execution, sandbox, security, architecture
related_dimensions: events, things, groups
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: implementation
ai_context: |
  This document specifies the Plugin Execution Engine architecture for running
  elizaOS plugins securely in isolated sandboxed environments.
  Location: one/things/plugin-execution-architecture.md
  Purpose: Technical specification for plugin execution system
---

# Plugin Execution Engine Architecture

**Cycles:** 41-50 of elizaOS Plugin Integration Plan
**Status:** Implementation Complete
**Version:** 1.0.0

---

## Overview

The Plugin Execution Engine provides secure, isolated execution of elizaOS plugins through a dedicated Node.js service with worker pool management, resource limits, monitoring, caching, and quota enforcement.

---

## Architecture Decision (Cycle 41)

### Options Evaluated

1. **Convex Functions** - Limited, no arbitrary code execution
2. **Isolated Worker Threads** - Node.js workers, moderate isolation
3. **External Execution Service** - Separate Node.js container

### Decision: External Execution Service

**Why:**
- Maximum security isolation
- Flexible resource limiting
- Easy horizontal scaling
- Crash isolation from main platform
- Support for long-running plugin operations

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ONE Platform (Convex)                     │
│                                                              │
│  • Plugins table (registry)                                 │
│  • Plugin instances (org-scoped)                            │
│  • Plugin configurations                                    │
│  • Execution quotas                                         │
│  • Event logging                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ JWT Authentication
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Plugin Executor Service (Node.js)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               HTTP API Layer                         │  │
│  │  POST /execute - Execute plugin action               │  │
│  │  GET  /health  - Health check                        │  │
│  │  GET  /metrics - Prometheus metrics                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────┴───────────────────────────────────┐  │
│  │            Request Queue & Cache                     │  │
│  │  • Priority queue                                    │  │
│  │  • Result cache (TTL-based)                          │  │
│  │  • Request deduplication                             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────┴───────────────────────────────────┐  │
│  │              Worker Pool Manager                     │  │
│  │  • 10 concurrent workers (configurable)              │  │
│  │  • Load balancing                                    │  │
│  │  • Worker recycling                                  │  │
│  │  • Crash recovery                                    │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│         ┌───────────┼───────────┐                          │
│         │           │           │                          │
│    ┌────▼────┐ ┌────▼────┐ ┌───▼─────┐                    │
│    │ Worker  │ │ Worker  │ │ Worker  │ ... (10 workers)   │
│    │  #1     │ │  #2     │ │  #3     │                    │
│    └─────────┘ └─────────┘ └─────────┘                    │
│         │           │           │                          │
│         │           │           │                          │
│    ┌────▼───────────▼───────────▼──────┐                  │
│    │     Sandboxed Plugin Runtime      │                  │
│    │  • elizaOS plugin loader          │                  │
│    │  • Resource limits (CPU/mem)      │                  │
│    │  • Timeout enforcement (30s)      │                  │
│    │  • Network access control         │                  │
│    └───────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Model

### Resource Limits

| Resource | Limit | Enforcement |
|----------|-------|-------------|
| CPU | 80% max per worker | OS-level |
| Memory | 512MB per execution | Worker process limit |
| Execution Time | 30s default, 5min max | Timeout timer |
| Network Bandwidth | 10MB per execution | Proxy monitoring |
| Disk Writes | Prohibited | File system permissions |

### Network Access Control

**Allowlist approach:**
- Only approved external domains
- Block internal IPs (10.x.x.x, 192.168.x.x, 127.x.x.x)
- Block cloud metadata endpoints (169.254.x.x)
- Rate limit: 10 requests/minute per plugin
- All requests logged

### Code Isolation

- Each execution runs in separate worker process
- No shared state between executions
- Worker recycling after N executions (prevent memory leaks)
- Crash isolation (worker crash doesn't affect others)

---

## Worker Pool Implementation (Cycle 44)

### Configuration

```typescript
interface WorkerPoolConfig {
  minWorkers: number;        // 2 (always ready)
  maxWorkers: number;        // 10 (configurable)
  maxExecutionsPerWorker: number; // 100 (before recycling)
  workerIdleTimeout: number; // 300000 (5 minutes)
  taskTimeout: number;       // 30000 (30 seconds default)
  maxTaskTimeout: number;    // 300000 (5 minutes max)
}
```

### Load Balancing

- Round-robin distribution
- Prefer idle workers over busy ones
- Queue requests when all workers busy
- Reject requests when queue full (backpressure)

### Worker Lifecycle

```
IDLE → BUSY → IDLE → ... (N times) → RECYCLING → TERMINATED
  ↓                                      ↓
CRASHED ──────────────────────────────→ RESTARTED
```

---

## Caching Strategy (Cycle 46)

### Cache Key Generation

```typescript
const cacheKey = hash({
  pluginId: string,
  actionName: string,
  params: Record<string, any>,
  version: string // Plugin version
});
```

### Cache Configuration

```typescript
interface CacheConfig {
  enabled: boolean;           // true
  ttl: number;                // 300000 (5 minutes default)
  maxSize: number;            // 1000 entries
  strategy: 'lru';            // LRU eviction
  compressionEnabled: boolean; // true (for large results)
}
```

### Cache Invalidation

- TTL expiration (automatic)
- Plugin update/uninstall (manual)
- Cache key version bump
- Admin API endpoint

---

## Error Recovery System (Cycle 47)

### Retry Strategy

```typescript
interface RetryConfig {
  maxAttempts: number;        // 3
  backoffMultiplier: number;  // 2 (exponential backoff)
  initialDelay: number;       // 1000 (1 second)
  maxDelay: number;           // 10000 (10 seconds)
  retryableErrors: string[];  // ['TIMEOUT', 'NETWORK_ERROR', 'WORKER_CRASHED']
}
```

### Circuit Breaker

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;   // 5 failures
  resetTimeout: number;       // 60000 (1 minute)
  halfOpenMaxRequests: number; // 3 (test if recovered)
}
```

**States:**
- **CLOSED** - Normal operation
- **OPEN** - Too many failures, reject requests
- **HALF_OPEN** - Testing if plugin recovered

### Fallback Strategies

1. **Cached Result** - Return last successful result (if available)
2. **Default Response** - Plugin-defined fallback value
3. **Error Notification** - Alert org owner via events

---

## Usage Quotas (Cycle 48)

### Quota Tiers

| Tier | Executions/Day | Concurrent | Priority |
|------|----------------|------------|----------|
| Free | 100 | 1 | Low |
| Pro | 10,000 | 5 | Medium |
| Enterprise | Unlimited | 10 | High |

### Enforcement

```typescript
interface QuotaCheck {
  organizationId: string;
  tier: 'free' | 'pro' | 'enterprise';
  dailyUsage: number;
  dailyLimit: number;
  concurrentUsage: number;
  concurrentLimit: number;
  resetAt: number; // Timestamp (midnight UTC)
}
```

**Process:**
1. Check quota before execution
2. Increment counter (atomic)
3. Execute if within limits
4. Return quota error if exceeded
5. Reset counters daily (cron job)

---

## Monitoring & Metrics (Cycle 45)

### Prometheus Metrics

```
# Execution metrics
plugin_executions_total{plugin_id, action_name, status}
plugin_execution_duration_seconds{plugin_id, action_name}
plugin_execution_memory_bytes{plugin_id}

# Worker pool metrics
worker_pool_size{state}  # idle, busy, recycling
worker_pool_queue_size
worker_pool_queue_wait_seconds

# Error metrics
plugin_errors_total{plugin_id, error_type}
plugin_timeouts_total{plugin_id}
plugin_retries_total{plugin_id}

# Cache metrics
cache_hits_total
cache_misses_total
cache_size_bytes
```

### Health Checks

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    workerPool: boolean;    // Workers available?
    cache: boolean;         // Cache responsive?
    memory: boolean;        // Memory < 90%?
    cpu: boolean;           // CPU < 90%?
  };
  uptime: number;
  version: string;
}
```

---

## Event Logging (Cycle 49)

### Event Structure

```typescript
interface PluginExecutionEvent {
  type: 'plugin_action_executed';
  actorId: string;          // Person who triggered
  targetId: string;         // Plugin instance
  timestamp: number;
  metadata: {
    pluginId: string;
    actionName: string;
    executionTime: number;  // milliseconds
    memoryUsed: number;     // bytes
    status: 'success' | 'error' | 'timeout';
    errorType?: string;
    retryCount?: number;
    cacheHit?: boolean;
    quotaUsed?: number;
    quotaRemaining?: number;
  };
}
```

### Log to Convex Events Table

Every execution creates an event record:
- Success: Full execution details
- Error: Error stack trace (sanitized)
- Timeout: Partial execution details
- Quota exceeded: Quota status

---

## API Specification (Cycle 43)

### POST /execute

**Request:**
```json
{
  "pluginId": "plugin_xyz123",
  "actionName": "performAction",
  "params": {
    "param1": "value1",
    "param2": 123
  },
  "secrets": {
    "API_KEY": "sk_..."
  },
  "timeout": 30000,
  "priority": "medium"
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "output": "...",
    "metadata": {}
  },
  "executionTime": 1234,
  "memoryUsed": 45678901,
  "cacheHit": false,
  "logs": ["INFO: Started", "INFO: Completed"]
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "type": "EXECUTION_ERROR",
    "message": "Plugin execution failed",
    "details": "...",
    "retryable": true
  },
  "executionTime": 1234,
  "logs": ["INFO: Started", "ERROR: Failed"]
}
```

### GET /health

```json
{
  "status": "healthy",
  "checks": {
    "workerPool": true,
    "cache": true,
    "memory": true,
    "cpu": true
  },
  "uptime": 86400,
  "version": "1.0.0"
}
```

### GET /metrics

Returns Prometheus format metrics.

---

## Testing Strategy (Cycle 50)

### Test Coverage

1. **Unit Tests**
   - Worker pool management
   - Cache operations
   - Quota enforcement
   - Error handling

2. **Integration Tests**
   - End-to-end execution flow
   - Multi-plugin dependencies
   - Concurrent executions
   - Error recovery

3. **Load Tests**
   - 100 concurrent executions
   - Queue backpressure handling
   - Worker recycling under load
   - Memory leak detection

4. **Security Tests**
   - Network access control
   - Resource limit enforcement
   - Malicious code detection
   - Secret isolation

---

## Deployment

### Docker Container

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
COPY . .
EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Environment Variables

```bash
# Service configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Worker pool
MIN_WORKERS=2
MAX_WORKERS=10
WORKER_IDLE_TIMEOUT=300000
MAX_EXECUTIONS_PER_WORKER=100

# Cache
CACHE_ENABLED=true
CACHE_TTL=300000
CACHE_MAX_SIZE=1000

# Resource limits
MAX_MEMORY_MB=512
MAX_CPU_PERCENT=80
DEFAULT_TIMEOUT_MS=30000
MAX_TIMEOUT_MS=300000

# Security
ALLOWED_DOMAINS=api.openai.com,api.anthropic.com
NETWORK_RATE_LIMIT=10

# Convex integration
CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOY_KEY=...
```

---

## Performance Targets

| Metric | Target | Monitoring |
|--------|--------|------------|
| Execution latency (p50) | < 500ms | Prometheus |
| Execution latency (p95) | < 2s | Prometheus |
| Execution latency (p99) | < 5s | Prometheus |
| Success rate | > 99% | Prometheus |
| Cache hit rate | > 60% | Prometheus |
| Worker utilization | 60-80% | Prometheus |
| Memory usage | < 80% | Health check |
| CPU usage | < 80% | Health check |

---

## Future Enhancements

**Post-Launch (Cycles 101+):**
- GPU support for AI model plugins
- Multi-region deployment
- Plugin versioning and A/B testing
- Real-time execution streaming
- Plugin marketplace analytics
- Custom resource profiles per plugin
- Plugin dependency pre-warming

---

**Built with security, scalability, and the 6-dimension ontology in mind.**
