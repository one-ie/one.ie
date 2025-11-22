/**
 * Agent Deployment Form - CYCLE-047
 * Form to deploy AI agents with type selection and capability configuration
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type AgentType = 'trading' | 'treasury' | 'community' | 'governance';
type AutonomyLevel = 'supervised' | 'semi' | 'full';

interface AgentConfig {
  name: string;
  agentType: AgentType;
  tokenAddress: string;
  autonomyLevel: AutonomyLevel;
  maxTransactionValue: string;
  capabilities: {
    canTrade: boolean;
    canPropose: boolean;
    canExecute: boolean;
    canDistribute: boolean;
  };
}

export function AgentDeploymentForm() {
  const [config, setConfig] = useState<AgentConfig>({
    name: '',
    agentType: 'trading',
    tokenAddress: '',
    autonomyLevel: 'supervised',
    maxTransactionValue: '100',
    capabilities: {
      canTrade: false,
      canPropose: false,
      canExecute: false,
      canDistribute: false,
    },
  });

  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      // TODO: Call backend mutation to deploy agent
      console.log('Deploying agent:', config);

      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to agent dashboard
      window.location.href = `/agent/new-agent-id`;
    } catch (error) {
      console.error('Failed to deploy agent:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const updateCapabilities = (key: keyof AgentConfig['capabilities'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [key]: value,
      },
    }));
  };

  return (
    <div class="space-y-6">
      {/* Basic Configuration */}
      <div class="space-y-4">
        <div>
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            placeholder="My Trading Agent"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="agentType">Agent Type</Label>
          <Select
            value={config.agentType}
            onValueChange={(value) => setConfig({ ...config, agentType: value as AgentType })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trading">🤖 Trading Agent</SelectItem>
              <SelectItem value="treasury">💰 Treasury Agent</SelectItem>
              <SelectItem value="community">👥 Community Agent</SelectItem>
              <SelectItem value="governance">🏛️ Governance Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tokenAddress">Token Address (Solana)</Label>
          <Input
            id="tokenAddress"
            placeholder="So1a...TokenAddress"
            value={config.tokenAddress}
            onChange={(e) => setConfig({ ...config, tokenAddress: e.target.value })}
            className="mt-1 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The token this agent will manage or interact with
          </p>
        </div>
      </div>

      <Separator />

      {/* Autonomy Configuration */}
      <div class="space-y-4">
        <div>
          <Label className="text-base font-semibold">Autonomy Level</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Control how much autonomy the agent has
          </p>

          <Select
            value={config.autonomyLevel}
            onValueChange={(value) => setConfig({ ...config, autonomyLevel: value as AutonomyLevel })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supervised">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Supervised</span>
                  <span className="text-xs text-muted-foreground">All actions require manual approval</span>
                </div>
              </SelectItem>
              <SelectItem value="semi">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Semi-Autonomous</span>
                  <span className="text-xs text-muted-foreground">Small actions auto, large require approval</span>
                </div>
              </SelectItem>
              <SelectItem value="full">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Full Autonomy</span>
                  <span className="text-xs text-muted-foreground">All actions executed automatically</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="maxTransactionValue">Max Transaction Value (SOL)</Label>
          <Input
            id="maxTransactionValue"
            type="number"
            placeholder="100"
            value={config.maxTransactionValue}
            onChange={(e) => setConfig({ ...config, maxTransactionValue: e.target.value })}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum value per transaction (risk limit)
          </p>
        </div>
      </div>

      <Separator />

      {/* Capabilities */}
      <div class="space-y-4">
        <div>
          <Label className="text-base font-semibold">Agent Capabilities</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Enable specific actions the agent can perform
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canTrade" className="font-medium">Can Trade</Label>
              <p className="text-xs text-muted-foreground">
                Execute trades on DEXs (Raydium, Orca, Jupiter)
              </p>
            </div>
            <Switch
              id="canTrade"
              checked={config.capabilities.canTrade}
              onCheckedChange={(checked) => updateCapabilities('canTrade', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canPropose" className="font-medium">Can Propose</Label>
              <p className="text-xs text-muted-foreground">
                Create governance proposals in DAOs
              </p>
            </div>
            <Switch
              id="canPropose"
              checked={config.capabilities.canPropose}
              onCheckedChange={(checked) => updateCapabilities('canPropose', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canExecute" className="font-medium">Can Execute</Label>
              <p className="text-xs text-muted-foreground">
                Execute passed governance proposals
              </p>
            </div>
            <Switch
              id="canExecute"
              checked={config.capabilities.canExecute}
              onCheckedChange={(checked) => updateCapabilities('canExecute', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canDistribute" className="font-medium">Can Distribute</Label>
              <p className="text-xs text-muted-foreground">
                Distribute tokens to community members
              </p>
            </div>
            <Switch
              id="canDistribute"
              checked={config.capabilities.canDistribute}
              onCheckedChange={(checked) => updateCapabilities('canDistribute', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Deploy Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={!config.name || !config.tokenAddress || isDeploying}
        >
          {isDeploying ? 'Deploying Agent...' : 'Deploy Agent'}
        </Button>
      </div>
    </div>
  );
}
