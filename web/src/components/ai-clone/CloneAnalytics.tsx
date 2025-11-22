/**
 * CloneAnalytics - Analytics dashboard for AI clones
 *
 * Features:
 * - Line chart: conversations over time
 * - Bar chart: messages by day of week
 * - Pie chart: topics discussed
 * - Table: top questions asked
 * - Sentiment analysis: positive/neutral/negative ratio
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CloneAnalyticsProps {
  cloneId: string;
}

export function CloneAnalytics({ cloneId }: CloneAnalyticsProps) {
  // TODO: Fetch real data from Convex
  // For now, use mock data

  // Conversations over time (last 30 days)
  const conversationsData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversations: Math.floor(Math.random() * 50) + 20,
    messages: Math.floor(Math.random() * 200) + 100,
  }));

  // Messages by day of week
  const dayOfWeekData = [
    { day: 'Mon', messages: 1245, conversations: 187 },
    { day: 'Tue', messages: 1387, conversations: 203 },
    { day: 'Wed', messages: 1156, conversations: 178 },
    { day: 'Thu', messages: 1523, conversations: 234 },
    { day: 'Fri', messages: 1298, conversations: 198 },
    { day: 'Sat', messages: 987, conversations: 142 },
    { day: 'Sun', messages: 876, conversations: 129 },
  ];

  // Topics discussed (extracted from messages)
  const topicsData = [
    { name: 'Technical Support', value: 342, color: 'hsl(var(--chart-1))' },
    { name: 'Product Questions', value: 289, color: 'hsl(var(--chart-2))' },
    { name: 'Pricing & Billing', value: 187, color: 'hsl(var(--chart-3))' },
    { name: 'Feature Requests', value: 156, color: 'hsl(var(--chart-4))' },
    { name: 'General Inquiry', value: 273, color: 'hsl(var(--chart-5))' },
  ];

  // Top questions asked
  const topQuestions = [
    { question: 'How do I integrate with my website?', count: 234, trend: 'up' },
    { question: 'What are the pricing tiers?', count: 198, trend: 'up' },
    { question: 'Can I customize the clone\'s voice?', count: 187, trend: 'down' },
    { question: 'How long does training take?', count: 156, trend: 'up' },
    { question: 'What data sources can I use?', count: 142, trend: 'neutral' },
  ];

  // Sentiment analysis
  const sentimentData = [
    { name: 'Positive', value: 687, percentage: 68.7, color: 'hsl(142 76% 36%)' },
    { name: 'Neutral', value: 234, percentage: 23.4, color: 'hsl(48 96% 53%)' },
    { name: 'Negative', value: 79, percentage: 7.9, color: 'hsl(0 84% 60%)' },
  ];

  const COLORS = topicsData.map(t => t.color);

  // Custom tooltip for line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Trend icon
  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Conversations Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations Over Time</CardTitle>
          <CardDescription>Daily conversation and message volume for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={conversationsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="conversations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Conversations"
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Messages by Day of Week & Topics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Messages by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle>Messages by Day of Week</CardTitle>
            <CardDescription>Distribution of messages across the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dayOfWeekData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="messages"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Messages"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Topics Discussed (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Topics Discussed</CardTitle>
            <CardDescription>Distribution of conversation topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {topicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Questions Asked */}
      <Card>
        <CardHeader>
          <CardTitle>Top Questions Asked</CardTitle>
          <CardDescription>Most frequently asked questions by users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="text-right w-24">Count</TableHead>
                <TableHead className="text-center w-20">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topQuestions.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{item.question}</TableCell>
                  <TableCell className="text-right font-medium">
                    {item.count}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <TrendIcon trend={item.trend} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>User sentiment across all conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.map((sentiment) => (
              <div key={sentiment.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: sentiment.color }}
                    />
                    <span className="font-medium">{sentiment.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {sentiment.value} ({sentiment.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${sentiment.percentage}%`,
                      backgroundColor: sentiment.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium">Overall Sentiment: Positive</p>
              <p className="text-xs text-muted-foreground mt-1">
                {sentimentData[0].percentage.toFixed(1)}% of users expressed positive sentiment,
                indicating high satisfaction with clone interactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
