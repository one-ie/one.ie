/**
 * Environment Variables Manager
 *
 * Admin dashboard for managing environment variables
 * Features:
 * - List, create, edit, delete env vars
 * - View and rotate secrets
 * - View audit logs
 * - Feature flag management
 * - Build variables export
 */

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface EnvironmentVariablesManagerProps {
  groupId: string;
}

export function EnvironmentVariablesManager({ groupId }: EnvironmentVariablesManagerProps) {
  const [selectedEnv, setSelectedEnv] = useState<'all' | 'development' | 'staging' | 'production'>('production');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [selectedVarId, setSelectedVarId] = useState<string | null>(null);

  // Queries
  const envVars = useQuery(api.queries.environmentVariables.list, {
    groupId,
    environment: selectedEnv === 'all' ? 'all' : selectedEnv,
    includeArchived: false,
    limit: 100,
  });

  const stats = useQuery(api.queries.environmentVariables.getStats, { groupId });

  const auditLog = useQuery(api.queries.environmentVariables.getAuditLog, {
    groupId,
    limit: 50,
  });

  const featureFlags = useQuery(api.queries.environmentVariables.getFeatureFlags, {
    groupId,
    environment: selectedEnv === 'all' ? 'production' : selectedEnv,
  });

  // Mutations
  const createEnvVar = useMutation(api.mutations.environmentVariables.create);
  const updateEnvVar = useMutation(api.mutations.environmentVariables.update);
  const deleteEnvVar = useMutation(api.mutations.environmentVariables.delete_env);
  const rotateSecret = useMutation(api.mutations.environmentVariables.rotateSecret);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    value: '',
    description: '',
    environment: 'production' as const,
    category: '',
    isSecret: true,
    isFeatureFlag: false,
  });

  const [rotateForm, setRotateForm] = useState({
    newValue: '',
    reason: '',
  });

  const handleCreate = async () => {
    try {
      if (!createForm.name || !createForm.value) {
        toast.error('Name and value are required');
        return;
      }

      await createEnvVar({
        groupId,
        name: createForm.name,
        value: createForm.value,
        description: createForm.description || undefined,
        environment: createForm.environment,
        category: createForm.category || undefined,
        isSecret: createForm.isSecret,
        isFeatureFlag: createForm.isFeatureFlag,
        valueType: createForm.isFeatureFlag
          ? createForm.value === 'true' || createForm.value === 'false'
            ? 'boolean'
            : 'string'
          : 'secret',
      });

      toast.success(`Environment variable "${createForm.name}" created`);
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        value: '',
        description: '',
        environment: 'production',
        category: '',
        isSecret: true,
        isFeatureFlag: false,
      });
    } catch (error) {
      toast.error(`Failed to create: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDelete = async (envVarId: string, name: string) => {
    try {
      await deleteEnvVar({
        envVarId,
        reason: 'Deleted by admin',
        permanent: false,
      });

      toast.success(`Environment variable "${name}" archived`);
    } catch (error) {
      toast.error(`Failed to delete: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleRotate = async () => {
    try {
      if (!selectedVarId || !rotateForm.newValue) {
        toast.error('New value is required');
        return;
      }

      await rotateSecret({
        envVarId: selectedVarId as any,
        newValue: rotateForm.newValue,
        reason: rotateForm.reason || 'Secret rotation',
      });

      toast.success('Secret rotated successfully');
      setShowRotateDialog(false);
      setRotateForm({ newValue: '', reason: '' });
      setSelectedVarId(null);
    } catch (error) {
      toast.error(`Failed to rotate: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const filteredVars = envVars?.filter(
    (ev) =>
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables</h1>
          <p className="text-muted-foreground mt-2">
            Manage configuration, API keys, and feature flags securely
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="lg">Add Environment Variable</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Environment Variable</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name (Required)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., STRIPE_SECRET_KEY"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value.toUpperCase() })
                    }
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Uppercase letters, numbers, underscores only
                  </p>
                </div>

                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={createForm.environment}
                    onValueChange={(value) =>
                      setCreateForm({
                        ...createForm,
                        environment: value as 'development' | 'staging' | 'production',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="value">Value (Required)</Label>
                <Textarea
                  id="value"
                  placeholder="Enter the actual value (will be encrypted)"
                  value={createForm.value}
                  onChange={(e) => setCreateForm({ ...createForm, value: e.target.value })}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What is this variable for?"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={createForm.category}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="api">API Keys</SelectItem>
                    <SelectItem value="feature_flag">Feature Flag</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.isSecret}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, isSecret: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Hide value in UI (mark as secret)</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={createForm.isFeatureFlag}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, isFeatureFlag: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>This is a feature flag</span>
                </label>
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Environment Variable
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Secrets</p>
                <p className="text-3xl font-bold text-red-600">{stats.secrets}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Feature Flags</p>
                <p className="text-3xl font-bold text-blue-600">{stats.featureFlags}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="variables" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Variables Tab */}
        <TabsContent value="variables" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />

            <Select
              value={selectedEnv}
              onValueChange={(value) =>
                setSelectedEnv(value as 'all' | 'development' | 'staging' | 'production')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredVars && filteredVars.length > 0 ? (
              filteredVars.map((envVar) => (
                <Card key={envVar._id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-mono font-bold text-lg">{envVar.name}</h3>
                            <Badge variant="outline">{envVar.environment}</Badge>
                            {envVar.isSecret && <Badge variant="destructive">Secret</Badge>}
                            {envVar.isFeatureFlag && <Badge variant="secondary">Feature Flag</Badge>}
                            {envVar.status !== 'active' && (
                              <Badge variant="outline">{envVar.status}</Badge>
                            )}
                          </div>

                          {envVar.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {envVar.description}
                            </p>
                          )}

                          {envVar.category && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Category: {envVar.category}
                            </p>
                          )}

                          {envVar.maskedValue && (
                            <p className="font-mono text-sm mt-2 text-amber-600">
                              {envVar.maskedValue}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground mt-3">
                            Created {new Date(envVar.createdAt).toLocaleDateString()}
                            {envVar.lastModifiedAt &&
                              ` • Modified ${new Date(envVar.lastModifiedAt).toLocaleDateString()}`}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {envVar.isSecret && (
                            <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedVarId(envVar._id)}
                                >
                                  Rotate
                                </Button>
                              </DialogTrigger>
                              {selectedVarId === envVar._id && (
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Rotate Secret: {envVar.name}</DialogTitle>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="new-value">New Value</Label>
                                      <Textarea
                                        id="new-value"
                                        placeholder="Enter new secret value"
                                        value={rotateForm.newValue}
                                        onChange={(e) =>
                                          setRotateForm({
                                            ...rotateForm,
                                            newValue: e.target.value,
                                          })
                                        }
                                        rows={4}
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor="reason">Reason</Label>
                                      <Input
                                        id="reason"
                                        placeholder="Why are you rotating this secret?"
                                        value={rotateForm.reason}
                                        onChange={(e) =>
                                          setRotateForm({
                                            ...rotateForm,
                                            reason: e.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <Button onClick={handleRotate} className="w-full">
                                      Confirm Rotation
                                    </Button>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDelete(envVar._id, envVar.name)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No environment variables found
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="feature-flags" className="space-y-4">
          {featureFlags ? (
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags for {selectedEnv}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(featureFlags).length > 0 ? (
                    Object.entries(featureFlags).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded border">
                        <span className="font-mono">{key}</span>
                        <Badge variant={value ? 'default' : 'secondary'}>
                          {String(value)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No feature flags configured
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Loading feature flags...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          {auditLog && auditLog.length > 0 ? (
            <div className="space-y-3">
              {auditLog.map((log) => (
                <Card key={log._id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {log.action}
                          </Badge>
                          <p className="text-sm font-medium">{log.personDisplayName}</p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>

                        {log.reason && (
                          <p className="text-sm text-muted-foreground mt-2">{log.reason}</p>
                        )}

                        {log.changes && log.changes.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Changed: {log.changes.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No audit log entries
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
