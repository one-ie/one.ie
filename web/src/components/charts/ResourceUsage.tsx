'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  Database,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Resource {
  id: string;
  name: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  color: string;
  description: string;
  details?: { label: string; value: string }[];
}

const resources: Resource[] = [
  {
    id: 'cpu',
    name: 'CPU Usage',
    icon: <Cpu className="h-5 w-5" />,
    current: 23,
    max: 100,
    unit: '%',
    trend: 'down',
    trendValue: -12,
    status: 'good',
    color: 'from-blue-600 to-cyan-500',
    description: 'Processing power utilization',
    details: [
      { label: 'Cores', value: '8 vCPU' },
      { label: 'Peak today', value: '67%' },
      { label: 'Avg load', value: '0.92' },
    ],
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: <MemoryStick className="h-5 w-5" />,
    current: 4.2,
    max: 16,
    unit: 'GB',
    trend: 'stable',
    trendValue: 0,
    status: 'good',
    color: 'from-purple-600 to-pink-500',
    description: 'RAM consumption',
    details: [
      { label: 'Available', value: '11.8 GB' },
      { label: 'Cached', value: '2.1 GB' },
      { label: 'Swap', value: '0 MB' },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: <HardDrive className="h-5 w-5" />,
    current: 127,
    max: 500,
    unit: 'GB',
    trend: 'up',
    trendValue: 8,
    status: 'good',
    color: 'from-green-600 to-emerald-500',
    description: 'Disk space usage',
    details: [
      { label: 'Free', value: '373 GB' },
      { label: 'IOPS', value: '12.5k/s' },
      { label: 'Type', value: 'NVMe SSD' },
    ],
  },
  {
    id: 'bandwidth',
    name: 'Bandwidth',
    icon: <Wifi className="h-5 w-5" />,
    current: 892,
    max: 10000,
    unit: 'GB/mo',
    trend: 'up',
    trendValue: 23,
    status: 'good',
    color: 'from-orange-600 to-yellow-500',
    description: 'Network transfer this month',
    details: [
      { label: 'Inbound', value: '342 GB' },
      { label: 'Outbound', value: '550 GB' },
      { label: 'Speed', value: '10 Gbps' },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    icon: <Database className="h-5 w-5" />,
    current: 1.8,
    max: 5,
    unit: 'GB',
    trend: 'stable',
    trendValue: 2,
    status: 'good',
    color: 'from-indigo-600 to-blue-500',
    description: 'Database storage used',
    details: [
      { label: 'Queries/s', value: '1,247' },
      { label: 'Connections', value: '42/100' },
      { label: 'Cache hit', value: '98.2%' },
    ],
  },
  {
    id: 'functions',
    name: 'Functions',
    icon: <Zap className="h-5 w-5" />,
    current: 45231,
    max: 100000,
    unit: 'calls',
    trend: 'up',
    trendValue: 15,
    status: 'good',
    color: 'from-teal-600 to-cyan-500',
    description: 'Edge function invocations today',
    details: [
      { label: 'Avg duration', value: '23ms' },
      { label: 'Success rate', value: '99.8%' },
      { label: 'Cost', value: '$0.00' },
    ],
  },
];

interface ResourceUsageProps {
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** View mode */
  viewMode?: 'cards' | 'list' | 'compact';
}

function ResourceCard({
  resource,
  index,
  animate,
  viewMode,
}: {
  resource: Resource;
  index: number;
  animate: boolean;
  viewMode: string;
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Animate value
        let start = 0;
        const increment = resource.current / 30;
        const interval = setInterval(() => {
          start += increment;
          if (start >= resource.current) {
            setCurrentValue(resource.current);
            clearInterval(interval);
          } else {
            setCurrentValue(start);
          }
        }, 50);
        return () => clearInterval(interval);
      }, index * 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
      setCurrentValue(resource.current);
    }
  }, [resource.current, index, animate]);

  const percentage = (resource.current / resource.max) * 100;
  const displayValue = resource.unit === '%'
    ? Math.round(currentValue)
    : currentValue < 1000
    ? currentValue.toFixed(1)
    : (currentValue / 1000).toFixed(1) + 'k';

  const statusColors = {
    good: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    critical: 'border-red-500/30 bg-red-500/5',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-blue-600" />,
    stable: <Activity className="h-4 w-4 text-gray-600" />,
  };

  if (viewMode === 'compact') {
    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-lg border ${statusColors[resource.status]} transition-all duration-500 hover:scale-102 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className={`p-2 rounded-lg bg-gradient-to-br ${resource.color} text-white`}>
          {resource.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{resource.name}</span>
            <span className="text-xs font-bold">
              {displayValue} {resource.unit}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${resource.color} transition-all duration-1000`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`relative overflow-hidden border-2 ${statusColors[resource.status]} backdrop-blur-xl transition-all duration-700 hover:scale-105 hover:shadow-2xl group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Animated Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}
      />

      {/* Warning Indicator */}
      {resource.status === 'warning' && (
        <div className="absolute top-3 right-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 animate-pulse" />
        </div>
      )}

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          {/* Icon and Name */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${resource.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
              {resource.icon}
            </div>
            <div>
              <CardTitle className="text-base">{resource.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Main Value Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black bg-gradient-to-r ${resource.color} bg-clip-text text-transparent">
              {displayValue}
            </span>
            <span className="text-sm text-muted-foreground">
              / {resource.max} {resource.unit}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${resource.color} transition-all duration-1500 ease-out shadow-lg relative overflow-hidden`}
                style={{ width: `${percentage}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">{Math.round(percentage)}% used</span>
              <div className="flex items-center gap-1">
                {trendIcons[resource.trend]}
                <span className={`text-xs font-bold ${
                  resource.trend === 'up' ? 'text-green-600' :
                  resource.trend === 'down' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {resource.trendValue > 0 ? '+' : ''}{resource.trendValue}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        {resource.details && viewMode === 'cards' && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
            {resource.details.map((detail, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs text-muted-foreground">{detail.label}</p>
                <p className="text-sm font-bold">{detail.value}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceChart({ resources }: { resources: Resource[] }) {
  return (
    <div className="relative h-64 flex items-end gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl">
      {resources.map((resource, idx) => {
        const percentage = (resource.current / resource.max) * 100;
        return (
          <div key={resource.id} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex-1 flex items-end">
              <div
                className={`w-full bg-gradient-to-t ${resource.color} rounded-t-lg transition-all duration-1000 hover:opacity-80`}
                style={{
                  height: `${percentage}%`,
                  animationDelay: `${idx * 100}ms`,
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold">{resource.name}</p>
              <p className="text-xs text-muted-foreground">{Math.round(percentage)}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ResourceUsage({
  showDetails = true,
  animate = true,
  viewMode = 'cards',
}: ResourceUsageProps) {
  const totalUsage = resources.reduce((sum, r) => sum + (r.current / r.max) * 100, 0) / resources.length;
  const criticalResources = resources.filter(r => r.status === 'critical').length;
  const warningResources = resources.filter(r => r.status === 'warning').length;

  return (
    <div className="w-full space-y-8">
      {/* Main Header Card */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
        {/* Animated Background */}
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-cyan-500 to-primary bg-clip-text text-transparent">
                Resource Usage
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Real-time infrastructure monitoring • Auto-scaling enabled
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-base px-4 py-2 shadow-lg shadow-cyan-500/50">
              <Activity className="h-4 w-4 mr-1 animate-pulse" />
              Live Metrics
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Overall Usage</p>
              <p className="text-2xl font-black text-primary">{Math.round(totalUsage)}%</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Status</p>
              <p className="text-2xl font-black text-green-600">Healthy</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Warnings</p>
              <p className="text-2xl font-black text-yellow-600">{warningResources}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl p-4 space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Critical</p>
              <p className="text-2xl font-black text-red-600">{criticalResources}</p>
            </div>
          </div>

          {/* Chart View */}
          <ResourceChart resources={resources} />
        </CardContent>
      </Card>

      {/* Resource Cards Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'compact' ? 'md:grid-cols-2' :
        viewMode === 'list' ? 'grid-cols-1' :
        'md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {resources.map((resource, idx) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            index={idx}
            animate={animate}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Optimization Tips */}
      {showDetails && (
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Resource Optimization</CardTitle>
            <CardDescription>
              Tips to maximize efficiency and minimize costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  CPU & Memory
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Auto-scaling handles traffic spikes automatically
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Edge caching reduces server load by 70%
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Serverless functions scale to zero when idle
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-green-600" />
                  Storage & Bandwidth
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Unlimited bandwidth on all plans
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Automatic image optimization saves 60% storage
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    Global CDN included at no extra cost
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}