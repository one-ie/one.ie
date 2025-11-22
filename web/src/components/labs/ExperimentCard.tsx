/**
 * ExperimentCard Component
 *
 * Displays experiment information with controls
 * - Enable/disable toggle
 * - View results button
 * - Share feedback button
 * - Usage stats and health indicators
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Star, TrendingUp, Users, Activity, Sparkles } from 'lucide-react';

export interface ExperimentCardProps {
  experiment: {
    id: string;
    name: string;
    description: string;
    experimentType: string;
    status: 'draft' | 'active' | 'archived';
    isEnabled: boolean;
    usageCount: number;
    feedbackCount: number;
    avgRating: number;
    properties?: {
      icon?: string;
      category?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      estimatedTime?: string;
      tags?: string[];
    };
  };
  onToggle: (experimentId: string, enabled: boolean) => Promise<void>;
  onViewResults: (experimentId: string) => void;
  onSubmitFeedback: (
    experimentId: string,
    rating: number,
    feedback: string
  ) => Promise<void>;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onToggle,
  onViewResults,
  onSubmitFeedback,
}) => {
  const [isEnabled, setIsEnabled] = useState(experiment.isEnabled);
  const [isToggling, setIsToggling] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(experiment.id, !isEnabled);
      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error('Failed to toggle experiment:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitFeedback(experiment.id, rating, feedback);
      setShowFeedback(false);
      setFeedback('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (experiment.status) {
      case 'active':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getDifficultyColor = () => {
    switch (experiment.properties?.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const healthScore = calculateHealthScore(experiment);

  return (
    <Card className={`relative overflow-hidden transition-all ${isEnabled ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Status indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor()}`} />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {experiment.properties?.icon && (
                <span className="text-2xl">{experiment.properties.icon}</span>
              )}
              <CardTitle className="text-xl">{experiment.name}</CardTitle>
              {isEnabled && (
                <Badge variant="default" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
            <CardDescription>{experiment.description}</CardDescription>
          </div>
        </div>

        {/* Tags and metadata */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{experiment.experimentType}</Badge>
          {experiment.properties?.difficulty && (
            <Badge className={getDifficultyColor()}>
              {experiment.properties.difficulty}
            </Badge>
          )}
          {experiment.properties?.estimatedTime && (
            <Badge variant="outline">⏱️ {experiment.properties.estimatedTime}</Badge>
          )}
          {experiment.properties?.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Usage</div>
              <div className="font-semibold">{experiment.usageCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500">Rating</div>
              <div className="font-semibold">
                {experiment.avgRating > 0
                  ? experiment.avgRating.toFixed(1)
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Health</div>
              <div className="font-semibold">{healthScore}%</div>
            </div>
          </div>
        </div>

        {/* Health bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              healthScore >= 70
                ? 'bg-green-500'
                : healthScore >= 40
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>

        {/* Enable/Disable toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <Label htmlFor={`enable-${experiment.id}`} className="font-medium">
            {isEnabled ? 'Experiment Enabled' : 'Enable Experiment'}
          </Label>
          <Switch
            id={`enable-${experiment.id}`}
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isToggling || experiment.status !== 'active'}
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onViewResults(experiment.id)}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          View Results
        </Button>

        <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex-1">
              <Star className="w-4 h-4 mr-2" />
              Share Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Feedback</DialogTitle>
              <DialogDescription>
                Help us improve {experiment.name} by sharing your experience
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Star rating */}
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback text */}
              <div>
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="What did you like? What could be improved?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowFeedback(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

// Helper function to calculate health score
function calculateHealthScore(experiment: {
  usageCount: number;
  feedbackCount: number;
  avgRating: number;
}): number {
  if (experiment.feedbackCount === 0) return 50;

  const ratingScore = (experiment.avgRating / 5) * 70;
  const usageScore = Math.min(experiment.usageCount / 100, 1) * 30;

  return Math.round(ratingScore + usageScore);
}
