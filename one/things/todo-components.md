# Convex Components + Effect.ts Integration - 100 Inference Todo List

**Feature:** Effect.ts Service Layer Architecture with Convex Components
**Status:** Planning Complete → Ready for Execution
**Created:** 2025-10-30

## Overview

This document tracks all 100 inferences for implementing a production-ready service layer that combines Effect.ts functional programming patterns with Convex components (@convex-dev/agent, workflow, RAG, rate-limiter, etc.) to build sophisticated multi-agent AI systems.

**Key Principle:** Effect wraps components, not replaces. Components handle infrastructure, Effect handles business logic composition.

---

## Foundation Phase (Infer 1-10)

**Agent:** agent-director
**Goal:** Validate architecture, map components, create execution plan

### ✅ Infer 1: Validate Effect + Convex Components Architecture
**Status:** ✅ Complete
**Task:** Ensure Effect.ts service layer pattern works with all Convex components
**Validation:**
- Effect.tryPromise wraps component Promise calls ✅
- Context/Layer pattern for dependency injection ✅
- Tagged errors for type-safe error handling ✅
- No performance regression vs direct component usage ✅
- All 8 components compatible with Effect wrapper pattern ✅

### ✅ Infer 2: Map 8 Convex Components to Effect Services
**Status:** ✅ Complete
**Component Mapping:**
1. **@convex-dev/agent** → AgentService
   - Where Effect helps: Business logic orchestration, multi-agent composition, error handling
   - Where component shines: Thread management, streaming, RAG, tool calling

2. **@convex-dev/workflow** → WorkflowService
   - Where Effect helps: Step business logic, service composition, error handling
   - Where component shines: Durable execution, journaling, retry policies

3. **@convex-dev/rag** → RAGService
   - Where Effect helps: Composing RAG with other services, custom embeddings, error handling
   - Where component shines: Vector storage, semantic search, chunking

4. **@convex-dev/rate-limiter** → RateLimitService
   - Where Effect helps: Composing rate limits with business logic, multi-level limits, smart retries
   - Where component shines: Token bucket, fixed window, capacity reservation

5. **@convex-dev/persistent-text-streaming** → StreamingService
   - Where Effect helps: Error recovery during streaming, lifecycle management, backpressure
   - Where component shines: WebSocket delivery, delta storage, client subscription

6. **@convex-dev/workpool** → TaskQueueService
   - Where Effect helps: Batch enqueuing, error handling, coordinating multiple pools
   - Where component shines: Task queuing, parallelism control, completion callbacks

7. **@convex-dev/retrier** → ResilientExecutionService
   - Where Effect helps: Coordinating retries across operations, custom policies, composition
   - Where component shines: Action retries with persistent state, status tracking

8. **@convex-dev/crons** → CronService
   - Where Effect helps: Scheduled job logic composition, error handling, service orchestration
   - Where component shines: Dynamic cron registration, schedule management

### ✅ Infer 3: Define Service Layer Structure
**Status:** ✅ Complete
**Directory Structure:**
```
backend/convex/
├── services/                     # Effect service layers (8 services)
├── domain/                       # Business logic with Effect
│   ├── agents/                  # Multi-agent orchestration
│   ├── workflows/               # Workflow definitions
│   └── users/                   # User domain logic
├── api/                         # Public endpoints (use services)
└── lib/                         # Effect utilities
    ├── effect-utils.ts
    ├── convex-effect.ts
    └── monitoring.ts
```

### ✅ Infer 4: Identify Error Types and Patterns
**Status:** ✅ Complete
**Error Categories:**

**Domain Errors:**
- `UserNotFoundError` - User doesn't exist
- `ThreadNotFoundError` - Thread doesn't exist
- `InsufficientPermissionsError` - User lacks permissions

**Infrastructure Errors:**
- `AgentError` - Agent component failure
- `RAGError` - RAG component failure
- `DatabaseError` - Convex database error

**Rate Limiting Errors:**
- `RateLimitError` - Rate limit exceeded
- `QuotaExceededError` - Quota limit hit

**Pattern:** Tagged error classes with `Data.TaggedError`

### ✅ Infer 5: Plan Dependency Injection Strategy
**Status:** ✅ Complete
**Strategy:**
- **Context.Tag:** Define service interfaces
- **Layer.effect:** Implement service layers
- **Layer.merge:** Compose multiple layers
- **Effect.provide:** Inject layers at runtime
- **Test Layers:** Swap real services for mocks

**Example:**
```typescript
class AgentService extends Context.Tag("AgentService")<...>() {}
const AgentServiceLive = Layer.effect(AgentService, ...)
const TestAgentServiceLive = Layer.succeed(AgentService, mockImpl)
```

### ✅ Infer 6: Define Observability Requirements
**Status:** ✅ Complete
**Requirements:**
1. **Service Call Tracking:** Log start, complete, fail for every service call
2. **Token Usage:** Track AI model token consumption per request
3. **Error Tracking:** Log all errors with Effect error chain
4. **Performance Metrics:** Track latency per service operation
5. **Dependency Graph:** Visualize service dependencies
6. **Distributed Tracing:** Propagate trace IDs across service calls

**Implementation:** MonitoringService with Effect.tap

### ✅ Infer 7: Create Integration Patterns Document
**Status:** ✅ Complete
**Patterns:**
1. **Effect-Wrapped Component:** `Effect.tryPromise` for component calls
2. **Service Layer:** Context.Tag + Layer for DI
3. **Error Handling:** `Effect.catchTag` for specific errors, `Effect.catchAll` for fallback
4. **Parallel Execution:** `Effect.all` with concurrency control
5. **Resource Management:** `Effect.Scope` + `acquireRelease`
6. **Retry Logic:** `Effect.retry` + `Schedule.exponential`
7. **Service Composition:** `Effect.gen` for sequential, `Effect.all` for parallel

### ✅ Infer 8: Break Down Into 100 Inferences
**Status:** ✅ Complete
**Breakdown:**
- Foundation: 1-10 (planning)
- Core Services: 11-30 (Agent, RAG, Rate Limit, Workflow)
- Supporting Services: 31-50 (Streaming, Workpool, Retrier, Crons)
- Domain Logic: 51-70 (Multi-agent, workflows, tools)
- Observability & Testing: 71-90 (Monitoring, tests, error handling)
- Advanced & Documentation: 91-100 (Confect, docs, optimization, launch)

### ✅ Infer 9: Assign Agents to Phases
**Status:** ✅ Complete
**Agent Assignments:**
- **agent-director:** Infer 1-10, 99-100 (planning, coordination, launch)
- **agent-backend:** Infer 11-50, 91-93, 97-98 (service implementation, optimization)
- **agent-builder:** Infer 51-70 (domain logic, multi-agent orchestration)
- **agent-ops:** Infer 71-75, 81-85 (monitoring, resource management)
- **agent-quality:** Infer 76-80, 86-90 (testing, error handling)
- **agent-documenter:** Infer 94-96 (documentation, guides, examples)

### ✅ Infer 10: Create Complete Implementation Plan
**Status:** ✅ Complete
**Deliverable:** `/one/things/plans/components.md`
**Content:** Executive summary, 6-dimension mapping, architecture, phases, success metrics, risks, timeline

---

## Core Service Layers Phase (Infer 11-30)

**Agent:** agent-backend
**Goal:** Implement Effect service layers for core components

### ⏳ Infer 11: Wrap @convex-dev/agent with Effect (Part 1: Setup)
**Status:** Pending
**Dependencies:** Infer 1-10 (Foundation complete)
**Task:** Create AgentService interface and basic structure
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Context, Layer, Data
- [ ] Import Agent from @convex-dev/agent
- [ ] Define error types: `AgentError`, `ThreadNotFoundError`, `ToolExecutionError`
- [ ] Create `AgentService` Context.Tag with interface:
  - `generateResponse(ctx, threadId, prompt)`
  - `createThread(ctx, userId)`
  - `continueThread(ctx, threadId, message)`
