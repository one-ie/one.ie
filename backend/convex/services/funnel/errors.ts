import { Data } from "effect";

/**
 * Funnel Builder Error Types
 *
 * Tagged errors using Effect.ts Data pattern for type-safe error handling.
 * Each error provides structured context for debugging and user feedback.
 */

// ============================================================================
// Funnel-Level Errors
// ============================================================================

export class FunnelNotFoundError extends Data.TaggedError("FunnelNotFoundError")<{
  message: string;
  funnelId: string;
}> {}

export class FunnelAlreadyPublishedError extends Data.TaggedError("FunnelAlreadyPublishedError")<{
  message: string;
  funnelId: string;
}> {}

export class InvalidFunnelSequenceError extends Data.TaggedError("InvalidFunnelSequenceError")<{
  message: string;
  details: string;
}> {}

export class UnauthorizedFunnelAccessError extends Data.TaggedError("UnauthorizedFunnelAccessError")<{
  message: string;
  userId: string;
  funnelId: string;
}> {}

export class FunnelLimitExceededError extends Data.TaggedError("FunnelLimitExceededError")<{
  message: string;
  organizationId: string;
  currentCount: number;
  limit: number;
}> {}

export class FunnelInvalidStatusError extends Data.TaggedError("FunnelInvalidStatusError")<{
  message: string;
  funnelId: string;
  currentStatus: string;
  requestedStatus: string;
}> {}

export class FunnelDuplicateNameError extends Data.TaggedError("FunnelDuplicateNameError")<{
  message: string;
  name: string;
  organizationId: string;
}> {}

// ============================================================================
// Page-Level Errors
// ============================================================================

export class PageNotFoundError extends Data.TaggedError("PageNotFoundError")<{
  message: string;
  pageId: string;
}> {}

export class PageAlreadyExistsError extends Data.TaggedError("PageAlreadyExistsError")<{
  message: string;
  funnelId: string;
  pageName: string;
}> {}

export class InvalidPageOrderError extends Data.TaggedError("InvalidPageOrderError")<{
  message: string;
  funnelId: string;
  pageOrder: number[];
  details: string;
}> {}

export class PageLimitExceededError extends Data.TaggedError("PageLimitExceededError")<{
  message: string;
  funnelId: string;
  currentCount: number;
  limit: number;
}> {}

export class UnauthorizedPageAccessError extends Data.TaggedError("UnauthorizedPageAccessError")<{
  message: string;
  userId: string;
  pageId: string;
}> {}

// ============================================================================
// Domain/Hosting Errors
// ============================================================================

export class DomainAlreadyClaimedError extends Data.TaggedError("DomainAlreadyClaimedError")<{
  message: string;
  domain: string;
  claimedBy: string;
}> {}

export class InvalidDomainError extends Data.TaggedError("InvalidDomainError")<{
  message: string;
  domain: string;
  reason: string;
}> {}

export class DomainNotFoundError extends Data.TaggedError("DomainNotFoundError")<{
  message: string;
  domain: string;
}> {}

export class DomainVerificationFailedError extends Data.TaggedError("DomainVerificationFailedError")<{
  message: string;
  domain: string;
  reason: string;
}> {}

// ============================================================================
// Analytics Errors
// ============================================================================

export class AnalyticsNotAvailableError extends Data.TaggedError("AnalyticsNotAvailableError")<{
  message: string;
  funnelId: string;
  reason: string;
}> {}

export class InvalidDateRangeError extends Data.TaggedError("InvalidDateRangeError")<{
  message: string;
  startDate: number;
  endDate: number;
  reason: string;
}> {}

export class AnalyticsDataCorruptedError extends Data.TaggedError("AnalyticsDataCorruptedError")<{
  message: string;
  funnelId: string;
  details: string;
}> {}

// ============================================================================
// Template Errors
// ============================================================================

export class TemplateNotFoundError extends Data.TaggedError("TemplateNotFoundError")<{
  message: string;
  templateId: string;
}> {}

export class InvalidTemplateError extends Data.TaggedError("InvalidTemplateError")<{
  message: string;
  templateId: string;
  reason: string;
}> {}

export class TemplateAlreadyExistsError extends Data.TaggedError("TemplateAlreadyExistsError")<{
  message: string;
  templateName: string;
  organizationId: string;
}> {}

// ============================================================================
// Integration Errors
// ============================================================================

export class IntegrationNotFoundError extends Data.TaggedError("IntegrationNotFoundError")<{
  message: string;
  integrationType: string;
  funnelId: string;
}> {}

export class IntegrationAuthFailedError extends Data.TaggedError("IntegrationAuthFailedError")<{
  message: string;
  integrationType: string;
  reason: string;
}> {}

export class IntegrationDataSyncError extends Data.TaggedError("IntegrationDataSyncError")<{
  message: string;
  integrationType: string;
  funnelId: string;
  details: string;
}> {}

// ============================================================================
// Validation Errors
// ============================================================================

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
  field: string;
  value: unknown;
  constraint: string;
}> {}

export class InvalidConfigurationError extends Data.TaggedError("InvalidConfigurationError")<{
  message: string;
  configKey: string;
  reason: string;
}> {}

// ============================================================================
// Organization Errors
// ============================================================================

export class OrganizationNotFoundError extends Data.TaggedError("OrganizationNotFoundError")<{
  message: string;
  organizationId: string;
}> {}

export class OrganizationInactiveError extends Data.TaggedError("OrganizationInactiveError")<{
  message: string;
  organizationId: string;
  status: string;
}> {}

export class OrganizationQuotaExceededError extends Data.TaggedError("OrganizationQuotaExceededError")<{
  message: string;
  organizationId: string;
  quotaType: string;
  currentUsage: number;
  limit: number;
}> {}

// ============================================================================
// Database Errors
// ============================================================================

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: string;
  operation: string;
  details: string;
}> {}

export class DatabaseConstraintError extends Data.TaggedError("DatabaseConstraintError")<{
  message: string;
  constraint: string;
  table: string;
}> {}

// ============================================================================
// Export All Error Types
// ============================================================================

export type FunnelError =
  // Funnel-level
  | FunnelNotFoundError
  | FunnelAlreadyPublishedError
  | InvalidFunnelSequenceError
  | UnauthorizedFunnelAccessError
  | FunnelLimitExceededError
  | FunnelInvalidStatusError
  | FunnelDuplicateNameError
  // Page-level
  | PageNotFoundError
  | PageAlreadyExistsError
  | InvalidPageOrderError
  | PageLimitExceededError
  | UnauthorizedPageAccessError
  // Domain/Hosting
  | DomainAlreadyClaimedError
  | InvalidDomainError
  | DomainNotFoundError
  | DomainVerificationFailedError
  // Analytics
  | AnalyticsNotAvailableError
  | InvalidDateRangeError
  | AnalyticsDataCorruptedError
  // Templates
  | TemplateNotFoundError
  | InvalidTemplateError
  | TemplateAlreadyExistsError
  // Integrations
  | IntegrationNotFoundError
  | IntegrationAuthFailedError
  | IntegrationDataSyncError
  // Validation
  | ValidationError
  | InvalidConfigurationError
  // Organization
  | OrganizationNotFoundError
  | OrganizationInactiveError
  | OrganizationQuotaExceededError
  // Database
  | DatabaseError
  | DatabaseConstraintError;
