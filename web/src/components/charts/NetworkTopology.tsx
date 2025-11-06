'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe2, Server, Activity, MapPin, Signal, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EdgeNode {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'high-load';
  latency: number;
  requests: number;
}

const edgeNodes: EdgeNode[] = [
  { id: 'sfo', name: 'San Francisco', region: 'North America', lat: 37.7749, lng: -122.4194, status: 'active', latency: 12, requests: 45231 },
  { id: 'nyc', name: 'New York', region: 'North America', lat: 40.7128, lng: -74.0060, status: 'active', latency: 18, requests: 38472 },
  { id: 'lon', name: 'London', region: 'Europe', lat: 51.5074, lng: -0.1278, status: 'high-load', latency: 22, requests: 62341 },
  { id: 'fra', name: 'Frankfurt', region: 'Europe', lat: 50.1109, lng: 8.6821, status: 'active', latency: 19, requests: 41283 },
  { id: 'sin', name: 'Singapore', region: 'Asia Pacific', lat: 1.3521, lng: 103.8198, status: 'active', latency: 31, requests: 52914 },
  { id: 'syd', name: 'Sydney', region: 'Oceania', lat: -33.8688, lng: 151.2093, status: 'idle', latency: 45, requests: 21847 },
  { id: 'tok', name: 'Tokyo', region: 'Asia Pacific', lat: 35.6762, lng: 139.6503, status: 'high-load', latency: 28, requests: 71923 },
  { id: 'sao', name: 'São Paulo', region: 'South America', lat: -23.5505, lng: -46.6333, status: 'active', latency: 52, requests: 34127 },
];

interface NetworkTopologyProps {
  /** Show detailed metrics */
  showDetails?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** View mode */
  viewMode?: 'map' | 'grid';
}

