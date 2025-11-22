/**
 * Agent Activity Log - CYCLE-048
 * Real-time activity feed showing agent actions and results
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon, ActivityIcon } from 'lucide-react';

interface ActivityEvent {
  _id: string;
  type: 'agent_action_executed' | 'agent_action_failed' | 'agent_action_pending';
  timestamp: number;
  metadata: {
    action: string;
    result?: string;
    error?: string;
    txSignature?: string;
    value?: string;
  };
}

interface AgentActivityLogProps {
  agentId: string;
}

export function AgentActivityLog({ agentId }: AgentActivityLogProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch activities from backend
    // const fetchActivities = async () => {
    //   const data = await convex.query(api.queries.agents.getActivity, { agentId });
    //   setActivities(data);
    //   setLoading(false);
    // };

    // Simulate loading with mock data
    setTimeout(() => {
      setActivities([
        {
          _id: '1',
          type: 'agent_action_executed',
          timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
          metadata: {
            action: 'swap',
            result: 'success',
            txSignature: '5abc...xyz',
            value: '10 SOL',
          },
        },
        {
          _id: '2',
          type: 'agent_action_executed',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
          metadata: {
            action: 'addLiquidity',
            result: 'success',
            txSignature: '3def...abc',
            value: '50 SOL',
          },
        },
        {
          _id: '3',
          type: 'agent_action_failed',
          timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
          metadata: {
            action: 'swap',
            error: 'Insufficient liquidity',
          },
        },
        {
          _id: '4',
          type: 'agent_action_executed',
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
          metadata: {
            action: 'distribute',
            result: 'success',
            txSignature: '7ghi...def',
            value: '100 tokens',
          },
        },
      ]);
      setLoading(false);
    }, 500);
  }, [agentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'agent_action_executed':
        return <CheckCircle2Icon className="h-5 w-5 text-green-500" />;
      case 'agent_action_failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'agent_action_pending':
        return <AlertCircleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventBadgeVariant = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'agent_action_executed':
        return 'default';
      case 'agent_action_failed':
        return 'destructive';
      case 'agent_action_pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Real-time feed of agent actions and results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No activity yet</p>
            <p className="text-sm mt-1">
              Agent actions will appear here once it starts executing tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((event) => (
              <div
                key={event._id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* Icon */}
                <div className="mt-0.5">
                  {getEventIcon(event.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">
                      {event.metadata.action}
                    </span>
                    <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                      {event.type.replace('agent_action_', '')}
                    </Badge>
                  </div>

                  {event.metadata.result && (
                    <p className="text-sm text-muted-foreground">
                      {event.metadata.result}
                    </p>
                  )}

                  {event.metadata.error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error: {event.metadata.error}
                    </p>
                  )}

                  {event.metadata.value && (
                    <p className="text-sm font-medium mt-1">
                      Value: {event.metadata.value}
                    </p>
                  )}

                  {event.metadata.txSignature && (
                    <a
                      href={`https://solscan.io/tx/${event.metadata.txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-mono mt-1 block"
                    >
                      View on Solscan →
                    </a>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
