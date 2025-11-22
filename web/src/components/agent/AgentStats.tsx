/**
 * Agent Stats - CYCLE-048
 * Display performance metrics and key statistics
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AgentStatsProps {
  agent: {
    _id: string;
    type: string;
    properties: {
      autonomyLevel: string;
      maxTransactionValue: string;
      capabilities: {
        canTrade: boolean;
        canPropose: boolean;
        canExecute: boolean;
        canDistribute: boolean;
      };
    };
  };
}

export function AgentStats({ agent }: AgentStatsProps) {
  // TODO: Fetch real metrics from backend
  const stats = {
    totalActions: 156,
    actionsToday: 12,
    successRate: 94.2,
    totalValue: '12,450 SOL',
  };

  const capabilities = Object.entries(agent.properties.capabilities)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key.replace('can', ''));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalActions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All-time executions
          </p>
        </CardContent>
      </Card>

      {/* Actions Today */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Actions Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.actionsToday}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Last 24 hours
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Successful executions
          </p>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalValue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Processed volume
          </p>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Autonomy Level</p>
              <Badge variant="outline" className="capitalize">
                {agent.properties.autonomyLevel}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Max Transaction</p>
              <Badge variant="outline">
                {agent.properties.maxTransactionValue} SOL
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {capabilities.map(cap => (
                  <Badge key={cap} variant="secondary" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
