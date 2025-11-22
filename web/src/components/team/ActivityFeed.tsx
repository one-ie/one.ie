/**
 * ActivityFeed Component
 *
 * Wrapper around LiveActivityFeed with team-specific formatting
 * Cycle 96: Team Collaboration Features
 */

import { LiveActivityFeed } from '@/components/ontology-ui/streaming/LiveActivityFeed';
import type { Event } from '@/components/ontology-ui/types';

interface ActivityFeedProps {
  events: Event[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function ActivityFeed({ events, onLoadMore, hasMore, isLoading }: ActivityFeedProps) {
  return (
    <LiveActivityFeed
      events={events}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
    />
  );
}