- [ ] Stub implementation (returns Effect.succeed with placeholder)

### ⏳ Infer 12: Implement AgentServiceLive Layer
**Status:** Pending
**Dependencies:** Infer 11
**Task:** Full implementation of AgentService
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Initialize Agent component in Layer.effect
- [ ] Implement `generateResponse` with Effect.tryPromise wrapping agent.continueThread
- [ ] Implement `createThread` with proper error handling
- [ ] Inject RateLimitService dependency (yield* RateLimitService)
- [ ] Check rate limit before agent calls
- [ ] Return typed errors (AgentError, RateLimitError)
- [ ] Add Effect.retry for transient failures

### ⏳ Infer 13: Create Agent Tool Definitions with Effect
**Status:** Pending
**Dependencies:** Infer 12
**Task:** Define agent tools that use Effect services internally
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Create `emailTool` using EmailService (Effect-based)
- [ ] Create `searchTool` using RAGService (Effect-based)
- [ ] Create `databaseQueryTool` using database operations (Effect-based)
- [ ] Convert Effect programs to Promises in tool handlers (Effect.runPromise)
- [ ] Handle errors gracefully (return error messages to agent)
- [ ] Register tools with Agent component

### ⏳ Infer 14: Add Agent Service Error Types
**Status:** Pending
**Dependencies:** Infer 13
**Task:** Define comprehensive error types for AgentService
**File:** `backend/convex/domain/agents/errors.ts`
**Acceptance Criteria:**
- [ ] `AgentError` - General agent failure (includes agentName, cause)
- [ ] `ThreadNotFoundError` - Thread doesn't exist (includes threadId)
- [ ] `ToolExecutionError` - Tool failed (includes toolName, cause)
- [ ] `InvalidPromptError` - Prompt validation failed (includes reason)
- [ ] `ModelOverloadedError` - Model capacity exceeded (includes retryAfter)
- [ ] All errors extend `Data.TaggedError`
- [ ] All errors include helpful metadata

### ⏳ Infer 15: Test AgentService with Effect
**Status:** Pending
**Dependencies:** Infer 14
**Task:** Create test layer for AgentService
**File:** `backend/convex/services/agent.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestAgentServiceLive` layer with mock implementation
- [ ] Mock `generateResponse` returns fixed response
- [ ] Mock `createThread` returns deterministic threadId
- [ ] Test successful agent call (Effect.runPromise passes)
- [ ] Test error handling (Effect.runPromise rejects with AgentError)
- [ ] Test rate limit integration (mocked RateLimitService)
- [ ] Test retry logic (transient errors recover)

### ⏳ Infer 16: Wrap @convex-dev/rag with Effect (Part 1: Setup)
**Status:** Pending
**Dependencies:** Infer 15
**Task:** Create RAGService interface and basic structure
**File:** `backend/convex/services/rag.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Context, Layer, Data
- [ ] Import RAG from @convex-dev/rag
- [ ] Define error types: `RAGError`, `EmbeddingError`, `SearchError`
- [ ] Create `RAGService` Context.Tag with interface:
  - `addDocument(ctx, namespace, content, metadata)`
  - `search(ctx, namespace, query, limit)`
  - `deleteDocument(ctx, namespace, entryId)`
- [ ] Stub implementation

### ⏳ Infer 17: Implement RAGServiceLive Layer
**Status:** Pending
**Dependencies:** Infer 16
**Task:** Full implementation of RAGService
**File:** `backend/convex/services/rag.service.ts`
**Acceptance Criteria:**
- [ ] Initialize RAG component with openai.embedding("text-embedding-3-small")
- [ ] Implement `addDocument` with Effect.tryPromise wrapping rag.add
- [ ] Implement `search` with Effect.tryPromise wrapping rag.search
- [ ] Implement `deleteDocument` with proper error handling
- [ ] Pre-process content before adding (Effect pipeline)
- [ ] Handle embedding generation failures gracefully
- [ ] Add vector score threshold filtering

### ⏳ Infer 18: Compose RAG with Agent Service
**Status:** Pending
**Dependencies:** Infer 17
**Task:** Use RAGService within AgentService for context retrieval
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Create `contextualAnswerAgent` action
- [ ] Inject both AgentService and RAGService
- [ ] Search RAG for context (yield* ragService.search)
- [ ] Generate agent response with context (yield* agentService.generateResponse)
- [ ] Return answer + sources (with relevance scores)
- [ ] Handle errors (RAGError, AgentError) gracefully
- [ ] Add Effect.retry for robustness

### ⏳ Infer 19: Add RAG Error Types
**Status:** Pending
**Dependencies:** Infer 18
**Task:** Define comprehensive error types for RAGService
**File:** `backend/convex/domain/agents/errors.ts`
**Acceptance Criteria:**
- [ ] `RAGError` - General RAG failure (includes cause)
- [ ] `EmbeddingError` - Embedding generation failed (includes text, modelName)
- [ ] `SearchError` - Search query failed (includes query, namespace)
- [ ] `ChunkingError` - Document chunking failed (includes documentId)
- [ ] `InvalidNamespaceError` - Namespace doesn't exist (includes namespace)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 20: Test RAGService with Effect
**Status:** Pending
**Dependencies:** Infer 19
**Task:** Create test layer for RAGService
**File:** `backend/convex/services/rag.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestRAGServiceLive` layer with mock implementation
- [ ] Mock `search` returns fixed results with scores
- [ ] Mock `addDocument` returns deterministic entryId
- [ ] Test successful search (Effect.runPromise passes)
- [ ] Test error handling (SearchError, EmbeddingError)
- [ ] Test composition with AgentService (integration)
- [ ] Test retry logic for transient failures

### ⏳ Infer 21: Wrap @convex-dev/rate-limiter with Effect (Part 1: Setup)
**Status:** Pending
**Dependencies:** Infer 20
**Task:** Create RateLimitService interface and basic structure
**File:** `backend/convex/services/rate-limit.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Context, Layer, Data
- [ ] Import RateLimiter from @convex-dev/rate-limiter
- [ ] Define error types: `RateLimitError`, `QuotaExceededError`
- [ ] Create `RateLimitService` Context.Tag with interface:
  - `checkLimit(ctx, name, key, count?)`
  - `checkUserLimit(ctx, userId)`
  - `checkGlobalLimit(ctx)`
- [ ] Stub implementation

### ⏳ Infer 22: Implement RateLimitServiceLive Layer
**Status:** Pending
**Dependencies:** Infer 21
**Task:** Full implementation of RateLimitService
**File:** `backend/convex/services/rate-limit.service.ts`
**Acceptance Criteria:**
- [ ] Initialize RateLimiter with config (token bucket, fixed window)
- [ ] Implement `checkLimit` with Effect.tryPromise wrapping rateLimiter.limit
- [ ] Return RateLimitError if limit exceeded (include retryAfter)
- [ ] Implement `checkUserLimit` (per-user rate limit)
- [ ] Implement `checkGlobalLimit` (system-wide rate limit)
- [ ] Add reserve parameter for capacity reservation
- [ ] Handle multiple rate limit tiers (starter, pro, enterprise)

### ⏳ Infer 23: Multi-Level Rate Limiting with Effect
**Status:** Pending
**Dependencies:** Infer 22
**Task:** Coordinate user and global rate limits in parallel
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Create `protectedAgentCall` action
- [ ] Check user and global limits in parallel (Effect.all)
- [ ] Fail fast if any limit exceeded
- [ ] Return specific error (UserRateLimitExceeded vs GlobalRateLimitExceeded)
- [ ] Include retryAfter in error response
- [ ] Execute agent call only if both limits OK
- [ ] Log rate limit events

