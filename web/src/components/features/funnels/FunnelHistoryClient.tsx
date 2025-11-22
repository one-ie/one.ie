/**
 * FunnelHistoryClient Component
 *
 * Real-time funnel version history using EventTimeline.
 * Subscribes to events for a specific funnel and displays timeline.
 *
 * Part of Cycle 37: Create Funnel Version History
 */

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { EventTimeline } from '@/components/ontology-ui/events/EventTimeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

interface FunnelHistoryClientProps {
  funnelId: string;
}

// Funnel-specific event types
const FUNNEL_EVENT_TYPES = [
  'funnel_created',
  'funnel_updated',
  'funnel_published',
  'funnel_unpublished',
  'funnel_duplicated',
  'funnel_archived',
  'step_added',
  'step_removed',
  'step_reordered',
  'element_added',
  'element_updated',
  'element_removed',
];

export function FunnelHistoryClient({ funnelId }: FunnelHistoryClientProps) {
  // Query funnel details
  const funnel = useQuery(api.queries.funnels.get, {
    id: funnelId as Id<'things'>,
  });

  // Query events for this funnel
  const events = useQuery(api.queries.events.byTarget, {
    targetId: funnelId as Id<'things'>,
    types: FUNNEL_EVENT_TYPES,
  });

  // Loading state
  if (funnel === undefined || events === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state - funnel not found
  if (funnel === null) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Funnel not found or you don't have permission to view it.
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state - no events
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No History Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This funnel has no recorded changes yet. Events will appear here as you make updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Export history as JSON
  const handleExport = () => {
    const data = {
      funnel: {
        id: funnel._id,
        name: funnel.name,
        status: funnel.status,
      },
      events: events.map((e) => ({
        type: e.type,
        timestamp: new Date(e.timestamp).toISOString(),
        metadata: e.metadata,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-history-${funnel._id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Funnel Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <a
                  href={`/funnels/${funnelId}`}
                  className="hover:underline flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {funnel.name}
                </a>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {new Date(funnel.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  funnel.status === 'published'
                    ? 'default'
                    : funnel.status === 'archived'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {funnel.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export History
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Changes</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Step Changes</p>
              <p className="text-2xl font-bold">
                {
                  events.filter((e) =>
                    ['step_added', 'step_removed', 'step_reordered'].includes(
                      e.type
                    )
                  ).length
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Element Changes</p>
              <p className="text-2xl font-bold">
                {
                  events.filter((e) =>
                    [
                      'element_added',
                      'element_updated',
                      'element_removed',
                    ].includes(e.type)
                  ).length
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <EventTimeline
        events={events}
        groupByDate={true}
        compact={false}
      />

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Tip:</strong> Click on events to see detailed change information.
            </p>
            <p>
              <strong>Note:</strong> Events are automatically tracked for audit compliance.
              All changes are timestamped and attributed to the user who made them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
