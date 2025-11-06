'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Package,
  FileCode,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Play,
  Pause
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BuildStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  icon: React.ReactNode;
  details?: string[];
  color: string;
  startTime?: number;
}

const buildSteps: BuildStep[] = [
  {
    id: 'clone',
    name: 'Clone Repository',
    description: 'Fetching latest code from GitHub',
    duration: 2.1,
    status: 'success',
    icon: <GitBranch className="h-5 w-5" />,
    details: ['main branch', '142 commits', '23.4 MB'],
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'install',
    name: 'Install Dependencies',
    description: 'Installing node_modules with Bun',
    duration: 3.8,
    status: 'success',
    icon: <Package className="h-5 w-5" />,
    details: ['1,247 packages', 'Bun v1.0.14', 'Cached: 89%'],
    color: 'from-purple-600 to-pink-500',
  },
  {
    id: 'typecheck',
    name: 'Type Checking',
    description: 'Running TypeScript compiler',
    duration: 4.2,
    status: 'success',
    icon: <FileCode className="h-5 w-5" />,
    details: ['665 files checked', '0 errors', '0 warnings'],
    color: 'from-indigo-600 to-blue-500',
  },
  {
    id: 'build',
    name: 'Build Production',
    description: 'Compiling and optimizing assets',
    duration: 8.5,
    status: 'success',
    icon: <Zap className="h-5 w-5" />,
    details: ['SSG: 42 pages', 'SSR: 8 routes', 'Assets: 234'],
    color: 'from-green-600 to-emerald-500',
  },
  {
    id: 'optimize',
    name: 'Optimize Assets',
    description: 'Minifying and compressing files',
    duration: 2.3,
    status: 'success',
    icon: <Zap className="h-5 w-5" />,
    details: ['JS: -67% size', 'CSS: -42% size', 'Images: WebP'],
    color: 'from-orange-600 to-yellow-500',
  },
];

interface BuildTimelineProps {
  /** Show detailed information */
  showDetails?: boolean;
  /** Enable animations */
  animate?: boolean;
  /** Auto-play the build process */
  autoPlay?: boolean;
}

