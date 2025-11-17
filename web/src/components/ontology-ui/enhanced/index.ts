/**
 * Enhanced Components - Phase 3 Advanced UI Features
 *
 * Production-ready enhanced components with advanced features:
 * - Live updates and real-time data
 * - Interactive visualizations
 * - Advanced search and filtering
 * - Performance optimizations
 * - Persistence and state management
 */

// Type exports
export type {
  Connection,
  Event,
  FilterConfig,
  SearchResult,
  Thing,
} from "../types";
export { DragDropBoard } from "./DragDropBoard";
export { EnhancedConnectionGraph } from "./EnhancedConnectionGraph";
// Phase 2 - Enhanced Feature Components (Cycles 51-57)
export { EnhancedCourseCard } from "./EnhancedCourseCard";
// Phase 3 - Cycles 58-64 (New Advanced Components)
export { EnhancedEventCard } from "./EnhancedEventCard";
export { EnhancedGroupCard } from "./EnhancedGroupCard";
export { EnhancedProgress } from "./EnhancedProgress";
export { EnhancedQuiz } from "./EnhancedQuiz";
export { EnhancedSearchBar } from "./EnhancedSearchBar";
export { EnhancedThingCard } from "./EnhancedThingCard";
export { EnhancedUserCard } from "./EnhancedUserCard";
export { EnhancedVideoPlayer } from "./EnhancedVideoPlayer";
export { InfiniteScroll, useConvexPagination } from "./InfiniteScroll";
export { SplitPane, SplitPanePresets } from "./SplitPane";
export { createSearchFilter, VirtualizedList } from "./VirtualizedList";
