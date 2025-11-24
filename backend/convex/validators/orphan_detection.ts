/**
 * ORPHAN DETECTION SERVICE
 *
 * Identifies referential integrity violations in the database:
 * - Orphaned connections (references deleted things)
 * - Orphaned events (references deleted actors/targets)
 * - Orphaned knowledge (references deleted things)
 * - Cross-group references (things in different groups)
 *
 * Used by:
 * 1. Data quality dashboard (monitoring)
 * 2. Repair tools (automated fixes)
 * 3. Migration validation (ensuring consistency)
 *
 * Returns violations with clear descriptions for remediation.
 */

import { QueryCtx } from "../_generated/server";

export interface OrphanViolation {
  type: string; // "orphaned_connection" | "orphaned_event" | "cross_group_reference" | etc.
  id: string; // ID of the violating record
  reason: string; // Human-readable explanation
  severity: "warning" | "error"; // warning = can repair, error = manual review needed
  affectedEntityIds?: string[]; // IDs of related entities
  recommendation?: string; // How to fix
}

export interface DetectionResult {
  violations: OrphanViolation[];
  summary: {
    totalViolations: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  timestamp: number;
  groupId?: string;
}

/**
 * Find orphaned connections
 *
 * A connection is orphaned if:
 * - fromEntityId points to a thing that doesn't exist
 * - toEntityId points to a thing that doesn't exist
 * - fromEntity and toEntity are in different groups
 * - connection's groupId doesn't match entities' groupId
 */
export async function findOrphanedConnections(
  ctx: QueryCtx,
  groupId?: string
): Promise<OrphanViolation[]> {
  const violations: OrphanViolation[] = [];

  // Get all connections (optionally filtered by group)
  let query = ctx.db.query("connections");
  const connections = groupId
    ? await ctx.db
        .query("connections")
        .withIndex("by_group", (q) => q.eq("groupId", groupId as any))
        .collect()
    : await query.collect();

  for (const conn of connections) {
    const connGroupId = (conn as any).groupId;
    const fromEntityId = (conn as any).fromEntityId;
    const toEntityId = (conn as any).toEntityId;

    // Check if FROM entity exists
    const fromEntity = await ctx.db.get(fromEntityId);
    if (!fromEntity) {
      violations.push({
        type: "orphaned_connection_missing_from",
        id: conn._id as string,
        reason: `Connection points to missing FROM entity ${fromEntityId}`,
        severity: "error",
        affectedEntityIds: [fromEntityId as string],
        recommendation: "Delete connection manually (FROM entity cannot be recovered)",
      });
      continue;
    }

    // Check if TO entity exists
    const toEntity = await ctx.db.get(toEntityId);
    if (!toEntity) {
      violations.push({
        type: "orphaned_connection_missing_to",
        id: conn._id as string,
        reason: `Connection points to missing TO entity ${toEntityId}`,
        severity: "error",
        affectedEntityIds: [toEntityId as string],
        recommendation: "Delete connection manually (TO entity cannot be recovered)",
      });
      continue;
    }

    // Check group isolation: FROM entity group
    if ((fromEntity as any).groupId !== connGroupId) {
      violations.push({
        type: "cross_group_reference_from",
        id: conn._id as string,
        reason: `FROM entity ${fromEntityId} (group ${(fromEntity as any).groupId}) differs from connection group ${connGroupId}`,
        severity: "error",
        affectedEntityIds: [fromEntityId as string],
        recommendation: "Update connection groupId or delete connection",
      });
    }

    // Check group isolation: TO entity group
    if ((toEntity as any).groupId !== connGroupId) {
      violations.push({
        type: "cross_group_reference_to",
        id: conn._id as string,
        reason: `TO entity ${toEntityId} (group ${(toEntity as any).groupId}) differs from connection group ${connGroupId}`,
        severity: "error",
        affectedEntityIds: [toEntityId as string],
        recommendation: "Update connection groupId or delete connection",
      });
    }

    // Check group isolation: FROM and TO same group
    if ((fromEntity as any).groupId !== (toEntity as any).groupId) {
      violations.push({
        type: "cross_group_connection",
        id: conn._id as string,
        reason: `FROM entity (group ${(fromEntity as any).groupId}) and TO entity (group ${(toEntity as any).groupId}) in different groups`,
        severity: "error",
        affectedEntityIds: [fromEntityId as string, toEntityId as string],
        recommendation: "Delete connection (cross-tenant connection not allowed)",
      });
    }
  }

  return violations;
}

/**
 * Find orphaned events
 *
 * An event is orphaned if:
 * - actorId points to a thing that doesn't exist
 * - targetId points to a thing that doesn't exist
 * - actor and target are in different groups
 * - event's groupId doesn't match actor/target groupId
 */
export async function findOrphanedEvents(
  ctx: QueryCtx,
  groupId?: string
): Promise<OrphanViolation[]> {
  const violations: OrphanViolation[] = [];

  // Get all events (optionally filtered by group)
  const events = groupId
    ? await ctx.db
        .query("events")
        .withIndex("by_group", (q) => q.eq("groupId", groupId as any))
        .collect()
    : await ctx.db.query("events").collect();

  for (const event of events) {
    const eventGroupId = (event as any).groupId;
    const actorId = (event as any).actorId;
    const targetId = (event as any).targetId;

    // Check actor if present
    if (actorId) {
      const actor = await ctx.db.get(actorId);

      if (!actor) {
        violations.push({
          type: "orphaned_event_missing_actor",
          id: event._id as string,
          reason: `Event has missing actor ${actorId}`,
          severity: "warning",
          affectedEntityIds: [actorId as string],
          recommendation: "Clear actorId (event can still be kept for audit trail)",
        });
      } else if ((actor as any).groupId !== eventGroupId) {
        violations.push({
          type: "cross_group_event_actor",
          id: event._id as string,
          reason: `Event actor (group ${(actor as any).groupId}) differs from event group ${eventGroupId}`,
          severity: "error",
          affectedEntityIds: [actorId as string],
          recommendation: "Update event groupId or clear actorId",
        });
      }
    }

    // Check target if present
    if (targetId) {
      const target = await ctx.db.get(targetId);

      if (!target) {
        violations.push({
          type: "orphaned_event_missing_target",
          id: event._id as string,
          reason: `Event has missing target ${targetId}`,
          severity: "warning",
          affectedEntityIds: [targetId as string],
          recommendation: "Clear targetId (event can still be kept for audit trail)",
        });
      } else if ((target as any).groupId !== eventGroupId) {
        violations.push({
          type: "cross_group_event_target",
          id: event._id as string,
          reason: `Event target (group ${(target as any).groupId}) differs from event group ${eventGroupId}`,
          severity: "error",
          affectedEntityIds: [targetId as string],
          recommendation: "Update event groupId or clear targetId",
        });
      }
    }
  }

  return violations;
}

/**
 * Find orphaned knowledge associations
 *
 * An association is orphaned if:
 * - thingId points to a thing that doesn't exist
 * - knowledgeId points to knowledge that doesn't exist
 */
export async function findOrphanedKnowledge(
  ctx: QueryCtx,
  groupId?: string
): Promise<OrphanViolation[]> {
  const violations: OrphanViolation[] = [];

  // Get all associations
  const associations = await ctx.db.query("thingKnowledge").collect();

  for (const assoc of associations) {
    const thingId = (assoc as any).thingId;
    const knowledgeId = (assoc as any).knowledgeId;

    // Check if thing exists
    const thing = await ctx.db.get(thingId);
    if (!thing) {
      // Skip if filtering by group and thing exists but in different group
      if (groupId && (thing as any)?.groupId !== groupId) {
        continue;
      }

      violations.push({
        type: "orphaned_knowledge_missing_thing",
        id: assoc._id as string,
        reason: `Knowledge association references missing thing ${thingId}`,
        severity: "warning",
        affectedEntityIds: [thingId as string],
        recommendation: "Delete association",
      });
      continue;
    }

    // Check if knowledge exists
    const knowledge = await ctx.db.get(knowledgeId);
    if (!knowledge) {
      violations.push({
        type: "orphaned_knowledge_missing_knowledge",
        id: assoc._id as string,
        reason: `Knowledge association references missing knowledge ${knowledgeId}`,
        severity: "warning",
        affectedEntityIds: [knowledgeId as string],
        recommendation: "Delete association",
      });
      continue;
    }

    // Check group isolation if filtering by group
    if (groupId) {
      if ((thing as any).groupId !== groupId) {
        violations.push({
          type: "cross_group_knowledge_thing",
          id: assoc._id as string,
          reason: `Knowledge thing (group ${(thing as any).groupId}) differs from target group ${groupId}`,
          severity: "error",
          affectedEntityIds: [thingId as string],
          recommendation: "Delete association",
        });
      }
    }
  }

  return violations;
}

/**
 * Find all cross-group references
 *
 * Comprehensive check for any references that span groups
 * This is a critical security check for multi-tenant isolation
 */
export async function findCrossGroupReferences(
  ctx: QueryCtx
): Promise<OrphanViolation[]> {
  const violations: OrphanViolation[] = [];

  // Check connections
  const connectionViolations = await findOrphanedConnections(ctx);
  violations.push(
    ...connectionViolations.filter((v) =>
      v.type.startsWith("cross_group_")
    )
  );

  // Check events
  const eventViolations = await findOrphanedEvents(ctx);
  violations.push(
    ...eventViolations.filter((v) => v.type.startsWith("cross_group_"))
  );

  // Check knowledge
  const knowledgeViolations = await findOrphanedKnowledge(ctx);
  violations.push(
    ...knowledgeViolations.filter((v) =>
      v.type.startsWith("cross_group_")
    )
  );

  return violations;
}

/**
 * Comprehensive orphan detection
 *
 * Runs all detection checks and returns aggregated results
 */
export async function detectAllOrphans(
  ctx: QueryCtx,
  groupId?: string
): Promise<DetectionResult> {
  const violations: OrphanViolation[] = [];

  // Run all checks
  const connViolations = await findOrphanedConnections(ctx, groupId);
  const eventViolations = await findOrphanedEvents(ctx, groupId);
  const knowledgeViolations = await findOrphanedKnowledge(ctx, groupId);

  violations.push(...connViolations);
  violations.push(...eventViolations);
  violations.push(...knowledgeViolations);

  // Aggregate by type and severity
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  for (const v of violations) {
    byType[v.type] = (byType[v.type] || 0) + 1;
    bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
  }

  return {
    violations,
    summary: {
      totalViolations: violations.length,
      byType,
      bySeverity,
    },
    timestamp: Date.now(),
    groupId,
  };
}

/**
 * Auto-repair violations
 *
 * Attempts to automatically fix violations where possible.
 * Manual review required for severity: "error"
 *
 * Returns count of repairs made
 */
export async function autoRepairOrphans(
  ctx: any,
  violations: OrphanViolation[]
): Promise<{ repaired: number; failed: number }> {
  let repaired = 0;
  let failed = 0;

  for (const v of violations) {
    // Only auto-repair warnings
    if (v.severity !== "warning") {
      failed++;
      continue;
    }

    try {
      // Delete orphaned record
      await ctx.db.delete(v.id as any);
      repaired++;
    } catch (e) {
      failed++;
    }
  }

  return { repaired, failed };
}
