/**
 * Validation Service - Funnel Builder Validation Functions
 *
 * Provides reusable validation logic for funnel sequences, element positions,
 * and other funnel builder constraints using Effect.ts patterns.
 *
 * Key Features:
 * - Pure validation functions (composable)
 * - Type-safe error handling with Effect.ts
 * - Comprehensive validation rules
 * - Reusable across mutations and queries
 *
 * @see /one/things/plans/clickfunnels-builder-100-cycles.md - Cycle 029
 * @see /backend/CLAUDE.md - Backend patterns
 */

import { Effect } from "effect";
import type { Id } from "../../_generated/dataModel";
import {
  InvalidFunnelSequenceError,
  ValidationError,
  InvalidPageOrderError,
} from "./errors";

// ============================================================================
// Types
// ============================================================================

/**
 * Step with sequence information
 */
export interface StepWithSequence {
  _id: Id<"things">;
  name: string;
  properties: {
    stepType: string;
    [key: string]: any;
  };
  metadata?: {
    sequence: number;
  };
}

/**
 * Connection with sequence metadata
 */
export interface ConnectionWithSequence {
  _id: Id<"connections">;
  fromThingId: Id<"things">;
  toThingId: Id<"things">;
  relationshipType: string;
  metadata?: {
    sequence: number;
    [key: string]: any;
  };
}

/**
 * Element position in page builder
 */
export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

/**
 * Valid step types for funnels
 */
export const VALID_STEP_TYPES = [
  "landing_page",
  "sales_page",
  "upsell_page",
  "downsell_page",
  "thank_you_page",
  "webinar_registration",
  "opt_in_page",
  "checkout_page",
  "custom_page",
] as const;

export type ValidStepType = typeof VALID_STEP_TYPES[number];

// ============================================================================
// Sequence Validation
// ============================================================================

/**
 * Validate funnel step sequence
 *
 * Ensures:
 * - No gaps in sequence (continuous 0..n-1 or 1..n)
 * - No duplicate sequences
 * - All step types are valid
 * - Minimum sequence constraints
 *
 * @param connections - Array of connections with sequence metadata
 * @param steps - Array of steps referenced by connections
 * @returns Effect that succeeds if valid, fails with InvalidFunnelSequenceError
 */
export const validateFunnelSequence = (
  connections: ConnectionWithSequence[],
  steps: StepWithSequence[]
): Effect.Effect<void, InvalidFunnelSequenceError> =>
  Effect.gen(function* () {
    // Check: Must have at least one step
    if (connections.length === 0) {
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Funnel must have at least one step",
          details: "No steps found in sequence",
        })
      );
    }

    // Check: All connections must have sequence metadata
    const missingSequence = connections.filter(
      (conn) => conn.metadata?.sequence === undefined
    );
    if (missingSequence.length > 0) {
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "All steps must have sequence numbers",
          details: `${missingSequence.length} steps missing sequence metadata`,
        })
      );
    }

    // Extract sequences and sort
    const sequences = connections
      .map((conn) => conn.metadata!.sequence)
      .sort((a, b) => a - b);

    // Check: No duplicates
    const uniqueSeqs = new Set(sequences);
    if (uniqueSeqs.size !== sequences.length) {
      const duplicates = sequences.filter(
        (seq, idx) => sequences.indexOf(seq) !== idx
      );
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Duplicate sequences found",
          details: `Duplicate sequence numbers: ${[...new Set(duplicates)].join(", ")}`,
        })
      );
    }

    // Check: No gaps (sequences must be continuous)
    // Accept both 0-based (0,1,2,...) and 1-based (1,2,3,...) sequences
    const minSeq = sequences[0];
    const expectedStart = minSeq === 0 || minSeq === 1 ? minSeq : 0;

    const hasGaps = sequences.some(
      (seq, idx) => seq !== expectedStart + idx
    );

    if (hasGaps) {
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Sequence has gaps",
          details: `Expected continuous ${expectedStart}-${expectedStart + sequences.length - 1}, got: ${sequences.join(", ")}`,
        })
      );
    }

    // Check: All step types are valid
    const invalidSteps = steps.filter(
      (step) => !VALID_STEP_TYPES.includes(step.properties.stepType as ValidStepType)
    );

    if (invalidSteps.length > 0) {
      const invalidTypes = invalidSteps
        .map((s) => `"${s.properties.stepType}"`)
        .join(", ");
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Invalid step types found",
          details: `Invalid step types: ${invalidTypes}. Valid types: ${VALID_STEP_TYPES.join(", ")}`,
        })
      );
    }

    // Check: All connections reference valid steps
    const stepIds = new Set(steps.map((s) => s._id));
    const orphanedConnections = connections.filter(
      (conn) => !stepIds.has(conn.toThingId)
    );

    if (orphanedConnections.length > 0) {
      return yield* Effect.fail(
        new InvalidFunnelSequenceError({
          message: "Orphaned connections found",
          details: `${orphanedConnections.length} connections reference non-existent steps`,
        })
      );
    }
  });

