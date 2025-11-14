/**
 * Comparison View
 *
 * Side-by-side comparison of traditional e-commerce vs Buy in ChatGPT
 */

import { useStore } from '@nanostores/react';
import { metrics, timeFormatted } from '@/stores/buyInChatGPTDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShoppingCart,
  Sparkles,
  Clock,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';

export function ComparisonView() {
  const m = useStore(metrics);
  const time = useStore(timeFormatted);

  // Traditional e-commerce metrics (average)
  const traditionalTime = 180; // 3 minutes in seconds
  const traditionalSteps = 12;
  const traditionalConversion = 15;

  // Calculate current ChatGPT advantage
  const timeSaved = Math.max(0, traditionalTime - m.timeElapsed);
  const stepsSaved = Math.max(0, traditionalSteps - m.stepsCompleted);
  const conversionIncrease = m.conversionProbability - traditionalConversion;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Real-Time Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            See how Buy in ChatGPT compares to traditional e-commerce flows in
            real-time as you progress through the demo.
          </div>
        </CardContent>
      </Card>

      {/* Time Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time to Purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Traditional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium">Traditional</span>
              </div>
              <span className="text-sm font-bold">3:00</span>
            </div>
            <Progress value={100} className="h-2" indicatorClassName="bg-gray-400" />
            <p className="text-xs text-muted-foreground mt-1">
              Average: 180 seconds
            </p>
          </div>

          {/* ChatGPT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium">Buy in ChatGPT</span>
              </div>
              <span className="text-sm font-bold text-green-600">{time}</span>
            </div>
            <Progress
              value={(m.timeElapsed / 60) * 100}
              className="h-2"
              indicatorClassName="bg-green-500"
            />
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {timeSaved > 0 && `${timeSaved}s faster`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Steps Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" />
            Steps Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Traditional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium">Traditional</span>
              </div>
              <span className="text-sm font-bold">12 steps</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-2 bg-gray-400 rounded" />
              ))}
            </div>
          </div>

          {/* ChatGPT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium">Buy in ChatGPT</span>
              </div>
              <span className="text-sm font-bold text-green-600">4 steps</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded ${
                    i < m.stepsCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-green-600 mt-2">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              67% fewer steps
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Conversion Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Traditional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium">Traditional</span>
              </div>
              <span className="text-sm font-bold">15%</span>
            </div>
            <Progress value={15} className="h-2" indicatorClassName="bg-red-400" />
            <p className="text-xs text-red-600 mt-1">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              70% cart abandonment
            </p>
          </div>

          {/* ChatGPT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium">Buy in ChatGPT</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {m.conversionProbability}%
              </span>
            </div>
            <Progress
              value={m.conversionProbability}
              className="h-2"
              indicatorClassName="bg-green-500"
            />
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {conversionIncrease > 0 && `+${conversionIncrease}% higher`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <FeatureRow
              feature="Natural language search"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="Context understanding"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="Personalized recommendations"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="One-click checkout"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="Pre-filled information"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="Instant payment (SPT)"
              traditional={false}
              chatgpt={true}
            />
            <FeatureRow
              feature="Conversational support"
              traditional={false}
              chatgpt={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <p className="font-medium text-green-900 dark:text-green-100">
              Why Buy in ChatGPT Wins
            </p>
            <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>67% faster checkout process</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>33% higher conversion rate</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>AI-powered recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>Frictionless experience</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureRow({
  feature,
  traditional,
  chatgpt,
}: {
  feature: string;
  traditional: boolean;
  chatgpt: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-xs">{feature}</span>
      <div className="flex items-center gap-4">
        <div className="w-6 text-center">
          {traditional ? (
            <Check className="w-4 h-4 text-green-500 inline" />
          ) : (
            <X className="w-4 h-4 text-red-500 inline" />
          )}
        </div>
        <div className="w-6 text-center">
          {chatgpt ? (
            <Check className="w-4 h-4 text-green-500 inline" />
          ) : (
            <X className="w-4 h-4 text-red-500 inline" />
          )}
        </div>
      </div>
    </div>
  );
}
