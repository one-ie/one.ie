/**
 * Buy in ChatGPT Demo
 *
 * Complete interactive simulation of the Buy in ChatGPT experience
 */

import { useStore } from '@nanostores/react';
import {
  demoStage,
  messages,
  isTyping,
  showComparison,
  speedSetting,
  resetDemo,
  startDemo,
  type SpeedSetting,
} from '@/stores/buyInChatGPTDemo';
import { ChatSimulator } from './ChatSimulator';
import { MetricsDashboard } from './MetricsDashboard';
import { ComparisonView } from './ComparisonView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RotateCcw,
  Play,
  Zap,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function BuyInChatGPTDemo() {
  const stage = useStore(demoStage);
  const allMessages = useStore(messages);
  const typing = useStore(isTyping);
  const comparison = useStore(showComparison);
  const speed = useStore(speedSetting);
  const [showTooltip, setShowTooltip] = useState(false);

  // Auto-start demo on mount
  useEffect(() => {
    if (allMessages.length === 0) {
      startDemo();
    }
  }, []);

  const handleReset = () => {
    resetDemo();
    setTimeout(() => startDemo(), 300);
  };

  const handleSpeedChange = (newSpeed: SpeedSetting) => {
    speedSetting.set(newSpeed);
  };

  const handleToggleComparison = () => {
    showComparison.set(!comparison);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Buy in ChatGPT Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                Experience the future of conversational commerce
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Speed Control */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={speed === 'slow' ? 'default' : 'ghost'}
                  onClick={() => handleSpeedChange('slow')}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Slow
                </Button>
                <Button
                  size="sm"
                  variant={speed === 'normal' ? 'default' : 'ghost'}
                  onClick={() => handleSpeedChange('normal')}
                  className="text-xs"
                >
                  Normal
                </Button>
                <Button
                  size="sm"
                  variant={speed === 'fast' ? 'default' : 'ghost'}
                  onClick={() => handleSpeedChange('fast')}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Fast
                </Button>
              </div>

              {/* Comparison Toggle */}
              <Button
                size="sm"
                variant={comparison ? 'default' : 'outline'}
                onClick={handleToggleComparison}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Compare
              </Button>

              {/* Reset Button */}
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>

              {/* Info Tooltip */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Info className="w-4 h-4" />
                </Button>

                {showTooltip && (
                  <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-sm">How This Works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <p>
                        This demo simulates the complete Buy in ChatGPT
                        experience:
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>AI understands your needs through conversation</li>
                        <li>Recommends products with explanations</li>
                        <li>Instant checkout with pre-filled data</li>
                        <li>Order confirmed in under 60 seconds</li>
                      </ol>
                      <p className="text-muted-foreground pt-2">
                        All interactions are simulated - no real purchases.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Simulator */}
          <div className={comparison ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <ChatSimulator />
          </div>

          {/* Metrics Dashboard (always visible) */}
          {!comparison && (
            <div className="lg:col-span-1">
              <MetricsDashboard />
            </div>
          )}

          {/* Comparison View (when toggled) */}
          {comparison && (
            <div className="lg:col-span-1">
              <ComparisonView />
            </div>
          )}
        </div>

        {/* Stage Indicator */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={stage === 'welcome' ? 'default' : 'outline'}>
                    1. Welcome
                  </Badge>
                  <Badge
                    variant={stage === 'qualifying' ? 'default' : 'outline'}
                  >
                    2. Qualifying
                  </Badge>
                  <Badge
                    variant={
                      stage === 'recommendations' ? 'default' : 'outline'
                    }
                  >
                    3. Recommendations
                  </Badge>
                  <Badge
                    variant={
                      stage === 'selected' || stage === 'checkout'
                        ? 'default'
                        : 'outline'
                    }
                  >
                    4. Checkout
                  </Badge>
                  <Badge variant={stage === 'confirmed' ? 'default' : 'outline'}>
                    5. Confirmed
                  </Badge>
                </div>

                {stage === 'confirmed' && (
                  <Button size="sm" onClick={handleReset}>
                    <Play className="w-4 h-4 mr-1" />
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Note */}
        <Card className="mt-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Why This Matters</p>
                <p className="text-muted-foreground">
                  Traditional e-commerce requires 7-12 steps and takes 3-5
                  minutes on average. Buy in ChatGPT reduces this to 4 steps and
                  under 60 seconds, increasing conversion rates by up to 33%.
                  The AI understands intent, recommends contextually, and removes
                  friction from checkout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
