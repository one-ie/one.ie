/**
 * Ontology Hooks - Complete barrel export
 *
 * Import any ontology hook from '@/hooks/ontology'
 *
 * @example
 * ```tsx
 * import {
 *   useProvider,
 *   useGroup,
 *   useCurrentUser,
 *   useThings,
 *   useConnections,
 *   useEvents,
 *   useSearch,
 *   isFeatureEnabled
 * } from '@/hooks/ontology';
 * ```
 */

// Connections
export {
  type Connection,
  type ConnectionFilter,
  type ConnectionType,
  type CreateConnectionInput,
  useConnection,
  useConnections,
  useEnrollments,
  useFollowers,
  useFollowing,
  useIsConnected,
  useOwnedEntities,
  useRelatedEntities,
  useUserEnrollments,
} from "./useConnection";
// Events
export {
  type Event,
  type EventFilter,
  type EventType,
  type RecordEventInput,
  useActivityFeed,
  useAuditTrail,
  useEvent,
  useEventCount,
  useEventStream,
  useEvents,
  useEventsByType,
  useTimeline,
  useUserHistory,
} from "./useEvent";
// Groups
export {
  type CreateGroupInput,
  type Group,
  type GroupFilter,
  type GroupPlan,
  type GroupType,
  type UpdateGroupInput,
  useChildGroups,
  useCurrentGroup,
  useGroup,
  useGroups,
} from "./useGroup";
// People
export {
  type CreatePersonInput,
  type Person,
  type UserRole,
  useCanAccess,
  useCurrentUser,
  useGroupMembers,
  useHasRole,
  usePerson,
  useUserProfile,
} from "./usePerson";
// Provider
export {
  DataProviderProvider,
  type IDataProvider,
  useIsProviderAvailable,
  useProvider,
  useProviderCapability,
  useProviderName,
} from "./useProvider";
// Knowledge & Search
export {
  type Label,
  type LabelCategory,
  type SearchOptions,
  type SearchResult,
  useEntitiesByLabel,
  useEntityLabels,
  useFacetedSearch,
  useLabels,
  useLabelsByCategory,
  useRecommendations,
  useSearch,
  useSearchByType,
  useSimilarEntities,
  useTrendingEntities,
} from "./useSearch";
// Things
export {
  type CreateThingInput,
  type Thing,
  type ThingFilter,
  type UpdateThingInput,
  useMyThings,
  usePublishedThings,
  useThing,
  useThingDetail,
  useThingSearch,
  useThings,
  useThingsByType,
} from "./useThing";