function StepCard({
  step,
  index,
  isActive,
  isComplete,
  elapsed,
}: {
  step: BuildStep;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  elapsed: number;
}) {
  const progress = isActive ? Math.min((elapsed / step.duration) * 100, 100) : isComplete ? 100 : 0;

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    running: <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-600" />,
    error: <AlertCircle className="h-4 w-4 text-red-600" />,
  };

  const currentStatus = isActive ? 'running' : isComplete ? 'success' : 'pending';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-500 ${
        isActive
          ? 'border-primary/50 bg-primary/10 scale-105 shadow-2xl shadow-primary/20'
          : isComplete
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-border/50 bg-card/30 opacity-60'
      }`}
    >
      {/* Animated Background Gradient */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
      )}

      {/* Step Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Step Number */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg ${
              isActive ? 'animate-pulse scale-110' : ''
            }`}
          >
            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
          </div>

          {/* Step Info */}
          <div>
            <h4 className="font-bold text-base">{step.name}</h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex items-center gap-2">
          {statusIcons[currentStatus]}
          {isActive && (
            <Badge variant="secondary" className="animate-pulse">
              Running
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${step.color} transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {isActive ? `${elapsed.toFixed(1)}s` : isComplete ? `${step.duration}s` : '0s'}
          </span>
          <span className="text-xs font-bold text-primary">
            {isActive ? `${Math.round(progress)}%` : isComplete ? '100%' : '0%'}
          </span>
        </div>
      </div>

      {/* Step Details */}
      {step.details && (isActive || isComplete) && (
        <div className="relative space-y-1 pt-3 border-t border-border/50">
          {step.details.map((detail, idx) => (
            <div
              key={idx}
              className="text-xs text-muted-foreground flex items-center gap-2 animate-in slide-in-from-left duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <span className="h-1 w-1 rounded-full bg-primary" />
              {detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BuildTimeline({
  showDetails = true,
  animate = true,
  autoPlay = true,
}: BuildTimelineProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const totalDuration = buildSteps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    if (!animate || !isPlaying) return;

    let animationFrame: number;
    let lastTime = Date.now();
    let currentStepStartTime = 0;
    let accumulatedTime = 0;

    const updateAnimation = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      setTotalElapsed(prev => {
        const newTotal = prev + delta;

        // Find which step should be active
        let accumulated = 0;
        let activeStep = -1;
        for (let i = 0; i < buildSteps.length; i++) {
          if (newTotal >= accumulated && newTotal < accumulated + buildSteps[i].duration) {
            activeStep = i;
            currentStepStartTime = accumulated;
            break;
          }
          accumulated += buildSteps[i].duration;
        }

        // Update current step
        if (activeStep !== currentStep) {
          if (currentStep >= 0) {
            setCompletedSteps(prev => [...prev, currentStep]);
          }
          setCurrentStep(activeStep);
        }

        // Update elapsed time for current step
        if (activeStep >= 0) {
          setElapsed(newTotal - currentStepStartTime);
        }

        // Reset if complete
        if (newTotal >= totalDuration) {
          setCompletedSteps(buildSteps.map((_, i) => i));
          setCurrentStep(-1);
          setElapsed(0);
          setTimeout(() => {
            setCompletedSteps([]);
            setTotalElapsed(0);
          }, 2000);
          return 0;
        }

        return newTotal;
      });

      animationFrame = requestAnimationFrame(updateAnimation);
    };

    animationFrame = requestAnimationFrame(updateAnimation);
    return () => cancelAnimationFrame(animationFrame);
  }, [animate, isPlaying, currentStep, totalDuration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setCompletedSteps([]);
    setElapsed(0);
    setTotalElapsed(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full space-y-8">
      {/* Main Timeline Card */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
        {/* Animated Background */}
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">
                Build Timeline
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Track every step from code to production
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-base px-4 py-2 shadow-lg shadow-indigo-500/50">
                <Clock className="h-4 w-4 mr-1" />
                {totalDuration.toFixed(1)}s total
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Playback Controls */}
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-background/50 backdrop-blur-xl">
            <button
              onClick={handlePlayPause}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg hover:scale-110 transition-transform duration-300"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-border/50 hover:bg-muted transition-colors duration-300 text-sm font-medium"
            >
              Reset
            </button>

            <div className="flex-1">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${(totalElapsed / totalDuration) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-sm font-bold text-muted-foreground">
              {totalElapsed.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>
          </div>

          {/* Build Steps Timeline */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {buildSteps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                index={idx}
                isActive={currentStep === idx}
                isComplete={completedSteps.includes(idx)}
                elapsed={currentStep === idx ? elapsed : 0}
              />
            ))}
          </div>

          {/* Real-time Console Output Simulation */}
          <div className="rounded-xl border border-border/50 bg-black/90 p-4 font-mono text-xs space-y-1 h-32 overflow-hidden">
            <div className="text-green-400 animate-pulse">$ bunx astro build</div>
            {currentStep >= 0 && (
              <>
                <div className="text-gray-400">
                  [{new Date().toISOString()}] Starting build process...
                </div>
                <div className="text-cyan-400">
                  ▶ {buildSteps[currentStep]?.name}...
                </div>
                {buildSteps[currentStep]?.details?.map((detail, idx) => (
                  <div key={idx} className="text-gray-500 ml-4">
                    • {detail}
                  </div>
                ))}
              </>
            )}
            {completedSteps.length === buildSteps.length && (
              <div className="text-green-400 font-bold animate-pulse">
                ✓ Build completed successfully in {totalDuration.toFixed(1)}s
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Build Metrics */}
      {showDetails && (
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Build Optimization Metrics</CardTitle>
            <CardDescription>
              How our build process compares to traditional tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Speed</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bun vs npm</span>
                    <span className="font-bold text-green-600">3.2x faster</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Astro vs Next.js</span>
                    <span className="font-bold text-green-600">2.1x faster</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total improvement</span>
                    <span className="font-bold text-green-600">67% faster</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Output Size</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">JavaScript</span>
                    <span className="font-bold">234 KB (-67%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CSS</span>
                    <span className="font-bold">42 KB (-42%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Images</span>
                    <span className="font-bold">1.2 MB (WebP)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">First Paint</span>
                    <span className="font-bold text-green-600">0.8s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time to Interactive</span>
                    <span className="font-bold text-green-600">1.2s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lighthouse Score</span>
                    <span className="font-bold text-green-600">100/100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}