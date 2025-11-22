/**
 * CloneDashboard - Main dashboard for managing AI clones
 *
 * Features:
 * - Hero section with clone info
 * - Stats cards
 * - Training status
 * - Voice/appearance preview
 * - Settings editor
 * - Action buttons
 * - Recent conversations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CloneAnalytics } from './CloneAnalytics';
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Star,
  Brain,
  RefreshCw,
  Play,
  Share2,
  Trash2,
  Settings,
  Mic,
  Video,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Network,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface CloneStats {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number; // in seconds
  satisfaction: number; // 0-5
}

export interface CloneTraining {
  knowledgeBaseSize: number; // number of chunks
  lastUpdated: number; // timestamp
  status: 'complete' | 'in_progress' | 'failed';
}

export interface CloneData {
  id: string;
  name: string;
  avatarUrl?: string;
  status: 'active' | 'training' | 'inactive' | 'error';
  systemPrompt: string;
  temperature: number; // 0-1
  tone: string;
  voiceId?: string;
  appearanceId?: string;
  createdAt: number;
  stats: CloneStats;
  training: CloneTraining;
}

interface CloneDashboardProps {
  clone: CloneData;
}

export function CloneDashboard({ clone }: CloneDashboardProps) {
  const [systemPrompt, setSystemPrompt] = useState(clone.systemPrompt);
  const [temperature, setTemperature] = useState(clone.temperature);
  const [tone, setTone] = useState(clone.tone);
  const [isRetraining, setIsRetraining] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Status badge color
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    training: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  // Training status icon
  const trainingStatusIcon = {
    complete: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    in_progress: <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />,
    failed: <AlertCircle className="h-4 w-4 text-red-600" />,
  };

  // Handle retrain
  const handleRetrain = async () => {
    setIsRetraining(true);
    // TODO: Call Convex mutation to retrain clone
    setTimeout(() => {
      setIsRetraining(false);
      alert('Clone retrained successfully!');
    }, 2000);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    // TODO: Call Convex mutation to update clone settings
    setShowSettings(false);
    alert('Settings saved successfully!');
  };

  // Handle delete clone
  const handleDelete = async () => {
    // TODO: Call Convex mutation to delete clone
    alert('Clone deleted successfully!');
    window.location.href = '/clones';
  };

  // Handle test clone
  const handleTest = () => {
    window.location.href = `/clone/${clone.id}/chat`;
  };

  // Handle share clone
  const handleShare = () => {
    const url = `${window.location.origin}/clone/${clone.id}/embed`;
    navigator.clipboard.writeText(url);
    alert('Embed URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={clone.avatarUrl} alt={clone.name} />
                <AvatarFallback>{clone.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{clone.name}</CardTitle>
                  <Badge className={statusColors[clone.status]}>
                    {clone.status}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  Created {formatDistanceToNow(new Date(clone.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button onClick={handleTest} variant="default">
                <Play className="h-4 w-4 mr-2" />
                Test Clone
              </Button>
              <Button onClick={() => window.location.href = `/clone/${clone.id}/knowledge`} variant="outline">
                <Network className="h-4 w-4 mr-2" />
                Knowledge Graph
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {/* Settings Dialog */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Clone Settings</DialogTitle>
                    <DialogDescription>
                      Customize your clone's behavior and personality
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* System Prompt */}
                    <div className="space-y-2">
                      <Label htmlFor="system-prompt">System Prompt</Label>
                      <Textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={6}
                        placeholder="Enter the system prompt for your clone..."
                      />
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2">
                      <Label htmlFor="temperature">
                        Temperature: {temperature.toFixed(2)}
                      </Label>
                      <Slider
                        id="temperature"
                        value={[temperature]}
                        onValueChange={(value) => setTemperature(value[0])}
                        min={0}
                        max={1}
                        step={0.01}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower = more focused, Higher = more creative
                      </p>
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSettings}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Alert Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your clone
                      and remove all associated data including conversations, training data,
                      and analytics.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete Clone
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clone.stats.totalConversations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clone.stats.totalMessages.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clone.stats.avgResponseTime.toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground">
              -0.3s from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfaction
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clone.stats.satisfaction.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training Status & Preview */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Training Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Training Status</CardTitle>
              {trainingStatusIcon[clone.training.status]}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Knowledge Base Size</span>
                <span className="font-medium">
                  {clone.training.knowledgeBaseSize.toLocaleString()} chunks
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(clone.training.lastUpdated), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize">
                  {clone.training.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="w-full"
            >
              {isRetraining ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Retrain Clone
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Voice & Appearance Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice & Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Voice Clone</span>
                <Badge variant={clone.voiceId ? 'default' : 'outline'}>
                  {clone.voiceId ? 'Enabled' : 'Not Configured'}
                </Badge>
              </div>
              {clone.voiceId && (
                <Button variant="outline" size="sm" className="w-full">
                  <Mic className="h-4 w-4 mr-2" />
                  Preview Voice
                </Button>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Appearance Clone</span>
                <Badge variant={clone.appearanceId ? 'default' : 'outline'}>
                  {clone.appearanceId ? 'Enabled' : 'Not Configured'}
                </Badge>
              </div>
              {clone.appearanceId && (
                <Button variant="outline" size="sm" className="w-full">
                  <Video className="h-4 w-4 mr-2" />
                  Preview Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <CloneAnalytics cloneId={clone.id} />

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Conversations</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href={`/clone/${clone.id}/conversations`}>View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock recent conversations */}
            {[
              { id: '1', title: 'Help with React hooks', messages: 12, timestamp: Date.now() - 3600000 },
              { id: '2', title: 'API integration question', messages: 8, timestamp: Date.now() - 7200000 },
              { id: '3', title: 'Deployment troubleshooting', messages: 15, timestamp: Date.now() - 14400000 },
            ].map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => window.location.href = `/clone/${clone.id}/chat?thread=${conversation.id}`}
              >
                <div className="flex-1">
                  <p className="font-medium">{conversation.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {conversation.messages} messages • {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
