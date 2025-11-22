/**
 * Agent Dashboard - CYCLE-048
 * Main dashboard component showing agent stats, controls, and activity
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentStats } from './AgentStats';
import { AgentControls } from './AgentControls';
import { AgentActivityLog } from './AgentActivityLog';
import { AgentSettings } from './AgentSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Agent {
  _id: string;
  name: string;
  type: 'trading' | 'treasury' | 'community' | 'governance';
  status: 'active' | 'paused' | 'disabled';
  walletAddress: string;
  tokenAddress: string;
  properties: {
    agentType: string;
    autonomyLevel: 'supervised' | 'semi' | 'full';
    maxTransactionValue: string;
    capabilities: {
      canTrade: boolean;
      canPropose: boolean;
      canExecute: boolean;
      canDistribute: boolean;
    };
  };
}

interface AgentDashboardProps {
  agentId: string;
}

export function AgentDashboard({ agentId }: AgentDashboardProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch agent data from backend
    // const fetchAgent = async () => {
    //   const data = await convex.query(api.queries.agents.get, { agentId });
    //   setAgent(data);
    //   setLoading(false);
    // };

    // Simulate loading
    setTimeout(() => {
      setAgent({
        _id: agentId,
        name: 'My Trading Agent',
        type: 'trading',
        status: 'active',
        walletAddress: 'AgentWallet123...xyz',
        tokenAddress: 'TokenAddr456...abc',
        properties: {
          agentType: 'trading',
          autonomyLevel: 'semi',
          maxTransactionValue: '100',
          capabilities: {
            canTrade: true,
            canPropose: false,
            canExecute: false,
            canDistribute: false,
          },
        },
      });
      setLoading(false);
    }, 1000);
  }, [agentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Not Found</CardTitle>
          <CardDescription>
            The agent you're looking for doesn't exist or you don't have access to it.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusColors = {
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    disabled: 'bg-red-500',
  };

  const typeEmojis = {
    trading: '🤖',
    treasury: '💰',
    community: '👥',
    governance: '🏛️',
  };

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <Badge variant="outline" className="text-lg">
              {typeEmojis[agent.type]} {agent.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
              <span className="capitalize">{agent.status}</span>
            </div>
            <span>•</span>
            <span className="font-mono">{agent.walletAddress}</span>
          </div>
        </div>

        <AgentControls agent={agent} />
      </div>

      {/* Agent Stats */}
      <AgentStats agent={agent} />

      {/* Tabbed Interface */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <AgentActivityLog agentId={agent._id} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Performance charts and metrics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AgentSettings agent={agent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