### ⏳ Infer 24: Add Rate Limit Error Types
**Status:** Pending
**Dependencies:** Infer 23
**Task:** Define comprehensive error types for rate limiting
**File:** `backend/convex/domain/agents/errors.ts`
**Acceptance Criteria:**
- [ ] `RateLimitError` - General rate limit (includes limitName, retryAfter)
- [ ] `UserRateLimitExceeded` - User-specific limit hit (includes userId, retryAfter)
- [ ] `GlobalRateLimitExceeded` - System-wide limit hit (includes retryAfter)
- [ ] `QuotaExceededError` - Monthly quota exceeded (includes quotaType, resetDate)
- [ ] `ReservationFailedError` - Capacity reservation failed (includes requested, available)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 25: Test RateLimitService with Effect
**Status:** Pending
**Dependencies:** Infer 24
**Task:** Create test layer for RateLimitService
**File:** `backend/convex/services/rate-limit.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestRateLimitServiceLive` layer
- [ ] Mock `checkLimit` returns OK for first N calls, then RateLimitError
- [ ] Test successful limit check (Effect.runPromise passes)
- [ ] Test rate limit exceeded (Effect.runPromise rejects with RateLimitError)
- [ ] Test parallel limit checks (user + global)
- [ ] Test retry logic (Effect.retry with exponential backoff)
- [ ] Test capacity reservation

### ⏳ Infer 26: Wrap @convex-dev/workflow with Effect (Part 1: Setup)
**Status:** Pending
**Dependencies:** Infer 25
**Task:** Create WorkflowService interface and basic structure
**File:** `backend/convex/services/workflow.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Context, Layer, Data
- [ ] Import WorkflowManager from @convex-dev/workflow
- [ ] Define error types: `WorkflowError`, `StepFailedError`
- [ ] Create `WorkflowService` Context.Tag with interface:
  - `defineWorkflow(name, handler)`
  - `startWorkflow(ctx, workflowId, args)`
  - `getWorkflowStatus(ctx, workflowId)`
- [ ] Stub implementation

### ⏳ Infer 27: Implement WorkflowServiceLive Layer
**Status:** Pending
**Dependencies:** Infer 26
**Task:** Full implementation of WorkflowService
**File:** `backend/convex/services/workflow.service.ts`
**Acceptance Criteria:**
- [ ] Initialize WorkflowManager with default retry behavior
- [ ] Implement `defineWorkflow` wrapping workflow.define
- [ ] Implement `startWorkflow` with Effect.tryPromise
- [ ] Implement `getWorkflowStatus` for monitoring
- [ ] Handle workflow step errors gracefully
- [ ] Add retry policies per step
- [ ] Support long-running workflows (hours/days)

### ⏳ Infer 28: Create Effect Programs for Workflow Steps
**Status:** Pending
**Dependencies:** Infer 27
**Task:** Use Effect services within workflow steps
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Define `researchWorkflow` using workflow.define
- [ ] Step 1: Classify query (Effect-based action)
- [ ] Step 2: Parallel research (web, academic, news agents)
- [ ] Step 3: Synthesize findings (Effect-based action using AgentService + RAGService)
- [ ] Step 4: Generate report (Effect-based action)
- [ ] Step 5: Save and notify (mutation)
- [ ] All actions use Effect.runPromise internally
- [ ] Error handling with Effect.catchAll

### ⏳ Infer 29: Add Workflow Error Types
**Status:** Pending
**Dependencies:** Infer 28
**Task:** Define comprehensive error types for workflows
**File:** `backend/convex/domain/workflows/errors.ts`
**Acceptance Criteria:**
- [ ] `WorkflowError` - General workflow failure (includes workflowId, cause)
- [ ] `StepFailedError` - Specific step failed (includes stepName, cause)
- [ ] `WorkflowTimeoutError` - Workflow exceeded time limit (includes workflowId, duration)
- [ ] `WorkflowCanceledError` - Workflow manually canceled (includes reason)
- [ ] `InvalidWorkflowStateError` - Workflow in invalid state (includes currentState)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 30: Test WorkflowService with Effect
**Status:** Pending
**Dependencies:** Infer 29
**Task:** Create test layer for WorkflowService
**File:** `backend/convex/services/workflow.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestWorkflowServiceLive` layer
- [ ] Mock workflow steps return deterministic results
- [ ] Test successful workflow execution (all steps pass)
- [ ] Test step failure handling (StepFailedError propagates)
- [ ] Test retry logic (step retries 3 times before failing)
- [ ] Test long-running workflow (status polling)
- [ ] Test workflow cancellation

---

## Supporting Services Phase (Infer 31-50)

**Agent:** agent-backend
**Goal:** Implement remaining service layers

### ⏳ Infer 31: Wrap @convex-dev/persistent-text-streaming with Effect
**Status:** Pending
**Dependencies:** Infer 30
**Task:** Create StreamingService interface and implementation
**File:** `backend/convex/services/streaming.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Stream from effect
- [ ] Import PersistentTextStreaming from @convex-dev/persistent-text-streaming
- [ ] Define error types: `StreamingError`, `ChunkAppendError`
- [ ] Create `StreamingService` Context.Tag
- [ ] Implement `generateStream(ctx, prompt, streamId)`
- [ ] Use Effect.Stream for backpressure handling
- [ ] Wrap persistentTextStreaming.appendChunk with Effect.tryPromise
- [ ] Handle stream lifecycle (start, chunk, complete, error)

### ⏳ Infer 32: Implement Streaming Error Recovery
**Status:** Pending
**Dependencies:** Infer 31
**Task:** Add retry logic for failed stream chunks
**File:** `backend/convex/services/streaming.service.ts`
**Acceptance Criteria:**
- [ ] Retry chunk append on transient errors (Effect.retry)
- [ ] Use exponential backoff (Schedule.exponential)
- [ ] Max 3 retries per chunk
- [ ] Mark stream as failed if chunk repeatedly fails
- [ ] Store failed chunks for manual recovery
- [ ] Log streaming errors as events

### ⏳ Infer 33: Test StreamingService with Effect
**Status:** Pending
**Dependencies:** Infer 32
**Task:** Create test layer for StreamingService
**File:** `backend/convex/services/streaming.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestStreamingServiceLive` layer
- [ ] Mock stream returns deterministic chunks
- [ ] Test successful streaming (all chunks delivered)
- [ ] Test chunk failure handling (retry + eventual success)
- [ ] Test stream cancellation (cleanup resources)
- [ ] Test backpressure (slow consumer)
- [ ] Test concurrent streams

### ⏳ Infer 34: Add Streaming Error Types
**Status:** Pending
**Dependencies:** Infer 33
**Task:** Define comprehensive error types for streaming
**File:** `backend/convex/domain/agents/errors.ts`
**Acceptance Criteria:**
- [ ] `StreamingError` - General streaming failure (includes streamId, cause)
- [ ] `ChunkAppendError` - Chunk append failed (includes chunk, attempt)
- [ ] `StreamCompletionError` - Failed to mark stream complete (includes streamId)
- [ ] `StreamProcessingError` - Stream processing logic failed (includes cause)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 35: Integrate Streaming with Agent Component
**Status:** Pending
**Dependencies:** Infer 34
**Task:** Use Agent component's built-in streaming instead of persistent-text-streaming
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Enable `saveStreamDeltas: true` in Agent config
- [ ] Agent automatically handles streaming to Convex
- [ ] Client subscribes to stream deltas via useQuery
- [ ] StreamingService used only for custom HTTP streaming
- [ ] Document when to use each approach
- [ ] Update tests to use Agent streaming

