/**
 * Plugin Security Dashboard Component
 * CYCLE-059: Security audit dashboard UI
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  Activity,
  Lock,
  Network,
  Cpu,
} from 'lucide-react';

// Mock data (replace with actual Convex queries)
const mockSecurityOverview = {
  securityScore: 85,
  pluginCount: 12,
  auditCounts: {
    info: 45,
    warning: 8,
    error: 2,
    critical: 0,
  },
  activeAlerts: 2,
  lastUpdated: Date.now(),
};

const mockAuditLog = [
  {
    _id: '1',
    pluginInstanceId: 'plugin_1',
    auditType: 'code_analysis',
    severity: 'info',
    message: 'Code analysis complete. Score: 95/100. Threats: 0',
    timestamp: Date.now() - 3600000,
    metadata: { score: 95, threatCount: 0 },
  },
  {
    _id: '2',
    pluginInstanceId: 'plugin_2',
    auditType: 'permission_check',
    severity: 'warning',
    message: 'Permission granted: network.external',
    timestamp: Date.now() - 7200000,
    metadata: { resource: 'network.external' },
  },
  {
    _id: '3',
    pluginInstanceId: 'plugin_3',
    auditType: 'network_block',
    severity: 'error',
    message: 'Access to localhost is blocked for security reasons',
    timestamp: Date.now() - 10800000,
    metadata: { domain: 'localhost' },
  },
];

export function PluginSecurityDashboard() {
  const [selectedSeverity, setSelectedSeverity] = useState<string | undefined>(undefined);

  // Get security score level
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { level: 'excellent', color: 'green', icon: CheckCircle2 };
    if (score >= 70) return { level: 'good', color: 'blue', icon: Shield };
    if (score >= 50) return { level: 'fair', color: 'yellow', icon: AlertTriangle };
    return { level: 'poor', color: 'red', icon: AlertTriangle };
  };

  const scoreInfo = getScoreLevel(mockSecurityOverview.securityScore);
  const ScoreIcon = scoreInfo.icon;

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Security Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <ScoreIcon className={`h-4 w-4 text-${scoreInfo.color}-500`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityOverview.securityScore}/100</div>
            <p className="text-xs text-muted-foreground capitalize">{scoreInfo.level}</p>
          </CardContent>
        </Card>

        {/* Active Plugins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityOverview.pluginCount}</div>
            <p className="text-xs text-muted-foreground">Installed plugins</p>
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityOverview.auditCounts.critical}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSecurityOverview.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {mockSecurityOverview.activeAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alerts</AlertTitle>
          <AlertDescription>
            You have {mockSecurityOverview.activeAlerts} active security alerts that require attention.{' '}
            <Button variant="link" className="p-0 h-auto">
              View alerts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Details Tabs */}
      <Tabs defaultValue="audit-log" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit-log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>
                Complete history of security events and checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Severity Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  <Button
                    variant={selectedSeverity === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeverity(undefined)}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedSeverity === 'critical' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeverity('critical')}
                  >
                    Critical ({mockSecurityOverview.auditCounts.critical})
                  </Button>
                  <Button
                    variant={selectedSeverity === 'error' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeverity('error')}
                  >
                    Errors ({mockSecurityOverview.auditCounts.error})
                  </Button>
                  <Button
                    variant={selectedSeverity === 'warning' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSeverity('warning')}
                  >
                    Warnings ({mockSecurityOverview.auditCounts.warning})
                  </Button>
                </div>

                {/* Audit Log Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAuditLog
                      .filter((log) => !selectedSeverity || log.severity === selectedSeverity)
                      .map((log) => (
                        <TableRow key={log._id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.auditType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.severity === 'critical' || log.severity === 'error'
                                  ? 'destructive'
                                  : log.severity === 'warning'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.message}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Permissions</CardTitle>
              <CardDescription>
                Manage what plugins can access in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Permission management UI - shows granted/revoked permissions per plugin
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Access Control</CardTitle>
              <CardDescription>
                Manage which domains plugins can access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Network allowlist management UI - add/remove allowed domains
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>
                Monitor CPU, memory, and network usage by plugins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Resource usage charts - CPU, memory, execution time, network bandwidth
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