/**
 * Validate reorder operation
 *
 * Ensures:
 * - New sequences are consecutive
 * - No duplicates
 * - All step IDs are valid
 * - Starts at 0 or 1
 *
 * @param stepSequences - Array of stepId -> newSequence mappings
 * @returns Effect that succeeds if valid, fails with InvalidPageOrderError
 */
export const validateReorderOperation = (
  stepSequences: Array<{ stepId: Id<"things">; newSequence: number }>
): Effect.Effect<void, InvalidPageOrderError> =>
  Effect.gen(function* () {
    // Check: Must have at least one step
    if (stepSequences.length === 0) {
      return yield* Effect.fail(
        new InvalidPageOrderError({
          message: "Cannot reorder empty step list",
          funnelId: "" as Id<"things">,
          pageOrder: [],
          details: "No steps provided for reorder operation",
        })
      );
    }

    // Extract and sort sequences
    const sequences = stepSequences
      .map((s) => s.newSequence)
      .sort((a, b) => a - b);

    // Check: No duplicates
    const hasDuplicates = new Set(sequences).size !== sequences.length;
    if (hasDuplicates) {
      return yield* Effect.fail(
        new InvalidPageOrderError({
          message: "Duplicate sequences found in reorder operation",
          funnelId: "" as Id<"things">,
          pageOrder: sequences,
          details: "Each step must have a unique sequence number",
        })
      );
    }

    // Check: No gaps (must be consecutive starting at 0 or 1)
    const minSeq = sequences[0];
    const expectedStart = minSeq === 0 || minSeq === 1 ? minSeq : 0;
    const hasGaps = sequences.some(
      (seq, idx) => seq !== expectedStart + idx
    );

    if (hasGaps) {
      return yield* Effect.fail(
        new InvalidPageOrderError({
          message: "Sequence has gaps",
          funnelId: "" as Id<"things">,
          pageOrder: sequences,
          details: `Expected continuous ${expectedStart}-${expectedStart + sequences.length - 1}, got: ${sequences.join(", ")}`,
        })
      );
    }

    // Check: No negative sequences
    if (sequences.some((seq) => seq < 0)) {
      return yield* Effect.fail(
        new InvalidPageOrderError({
          message: "Negative sequence numbers not allowed",
          funnelId: "" as Id<"things">,
          pageOrder: sequences,
          details: "Sequence numbers must be >= 0",
        })
      );
    }
  });

// ============================================================================
// Element Position Validation
// ============================================================================

/**
 * Validate element position in page builder
 *
 * Ensures:
 * - x, y coordinates are non-negative
 * - width and height are positive
 * - zIndex is within valid range (0-999)
 * - Position doesn't exceed canvas bounds
 *
 * @param position - Element position to validate
 * @param canvasWidth - Maximum canvas width (default: 1920)
 * @param canvasHeight - Maximum canvas height (default: 10000)
 * @returns Effect that succeeds if valid, fails with ValidationError
 */
