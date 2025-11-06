'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap } from 'lucide-react';

interface DeploymentStage {
  name: string;
  duration: number;
  description: string;
  files?: number | string;
  color: string;
  bgColor: string;
}

const stages: DeploymentStage[] = [
  {
    name: 'Build',
    duration: 14,
    description: 'Compile & optimize',
    files: '600+ files',
    color: 'from-blue-600 to-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    name: 'Upload',
    duration: 4.5,
    description: 'Transfer assets',
    files: '665 assets',
    color: 'from-purple-600 to-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    name: 'Deploy',
    duration: 0.5,
    description: 'Edge functions',
    files: 'Serverless',
    color: 'from-green-600 to-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    name: 'Replicate',
    duration: 0.8,
    description: 'Global propagation',
    files: '330+ edges',
    color: 'from-orange-600 to-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

const totalTime = stages.reduce((sum, stage) => sum + stage.duration, 0);

interface DeploymentSpeedProps {
  /** Show detailed breakdown */
  showDetails?: boolean;
  /** Timestamp for deployment */
  timestamp?: string;
}

export function DeploymentSpeed({
  showDetails = true,
  timestamp = 'Nov 6, 2025',
}: DeploymentSpeedProps) {
  const getPercentage = (duration: number): number => {
    return (duration / totalTime) * 100;
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Speed Card */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="absolute -top-12 -right-12 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />

        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">37% Faster Deployments</CardTitle>
              <CardDescription>4-stage pipeline optimized for speed</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Zap className="h-3 w-3 mr-1" />
              Lightning Fast
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          {/* Stages Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {stages.map((stage, idx) => (
              <div key={idx} className="relative">
                {/* Stage Card */}
                <div className={`${stage.bgColor} rounded-lg border border-primary/10 p-4 space-y-3 h-full`}>
                  {/* Duration Circle */}
                  <div className="flex items-center justify-center h-14 w-14 mx-auto rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20">
                    <span className="text-lg font-bold text-foreground">{stage.duration}s</span>
                  </div>

                  {/* Stage Info */}
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-sm">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </div>

                  {/* File Count */}
                  {stage.files && (
                    <div className="text-xs text-center text-muted-foreground bg-background/50 rounded px-2 py-1">
                      {stage.files}
                    </div>
                  )}

                  {/* Percentage */}
                  <div className="text-xs text-center font-medium text-primary">
                    {getPercentage(stage.duration).toFixed(0)}%
                  </div>
                </div>

                {/* Arrow Connector */}
                {idx < stages.length - 1 && (
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:block">
                    <ArrowRight className="h-5 w-5 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar Visualization */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Pipeline Timeline</h4>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted gap-0.5">
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-r ${stage.color}`}
                  style={{ width: `${getPercentage(stage.duration)}%` }}
                  title={`${stage.name}: ${stage.duration}s`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>0s</span>
              <span className="font-semibold text-foreground">{totalTime}s total</span>
              <span>100%</span>
            </div>
          </div>

          {/* Live Status */}
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Live at oneie.pages.dev
              </p>
              <p className="text-xs text-green-600 dark:text-green-400/80">
                Deployed {timestamp}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground mb-2">Deployment Cost</p>
            <p className="text-2xl font-bold text-primary">$0.00</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unlimited deployments. Completely free.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showDetails && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Stage Details</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stage.color} text-white text-sm font-bold flex-shrink-0`}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold">{stage.name}</p>
                      <p className="text-sm text-primary font-bold">{stage.duration}s</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                    {stage.files && (
                      <p className="text-xs text-muted-foreground">
                        {stage.files}
                      </p>
                    )}
                  </div>

                  {/* Small Progress Bar */}
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={`h-full bg-gradient-to-r ${stage.color}`}
                      style={{ width: `${Math.min((stage.duration / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Time</p>
                  <p className="text-2xl font-bold text-primary">{totalTime}s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Files Processed</p>
                  <p className="text-2xl font-bold">1,265+</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold text-green-600">37% ↓</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
