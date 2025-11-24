/**
 * Entity Service (Effect.ts Business Logic)
 *
 * Pure business logic for entity operations using Effect.ts
 * Separates business logic from Convex mutations/queries
 *
 * Pattern:
 * 1. Define business logic here with Effect.ts
 * 2. Convex mutations call these functions
 * 3. Services can be composed together
 */

import { Effect, pipe } from "effect";
import type { ActionCtx } from "../_generated/server";
import {
  ValidationError,
  DatabaseError,
  RAGError,
  IndexError,
  RAGService,
  validate,
  wrapDatabase
} from "./layers";

// ============================================================================
// Types
// ============================================================================

export interface CreateEntityInput {
  groupId: string;
  type: string;
  name: string;
  properties?: Record<string, any>;
  status?: "draft" | "active" | "published" | "archived" | "inactive";
}

export interface Entity {
  _id: string;
  groupId: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface UpdateEntityInput {
  entityId: string;
  name?: string;
  properties?: Record<string, any>;
  status?: "draft" | "active" | "published" | "archived" | "inactive";
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate entity name
 *
 * Rules:
 * - Must not be empty
 * - Must be at least 2 characters
 * - Must be less than 200 characters
 */
export function validateEntityName(name: string): Effect.Effect<string, ValidationError> {
  return pipe(
    validate("name", name, (n) => n.trim().length >= 2, "Name must be at least 2 characters"),
    Effect.flatMap((n) =>
      validate("name", n, (n) => n.length <= 200, "Name must be less than 200 characters")
    )
  );
}

/**
 * Validate entity type
 *
 * Rules:
 * - Must not be empty
 * - Must be a valid thing type from ontology
 */
export function validateEntityType(
  type: string,
  validTypes: readonly string[]
): Effect.Effect<string, ValidationError> {
  return validate(
    "type",
    type,
    (t) => validTypes.includes(t),
    `Invalid entity type. Must be one of: ${validTypes.join(", ")}`
  );
}

/**
 * Validate group exists and is active
 */
export function validateGroup(
  groupId: string,
  getGroup: (id: string) => Promise<{ status: string } | null>
): Effect.Effect<void, ValidationError | DatabaseError> {
  return pipe(
    wrapDatabase("query", "groups", () => getGroup(groupId)),
    Effect.flatMap((group) => {
      if (!group) {
        return Effect.fail(new ValidationError({
          field: "groupId",
          message: "Group not found",
          value: groupId
        }));
      }
      if (group.status !== "active") {
        return Effect.fail(new ValidationError({
          field: "groupId",
          message: "Group is not active",
          value: groupId
        }));
      }
      return Effect.void;
    })
  );
}

// ============================================================================
// Business Logic Functions
// ============================================================================

/**
 * Create Entity Business Logic
 *
 * Steps:
 * 1. Validate all inputs
 * 2. Check group exists and is active
 * 3. Create entity
 * 4. Add to RAG (if applicable)
 * 5. Log event
 */
export function createEntity(
  ctx: ActionCtx,
  input: CreateEntityInput,
  context: {
    validTypes: readonly string[];
    getGroup: (id: string) => Promise<{ status: string } | null>;
    insertEntity: (entity: Omit<Entity, "_id">) => Promise<string>;
    logEvent: (event: any) => Promise<void>;
  }
): Effect.Effect<string, ValidationError | DatabaseError | IndexError, any> {
  return pipe(
    // 1. Validate inputs
    validateEntityName(input.name),
    Effect.flatMap((validName) =>
      pipe(
        validateEntityType(input.type, context.validTypes),
        Effect.flatMap((validType) =>
          pipe(
            // 2. Validate group
            validateGroup(input.groupId, context.getGroup),
            Effect.flatMap(() => {
              // 3. Create entity
              const now = Date.now();
              const entity = {
                groupId: input.groupId,
                type: validType,
                name: validName,
                properties: input.properties || {},
                status: input.status || "draft",
                createdAt: now,
                updatedAt: now
              };

              return pipe(
                wrapDatabase("mutation", "entities", () => context.insertEntity(entity)),
                Effect.flatMap((entityId) => {
                  // 4. Add to RAG (if entity has searchable content)
                  const ragEffect = shouldIndexForRAG(validType, entity.properties)
                    ? pipe(
                        (RAGService as any).addDocument(
                          ctx,
                          `group:${input.groupId}`,
                          getSearchableText(entity),
                          {
                            entityId,
                            entityType: validType,
                            createdAt: now
                          }
                        ),
                        Effect.asVoid
                      )
                    : Effect.void;

                  // 5. Log event
                  const logEffect = wrapDatabase("mutation", "events", () =>
                    context.logEvent({
                      groupId: input.groupId,
                      type: "thing_created",
                      targetId: entityId,
                      timestamp: now,
                      metadata: {
                        entityType: validType,
                        entityName: validName,
                        status: input.status || "draft"
                      }
                    })
                  );

                  return pipe(
                    ragEffect,
                    Effect.flatMap(() => logEffect),
                    Effect.map(() => entityId)
                  );
                })
              );
            })
          )
        )
      )
    )
  ) as any;
}

/**
 * Update Entity Business Logic
 *
 * Steps:
 * 1. Validate inputs
 * 2. Get existing entity
 * 3. Update entity
 * 4. Update RAG index (if applicable)
 * 5. Log event
 */
export function updateEntity(
  ctx: ActionCtx,
  input: UpdateEntityInput,
  context: {
    getEntity: (id: string) => Promise<Entity | null>;
    updateEntity: (id: string, updates: Partial<Entity>) => Promise<void>;
    logEvent: (event: any) => Promise<void>;
  }
): Effect.Effect<void, ValidationError | DatabaseError | RAGError | IndexError, any> {
  return pipe(
    // 1. Get existing entity
    wrapDatabase("query", "entities", () => context.getEntity(input.entityId)),
    Effect.flatMap((entity) => {
      if (!entity) {
        return Effect.fail(
          new ValidationError({
            field: "entityId",
            message: "Entity not found",
            value: input.entityId
          })
        );
      }

      // 2. Validate name if provided
      const nameEffect = input.name
        ? validateEntityName(input.name)
        : Effect.succeed(entity.name);

      return pipe(
        nameEffect,
        Effect.flatMap((validName) => {
          // 3. Build updates
          const updates: Partial<Entity> = {
            updatedAt: Date.now()
          };
          const changes: string[] = [];

          if (input.name) {
            updates.name = validName;
            changes.push("name");
          }
          if (input.properties) {
            updates.properties = input.properties;
            changes.push("properties");
          }
          if (input.status) {
            updates.status = input.status;
            changes.push("status");
          }

          // 4. Update entity
          return pipe(
            wrapDatabase("mutation", "entities", () =>
              context.updateEntity(input.entityId, updates)
            ),
            Effect.flatMap(() => {
              // 5. Update RAG index (if entity has searchable content)
              const ragEffect = shouldIndexForRAG(
                entity.type,
                updates.properties || entity.properties
              )
                ? pipe(
                    (RAGService as any).deleteDocument(ctx, input.entityId),
                    Effect.flatMap(() =>
                      (RAGService as any).addDocument(
                        ctx,
                        `group:${entity.groupId}`,
                        getSearchableText({ ...entity, ...updates }),
                        {
                          entityId: input.entityId,
                          entityType: entity.type,
                          updatedAt: updates.updatedAt
                        }
                      )
                    ),
                    Effect.asVoid
                  )
                : Effect.void;

              // 6. Log event
              const logEffect = wrapDatabase("mutation", "events", () =>
                context.logEvent({
                  groupId: entity.groupId,
                  type: "thing_updated",
                  targetId: input.entityId,
                  timestamp: Date.now(),
                  metadata: {
                    entityType: entity.type,
                    entityName: entity.name,
                    changes
                  }
                })
              );

              return pipe(
                ragEffect,
                Effect.flatMap(() => logEffect),
                Effect.asVoid
              );
            })
          );
        })
      );
    })
  ) as any;
}

/**
 * Archive Entity Business Logic
 *
 * Steps:
 * 1. Get existing entity
 * 2. Archive entity (soft delete)
 * 3. Remove from RAG index
 * 4. Log event
 */
export function archiveEntity(
  ctx: ActionCtx,
  entityId: string,
  context: {
    getEntity: (id: string) => Promise<Entity | null>;
    updateEntity: (id: string, updates: Partial<Entity>) => Promise<void>;
    logEvent: (event: any) => Promise<void>;
  }
): Effect.Effect<void, ValidationError | DatabaseError | RAGError, any> {
  return pipe(
    // 1. Get existing entity
    wrapDatabase("query", "entities", () => context.getEntity(entityId)),
    Effect.flatMap((entity): Effect.Effect<void, ValidationError | DatabaseError | RAGError, any> => {
      if (!entity) {
        return Effect.fail(
          new ValidationError({
            field: "entityId",
            message: "Entity not found",
            value: entityId
          })
        );
      }

      // 2. Archive entity
      const now = Date.now();
      return pipe(
        wrapDatabase("mutation", "entities", () =>
          context.updateEntity(entityId, {
            status: "archived",
            updatedAt: now,
            deletedAt: now
          } as any)
        ),
        Effect.flatMap(() => {
          // 3. Remove from RAG index
          const ragEffect = shouldIndexForRAG(entity.type, entity.properties)
            ? (RAGService as any).deleteDocument(ctx, entityId)
            : Effect.void;

          // 4. Log event
          const logEffect = wrapDatabase("mutation", "events", () =>
            context.logEvent({
              groupId: entity.groupId,
              type: "thing_deleted",
              targetId: entityId,
              timestamp: now,
              metadata: {
                entityType: entity.type,
                entityName: entity.name,
                action: "archived"
              }
            })
          );

          return pipe(ragEffect, Effect.flatMap(() => logEffect), Effect.asVoid);
        })
      ) as any;
    })
  ) as any;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine if entity should be indexed for RAG
 *
 * Returns true for content types (blog_post, video, course, etc.)
 */
function shouldIndexForRAG(type: string, properties: Record<string, any>): boolean {
  const indexableTypes = [
    "blog_post",
    "video",
    "podcast",
    "course",
    "lesson",
    "social_post",
    "email",
    "digital_product",
    "knowledge_item"
  ];

  return indexableTypes.includes(type) && hasSearchableContent(properties);
}

/**
 * Check if entity has searchable content
 */
function hasSearchableContent(properties: Record<string, any>): boolean {
  return !!(
    properties.content ||
    properties.description ||
    properties.transcript ||
    properties.text ||
    properties.body
  );
}

/**
 * Extract searchable text from entity
 */
function getSearchableText(entity: Partial<Entity>): string {
  const parts: string[] = [entity.name || ""];

  if (entity.properties) {
    if (entity.properties.content) parts.push(entity.properties.content);
    if (entity.properties.description) parts.push(entity.properties.description);
    if (entity.properties.transcript) parts.push(entity.properties.transcript);
    if (entity.properties.text) parts.push(entity.properties.text);
    if (entity.properties.body) parts.push(entity.properties.body);
  }

  return parts.filter(Boolean).join("\n\n");
}
