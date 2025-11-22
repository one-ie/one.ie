/**
 * StepService - Funnel Step Management
 *
 * Manages funnel steps (pages) and their sequencing using Effect.ts patterns.
 * Follows the 6-dimension ontology:
 * - Steps are things (type: "funnel_step")
 * - Step-funnel relationships are connections (type: "funnel_contains_step")
 * - All operations logged as events (step_added, step_removed, etc.)
 * - Multi-tenant isolation via groupId
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - Cycle 021
 * @see /one/knowledge/patterns/backend/service-template.md - Service pattern
 */

import { Effect, Context } from "effect";
import type { Id } from "../../_generated/dataModel";
import {
  PageNotFoundError,
  PageAlreadyExistsError,
  InvalidPageOrderError,
  PageLimitExceededError,
  UnauthorizedPageAccessError,
  FunnelNotFoundError,
  ValidationError,
  DatabaseError,
} from "./errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Step (page) types supported in funnels
 */
export type StepType =
  | "landing_page"
  | "sales_page"
  | "upsell_page"
  | "downsell_page"
  | "thank_you_page"
  | "webinar_registration"
  | "opt_in_page"
  | "checkout_page"
  | "custom_page";

/**
 * Step status lifecycle
 */
export type StepStatus = "draft" | "active" | "published" | "archived";

/**
 * Input for creating a new step
 */
export interface CreateStepInput {
  funnelId: Id<"things">;
  name: string;
  stepType: StepType;
  sequence?: number; // Optional: auto-calculate if not provided
  properties?: {
    title?: string;
    description?: string;
    slug?: string;
    seoTitle?: string;
    seoDescription?: string;
    customCss?: string;
    customJs?: string;
    backgroundColor?: string;
    layout?: string;
    [key: string]: any;
  };
}

/**
 * Input for updating a step
 */
export interface UpdateStepInput {
  name?: string;
  stepType?: StepType;
  properties?: Record<string, any>;
  status?: StepStatus;
}

/**
 * Step reorder operation
 */
export interface ReorderStepsInput {
  funnelId: Id<"things">;
  stepSequences: Array<{
    stepId: Id<"things">;
    newSequence: number;
  }>;
}

/**
 * Database interface (injected dependency)
 */
export interface DatabaseContext {
  get: (id: Id<"things">) => Promise<any>;
  insert: (table: string, data: any) => Promise<Id<"things">>;
  patch: (id: Id<"things">, data: any) => Promise<void>;
  query: (table: string) => any;
}

/**
 * Current user context (for authorization)
 */
export interface UserContext {
  userId: Id<"things">;
  groupId: Id<"groups">;
}

// ============================================================================
// Service Definition
// ============================================================================

/**
 * StepService - Manages funnel steps and sequences
 */