export const validateElementPosition = (
  position: Position,
  canvasWidth: number = 1920,
  canvasHeight: number = 10000
): Effect.Effect<Position, ValidationError> =>
  Effect.gen(function* () {
    // Validate x coordinate
    if (position.x < 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: "X coordinate cannot be negative",
          field: "x",
          value: position.x,
          constraint: ">= 0",
        })
      );
    }

    // Validate y coordinate
    if (position.y < 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Y coordinate cannot be negative",
          field: "y",
          value: position.y,
          constraint: ">= 0",
        })
      );
    }

    // Validate width
    if (position.width <= 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Width must be positive",
          field: "width",
          value: position.width,
          constraint: "> 0",
        })
      );
    }

    // Validate height
    if (position.height <= 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Height must be positive",
          field: "height",
          value: position.height,
          constraint: "> 0",
        })
      );
    }

    // Validate zIndex (if provided)
    if (position.zIndex !== undefined) {
      if (position.zIndex < 0 || position.zIndex > 999) {
        return yield* Effect.fail(
          new ValidationError({
            message: "zIndex must be between 0 and 999",
            field: "zIndex",
            value: position.zIndex,
            constraint: "0-999",
          })
        );
      }
    }

    // Validate bounds (element must fit within canvas)
    if (position.x + position.width > canvasWidth) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Element exceeds canvas width",
          field: "x + width",
          value: position.x + position.width,
          constraint: `<= ${canvasWidth}`,
        })
      );
    }

    if (position.y + position.height > canvasHeight) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Element exceeds canvas height",
          field: "y + height",
          value: position.y + position.height,
          constraint: `<= ${canvasHeight}`,
        })
      );
    }

    return position;
  });

/**
 * Validate element overlap (detect if two elements overlap)
 *
 * @param pos1 - First element position
 * @param pos2 - Second element position
 * @returns true if elements overlap, false otherwise
 */
export const checkElementOverlap = (
  pos1: Position,
  pos2: Position
): Effect.Effect<boolean> =>
  Effect.sync(() => {
    const overlap =
      pos1.x < pos2.x + pos2.width &&
      pos1.x + pos1.width > pos2.x &&
      pos1.y < pos2.y + pos2.height &&
      pos1.y + pos1.height > pos2.y;

    return overlap;
  });

/**
 * Validate element positioning rules
 *
 * Additional constraints:
 * - Minimum width/height (e.g., buttons must be at least 40x40)
 * - Maximum width/height (prevent huge elements)
 * - Aspect ratio constraints (for specific element types)
 *
 * @param position - Element position
 * @param elementType - Type of element (button, image, text, etc.)
 * @returns Effect that succeeds if valid, fails with ValidationError
 */
export const validateElementConstraints = (
  position: Position,
  elementType: string
): Effect.Effect<Position, ValidationError> =>
  Effect.gen(function* () {
    // First validate basic position
    yield* validateElementPosition(position);

    // Element-specific constraints
    switch (elementType) {
      case "button":
        // Buttons must be at least 40x40px (touch-friendly)
        if (position.width < 40 || position.height < 40) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Button must be at least 40x40px for touch interaction",
              field: "width/height",
              value: `${position.width}x${position.height}`,
              constraint: ">= 40x40",
            })
          );
        }
        break;

      case "image":
        // Images should have reasonable dimensions
        if (position.width > 2000 || position.height > 2000) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Image dimensions exceed maximum (2000x2000px)",
              field: "width/height",
              value: `${position.width}x${position.height}`,
              constraint: "<= 2000x2000",
            })
          );
        }
        break;

      case "text":
        // Text blocks should have minimum width for readability
        if (position.width < 100) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Text block must be at least 100px wide for readability",
              field: "width",
              value: position.width,
              constraint: ">= 100",
            })
          );
        }
        break;

      case "video":
        // Videos should maintain 16:9 aspect ratio (with some tolerance)
        const aspectRatio = position.width / position.height;
        const target = 16 / 9;
        const tolerance = 0.1;

        if (Math.abs(aspectRatio - target) > tolerance) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Video should maintain 16:9 aspect ratio",
              field: "aspect ratio",
              value: aspectRatio.toFixed(2),
              constraint: `~${target.toFixed(2)} (±${tolerance})`,
            })
          );
        }
        break;
    }

    return position;
  });

