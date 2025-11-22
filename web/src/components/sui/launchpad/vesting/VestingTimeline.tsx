/**
 * VestingTimeline Component
 *
 * Visual timeline component with:
 * - Horizontal timeline with markers
 * - Cliff indicator
 * - Monthly unlock markers
 * - Claimed vs unclaimed visual
 * - Zoom controls
 *
 * Used in: VestingScheduleCard, detailed vesting pages
 */

import { useState, useMemo } from 'react';
import { formatDistance, differenceInMonths, addMonths } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface VestingSchedule {
  id: string;
  tokenSymbol: string;
  totalAmount: number;
  claimedAmount: number;
  startTime: number;
  cliffDuration: number;
  vestingDuration: number;
  cliffEndTime: number;
  endTime: number;
}

interface VestingTimelineProps {
  schedule: VestingSchedule;
  showLegend?: boolean;
  compact?: boolean;
}

export function VestingTimeline({
  schedule,
  showLegend = true,
  compact = false,
}: VestingTimelineProps) {
  const [zoomLevel, setZoomLevel] = useState<'full' | 'months' | 'weeks'>('full');

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const now = Date.now();
    const startDate = new Date(schedule.startTime);
    const cliffEndDate = new Date(schedule.cliffEndTime);
    const endDate = new Date(schedule.endTime);

    const totalMonths = differenceInMonths(endDate, startDate);
    const cliffMonths = differenceInMonths(cliffEndDate, startDate);
    const vestingMonths = totalMonths - cliffMonths;

    // Calculate monthly unlock amount (simplified linear vesting)
    const monthlyUnlock = vestingMonths > 0
      ? schedule.totalAmount / vestingMonths
      : 0;

    // Generate monthly markers
    const markers = [];
    for (let i = 0; i <= totalMonths; i++) {
      const markerDate = addMonths(startDate, i);
      const isCliff = i < cliffMonths;
      const isPast = markerDate.getTime() < now;
      const amount = isCliff ? 0 : monthlyUnlock;

      markers.push({
        date: markerDate,
        month: i,
        isCliff,
        isPast,
        amount,
        label: i === 0 ? 'Start' : i === cliffMonths ? 'Cliff End' : i === totalMonths ? 'End' : `M${i}`,
      });
    }

    return {
      totalMonths,
      cliffMonths,
      vestingMonths,
      monthlyUnlock,
      markers,
      progressPercentage: (schedule.claimedAmount / schedule.totalAmount) * 100,
      currentPosition: now < schedule.startTime
        ? 0
        : now > schedule.endTime
          ? 100
          : ((now - schedule.startTime) / (schedule.endTime - schedule.startTime)) * 100,
    };
  }, [schedule]);

  const handleZoomIn = () => {
    if (zoomLevel === 'full') setZoomLevel('months');
    else if (zoomLevel === 'months') setZoomLevel('weeks');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'weeks') setZoomLevel('months');
    else if (zoomLevel === 'months') setZoomLevel('full');
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact timeline bar */}
        <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
          {/* Cliff section */}
          <div
            className="absolute h-full bg-yellow-200 dark:bg-yellow-900/40"
            style={{
              left: 0,
              width: `${(timelineData.cliffMonths / timelineData.totalMonths) * 100}%`
            }}
          />

          {/* Claimed section */}
          <div
            className="absolute h-full bg-green-500 dark:bg-green-600"
            style={{
              left: 0,
              width: `${timelineData.progressPercentage}%`
            }}
          />

          {/* Current position indicator */}
          <div
            className="absolute h-full w-0.5 bg-primary"
            style={{ left: `${timelineData.currentPosition}%` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-t">
                Now
              </div>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Start</span>
          <span>Cliff: {timelineData.cliffMonths}m</span>
          <span>End: {timelineData.totalMonths}m</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Vesting Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleZoomOut}
              disabled={zoomLevel === 'full'}
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleZoomIn}
              disabled={zoomLevel === 'weeks'}
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline visualization */}
        <div className="space-y-4">
          {/* Timeline bar */}
          <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
            {/* Background sections */}
            <div className="absolute inset-0 flex">
              {/* Cliff section */}
              <div
                className="bg-yellow-100 dark:bg-yellow-900/20 border-r-2 border-yellow-400"
                style={{ width: `${(timelineData.cliffMonths / timelineData.totalMonths) * 100}%` }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="size-6 text-yellow-600 opacity-50" />
                </div>
              </div>

              {/* Vesting section */}
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/10" />
            </div>

            {/* Claimed progress overlay */}
            <div
              className="absolute h-full bg-green-500/80 dark:bg-green-600/80 transition-all duration-500"
              style={{ width: `${timelineData.progressPercentage}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="size-6 text-white opacity-80" />
              </div>
            </div>

            {/* Current position indicator */}
            <div
              className="absolute h-full w-1 bg-primary shadow-lg transition-all duration-300"
              style={{ left: `${timelineData.currentPosition}%` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1">
                <Badge variant="default" className="whitespace-nowrap">
                  Now
                </Badge>
              </div>
            </div>
          </div>

          {/* Month markers */}
          <div className="relative h-12">
            <div className="absolute inset-x-0 flex justify-between items-start">
              {timelineData.markers
                .filter((_, i) =>
                  zoomLevel === 'full' ? i % Math.max(1, Math.floor(timelineData.totalMonths / 12)) === 0 :
                  zoomLevel === 'months' ? i % Math.max(1, Math.floor(timelineData.totalMonths / 24)) === 0 :
                  true
                )
                .map((marker, index) => (
                  <div
                    key={marker.month}
                    className="flex flex-col items-center"
                    style={{
                      position: 'absolute',
                      left: `${(marker.month / timelineData.totalMonths) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className={`w-0.5 h-3 ${marker.isPast ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                    <div className={`text-xs mt-1 ${marker.isPast ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                      {marker.label}
                    </div>
                    {marker.amount > 0 && zoomLevel !== 'full' && (
                      <div className="text-xs text-muted-foreground">
                        +{Math.round(marker.amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{timelineData.totalMonths}</div>
            <div className="text-xs text-muted-foreground">Total Months</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{timelineData.cliffMonths}</div>
            <div className="text-xs text-muted-foreground">Cliff Months</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{timelineData.vestingMonths}</div>
            <div className="text-xs text-muted-foreground">Vesting Months</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(timelineData.monthlyUnlock).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Unlock</div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 rounded" />
              <span className="text-sm text-muted-foreground">Cliff Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded" />
              <span className="text-sm text-muted-foreground">Vesting Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded" />
              <span className="text-sm text-muted-foreground">Claimed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded" />
              <span className="text-sm text-muted-foreground">Current Time</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