export class StepService extends Context.Tag("StepService")<
  StepService,
  {
    /**
     * Add a new step to a funnel
     */
    add: (
      input: CreateStepInput,
      user: UserContext
    ) => Effect.Effect<Id<"things">, PageNotFoundError | FunnelNotFoundError | PageLimitExceededError | ValidationError | DatabaseError>;

    /**
     * Get a step by ID
     */
    get: (
      stepId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<any, PageNotFoundError | UnauthorizedPageAccessError | DatabaseError>;

    /**
     * List all steps for a funnel (ordered by sequence)
     */
    listByFunnel: (
      funnelId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<any[], FunnelNotFoundError | UnauthorizedPageAccessError | DatabaseError>;

    /**
     * Update a step
     */
    update: (
      stepId: Id<"things">,
      input: UpdateStepInput,
      user: UserContext
    ) => Effect.Effect<void, PageNotFoundError | UnauthorizedPageAccessError | ValidationError | DatabaseError>;

    /**
     * Remove a step from a funnel
     */
    remove: (
      stepId: Id<"things">,
      user: UserContext
    ) => Effect.Effect<void, PageNotFoundError | UnauthorizedPageAccessError | DatabaseError>;

    /**
     * Reorder steps in a funnel
     */
    reorder: (
      input: ReorderStepsInput,
      user: UserContext
    ) => Effect.Effect<void, FunnelNotFoundError | InvalidPageOrderError | UnauthorizedPageAccessError | DatabaseError>;
  }
>() {}

// ============================================================================
// Service Implementation
// ============================================================================

/**
 * Create StepService implementation
 *
 * @param db - Database context (Convex ctx.db)
 * @returns StepService implementation
 */
export const makeStepService = (db: DatabaseContext) =>
  StepService.of({
    /**
     * Add a new step to a funnel
     */
    add: (input, user) =>
      Effect.gen(function* () {
        // 1. Validate funnel exists
        const funnel = yield* Effect.tryPromise({
          try: () => db.get(input.funnelId),
          catch: () =>
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId: input.funnelId,
            }),
        });

        if (!funnel) {
          return yield* Effect.fail(
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId: input.funnelId,
            })
          );
        }

        // 2. Validate user has access to funnel (groupId match)
        if (funnel.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to add steps to this funnel",
              userId: user.userId,
              pageId: input.funnelId,
            })
          );
        }

        // 3. Check step limit (max 50 steps per funnel)
        const existingSteps = yield* Effect.tryPromise({
          try: async () => {
            const connections = await db
              .query("connections")
              .filter((c: any) =>
                c.fromThingId === input.funnelId &&
                c.relationshipType === "funnel_contains_step"
              )
              .collect();
            return connections;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query existing steps",
              operation: "query_connections",
              details: String(error),
            }),
        });

        if (existingSteps.length >= 50) {
          return yield* Effect.fail(
            new PageLimitExceededError({
              message: "Funnel step limit exceeded (max 50 steps)",
              funnelId: input.funnelId,
              currentCount: existingSteps.length,
              limit: 50,
            })
          );
        }

        // 4. Validate input
        if (!input.name || input.name.trim().length === 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Step name is required",
              field: "name",
              value: input.name,
              constraint: "required",
            })
          );
        }

        // 5. Calculate sequence number if not provided
        const sequence =
          input.sequence ??
          Math.max(0, ...existingSteps.map((s: any) => s.metadata?.sequence ?? 0)) + 1;

        // 6. Create step thing
        const stepId = yield* Effect.tryPromise({
          try: () =>
            db.insert("things", {
              type: "funnel_step",
              name: input.name,
              groupId: user.groupId,
              properties: {
                stepType: input.stepType,
                title: input.properties?.title ?? input.name,
                description: input.properties?.description ?? "",
                slug: input.properties?.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
                seoTitle: input.properties?.seoTitle,
                seoDescription: input.properties?.seoDescription,
                customCss: input.properties?.customCss,
                customJs: input.properties?.customJs,
                backgroundColor: input.properties?.backgroundColor ?? "#ffffff",
                layout: input.properties?.layout ?? "default",
                ...input.properties,
              },
              status: "draft",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to create step",
              operation: "insert_step",
              details: String(error),
            }),
        });

        // 7. Create connection: funnel_contains_step
        yield* Effect.tryPromise({
          try: () =>
            db.insert("connections", {
              fromThingId: input.funnelId,
              toThingId: stepId,
              relationshipType: "funnel_contains_step",
              metadata: {
                sequence,
                stepType: input.stepType,
              },
              validFrom: Date.now(),
              createdAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to create funnel-step connection",
              operation: "insert_connection",
              details: String(error),
            }),
        });

        // 8. Log event: step_added
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "step_added",
              actorId: user.userId,
              targetId: stepId,
              timestamp: Date.now(),
              metadata: {
                funnelId: input.funnelId,
                stepType: input.stepType,
                sequence,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log step_added event",
              operation: "insert_event",
              details: String(error),
            }),
        });

        return stepId;
      }),

    /**
     * Get a step by ID
     */
    get: (stepId, user) =>
      Effect.gen(function* () {
        // 1. Get step
        const step = yield* Effect.tryPromise({
          try: () => db.get(stepId),
          catch: () =>
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            }),
        });

        if (!step) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            })
          );
        }

        // 2. Validate access via groupId
        if (step.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to access this step",
              userId: user.userId,
              pageId: stepId,
            })
          );
        }

        // 3. Get connection to find sequence
        const connection = yield* Effect.tryPromise({
          try: async () => {
            const conn = await db
              .query("connections")
              .filter((c: any) =>
                c.toThingId === stepId &&
                c.relationshipType === "funnel_contains_step"
              )
              .first();
            return conn;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query step connection",
              operation: "query_connection",
              details: String(error),
            }),
        });

        return {
          ...step,
          sequence: connection?.metadata?.sequence ?? 0,
          funnelId: connection?.fromThingId,
        };
      }),

    /**
     * List all steps for a funnel (ordered by sequence)
     */
    listByFunnel: (funnelId, user) =>
      Effect.gen(function* () {
        // 1. Validate funnel exists and user has access
        const funnel = yield* Effect.tryPromise({
          try: () => db.get(funnelId),
          catch: () =>
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId,
            }),
        });

        if (!funnel) {
          return yield* Effect.fail(
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId,
            })
          );
        }

        if (funnel.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to access this funnel",
              userId: user.userId,
              pageId: funnelId,
            })
          );
        }

        // 2. Get all connections: funnel_contains_step
        const connections = yield* Effect.tryPromise({
          try: async () => {
            const conns = await db
              .query("connections")
              .filter((c: any) =>
                c.fromThingId === funnelId &&
                c.relationshipType === "funnel_contains_step"
              )
              .collect();
            return conns;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query funnel steps",
              operation: "query_connections",
              details: String(error),
            }),
        });

        // 3. Get all step things
        const steps = yield* Effect.tryPromise({
          try: async () => {
            const stepIds = connections.map((c: any) => c.toThingId);
            const stepsData = await Promise.all(
              stepIds.map((id: Id<"things">) => db.get(id))
            );
            return stepsData.filter(Boolean);
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to fetch step details",
              operation: "get_steps",
              details: String(error),
            }),
        });

        // 4. Merge steps with sequence from connections
        const stepsWithSequence = steps.map((step: any) => {
          const connection = connections.find((c: any) => c.toThingId === step._id);
          return {
            ...step,
            sequence: connection?.metadata?.sequence ?? 0,
            funnelId,
          };
        });

        // 5. Sort by sequence
        return stepsWithSequence.sort((a, b) => a.sequence - b.sequence);
      }),

    /**
     * Update a step
     */
    update: (stepId, input, user) =>
      Effect.gen(function* () {
        // 1. Get step and validate access
        const step = yield* Effect.tryPromise({
          try: () => db.get(stepId),
          catch: () =>
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            }),
        });

        if (!step) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            })
          );
        }

        if (step.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to update this step",
              userId: user.userId,
              pageId: stepId,
            })
          );
        }

        // 2. Validate input
        if (input.name !== undefined && input.name.trim().length === 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Step name cannot be empty",
              field: "name",
              value: input.name,
              constraint: "required",
            })
          );
        }

        // 3. Merge properties
        const updatedProperties = input.properties
          ? { ...step.properties, ...input.properties }
          : step.properties;

        if (input.stepType) {
          updatedProperties.stepType = input.stepType;
        }

        // 4. Update step
        yield* Effect.tryPromise({
          try: () =>
            db.patch(stepId, {
              ...(input.name && { name: input.name }),
              ...(input.properties && { properties: updatedProperties }),
              ...(input.status && { status: input.status }),
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to update step",
              operation: "patch_step",
              details: String(error),
            }),
        });

        // 5. Log event: element_updated (using consolidated event type)
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "element_updated",
              actorId: user.userId,
              targetId: stepId,
              timestamp: Date.now(),
              metadata: {
                updatedFields: Object.keys(input),
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log element_updated event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),

    /**
     * Remove a step from a funnel
     */
    remove: (stepId, user) =>
      Effect.gen(function* () {
        // 1. Get step and validate access
        const step = yield* Effect.tryPromise({
          try: () => db.get(stepId),
          catch: () =>
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            }),
        });

        if (!step) {
          return yield* Effect.fail(
            new PageNotFoundError({
              message: "Step not found",
              pageId: stepId,
            })
          );
        }

        if (step.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to remove this step",
              userId: user.userId,
              pageId: stepId,
            })
          );
        }

        // 2. Get connection to find funnel
        const connection = yield* Effect.tryPromise({
          try: async () => {
            const conn = await db
              .query("connections")
              .filter((c: any) =>
                c.toThingId === stepId &&
                c.relationshipType === "funnel_contains_step"
              )
              .first();
            return conn;
          },
          catch: (error) =>
            new DatabaseError({
              message: "Failed to query step connection",
              operation: "query_connection",
              details: String(error),
            }),
        });

        const funnelId = connection?.fromThingId;
        const removedSequence = connection?.metadata?.sequence ?? 0;

        // 3. Soft delete step
        yield* Effect.tryPromise({
          try: () =>
            db.patch(stepId, {
              status: "archived",
              updatedAt: Date.now(),
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to archive step",
              operation: "patch_step",
              details: String(error),
            }),
        });

        // 4. Delete connection (hard delete connections is OK)
        if (connection) {
          yield* Effect.tryPromise({
            try: () => db.patch(connection._id, { validTo: Date.now() }),
            catch: (error) =>
              new DatabaseError({
                message: "Failed to invalidate connection",
                operation: "patch_connection",
                details: String(error),
              }),
          });
        }

        // 5. Resequence remaining steps (close gaps)
        if (funnelId) {
          const remainingConnections = yield* Effect.tryPromise({
            try: async () => {
              const conns = await db
                .query("connections")
                .filter((c: any) =>
                  c.fromThingId === funnelId &&
                  c.relationshipType === "funnel_contains_step" &&
                  !c.validTo
                )
                .collect();
              return conns;
            },
            catch: (error) =>
              new DatabaseError({
                message: "Failed to query remaining connections",
                operation: "query_connections",
                details: String(error),
              }),
          });

          // Update sequences for steps after the removed one
          for (const conn of remainingConnections) {
            const currentSeq = conn.metadata?.sequence ?? 0;
            if (currentSeq > removedSequence) {
              yield* Effect.tryPromise({
                try: () =>
                  db.patch(conn._id, {
                    metadata: {
                      ...conn.metadata,
                      sequence: currentSeq - 1,
                    },
                  }),
                catch: (error) =>
                  new DatabaseError({
                    message: "Failed to resequence steps",
                    operation: "patch_connection",
                    details: String(error),
                  }),
              });
            }
          }
        }

        // 6. Log event: step_removed
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "step_removed",
              actorId: user.userId,
              targetId: stepId,
              timestamp: Date.now(),
              metadata: {
                funnelId,
                previousSequence: removedSequence,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log step_removed event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),

    /**
     * Reorder steps in a funnel
     */
    reorder: (input, user) =>
      Effect.gen(function* () {
        // 1. Validate funnel exists and user has access
        const funnel = yield* Effect.tryPromise({
          try: () => db.get(input.funnelId),
          catch: () =>
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId: input.funnelId,
            }),
        });

        if (!funnel) {
          return yield* Effect.fail(
            new FunnelNotFoundError({
              message: "Funnel not found",
              funnelId: input.funnelId,
            })
          );
        }

        if (funnel.groupId !== user.groupId) {
          return yield* Effect.fail(
            new UnauthorizedPageAccessError({
              message: "Not authorized to reorder steps in this funnel",
              userId: user.userId,
              pageId: input.funnelId,
            })
          );
        }

        // 2. Validate sequence array (no gaps, no duplicates, starts at 0 or 1)
        const sequences = input.stepSequences.map((s) => s.newSequence).sort((a, b) => a - b);
        const hasGaps = sequences.some((seq, idx) => seq !== idx && seq !== idx + 1);
        const hasDuplicates = new Set(sequences).size !== sequences.length;

        if (hasGaps || hasDuplicates) {
          return yield* Effect.fail(
            new InvalidPageOrderError({
              message: "Invalid step sequence: must be consecutive with no duplicates",
              funnelId: input.funnelId,
              pageOrder: sequences,
              details: hasGaps ? "Sequence has gaps" : "Sequence has duplicates",
            })
          );
        }

        // 3. Update all connection sequences
        for (const { stepId, newSequence } of input.stepSequences) {
          const connection = yield* Effect.tryPromise({
            try: async () => {
              const conn = await db
                .query("connections")
                .filter((c: any) =>
                  c.fromThingId === input.funnelId &&
                  c.toThingId === stepId &&
                  c.relationshipType === "funnel_contains_step" &&
                  !c.validTo
                )
                .first();
              return conn;
            },
            catch: (error) =>
              new DatabaseError({
                message: "Failed to query step connection",
                operation: "query_connection",
                details: String(error),
              }),
          });

          if (connection) {
            yield* Effect.tryPromise({
              try: () =>
                db.patch(connection._id, {
                  metadata: {
                    ...connection.metadata,
                    sequence: newSequence,
                  },
                }),
              catch: (error) =>
                new DatabaseError({
                  message: "Failed to update step sequence",
                  operation: "patch_connection",
                  details: String(error),
                }),
            });
          }
        }

        // 4. Log event: step_reordered
        yield* Effect.tryPromise({
          try: () =>
            db.insert("events", {
              type: "step_reordered",
              actorId: user.userId,
              targetId: input.funnelId,
              timestamp: Date.now(),
              metadata: {
                funnelId: input.funnelId,
                newSequence: input.stepSequences,
                groupId: user.groupId,
              },
            }),
          catch: (error) =>
            new DatabaseError({
              message: "Failed to log step_reordered event",
              operation: "insert_event",
              details: String(error),
            }),
        });
      }),
  });
