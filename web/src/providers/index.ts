/**
 * DataProvider Exports
 *
 * Central export for all DataProvider functionality.
 * Organizations can switch backends by changing ONE import.
 */

export type { ConvexProviderConfig } from "./ConvexProvider";
// Convex implementation
export { createConvexProvider } from "./ConvexProvider";
// Main interface and types
export type {
	AuthError,
	AuthResult,
	Connection,
	ConnectionCreateError,
	ConnectionNotFoundError,
	ConnectionType,
	CreateConnectionInput,
	CreateEventInput,
	CreateKnowledgeInput,
	CreateThingInput,
	DataProvider,
	DataProviderError,
	Disable2FAArgs,
	EmailAlreadyExistsError,
	EmailNotVerifiedError,
	Event,
	EventCreateError,
	Invalid2FACodeError,
	InvalidCredentialsError,
	InvalidTokenError,
	Knowledge,
	KnowledgeNotFoundError,
	KnowledgeType,
	ListConnectionsOptions,
	ListEventsOptions,
	ListThingsOptions,
	LoginArgs,
	MagicLinkArgs,
	NetworkError,
	PasswordResetArgs,
	PasswordResetCompleteArgs,
	QueryError,
	RateLimitExceededError,
	SearchKnowledgeOptions,
	SignupArgs,
	Thing,
	ThingCreateError,
	ThingKnowledge,
	ThingNotFoundError,
	ThingStatus,
	ThingUpdateError,
	TokenExpiredError,
	TwoFactorRequiredError,
	TwoFactorSetup,
	TwoFactorStatus,
	UpdateThingInput,
	// Auth types
	User,
	UserNotFoundError,
	Verify2FAArgs,
	VerifyEmailArgs,
	WeakPasswordError,
} from "./DataProvider";
// Effect.ts service tag
export { DataProviderService } from "./DataProvider";
export type { ProviderConfig, ProviderType } from "./factory";
// Factory pattern
export {
	createDataProvider,
	createDataProviderLayer,
	getDefaultProvider,
	initializeDefaultProvider,
} from "./factory";