### ⏳ Infer 36: Wrap @convex-dev/workpool with Effect
**Status:** Pending
**Dependencies:** Infer 35
**Task:** Create TaskQueueService interface and implementation
**File:** `backend/convex/services/workpool.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Queue from effect
- [ ] Import Workpool from @convex-dev/workpool
- [ ] Define error types: `EnqueueError`, `TaskStatusError`
- [ ] Create `TaskQueueService` Context.Tag
- [ ] Implement `enqueueTask(ctx, priority, action, args)`
- [ ] Implement `getTaskStatus(ctx, taskId)`
- [ ] Support multiple workpools (high priority, low priority)
- [ ] Handle task completion callbacks

### ⏳ Infer 37: Batch Task Enqueuing with Effect
**Status:** Pending
**Dependencies:** Infer 36
**Task:** Enqueue multiple tasks in parallel
**File:** `backend/convex/domain/workflows/batch-processing.ts`
**Acceptance Criteria:**
- [ ] Create `processBatch` mutation
- [ ] Use Effect.all to enqueue tasks in parallel
- [ ] Control concurrency (max 10 concurrent enqueues)
- [ ] Return array of taskIds
- [ ] Handle partial failures gracefully
- [ ] Log batch processing metrics
- [ ] Add retry for failed enqueues

### ⏳ Infer 38: Test TaskQueueService with Effect
**Status:** Pending
**Dependencies:** Infer 37
**Task:** Create test layer for TaskQueueService
**File:** `backend/convex/services/workpool.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestTaskQueueServiceLive` layer
- [ ] Mock `enqueueTask` returns deterministic taskId
- [ ] Mock `getTaskStatus` returns task progress
- [ ] Test successful task enqueuing
- [ ] Test task status polling
- [ ] Test batch enqueuing (parallel)
- [ ] Test priority queuing (high vs low)
- [ ] Test completion callbacks

### ⏳ Infer 39: Add Workpool Error Types
**Status:** Pending
**Dependencies:** Infer 38
**Task:** Define comprehensive error types for task queues
**File:** `backend/convex/domain/workflows/errors.ts`
**Acceptance Criteria:**
- [ ] `EnqueueError` - Task enqueue failed (includes action, cause)
- [ ] `TaskStatusError` - Failed to check task status (includes taskId)
- [ ] `TaskFailedError` - Task execution failed (includes taskId, error)
- [ ] `WorkpoolFullError` - Workpool at capacity (includes maxParallelism, current)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 40: Integrate Workpool with Workflow
**Status:** Pending
**Dependencies:** Infer 39
**Task:** Use TaskQueueService within workflows for async operations
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Enqueue background tasks from workflow steps
- [ ] Poll task status within workflow
- [ ] Handle task failures within workflow
- [ ] Use Effect.retry for task status polling
- [ ] Log task enqueue/complete events
- [ ] Update workflow state based on task results

### ⏳ Infer 41: Wrap @convex-dev/retrier with Effect
**Status:** Pending
**Dependencies:** Infer 40
**Task:** Create ResilientExecutionService interface and implementation
**File:** `backend/convex/services/retrier.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect, Schedule from effect
- [ ] Import ActionRetrier from @convex-dev/retrier
- [ ] Define error types: `RetrierStartError`, `ExecutionTimeout`
- [ ] Create `ResilientExecutionService` Context.Tag
- [ ] Implement `executeWithRetry(ctx, action, args)`
- [ ] Poll for completion with Effect.repeat
- [ ] Return result or throw ExecutionFailed
- [ ] Handle retrier-level and Effect-level retries

### ⏳ Infer 42: Combine Retrier with Effect.retry
**Status:** Pending
**Dependencies:** Infer 41
**Task:** Hybrid retry strategy (component + Effect)
**File:** `backend/convex/domain/workflows/reliable-execution.ts`
**Acceptance Criteria:**
- [ ] Use retrier for infrastructure-level retries (actions with persistent state)
- [ ] Use Effect.retry for application-level retries (in-memory operations)
- [ ] Example: Validate data (Effect.retry) → Process data (retrier.run)
- [ ] Document when to use each approach
- [ ] Add integration test for hybrid retries
- [ ] Log retry attempts as events

### ⏳ Infer 43: Test ResilientExecutionService with Effect
**Status:** Pending
**Dependencies:** Infer 42
**Task:** Create test layer for ResilientExecutionService
**File:** `backend/convex/services/retrier.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestResilientExecutionServiceLive` layer
- [ ] Mock action execution with configurable success/failure
- [ ] Test successful execution (returns result)
- [ ] Test retries (fails 2 times, succeeds on 3rd)
- [ ] Test max retries exceeded (throws ExecutionFailed)
- [ ] Test timeout (throws ExecutionTimeout)
- [ ] Test status polling (Effect.repeat)

### ⏳ Infer 44: Add Retrier Error Types
**Status:** Pending
**Dependencies:** Infer 43
**Task:** Define comprehensive error types for retries
**File:** `backend/convex/domain/workflows/errors.ts`
**Acceptance Criteria:**
- [ ] `RetrierStartError` - Failed to start retry execution (includes cause)
- [ ] `StatusCheckError` - Failed to check execution status (includes runId)
- [ ] `ExecutionTimeout` - Execution exceeded time limit (includes runId, duration)
- [ ] `ExecutionFailed` - Execution failed after all retries (includes error, attempts)
- [ ] `ExecutionCanceled` - Execution manually canceled (includes runId)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 45: Integrate Retrier with Workflow
**Status:** Pending
**Dependencies:** Infer 44
**Task:** Use ResilientExecutionService for critical workflow steps
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Define `supportTicketWorkflow` using workflow.define
- [ ] Use retrier for external API calls (email, Slack)
- [ ] Use Effect.retry for internal operations (validation, formatting)
- [ ] Handle ExecutionFailed gracefully (fallback actions)
- [ ] Log retry attempts and final outcomes
- [ ] Test workflow with simulated failures

### ⏳ Infer 46: Wrap @convex-dev/crons with Effect
**Status:** Pending
**Dependencies:** Infer 45
**Task:** Create CronService interface and implementation
**File:** `backend/convex/services/crons.service.ts`
**Acceptance Criteria:**
- [ ] Import Effect from effect
- [ ] Import Crons from @convex-dev/crons
- [ ] Define error types: `CronRegisterError`, `CronExecutionError`
- [ ] Create `CronService` Context.Tag
- [ ] Implement `register(ctx, schedule, action, args, name)`
- [ ] Implement `unregister(ctx, name)`
- [ ] Implement `list(ctx)` for registered crons
- [ ] Support cron specs (e.g., "0 0 * * *")

### ⏳ Infer 47: Effect-Based Cron Job Logic
**Status:** Pending
**Dependencies:** Infer 46
**Task:** Use Effect in cron job handlers
**File:** `backend/convex/domain/crons/daily-maintenance.ts`
**Acceptance Criteria:**
- [ ] Create `dailyMaintenanceWithEffect` internalAction
- [ ] Use Effect.gen for job logic
- [ ] Inject services (RAGService, MonitoringService)
- [ ] Clean up old content (Effect-wrapped mutation)
- [ ] Generate daily report (Effect service call)
- [ ] Send report via email (Effect-wrapped action)
- [ ] Handle errors with Effect.catchAll (log + succeed)
- [ ] Run with Effect.runPromise

### ⏳ Infer 48: Test CronService with Effect
**Status:** Pending
**Dependencies:** Infer 47
**Task:** Create test layer for CronService
**File:** `backend/convex/services/crons.service.test.ts`
**Acceptance Criteria:**
- [ ] Create `TestCronServiceLive` layer
- [ ] Mock `register` stores cron definition
- [ ] Mock `list` returns registered crons
- [ ] Test cron registration (succeeds)
- [ ] Test cron execution (job runs on schedule)
- [ ] Test cron unregistration (removes from list)
- [ ] Test job errors (logged, job continues)
- [ ] Test Effect-based job logic (services injected)

