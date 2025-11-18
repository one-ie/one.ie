/**
 * Backend-Agnostic React Hooks
 *
 * Convex-style API for accessing the 6-dimension ontology through any backend provider.
 *
 * @example
 * ```tsx
 * import {
 *   DataProviderProvider,
 *   useThings,
 *   useCreateThing,
 *   useConnections,
 *   useLogEvent
 * } from '@/hooks';
 *
 * function App() {
 *   return (
 *     <DataProviderProvider provider={convexProvider}>
 *       <MyComponent />
 *     </DataProviderProvider>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { data: courses, loading } = useThings({ type: 'course' });
 *   const { mutate: createCourse } = useCreateThing();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {courses?.map(course => <div key={course._id}>{course.name}</div>)}
 *       <button onClick={() => createCourse({
 *         type: 'course',
 *         name: 'New Course',
 *         properties: {}
 *       })}>
 *         Create Course
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// PROVIDER & CONTEXT
// ============================================================================

export {
	DataProviderProvider,
	queryClient,
	useDataProvider,
} from "./useDataProvider";

// ============================================================================
// TYPES
// ============================================================================

export type {
	ExtractMutationArgs,
	ExtractMutationData,
	ExtractQueryData,
	MutationOptions,
	MutationResult,
	QueryOptions,
	QueryResult,
} from "./types";

// ============================================================================
// THINGS DIMENSION
// ============================================================================

export {
	useAgents,
	useBlogPosts,
	// Type-specific hooks
	useCourses,
	// Mutation hooks
	useCreateThing,
	useDeleteThing,
	useThing,
	// Query hooks
	useThings,
	useTokens,
	useUpdateThing,
} from "./useThings";

// ============================================================================
// CONNECTIONS DIMENSION
// ============================================================================

export {
	useConnection,
	// Query hooks
	useConnections,
	// Mutation hooks
	useCreateConnection,
	useDeleteConnection,
	useEnrollments,
	useFollowing,
	// Relationship-specific hooks
	useOwnedThings,
	useTokenHoldings,
} from "./useConnections";

// ============================================================================
// EVENTS DIMENSION
// ============================================================================

export {
	useActivityFeed,
	// Convenience hooks
	useAuditTrail,
	useEvent,
	// Query hooks
	useEvents,
	// Mutation hooks
	useLogEvent,
	useRecentEvents,
} from "./useEvents";

// ============================================================================
// KNOWLEDGE DIMENSION
// ============================================================================

export {
	// Mutation hooks
	useCreateKnowledge,
	// Query hooks
	useKnowledge,
	// Convenience hooks
	useLabels,
	useLinkKnowledge,
	useSearch,
	useThingKnowledge,
} from "./useKnowledge";

// ============================================================================
// ORGANIZATIONS DIMENSION
// ============================================================================

export {
	// Mutation hooks
	useCreateOrganization,
	// Convenience hooks
	useCurrentOrganization,
	useDeleteOrganization,
	// Query hooks
	useOrganization,
	useOrganizationMembers,
	useOrganizations,
	useUpdateOrganization,
} from "./useOrganizations";

// ============================================================================
// PEOPLE DIMENSION
// ============================================================================

export {
	// Query hooks
	useCurrentUser,
	// Role & permission helpers
	useHasPermission,
	useHasRole,
	useInvitePerson,
	usePeople,
	usePerson,
	// Mutation hooks
	useUpdatePerson,
} from "./usePeople";

// ============================================================================
// AUTH DIMENSION
// ============================================================================

export {
	// Two-factor authentication
	use2FA,
	// Authentication hooks
	useLogin,
	useLogout,
	useMagicLinkAuth,
	// Password management
	usePasswordReset,
	usePasswordResetComplete,
	useSignup,
	// Email verification
	useVerifyEmail,
} from "./useAuth";

// ============================================================================
// ONTOLOGY DISCOVERY
// ============================================================================

export {
	useConnectionTypes,
	useEnabledFeatures,
	useEventTypes,
	useFeatureBreakdown,
	// Feature detection
	useHasFeature,
	// Complete ontology
	useOntology,
	useOntologyMetadata,
	// Type discovery
	useThingTypes,
} from "./useOntology";