// ============================================================================
// Step Type Validation
// ============================================================================

/**
 * Validate step type is valid
 *
 * @param stepType - Step type to validate
 * @returns Effect that succeeds with validated type, fails with ValidationError
 */
export const validateStepType = (
  stepType: string
): Effect.Effect<ValidStepType, ValidationError> =>
  Effect.gen(function* () {
    if (!VALID_STEP_TYPES.includes(stepType as ValidStepType)) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Invalid step type",
          field: "stepType",
          value: stepType,
          constraint: `One of: ${VALID_STEP_TYPES.join(", ")}`,
        })
      );
    }

    return stepType as ValidStepType;
  });

/**
 * Validate funnel has required step types
 *
 * Some funnels have constraints on required steps:
 * - Sales funnel: must have landing_page, sales_page, checkout_page, thank_you_page
 * - Lead funnel: must have opt_in_page, thank_you_page
 * - Webinar funnel: must have webinar_registration, thank_you_page
 *
 * @param steps - Array of steps in funnel
 * @param funnelType - Type of funnel (sales, lead, webinar, custom)
 * @returns Effect that succeeds if valid, fails with InvalidFunnelSequenceError
 */
export const validateRequiredStepTypes = (
  steps: StepWithSequence[],
  funnelType: string
): Effect.Effect<void, InvalidFunnelSequenceError> =>
  Effect.gen(function* () {
    const stepTypes = steps.map((s) => s.properties.stepType);

    switch (funnelType) {
      case "sales":
        const requiredSales = [
          "landing_page",
          "sales_page",
          "checkout_page",
          "thank_you_page",
        ];
        const missingSales = requiredSales.filter(
          (type) => !stepTypes.includes(type)
        );
        if (missingSales.length > 0) {
          return yield* Effect.fail(
            new InvalidFunnelSequenceError({
              message: "Sales funnel missing required step types",
              details: `Missing: ${missingSales.join(", ")}`,
            })
          );
        }
        break;

      case "lead":
        const requiredLead = ["opt_in_page", "thank_you_page"];
        const missingLead = requiredLead.filter(
          (type) => !stepTypes.includes(type)
        );
        if (missingLead.length > 0) {
          return yield* Effect.fail(
            new InvalidFunnelSequenceError({
              message: "Lead funnel missing required step types",
              details: `Missing: ${missingLead.join(", ")}`,
            })
          );
        }
        break;

      case "webinar":
        const requiredWebinar = ["webinar_registration", "thank_you_page"];
        const missingWebinar = requiredWebinar.filter(
          (type) => !stepTypes.includes(type)
        );
        if (missingWebinar.length > 0) {
          return yield* Effect.fail(
            new InvalidFunnelSequenceError({
              message: "Webinar funnel missing required step types",
              details: `Missing: ${missingWebinar.join(", ")}`,
            })
          );
        }
        break;

      case "custom":
        // Custom funnels have no required step types
        break;

      default:
        // Unknown funnel type - no validation
        break;
    }
  });

// ============================================================================
// Export Validation Service
// ============================================================================

/**
 * ValidationService - Composable validation functions for funnel builder
 */
export const ValidationService = {
  // Sequence validation
  validateFunnelSequence,
  validateReorderOperation,

  // Position validation
  validateElementPosition,
  validateElementConstraints,
  checkElementOverlap,

  // Step type validation
  validateStepType,
  validateRequiredStepTypes,

  // Constants
  VALID_STEP_TYPES,
};