### ⏳ Infer 49: Add Cron Error Types
**Status:** Pending
**Dependencies:** Infer 48
**Task:** Define comprehensive error types for crons
**File:** `backend/convex/domain/crons/errors.ts`
**Acceptance Criteria:**
- [ ] `CronRegisterError` - Failed to register cron (includes cronspec, cause)
- [ ] `CronExecutionError` - Cron job execution failed (includes jobName, cause)
- [ ] `InvalidCronspecError` - Cron schedule format invalid (includes cronspec)
- [ ] `CronNotFoundError` - Cron doesn't exist (includes cronName)
- [ ] All errors extend `Data.TaggedError`

### ⏳ Infer 50: Integrate Crons with Monitoring
**Status:** Pending
**Dependencies:** Infer 49
**Task:** Track cron job executions via MonitoringService
**File:** `backend/convex/domain/crons/daily-maintenance.ts`
**Acceptance Criteria:**
- [ ] Inject MonitoringService in cron job
- [ ] Track job start (Effect.tap)
- [ ] Track job completion (Effect.tap)
- [ ] Track job errors (Effect.tapError)
- [ ] Log execution duration
- [ ] Alert if job fails repeatedly (3+ times)
- [ ] Store job metrics in database

---

## Domain Logic Phase (Infer 51-70)

**Agents:** agent-backend, agent-builder
**Goal:** Build complex business logic using Effect services

### ⏳ Infer 51: Multi-Agent Orchestration with Effect
**Status:** Pending
**Dependencies:** Infer 50
**Task:** Compose multiple agents in parallel and sequential flows
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Create `multiAgentPipeline` action
- [ ] Inject AgentService and RAGService
- [ ] Sequential: Fetch context → Classify intent → Route to agent
- [ ] Parallel: Quality checks (grammar + factuality)
- [ ] Use Effect.gen for sequential, Effect.all for parallel
- [ ] Handle errors from multiple agents gracefully
- [ ] Return combined result

### ⏳ Infer 52: Parallel Agent Execution (Effect.all)
**Status:** Pending
**Dependencies:** Infer 51
**Task:** Run multiple agents concurrently with concurrency control
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Use Effect.all with concurrency: 2 (limit parallel agents)
- [ ] Execute: [webSearchAgent, academicAgent, newsAgent]
- [ ] Collect results in array
- [ ] Handle partial failures (mode: "default" vs "either")
- [ ] Return all results or fail fast
- [ ] Log agent execution metrics

### ⏳ Infer 53: Sequential Agent Pipelines (Effect.gen)
**Status:** Pending
**Dependencies:** Infer 52
**Task:** Chain agents where output of one feeds into next
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Use Effect.gen for sequential composition
- [ ] Example: ClassifyAgent → (if technical) TechnicalAgent → QualityCheckAgent
- [ ] Pass results between steps (yield* pattern)
- [ ] Short-circuit on errors (automatic with Effect)
- [ ] Add Effect.tap for logging intermediate results
- [ ] Return final result

### ⏳ Infer 54: Conditional Agent Routing
**Status:** Pending
**Dependencies:** Infer 53
**Task:** Route to different agents based on classification
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Classify query type (technical, sales, support)
- [ ] Route to appropriate agent based on classification
- [ ] Use Effect conditional logic (ternary or if/else in Effect.gen)
- [ ] Fall back to general agent if classification fails
- [ ] Log routing decisions as events
- [ ] Test all routing paths

### ⏳ Infer 55: Error Propagation Across Agents
**Status:** Pending
**Dependencies:** Infer 54
**Task:** Handle errors from any agent in pipeline
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Use Effect.catchTag for specific agent errors
- [ ] Example: Catch ClassificationError, use default route
- [ ] Example: Catch AgentError from any agent, return fallback response
- [ ] Use Effect.catchAll for unexpected errors
- [ ] Log all errors as events
- [ ] Graceful degradation (partial results)

### ⏳ Infer 56: Research Workflow Implementation (Part 1: Structure)
**Status:** Pending
**Dependencies:** Infer 55
**Task:** Define research workflow structure
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Import workflow from services/workflow.service
- [ ] Define `researchWorkflow` with workflow.define
- [ ] Args: { query: v.string(), userId: v.string() }
- [ ] Return type: ResearchResult
- [ ] Stub handler (async function with steps)
- [ ] Plan 5 steps: Classify, Parallel Research, Synthesize, Generate Report, Save

### ⏳ Infer 57: Research Workflow (Part 2: Parallel Research)
**Status:** Pending
**Dependencies:** Infer 56
**Task:** Implement parallel research step
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Step 2: Parallel research with Promise.all
- [ ] Run: webSearchAgent, academicAgent, newsAgent (all actions)
- [ ] Use step.runAction for each agent
- [ ] Collect results in array
- [ ] Handle failures (log but continue)
- [ ] Pass results to next step

### ⏳ Infer 58: Research Workflow (Part 3: Synthesis with Effect)
**Status:** Pending
**Dependencies:** Infer 57
**Task:** Synthesize findings using Effect services
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Create `synthesisAgentWithEffect` internalAction
- [ ] Use Effect.gen for composition
- [ ] Inject AgentService and RAGService
- [ ] Fetch background context (RAGService.search)
- [ ] Synthesize findings with agent
- [ ] Add Effect.retry for robustness
- [ ] Return synthesis result
- [ ] Call from workflow step

### ⏳ Infer 59: Research Workflow (Part 4: Report Generation)
**Status:** Pending
**Dependencies:** Infer 58
**Task:** Generate final report
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Step 4: Generate report (step.runAction)
- [ ] Create `reportGeneratorWithEffect` internalAction
- [ ] Use AgentService to format report
- [ ] Include: Summary, key findings, sources, recommendations
- [ ] Format as markdown
- [ ] Add Effect error handling
- [ ] Return formatted report

### ⏳ Infer 60: Research Workflow (Part 5: Save and Notify)
**Status:** Pending
**Dependencies:** Infer 59
**Task:** Save report and notify user
**File:** `backend/convex/domain/workflows/research.ts`
**Acceptance Criteria:**
- [ ] Step 5: Save report (step.runMutation)
- [ ] Create mutation to save to database
- [ ] Send notification email (optional action)
- [ ] Log workflow completion event
- [ ] Return final report
- [ ] Test complete workflow end-to-end

### ⏳ Infer 61: Support Ticket Workflow (Part 1: Structure)
**Status:** Pending
**Dependencies:** Infer 60
**Task:** Define support ticket workflow
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Define `supportTicketWorkflow` with workflow.define
- [ ] Args: { userId: v.string(), issue: v.string() }
- [ ] Return type: SupportResult
- [ ] Plan 4 steps: Create thread, Generate response, Quality check, Save ticket
- [ ] Stub handler

### ⏳ Infer 62: Support Workflow (Part 2: Create Thread)
**Status:** Pending
**Dependencies:** Infer 61
**Task:** Create agent thread for support
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Step 1: Fetch user context (step.runQuery)
- [ ] Step 2: Create agent thread (step.runAction)
- [ ] Use `createSupportThreadWithEffect` internalAction
- [ ] Inject AgentService and RAGService
- [ ] Fetch relevant KB articles (RAG)
- [ ] Create thread with context
- [ ] Return threadId and initial response

### ⏳ Infer 63: Support Workflow (Part 3: Quality Check)
**Status:** Pending
**Dependencies:** Infer 62
**Task:** Check response quality in parallel
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Step 3: Parallel quality checks (Promise.all)
- [ ] Check grammar score (step.runAction)
- [ ] Check factuality score (step.runAction)
- [ ] Both use Effect services internally
- [ ] Return scores
- [ ] Refine response if scores < 0.8

### ⏳ Infer 64: Support Workflow (Part 4: Refine Response)
**Status:** Pending
**Dependencies:** Infer 63
**Task:** Refine response if quality checks fail
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Conditional: If grammarScore < 0.8 OR factualityScore < 0.8
- [ ] Run: `refineResponseWithEffect` (step.runAction)
- [ ] Use Effect.retry (max 2 attempts)
- [ ] Re-run quality checks
- [ ] Return refined response or original if retries fail
- [ ] Log refinement attempts