function EdgeNodeCard({
  node,
  index,
  animate,
}: {
  node: EdgeNode;
  index: number;
  animate: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), index * 100);
      const pulseTimer = setInterval(() => setPulseActive(prev => !prev), 3000);
      return () => {
        clearTimeout(timer);
        clearInterval(pulseTimer);
      };
    } else {
      setIsVisible(true);
    }
  }, [index, animate]);

  const statusColors = {
    active: 'border-green-500/50 bg-green-500/10',
    idle: 'border-gray-500/50 bg-gray-500/10',
    'high-load': 'border-orange-500/50 bg-orange-500/10',
  };

  const statusBadgeColors = {
    active: 'bg-green-500/20 text-green-600 border-green-500/50',
    idle: 'bg-gray-500/20 text-gray-600 border-gray-500/50',
    'high-load': 'bg-orange-500/20 text-orange-600 border-orange-500/50',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-6 backdrop-blur-xl transition-all duration-700 hover:scale-105 hover:shadow-2xl group ${
        statusColors[node.status]
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Connection Lines Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {pulseActive && (
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke={`url(#gradient-${node.id})`}
              strokeWidth="2"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Node Icon */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
          node.status === 'high-load' ? 'from-orange-600 to-red-500' :
          node.status === 'idle' ? 'from-gray-600 to-gray-500' :
          'from-green-600 to-emerald-500'
        } text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          <Server className="h-6 w-6" />
        </div>

        {/* Status Badge */}
        <Badge variant="outline" className={`text-xs font-bold ${statusBadgeColors[node.status]} animate-pulse`}>
          {node.status === 'high-load' ? 'High Load' : node.status === 'idle' ? 'Idle' : 'Active'}
        </Badge>
      </div>

      {/* Location Info */}
      <div className="relative space-y-3">
        <div>
          <h4 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {node.name}
          </h4>
          <p className="text-sm text-muted-foreground">{node.region}</p>
        </div>

        {/* Metrics */}
        <div className="space-y-2 pt-3 border-t border-border/50">
          {/* Latency */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Latency
            </span>
            <span className={`text-sm font-bold ${
              node.latency < 20 ? 'text-green-600' :
              node.latency < 40 ? 'text-yellow-600' :
              'text-orange-600'
            }`}>
              {node.latency}ms
            </span>
          </div>

          {/* Requests */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Signal className="h-3 w-3" />
              Requests/hr
            </span>
            <span className="text-sm font-bold text-foreground">
              {(node.requests / 1000).toFixed(1)}k
            </span>
          </div>

          {/* Load Bar */}
          <div className="pt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  node.status === 'high-load' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  node.status === 'idle' ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{
                  width: `${node.status === 'high-load' ? 85 : node.status === 'idle' ? 25 : 60}%`,
                  animation: animate ? 'pulse 2s infinite' : undefined
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkMap({ nodes, animate }: { nodes: EdgeNode[]; animate: boolean }) {
  // Initialize with default connections
  const defaultConnections = [
    { from: 'sfo', to: 'nyc', active: true },
    { from: 'nyc', to: 'lon', active: true },
    { from: 'lon', to: 'fra', active: false },
    { from: 'fra', to: 'sin', active: true },
    { from: 'sin', to: 'tok', active: true },
    { from: 'tok', to: 'syd', active: false },
    { from: 'syd', to: 'sfo', active: true },
    { from: 'sao', to: 'nyc', active: true },
  ];

  const [connections, setConnections] = useState<{ from: string; to: string; active: boolean }[]>(defaultConnections);

  useEffect(() => {
    if (animate && typeof window !== 'undefined') {
      // Only animate connections on client side
      const interval = setInterval(() => {
        setConnections(prev =>
          prev.map(conn => ({ ...conn, active: Math.random() > 0.3 }))
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [animate]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-primary/5 via-background to-background rounded-xl border-2 border-primary/20 overflow-hidden">
      {/* World Map Background (simplified) */}
      <div className="absolute inset-0 opacity-10">
        <Globe2 className="h-full w-full text-primary" />
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          // Convert lat/lng to x/y (simplified projection)
          const fromX = ((fromNode.lng + 180) / 360) * 100;
          const fromY = ((90 - fromNode.lat) / 180) * 100;
          const toX = ((toNode.lng + 180) / 360) * 100;
          const toY = ((90 - toNode.lat) / 180) * 100;

          return (
            <line
              key={idx}
              x1={`${fromX}%`}
              y1={`${fromY}%`}
              x2={`${toX}%`}
              y2={`${toY}%`}
              stroke={conn.active ? '#22c55e' : '#6b7280'}
              strokeWidth="1"
              strokeOpacity={conn.active ? 0.6 : 0.2}
              strokeDasharray={conn.active ? '0' : '5 5'}
              className={conn.active ? 'animate-pulse' : ''}
            >
              {conn.active && (
                <animate
                  attributeName="stroke-opacity"
                  values="0.2;0.8;0.2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}
      </svg>

      {/* Edge Nodes */}
      {nodes.map(node => {
        // Convert lat/lng to x/y (simplified projection)
        const x = ((node.lng + 180) / 360) * 100;
        const y = ((90 - node.lat) / 180) * 100;

        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group/node"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {/* Pulse Ring */}
            {node.status === 'high-load' && (
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
            )}

            {/* Node Dot */}
            <div className={`relative h-4 w-4 rounded-full border-2 shadow-lg transition-all duration-300 hover:scale-150 ${
              node.status === 'high-load' ? 'bg-orange-500 border-orange-300' :
              node.status === 'idle' ? 'bg-gray-500 border-gray-300' :
              'bg-green-500 border-green-300'
            }`}>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/node:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-background border border-border rounded-lg shadow-xl p-2 whitespace-nowrap">
                  <p className="text-xs font-bold">{node.name}</p>
                  <p className="text-xs text-muted-foreground">{node.latency}ms • {(node.requests / 1000).toFixed(1)}k req/hr</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 bg-background/80 backdrop-blur-xl rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-xs text-muted-foreground">High Load</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-500" />
          <span className="text-xs text-muted-foreground">Idle</span>
        </div>
      </div>
    </div>
  );
}

export function NetworkTopology({
  showDetails = true,
  animate = true,
  viewMode = 'grid',
}: NetworkTopologyProps) {
  const totalRequests = edgeNodes.reduce((sum, node) => sum + node.requests, 0);
  const avgLatency = Math.round(edgeNodes.reduce((sum, node) => sum + node.latency, 0) / edgeNodes.length);
  const activeNodes = edgeNodes.filter(n => n.status === 'active').length;
  const highLoadNodes = edgeNodes.filter(n => n.status === 'high-load').length;

  return (
    <div className="w-full space-y-8">
      {/* Main Header Card */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
        {/* Animated Background */}
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                Global Edge Network
              </CardTitle>
              <CardDescription className="text-base mt-2">
                330+ locations worldwide • Sub-50ms latency everywhere
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-base px-4 py-2 shadow-lg shadow-blue-500/50">
              <Wifi className="h-4 w-4 mr-1 animate-pulse" />
              Live Network
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Network Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Total Requests</p>
              <p className="text-2xl font-black text-primary">{(totalRequests / 1000).toFixed(0)}k/hr</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Avg Latency</p>
              <p className="text-2xl font-black text-green-600">{avgLatency}ms</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Active Nodes</p>
              <p className="text-2xl font-black text-blue-600">{activeNodes}/{edgeNodes.length}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">High Load</p>
              <p className="text-2xl font-black text-orange-600">{highLoadNodes} nodes</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          {viewMode === 'map' && (
            <NetworkMap nodes={edgeNodes} animate={animate} />
          )}
        </CardContent>
      </Card>

      {/* Edge Nodes Grid */}
      {(viewMode === 'grid' || showDetails) && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Edge Locations</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {edgeNodes.map((node, idx) => (
              <EdgeNodeCard
                key={node.id}
                node={node}
                index={idx}
                animate={animate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Network Benefits */}
      {showDetails && (
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Why Our Network Matters</CardTitle>
            <CardDescription>
              Every millisecond counts for user experience and SEO rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" />
                  Global Reach
                </h4>
                <p className="text-sm text-muted-foreground">
                  Deploy once, serve everywhere. Your content is automatically distributed to all edge locations worldwide.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Low Latency
                </h4>
                <p className="text-sm text-muted-foreground">
                  Users experience sub-50ms response times from the nearest edge, improving conversion rates by up to 23%.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  Auto-Scaling
                </h4>
                <p className="text-sm text-muted-foreground">
                  Traffic automatically routes to available nodes. Handle viral traffic spikes without any configuration.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Signal className="h-5 w-5 text-purple-600" />
                  99.99% Uptime
                </h4>
                <p className="text-sm text-muted-foreground">
                  Redundant infrastructure ensures your site stays online even if entire regions go offline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}