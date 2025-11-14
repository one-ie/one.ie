/**
 * Metrics Dashboard
 *
 * Real-time metrics showing demo progress and conversion optimization
 */

import { useStore } from '@nanostores/react';
import {
  metrics,
  timeFormatted,
  progressPercentage,
  demoStage,
} from '@/stores/buyInChatGPTDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export function MetricsDashboard() {
  const m = useStore(metrics);
  const time = useStore(timeFormatted);
  const progress = useStore(progressPercentage);
  const stage = useStore(demoStage);

  const isComplete = stage === 'confirmed';

  return (
    <div className="space-y-4">
      {/* Time Elapsed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Time Elapsed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{time}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {isComplete
              ? 'Demo completed'
              : `${m.stepsCompleted}/4 steps completed`}
          </p>
          <Progress value={progress} className="mt-3" />
        </CardContent>
      </Card>

      {/* Conversion Probability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Conversion Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {m.conversionProbability}%
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +{m.conversionProbability - 15}% vs traditional
            </Badge>
          </div>
          <Progress
            value={m.conversionProbability}
            className="mt-3"
            indicatorClassName="bg-green-500"
          />
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <MetricRow
            icon={<Zap className="w-4 h-4 text-yellow-500" />}
            label="Steps Required"
            value="4"
            comparison="vs 12 traditional"
          />
          <MetricRow
            icon={<Clock className="w-4 h-4 text-blue-500" />}
            label="Average Time"
            value="<60s"
            comparison="vs 3-5 min traditional"
          />
          <MetricRow
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            label="Cart Abandonment"
            value="12%"
            comparison="vs 70% traditional"
          />
        </CardContent>
      </Card>

      {/* Stage Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Stage Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <StageItem
            stage="Welcome"
            active={stage === 'welcome'}
            completed={stage !== 'welcome'}
          />
          <StageItem
            stage="Qualifying Questions"
            active={stage === 'qualifying'}
            completed={
              stage !== 'welcome' &&
              stage !== 'qualifying'
            }
          />
          <StageItem
            stage="Product Recommendations"
            active={stage === 'recommendations'}
            completed={
              stage === 'selected' ||
              stage === 'checkout' ||
              stage === 'confirmed'
            }
          />
          <StageItem
            stage="Checkout"
            active={stage === 'selected' || stage === 'checkout'}
            completed={stage === 'confirmed'}
          />
          <StageItem
            stage="Order Confirmed"
            active={stage === 'confirmed'}
            completed={stage === 'confirmed'}
          />
        </CardContent>
      </Card>

      {/* Success Message */}
      {isComplete && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Demo Complete!
                </p>
                <p className="text-green-700 dark:text-green-300">
                  Order completed in {time} with {m.conversionProbability}%
                  conversion confidence. That's 67% faster than traditional
                  e-commerce!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  comparison,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  comparison: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground">{comparison}</div>
      </div>
    </div>
  );
}

function StageItem({
  stage,
  active,
  completed,
}: {
  stage: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        active ? 'bg-primary/10' : ''
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          completed
            ? 'bg-green-500'
            : active
              ? 'bg-primary animate-pulse'
              : 'bg-muted'
        }`}
      />
      <span
        className={`text-sm ${
          active ? 'font-medium' : completed ? 'text-muted-foreground' : 'text-muted-foreground'
        }`}
      >
        {stage}
      </span>
      {completed && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
    </div>
  );
}