### ⏳ Infer 65: Support Workflow (Part 5: Save Ticket)
**Status:** Pending
**Dependencies:** Infer 64
**Task:** Save support ticket to database
**File:** `backend/convex/domain/workflows/support.ts`
**Acceptance Criteria:**
- [ ] Step 4: Save ticket (step.runMutation)
- [ ] Store: userId, threadId, issue, response, qualityScores
- [ ] Create ticket entity in database
- [ ] Send notification to support team (optional)
- [ ] Log ticket creation event
- [ ] Return ticket result

### ⏳ Infer 66: Tool Definition: Email Tool with Effect
**Status:** Pending
**Dependencies:** Infer 65
**Task:** Create email tool using Effect services
**File:** `backend/convex/domain/agents/tools.ts`
**Acceptance Criteria:**
- [ ] Define `EmailService` Context.Tag
- [ ] Implement `EmailServiceLive` (uses SendGrid or Resend)
- [ ] Create `emailTool` with createTool
- [ ] Tool handler uses Effect.gen internally
- [ ] Inject EmailService (yield* EmailService)
- [ ] Send email with service
- [ ] Convert Effect to Promise (Effect.runPromise)
- [ ] Return success/failure message

### ⏳ Infer 67: Tool Definition: Database Query Tool with Effect
**Status:** Pending
**Dependencies:** Infer 66
**Task:** Create database query tool using Effect
**File:** `backend/convex/domain/agents/tools.ts`
**Acceptance Criteria:**
- [ ] Define `DatabaseService` Context.Tag
- [ ] Implement `DatabaseServiceLive` (wraps ctx.db operations)
- [ ] Create `databaseQueryTool` with createTool
- [ ] Tool handler uses Effect.gen
- [ ] Inject DatabaseService
- [ ] Execute query (e.g., search users by email)
- [ ] Return results as string (formatted)
- [ ] Handle errors gracefully

### ⏳ Infer 68: Tool Definition: External API Tool with Effect
**Status:** Pending
**Dependencies:** Infer 67
**Task:** Create external API tool using Effect
**File:** `backend/convex/domain/agents/tools.ts`
**Acceptance Criteria:**
- [ ] Define `ExternalAPIService` Context.Tag
- [ ] Implement `ExternalAPIServiceLive` (uses fetch)
- [ ] Create `externalAPITool` with createTool
- [ ] Tool handler uses Effect.gen
- [ ] Inject ExternalAPIService
- [ ] Make API call with retry (Effect.retry)
- [ ] Parse response
- [ ] Return result to agent

### ⏳ Infer 69: Error Handling in Agent Tools
**Status:** Pending
**Dependencies:** Infer 68
**Task:** Handle errors gracefully in all tools
**File:** `backend/convex/domain/agents/tools.ts`
**Acceptance Criteria:**
- [ ] Wrap all tool operations in Effect.tryPromise
- [ ] Define tool-specific error types (EmailError, APIError, etc.)
- [ ] Use Effect.catchAll to return error messages
- [ ] Log tool errors as events
- [ ] Return helpful error messages to agent (not exceptions)
- [ ] Agent continues even if tool fails

### ⏳ Infer 70: Register Tools with Agent
**Status:** Pending
**Dependencies:** Infer 69
**Task:** Add all tools to Agent component
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Import all tools (emailTool, databaseQueryTool, externalAPITool)
- [ ] Register in Agent config: `tools: { sendEmail: emailTool, queryDB: databaseQueryTool, callAPI: externalAPITool }`
- [ ] Agent can now call tools
- [ ] Test agent using tools (integration test)
- [ ] Verify Effect services injected correctly in tools
- [ ] Log tool usage metrics

---

## Observability & Testing Phase (Infer 71-90)

**Agents:** agent-quality, agent-ops
**Goal:** Monitoring, testing, error handling, resource management

### ⏳ Infer 71: Create MonitoringService with Effect
**Status:** Pending
**Dependencies:** Infer 70
**Task:** Implement observability service
**File:** `backend/convex/services/monitoring.service.ts`
**Acceptance Criteria:**
- [ ] Define `MonitoringService` Context.Tag
- [ ] Interface: `trackServiceCall(name, duration, result)`, `trackError(error)`, `trackTokenUsage(tokens)`
- [ ] Implement `MonitoringServiceLive` (logs to console + database)
- [ ] Use Effect.tap to track service calls
- [ ] Use Effect.tapError to track errors
- [ ] Store metrics in database (events table)
- [ ] Export metrics for external tools (Sentry, Datadog)

### ⏳ Infer 72: Track Service Call Lifecycle
**Status:** Pending
**Dependencies:** Infer 71
**Task:** Log start, complete, fail for every service call
**File:** `backend/convex/lib/monitoring.ts`
**Acceptance Criteria:**
- [ ] Wrap service calls with Effect.tap
- [ ] Log service_call_started event (service name, args)
- [ ] Log service_call_completed event (service name, duration, result)
- [ ] Log service_call_failed event (service name, error, duration)
- [ ] Include trace ID for distributed tracing
- [ ] Store in events table with metadata

### ⏳ Infer 73: Track Token Usage for AI Services
**Status:** Pending
**Dependencies:** Infer 72
**Task:** Monitor AI model token consumption
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Extract token usage from agent response (response.usage)
- [ ] Call `MonitoringService.trackTokenUsage`
- [ ] Store: promptTokens, completionTokens, totalTokens, model, timestamp
- [ ] Aggregate usage per user, per organization
- [ ] Alert if usage exceeds quota
- [ ] Display in usage dashboard (frontend)

### ⏳ Infer 74: Error Tracking with Sentry Integration
**Status:** Pending
**Dependencies:** Infer 73
**Task:** Send errors to Sentry for debugging
**File:** `backend/convex/lib/monitoring.ts`
**Acceptance Criteria:**
- [ ] Install `@sentry/node`
- [ ] Initialize Sentry in MonitoringService
- [ ] Capture Effect errors with Sentry.captureException
- [ ] Include: Error type, stack trace, service context, user context
- [ ] Group errors by error type (_tag)
- [ ] Link Sentry issues to Convex functions
- [ ] Test error capture

### ⏳ Infer 75: Performance Metrics Tracking
**Status:** Pending
**Dependencies:** Infer 74
**Task:** Track latency per service operation
**File:** `backend/convex/lib/monitoring.ts`
**Acceptance Criteria:**
- [ ] Measure duration for every service call (Date.now())
- [ ] Store: service name, operation, duration, timestamp
- [ ] Calculate: p50, p95, p99 latency (in database query)
- [ ] Alert if latency exceeds threshold (p95 > 500ms)
- [ ] Display in monitoring dashboard
- [ ] Export to external APM (Application Performance Monitoring)

### ⏳ Infer 76: Create Test Layers (Mock Implementations)
**Status:** Pending
**Dependencies:** Infer 75
**Task:** Build test implementations for all services
**File:** `backend/convex/services/test-layers.ts`
**Acceptance Criteria:**
- [ ] Create `TestAgentServiceLive` with mock generateResponse
- [ ] Create `TestRAGServiceLive` with mock search
- [ ] Create `TestRateLimitServiceLive` with mock checkLimit
- [ ] Create `TestWorkflowServiceLive` with mock workflow steps
- [ ] Create `TestMonitoringServiceLive` (no-op logging)
- [ ] Export all test layers for use in tests
- [ ] Document how to use test layers

### ⏳ Infer 77: Test AgentService with Mock Layer
**Status:** Pending
**Dependencies:** Infer 76
**Task:** Write unit tests for AgentService using test layer
**File:** `backend/convex/services/agent.service.test.ts`
**Acceptance Criteria:**
- [ ] Test: `generateResponse` returns mock response
- [ ] Test: `createThread` returns deterministic threadId
- [ ] Test: Rate limit check (mocked RateLimitService)
- [ ] Test: Error handling (AgentError thrown and caught)
- [ ] Test: Retry logic (transient errors recover)
- [ ] All tests use `TestAgentServiceLive` layer
- [ ] All tests pass

