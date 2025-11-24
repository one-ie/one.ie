/**
 * Validation utilities and error types for the backend
 * Following the 6-dimension ontology with type-safe error handling
 */

// ============================================================================
// ERROR TYPES (Tagged Unions for Effect.ts compatibility)
// ============================================================================

export class ValidationError extends Error {
  readonly _tag = "ValidationError";
  constructor(
    public field: string,
    public message: string
  ) {
    super(`Validation error on ${field}: ${message}`);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  readonly _tag = "NotFoundError";
  constructor(
    public entityType: string,
    public id: string
  ) {
    super(`${entityType} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  readonly _tag = "UnauthorizedError";
  constructor(
    public action: string,
    public reason: string
  ) {
    super(`Unauthorized to ${action}: ${reason}`);
    this.name = "UnauthorizedError";
  }
}

export class DuplicateError extends Error {
  readonly _tag = "DuplicateError";
  constructor(
    public entityType: string,
    public field: string,
    public value: string
  ) {
    super(`${entityType} with ${field}=${value} already exists`);
    this.name = "DuplicateError";
  }
}

export class QuotaExceededError extends Error {
  readonly _tag = "QuotaExceededError";
  constructor(
    public resource: string,
    public limit: number,
    public current: number
  ) {
    super(`${resource} quota exceeded: ${current}/${limit}`);
    this.name = "QuotaExceededError";
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("email", "Invalid email format");
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  field: string,
  min: number,
  max: number
): void {
  if (value.length < min) {
    throw new ValidationError(field, `Must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new ValidationError(field, `Must be at most ${max} characters`);
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: any, field: string): void {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError(field, "This field is required");
  }
}

/**
 * Validate entity type against ontology
 */
export function validateEntityType(type: string): void {
  const validTypes = [
    // People
    "creator",
    "customer",
    "supporter",
    // Content
    "blog_post",
    "blog_category",
    "blog_tag",
    "article",
    "video",
    "podcast",
    "newsletter",
    // Education
    "course",
    "lesson",
    "quiz",
    "certificate",
    "learning_path",
    // Commerce
    "product",
    "service",
    "token",
    "nft",
    "subscription",
    // Community
    "community",
    "channel",
    "thread",
    "message",
    "comment",
    // Projects
    "project",
    "milestone",
    "task",
    "issue",
    // Portfolio
    "portfolio_item",
    "skill",
    "award",
    "testimonial",
    // Organizations
    "organization",
    "team",
    "department",
    // Events
    "event",
    "meetup",
    "webinar",
    // Governance
    "proposal",
    "vote",
    "treasury",
    // External
    "external_agent",
    "external_workflow",
    "external_connection",
    // Contact
    "contact_submission",
    // Other
    "file",
    "image",
    "document",
  ];

  if (!validTypes.includes(type)) {
    throw new ValidationError(
      "type",
      `Invalid entity type. Must be one of: ${validTypes.join(", ")}`
    );
  }
}

/**
 * Validate connection type against ontology
 */
export function validateConnectionType(type: string): void {
  const validTypes = [
    // Ownership
    "owns",
    "created_by",
    "authored",
    // Relationships
    "follows",
    "member_of",
    "part_of",
    "related_to",
    // Content
    "published_in",
    "tagged_with",
    "categorized_as",
    // Education
    "enrolled_in",
    "completed",
    "teaches",
    "mentors",
    // Commerce
    "holds_tokens",
    "purchased",
    "subscribed_to",
    "donated_to",
    // Community
    "commented_on",
    "replied_to",
    "reacted_to",
    // Projects
    "assigned_to",
    "depends_on",
    "blocks",
    // Knowledge
    "has_knowledge",
    "references",
    // Consolidated types with protocol metadata
    "transacted",
    "communicated",
    "delegated",
  ];

  if (!validTypes.includes(type)) {
    throw new ValidationError(
      "type",
      `Invalid connection type. Must be one of: ${validTypes.join(", ")}`
    );
  }
}

/**
 * Validate event type against ontology
 */
export function validateEventType(type: string): void {
  const validTypes = [
    // Group events
    "group_created",
    "group_updated",
    "group_archived",
    // Person events
    "person_created",
    "person_updated",
    "person_removed",
    "person_role_changed",
    "person_added_to_group",
    // Entity events
    "entity_created",
    "entity_updated",
    "entity_deleted",
    "entity_published",
    "entity_archived",
    // Connection events
    "connection_created",
    "connection_updated",
    "connection_deleted",
    // Knowledge events
    "knowledge_created",
    "knowledge_updated",
    "knowledge_deleted",
    "knowledge_linked",
    "knowledge_bulk_created",
    // Auth events
    "user_signed_up",
    "user_signed_in",
    "user_signed_out",
    // Content events
    "post_created",
    "post_published",
    "comment_created",
    // Education events
    "course_created",
    "lesson_completed",
    "quiz_submitted",
    "certificate_earned",
    // Commerce events
    "token_purchased",
    "token_transferred",
    "subscription_started",
    "payment_received",
    // Community events
    "message_sent",
    "reaction_added",
    // Contact events
    "contact_submitted",
    // AI events
    "ai_response_generated",
    "question_answered",
    // API events
    "api_key_created",
    "api_key_revoked",
    // Blockchain events (consolidated)
    "blockchain_transaction",
    "blockchain_contract_deployed",
    "blockchain_event_emitted",
    // Cycle events
    "cycle_started",
    "cycle_completed",
    "cycle_failed",
  ];

  if (!validTypes.includes(type)) {
    throw new ValidationError(
      "type",
      `Invalid event type. Must be one of: ${validTypes.join(", ")}`
    );
  }
}

/**
 * Validate group type
 */
export function validateGroupType(type: string): void {
  const validTypes = [
    "friend_circle",
    "business",
    "community",
    "dao",
    "government",
    "organization",
  ];

  if (!validTypes.includes(type)) {
    throw new ValidationError(
      "type",
      `Invalid group type. Must be one of: ${validTypes.join(", ")}`
    );
  }
}

/**
 * Validate person role
 */
export function validateRole(role: string): void {
  const validRoles = ["platform_owner", "org_owner", "org_user", "customer"];

  if (!validRoles.includes(role)) {
    throw new ValidationError(
      "role",
      `Invalid role. Must be one of: ${validRoles.join(", ")}`
    );
  }
}

/**
 * Validate status
 */
export function validateStatus(status: string): void {
  const validStatuses = ["draft", "active", "published", "archived"];

  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      "status",
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }
}

// ============================================================================
// COMPOSITE VALIDATORS (for complete operations)
// ============================================================================

export interface CreateGroupInput {
  name: string;
  type: string;
  parentGroupId?: string;
  properties?: any;
}

export function validateCreateGroup(input: CreateGroupInput): void {
  validateRequired(input.name, "name");
  validateLength(input.name, "name", 1, 200);
  validateRequired(input.type, "type");
  validateGroupType(input.type);
}

export interface CreatePersonInput {
  groupId: string;
  name: string;
  email: string;
  role: string;
  properties?: any;
}

export function validateCreatePerson(input: CreatePersonInput): void {
  validateRequired(input.groupId, "groupId");
  validateRequired(input.name, "name");
  validateLength(input.name, "name", 1, 200);
  validateRequired(input.email, "email");
  validateEmail(input.email);
  validateRequired(input.role, "role");
  validateRole(input.role);
}

export interface CreateThingInput {
  groupId: string;
  type: string;
  name: string;
  properties?: any;
}

export function validateCreateThing(input: CreateThingInput): void {
  validateRequired(input.groupId, "groupId");
  validateRequired(input.type, "type");
  validateEntityType(input.type);
  validateRequired(input.name, "name");
  validateLength(input.name, "name", 1, 500);
}

export interface CreateConnectionInput {
  groupId: string;
  type: string;
  fromId: string;
  toId: string;
  metadata?: any;
}

export function validateCreateConnection(input: CreateConnectionInput): void {
  validateRequired(input.groupId, "groupId");
  validateRequired(input.type, "type");
  validateConnectionType(input.type);
  validateRequired(input.fromId, "fromId");
  validateRequired(input.toId, "toId");

  if (input.fromId === input.toId) {
    throw new ValidationError("connection", "Cannot create self-referential connection");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safe error message extraction (for logging)
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if error is a specific type
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

/**
 * Format error for HTTP response
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  type?: string;
  field?: string;
} {
  if (error instanceof ValidationError) {
    return {
      error: error.message,
      type: "ValidationError",
      field: error.field,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      error: error.message,
      type: "NotFoundError",
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      error: error.message,
      type: "UnauthorizedError",
    };
  }

  if (error instanceof DuplicateError) {
    return {
      error: error.message,
      type: "DuplicateError",
      field: error.field,
    };
  }

  if (error instanceof QuotaExceededError) {
    return {
      error: error.message,
      type: "QuotaExceededError",
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      type: "Error",
    };
  }

  return {
    error: "Unknown error occurred",
    type: "UnknownError",
  };
}
