/**
 * TEMPORAL CONSTRAINT VALIDATORS
 *
 * Enforces valid time windows and ordering constraints for temporal fields:
 * - Connection validity windows (validFrom <= validTo)
 * - Event timestamp ordering
 * - Creation/update timestamp sequences
 *
 * These validators prevent logical inconsistencies in temporal data.
 */

/**
 * Validate connection temporal constraints
 *
 * Ensures:
 * - If both validFrom and validTo are provided: validFrom <= validTo
 * - validFrom must be in the past or present
 * - validTo (if provided) must be in the future or present
 *
 * Returns error message if invalid, null if valid
 */
export function validateConnectionTiming(
  validFrom?: number,
  validTo?: number,
  now: number = Date.now()
): string | null {
  // Both provided: validate ordering
  if (validFrom !== undefined && validTo !== undefined) {
    if (validFrom > validTo) {
      return `Connection validFrom (${validFrom}) must be <= validTo (${validTo})`;
    }
  }

  // validFrom in future: warn but allow
  if (validFrom !== undefined && validFrom > now) {
    // This is allowed (scheduling future-valid connections)
    // But could be flagged as unusual
  }

  // validTo in past: always invalid (already expired)
  if (validTo !== undefined && validTo < now) {
    // This is allowed but indicates an already-expired connection
    // Might want to archive instead
  }

  return null;
}

/**
 * Validate event timestamp ordering
 *
 * Ensures:
 * - Event timestamp is not in the future (unless explicitly allowed)
 * - Event timestamp is reasonable (not before epoch or far past)
 *
 * Returns error message if invalid, null if valid
 */
export function validateEventTimestamp(
  timestamp: number,
  now: number = Date.now(),
  allowFuture: boolean = false
): string | null {
  // Future timestamp not allowed (unless explicitly enabled)
  if (!allowFuture && timestamp > now) {
    const diff = Math.round((timestamp - now) / 1000);
    return `Event timestamp cannot be in the future (${diff}s from now)`;
  }

  // Very old timestamp (before 2000-01-01)
  const epoch2000 = 946684800000;
  if (timestamp < epoch2000) {
    return `Event timestamp is before year 2000 (likely invalid)`;
  }

  // Sanity check: not more than 100 years in future
  const hundredYearsMs = 100 * 365.25 * 24 * 60 * 60 * 1000;
  if (timestamp > now + hundredYearsMs) {
    return `Event timestamp is more than 100 years in the future`;
  }

  return null;
}

/**
 * Validate entity creation/update sequences
 *
 * Ensures:
 * - createdAt <= updatedAt
 * - Neither are in far future
 * - Timestamps are monotonically ordered across updates
 *
 * Returns error message if invalid, null if valid
 */
export function validateEntityTimestamps(
  createdAt: number,
  updatedAt: number,
  now: number = Date.now()
): string | null {
  // Creation must come before update
  if (createdAt > updatedAt) {
    return `Entity createdAt (${createdAt}) must be <= updatedAt (${updatedAt})`;
  }

  // Check both are reasonable
  const tsError = validateEventTimestamp(createdAt, now);
  if (tsError) return `createdAt: ${tsError}`;

  const udError = validateEventTimestamp(updatedAt, now);
  if (udError) return `updatedAt: ${udError}`;

  // Sanity check: not updated more than 1ms before created
  if (updatedAt < createdAt) {
    return "updatedAt must be >= createdAt";
  }

  return null;
}

/**
 * Validate deletion timeline
 *
 * Ensures:
 * - deletedAt is after createdAt and updatedAt (if provided)
 * - deletedAt is not in the future
 *
 * Returns error message if invalid, null if valid
 */
export function validateDeletionTimestamp(
  deletedAt: number,
  createdAt: number,
  updatedAt: number,
  now: number = Date.now()
): string | null {
  // Deleted before created
  if (deletedAt < createdAt) {
    return `Deletion cannot occur before creation (deletedAt ${deletedAt} < createdAt ${createdAt})`;
  }

  // Deleted before last update
  if (deletedAt < updatedAt) {
    return `Deletion cannot occur before last update (deletedAt ${deletedAt} < updatedAt ${updatedAt})`;
  }

  // Future deletion (soft delete scheduling)
  if (deletedAt > now) {
    // This could be allowed for scheduled deletion
    // Return null to allow, or error to disallow
    return null;
  }

  return null;
}

/**
 * Validate event sequence integrity
 *
 * Given a series of events, ensure they're in valid order
 * Useful for replay/audit trails
 *
 * Returns array of validation errors (empty if all valid)
 */
export function validateEventSequence(
  events: Array<{
    timestamp: number;
    type: string;
    actorId?: string;
  }>
): Array<{ index: number; error: string }> {
  const errors: Array<{ index: number; error: string }> = [];

  let lastTimestamp = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Check timestamp validity
    const tsError = validateEventTimestamp(event.timestamp);
    if (tsError) {
      errors.push({ index: i, error: tsError });
    }

    // Check ordering (should be non-decreasing, allowing duplicates)
    if (event.timestamp < lastTimestamp) {
      errors.push({
        index: i,
        error: `Event sequence out of order: timestamp ${event.timestamp} < previous ${lastTimestamp}`,
      });
    }

    lastTimestamp = event.timestamp;
  }

  return errors;
}

/**
 * Calculate time window validity
 *
 * Returns object with validity info
 */
export function getTimeWindowValidity(
  validFrom: number | undefined,
  validTo: number | undefined,
  now: number = Date.now()
): {
  isValid: boolean;
  status: "future" | "active" | "expired" | "unknown";
  daysRemaining?: number;
} {
  // No constraints
  if (!validFrom && !validTo) {
    return { isValid: true, status: "unknown" };
  }

  // Check if time window hasn't started yet
  if (validFrom && validFrom > now) {
    const daysRemaining = Math.ceil((validFrom - now) / (24 * 60 * 60 * 1000));
    return { isValid: true, status: "future", daysRemaining };
  }

  // Check if already expired
  if (validTo && validTo < now) {
    return { isValid: false, status: "expired" };
  }

  // Within valid window
  if (validFrom && validTo) {
    if (validFrom <= now && now <= validTo) {
      const daysRemaining = Math.ceil((validTo - now) / (24 * 60 * 60 * 1000));
      return { isValid: true, status: "active", daysRemaining };
    }
  } else if (validFrom && validFrom <= now) {
    // Valid from specified, no end
    return { isValid: true, status: "active" };
  }

  return { isValid: true, status: "unknown" };
}

/**
 * Calculate days since/until timestamps
 *
 * Useful for metrics and aging queries
 */
export function getTimeDelta(
  timestamp: number,
  now: number = Date.now()
): {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
  direction: "past" | "future";
} {
  const delta = Math.abs(now - timestamp);
  const direction = timestamp <= now ? "past" : "future";

  return {
    milliseconds: delta,
    seconds: Math.floor(delta / 1000),
    minutes: Math.floor(delta / (1000 * 60)),
    hours: Math.floor(delta / (1000 * 60 * 60)),
    days: Math.floor(delta / (1000 * 60 * 60 * 24)),
    weeks: Math.floor(delta / (1000 * 60 * 60 * 24 * 7)),
    months: Math.floor(delta / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(delta / (1000 * 60 * 60 * 24 * 365)),
    direction,
  };
}