### ⏳ Infer 78: Test RAGService with Mock Layer
**Status:** Pending
**Dependencies:** Infer 77
**Task:** Write unit tests for RAGService
**File:** `backend/convex/services/rag.service.test.ts`
**Acceptance Criteria:**
- [ ] Test: `search` returns mock results with scores
- [ ] Test: `addDocument` returns deterministic entryId
- [ ] Test: Error handling (SearchError, EmbeddingError)
- [ ] Test: Composition with AgentService (integration)
- [ ] Use `TestRAGServiceLive` layer
- [ ] All tests pass

### ⏳ Infer 79: Test Effect Error Handling (Effect.catchTag)
**Status:** Pending
**Dependencies:** Infer 78
**Task:** Validate error handling patterns
**File:** `backend/convex/domain/agents/orchestration.test.ts`
**Acceptance Criteria:**
- [ ] Test: Catch specific error (Effect.catchTag("AgentError"))
- [ ] Test: Catch all errors (Effect.catchAll)
- [ ] Test: Error propagation (child service error bubbles up)
- [ ] Test: Graceful degradation (return fallback on error)
- [ ] Test: Retry on specific errors (Effect.retry with Schedule.whileInput)
- [ ] All tests use test layers
- [ ] All tests pass

### ⏳ Infer 80: Integration Tests with Real Components
**Status:** Pending
**Dependencies:** Infer 79
**Task:** Test with actual Convex components (not mocks)
**File:** `backend/convex/integration/services.test.ts`
**Acceptance Criteria:**
- [ ] Test: AgentService with real @convex-dev/agent
- [ ] Test: RAGService with real @convex-dev/rag
- [ ] Test: RateLimitService with real @convex-dev/rate-limiter
- [ ] Test: End-to-end flow (create thread → search RAG → generate response)
- [ ] Test: Error handling with real components
- [ ] Test: Performance (latency within acceptable range)
- [ ] All integration tests pass

### ⏳ Infer 81: Layered Error Handling Pattern
**Status:** Pending
**Dependencies:** Infer 80
**Task:** Implement layered error handling strategy
**File:** `backend/convex/lib/error-handling.ts`
**Acceptance Criteria:**
- [ ] Domain errors: Business logic failures (UserNotFoundError)
- [ ] Infrastructure errors: Component failures (AgentError, RAGError)
- [ ] Handle domain errors specifically (Effect.catchTag)
- [ ] Handle infrastructure errors with retry (Effect.retry)
- [ ] Catch-all for unexpected errors (Effect.catchAll)
- [ ] Example implementation in orchestration.ts
- [ ] Document pattern

### ⏳ Infer 82: Retry Strategies (Schedule.exponential)
**Status:** Pending
**Dependencies:** Infer 81
**Task:** Implement smart retry policies
**File:** `backend/convex/lib/retry-strategies.ts`
**Acceptance Criteria:**
- [ ] Exponential backoff: Schedule.exponential("1 second").pipe(Schedule.recurs(3))
- [ ] Retry only specific errors: Schedule.whileInput((error) => error._tag === "TransientError")
- [ ] Max retries: Schedule.recurs(5)
- [ ] Retry with jitter: Add randomness to backoff
- [ ] Document when to use each strategy
- [ ] Apply to agent, RAG, external API calls

### ⏳ Infer 83: Circuit Breaker Pattern with Effect
**Status:** Pending
**Dependencies:** Infer 82
**Task:** Prevent cascading failures
**File:** `backend/convex/lib/circuit-breaker.ts`
**Acceptance Criteria:**
- [ ] Define circuit breaker states: Closed, Open, HalfOpen
- [ ] Track failure rate (e.g., 5 failures in 10 seconds → Open)
- [ ] Open state: Reject requests immediately (no calls to service)
- [ ] HalfOpen state: Allow limited requests to test recovery
- [ ] Closed state: Normal operation
- [ ] Implement with Effect.Ref for state management
- [ ] Apply to external API calls

### ⏳ Infer 84: Graceful Degradation Pattern
**Status:** Pending
**Dependencies:** Infer 83
**Task:** Return partial results on failure
**File:** `backend/convex/domain/agents/orchestration.ts`
**Acceptance Criteria:**
- [ ] Example: Multi-agent pipeline fails for one agent
- [ ] Return results from successful agents
- [ ] Include error message for failed agent
- [ ] User gets partial response, not complete failure
- [ ] Log degradation event (service_degraded)
- [ ] Test with mock failures

### ⏳ Infer 85: Resource Management with Effect.Scope
**Status:** Pending
**Dependencies:** Infer 84
**Task:** Implement resource acquisition/release
**File:** `backend/convex/lib/resource-management.ts`
**Acceptance Criteria:**
- [ ] Use Effect.Scope for resource lifecycle
- [ ] Pattern: Effect.acquireRelease(acquire, release)
- [ ] Example: Acquire agent pool, release on completion/error
- [ ] Ensure resources released even on failure
- [ ] Test resource cleanup (no leaks)
- [ ] Document pattern

### ⏳ Infer 86: Connection Pooling for External APIs
**Status:** Pending
**Dependencies:** Infer 85
**Task:** Reuse connections for efficiency
**File:** `backend/convex/lib/connection-pool.ts`
**Acceptance Criteria:**
- [ ] Create connection pool for external APIs
- [ ] Acquire connection from pool (Effect.acquireRelease)
- [ ] Reuse connections across requests
- [ ] Release connection back to pool
- [ ] Close pool on shutdown (cleanup)
- [ ] Test pool behavior (acquire, reuse, release)

### ⏳ Infer 87: Agent Pool Lifecycle Management
**Status:** Pending
**Dependencies:** Infer 86
**Task:** Manage pool of agent instances
**File:** `backend/convex/services/agent.service.ts`
**Acceptance Criteria:**
- [ ] Create pool of agent instances (e.g., 10 agents)
- [ ] Acquire agent from pool for request
- [ ] Release agent back to pool
- [ ] Handle pool exhaustion (queue requests)
- [ ] Shutdown pool gracefully (finish in-flight requests)
- [ ] Test pool under load

### ⏳ Infer 88: Cleanup on Failure
**Status:** Pending
**Dependencies:** Infer 87
**Task:** Ensure resources released on errors
**File:** `backend/convex/lib/resource-management.ts`
**Acceptance Criteria:**
- [ ] Use Effect.acquireRelease (release always called)
- [ ] Test: Throw error during operation, verify release called
- [ ] Test: Multiple resources acquired, all released on error
- [ ] Example: Acquire DB connection, agent, external API connection
- [ ] All released if any operation fails
- [ ] No resource leaks

### ⏳ Infer 89: Resource Acquisition/Release Patterns
**Status:** Pending
**Dependencies:** Infer 88
**Task:** Document common resource management patterns
**File:** `backend/convex/lib/resource-management.md`
**Acceptance Criteria:**
- [ ] Pattern 1: Single resource (Effect.acquireRelease)
- [ ] Pattern 2: Multiple resources (nested acquireRelease)
- [ ] Pattern 3: Conditional resource acquisition
- [ ] Pattern 4: Resource pooling
- [ ] Pattern 5: Cleanup on shutdown
- [ ] Code examples for each pattern
- [ ] Best practices

### ⏳ Infer 90: Resource Safety Tests
**Status:** Pending
**Dependencies:** Infer 89
**Task:** Validate zero resource leaks
**File:** `backend/convex/lib/resource-management.test.ts`
**Acceptance Criteria:**
- [ ] Test: Acquire and release resource (success path)
- [ ] Test: Acquire and release resource (error path)
- [ ] Test: Multiple resources acquired and released
- [ ] Test: Resource pool behavior (acquire, reuse, release)
- [ ] Test: Memory usage (no leaks after 1000 operations)
- [ ] All tests pass

