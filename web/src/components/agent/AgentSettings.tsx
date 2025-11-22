/**
 * Agent Settings - CYCLE-048
 * Configure agent parameters, capabilities, and permissions
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface AgentSettingsProps {
  agent: {
    _id: string;
    name: string;
    properties: {
      autonomyLevel: 'supervised' | 'semi' | 'full';
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

export function AgentSettings({ agent }: AgentSettingsProps) {
  const [config, setConfig] = useState({
    name: agent.name,
    autonomyLevel: agent.properties.autonomyLevel,
    maxTransactionValue: agent.properties.maxTransactionValue,
    capabilities: { ...agent.properties.capabilities },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call backend mutation to update agent settings
      console.log('Saving agent settings:', config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateCapability = (key: keyof typeof config.capabilities, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>
            Configure agent name and general settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Autonomy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Autonomy Settings</CardTitle>
          <CardDescription>
            Control how much autonomy the agent has
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="autonomyLevel">Autonomy Level</Label>
            <Select
              value={config.autonomyLevel}
              onValueChange={(value) => updateConfig({ autonomyLevel: value as typeof config.autonomyLevel })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervised">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Supervised</span>
                    <span className="text-xs text-muted-foreground">All actions require approval</span>
                  </div>
                </SelectItem>
                <SelectItem value="semi">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Semi-Autonomous</span>
                    <span className="text-xs text-muted-foreground">Large actions require approval</span>
                  </div>
                </SelectItem>
                <SelectItem value="full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Full Autonomy</span>
                    <span className="text-xs text-muted-foreground">All actions automatic</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxTransaction">Max Transaction Value (SOL)</Label>
            <Input
              id="maxTransaction"
              type="number"
              value={config.maxTransactionValue}
              onChange={(e) => updateConfig({ maxTransactionValue: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum value per transaction (risk limit)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Capabilities</CardTitle>
          <CardDescription>
            Enable or disable specific agent actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canTrade" className="font-medium">Can Trade</Label>
              <p className="text-xs text-muted-foreground">
                Execute trades on DEXs
              </p>
            </div>
            <Switch
              id="canTrade"
              checked={config.capabilities.canTrade}
              onCheckedChange={(checked) => updateCapability('canTrade', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canPropose" className="font-medium">Can Propose</Label>
              <p className="text-xs text-muted-foreground">
                Create governance proposals
              </p>
            </div>
            <Switch
              id="canPropose"
              checked={config.capabilities.canPropose}
              onCheckedChange={(checked) => updateCapability('canPropose', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canExecute" className="font-medium">Can Execute</Label>
              <p className="text-xs text-muted-foreground">
                Execute passed proposals
              </p>
            </div>
            <Switch
              id="canExecute"
              checked={config.capabilities.canExecute}
              onCheckedChange={(checked) => updateCapability('canExecute', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="canDistribute" className="font-medium">Can Distribute</Label>
              <p className="text-xs text-muted-foreground">
                Distribute tokens to community
              </p>
            </div>
            <Switch
              id="canDistribute"
              checked={config.capabilities.canDistribute}
              onCheckedChange={(checked) => updateCapability('canDistribute', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Delete Agent</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this agent and all its data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure? This action cannot be undone.')) {
                    console.log('Deleting agent:', agent._id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={!hasChanges}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