---

## Advanced Patterns & Documentation Phase (Infer 91-100)

**Agents:** agent-documenter, agent-ops, agent-backend
**Goal:** Confect evaluation, documentation, optimization, launch

### ⏳ Infer 91: Evaluate Confect for Full Effect Integration
**Status:** Pending
**Dependencies:** Infer 90
**Task:** Assess Confect vs manual integration
**File:** `one/things/plans/confect-evaluation.md`
**Acceptance Criteria:**
- [ ] Install @rjdellecese/confect
- [ ] Create sample schema with Effect Schema
- [ ] Define sample query/mutation with Confect
- [ ] Compare: Manual integration vs Confect
- [ ] Pros: Effect-native, Option<A> instead of A | null, Effect.Schema
- [ ] Cons: Learning curve, team adoption, migration effort
- [ ] Recommendation: Manual integration (gradual adoption) vs Confect (new projects)

### ⏳ Infer 92: Confect + Convex Components Pattern
**Status:** Pending
**Dependencies:** Infer 91
**Task:** Test Confect compatibility with components
**File:** `backend/convex/confect-test.ts`
**Acceptance Criteria:**
- [ ] Define schema with Confect (defineSchema, defineTable)
- [ ] Create Confect functions (query, mutation, action)
- [ ] Use Convex components in Confect actions
- [ ] Wrap component calls with Effect.tryPromise
- [ ] Verify: Confect context compatible with component context
- [ ] Document integration pattern
- [ ] Test end-to-end

### ⏳ Infer 93: Migration Guide (Promise → Effect, Manual → Confect)
**Status:** Pending
**Dependencies:** Infer 92
**Task:** Document migration strategies
**File:** `one/things/plans/effect-migration-guide.md`
**Acceptance Criteria:**
- [ ] Guide 1: Migrating Promise-based code to Effect
- [ ] Guide 2: Migrating manual Effect integration to Confect
- [ ] Step-by-step instructions
- [ ] Code examples (before/after)
- [ ] Common pitfalls and solutions
- [ ] Timeline estimates (days per 1000 LOC)
- [ ] Decision tree (when to migrate vs rewrite)

### ⏳ Infer 94: Write Service Layer Guide
**Status:** Pending
**Dependencies:** Infer 93
**Task:** Comprehensive guide for Effect service layers
**File:** `one/knowledge/effect-service-layer-guide.md`
**Acceptance Criteria:**
- [ ] Overview: Effect wraps components, not replaces
- [ ] Pattern 1: Effect-wrapped component
- [ ] Pattern 2: Service layer (Context.Tag + Layer)
- [ ] Pattern 3: Error handling (tagged errors)
- [ ] Pattern 4: Parallel execution (Effect.all)
- [ ] Pattern 5: Resource management (Scope, acquireRelease)
- [ ] Code examples for all patterns
- [ ] Best practices

### ⏳ Infer 95: Document All Effect Patterns
**Status:** Pending
**Dependencies:** Infer 94
**Task:** Create pattern library
**File:** `one/knowledge/effect-patterns.md`
**Acceptance Criteria:**
- [ ] Pattern: Effect.tryPromise (Promise → Effect)
- [ ] Pattern: Effect.gen (sequential composition)
- [ ] Pattern: Effect.all (parallel composition)
- [ ] Pattern: Effect.catchTag (specific error handling)
- [ ] Pattern: Effect.catchAll (fallback error handling)
- [ ] Pattern: Effect.retry + Schedule (retry policies)
- [ ] Pattern: Effect.Scope + acquireRelease (resource management)
- [ ] Pattern: Context.Tag + Layer (dependency injection)
- [ ] Code examples for each

### ⏳ Infer 96: Create Example Programs
**Status:** Pending
**Dependencies:** Infer 95
**Task:** End-to-end examples using Effect services
**File:** `one/knowledge/effect-examples.md`
**Acceptance Criteria:**
- [ ] Example 1: Multi-agent orchestration
- [ ] Example 2: Research workflow
- [ ] Example 3: Support ticket workflow
- [ ] Example 4: Batch processing with workpool
- [ ] Example 5: Scheduled cron job with Effect
- [ ] All examples fully working (copy-paste ready)
- [ ] Include test setup

### ⏳ Infer 97: Troubleshooting Guide for Effect Errors
**Status:** Pending
**Dependencies:** Infer 96
**Task:** Common errors and solutions
**File:** `one/knowledge/effect-troubleshooting.md`
**Acceptance Criteria:**
- [ ] Error: "No service found for tag X" → Forgot Effect.provide
- [ ] Error: "Effect stack too deep" → Use Effect.fork or Effect.cached
- [ ] Error: "Unhandled error in Effect" → Add Effect.catchAll
- [ ] Error: "Promise rejection" → Wrap with Effect.tryPromise
- [ ] Error: "Type mismatch" → Check error channel types
- [ ] Solutions for each error
- [ ] Debugging tips

### ⏳ Infer 98: Performance Optimization
**Status:** Pending
**Dependencies:** Infer 97
**Task:** Optimize Effect-based code for production
**File:** `backend/convex/lib/optimization.ts`
**Acceptance Criteria:**
- [ ] Parallel execution with concurrency control (Effect.all)
- [ ] Caching layer for service calls (Effect.cached)
- [ ] Connection reuse (connection pooling)
- [ ] Batch operations (combine multiple calls)
- [ ] Benchmark: Effect vs Promise-based (ensure no regression)
- [ ] Optimize hot paths (< 5% overhead)

### ⏳ Infer 99: Deploy to Convex Production
**Status:** Pending
**Dependencies:** Infer 98
**Task:** Deploy Effect service layer to production
**File:** N/A
**Acceptance Criteria:**
- [ ] Run full test suite (unit + integration) → All pass
- [ ] Deploy to Convex: `npx convex deploy`
- [ ] Monitor service performance (latency, errors)
- [ ] Verify all components working (agent, RAG, rate-limiter, etc.)
- [ ] Check error rates (< 1%)
- [ ] Monitor resource usage (memory, CPU)
- [ ] Rollback plan ready (if issues detected)

### ⏳ Infer 100: Mark Feature Complete and Train Team
**Status:** Pending
**Dependencies:** Infer 99
**Task:** Launch and knowledge transfer
**File:** `one/events/components-feature-complete.md`
**Acceptance Criteria:**
- [ ] All 100 inferences complete ✅
- [ ] All tests passing (unit, integration, resource safety) ✅
- [ ] Documentation complete (guides, patterns, examples, troubleshooting) ✅
- [ ] Performance optimized (no regression) ✅
- [ ] Deployed to production ✅
- [ ] Team trained: Pair programming sessions (3 sessions)
- [ ] Team trained: Effect workshop (1 day)
- [ ] Create runbook for Effect errors (operations)
- [ ] Celebrate! 🎉

---

## Summary Statistics

**Total Inferences:** 100
**Estimated Duration:** 45-60 days (with parallelization)
**Agents Involved:** 6 (director, backend, builder, ops, quality, documenter)
**New Service Layers:** 8 (Agent, RAG, RateLimit, Workflow, Streaming, Workpool, Retrier, Crons)
**Domain Workflows:** 2 (Research, Support)
**Agent Tools:** 3 (Email, Database, External API)
**Test Coverage:** 90%+ (unit + integration + resource safety)
**Performance:** No regression vs Promise-based approach

---

## Next Steps

1. **Start Execution:** Run `/next` to begin Infer 11 (AgentService implementation)
2. **Review Plan:** Use `/plan` to see full breakdown
3. **Track Progress:** Use `/now` to see current inference, `/done` to mark complete
4. **Quality Checks:** agent-quality will continuously validate patterns

**Ready to begin? Type `/next` to start Infer 11!**
