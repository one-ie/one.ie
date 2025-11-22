/**
 * Custom Events Dashboard
 *
 * Cycle 79: Custom Event Tracking
 *
 * Comprehensive dashboard for viewing and analyzing custom events with:
 * - Event list with filtering, search, and pagination (EventList from ontology-ui)
 * - Event occurrence charts (line chart, bar chart)
 * - Event goals tracking with progress indicators
 * - Event library browser
 * - Export functionality (CSV)
 * - Real-time updates from both localStorage and Convex
 *
 * Usage:
 * ```tsx
 * <CustomEventsDashboard groupId="group_123" />
 * ```
 */

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { EventList } from '@/components/ontology-ui/events/EventList';
import type { Event } from '@/components/ontology-ui/types';
import {
	getAllEvents,
	getEventCounts,
	getTopEvents,
	getAllGoals,
	createEventGoal,
	deleteGoal,
	archiveGoal,
	EventLibrary,
	getAllEventDefinitions,
	trackEvent,
	downloadEventsCSV,
	type CustomEvent,
	type EventGoal,
	type CustomEventDefinition,
} from '@/lib/analytics/custom-events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import {
	Activity,
	Target,
	Download,
	Plus,
	Trash2,
	Archive,
	TrendingUp,
	BarChart3,
	FileText,
	PlayCircle,
	CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomEventsDashboardProps {
	groupId?: string;
	showBackendEvents?: boolean;
}

export function CustomEventsDashboard({
	groupId,
	showBackendEvents = false,
}: CustomEventsDashboardProps) {
	const [selectedDateRange, setSelectedDateRange] = useState<'7days' | '30days' | 'all'>('30days');
	const [localEvents, setLocalEvents] = useState<CustomEvent[]>([]);
	const [goals, setGoals] = useState<EventGoal[]>([]);
	const [createGoalOpen, setCreateGoalOpen] = useState(false);
	const [newGoalEvent, setNewGoalEvent] = useState('');
	const [newGoalTarget, setNewGoalTarget] = useState('100');
	const [newGoalPeriod, setNewGoalPeriod] = useState<'day' | 'week' | 'month' | 'all-time'>(
		'all-time'
	);

	// Fetch backend events from Convex (optional)
	const backendEvents = useQuery(
		showBackendEvents && groupId
			? api.queries.events.recent
			: undefined,
		showBackendEvents && groupId ? { limit: 1000 } : 'skip'
	);

	// Load local events and goals on mount
	useEffect(() => {
		setLocalEvents(getAllEvents());
		setGoals(getAllGoals());

		// Refresh every 5 seconds
		const interval = setInterval(() => {
			setLocalEvents(getAllEvents());
			setGoals(getAllGoals());
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	// Filter events by date range
	const filteredEvents = useMemo(() => {
		const now = Date.now();
		let cutoff = 0;

		if (selectedDateRange === '7days') {
			cutoff = now - 7 * 24 * 60 * 60 * 1000;
		} else if (selectedDateRange === '30days') {
			cutoff = now - 30 * 24 * 60 * 60 * 1000;
		}

		return cutoff > 0 ? localEvents.filter((e) => e.timestamp >= cutoff) : localEvents;
	}, [localEvents, selectedDateRange]);

	// Convert custom events to ontology Event format for EventList
	const eventsForList = useMemo<Event[]>(() => {
		return filteredEvents.map((event) => ({
			_id: `${event.timestamp}_${event.name}` as Id<'events'>,
			type: event.name,
			actorId: event.userId ? (event.userId as Id<'things'>) : ('' as Id<'things'>),
			targetId: '' as Id<'things'>,
			timestamp: event.timestamp,
			metadata: event.properties,
			_creationTime: event.timestamp,
		}));
	}, [filteredEvents]);

	// Get event counts
	const eventCounts = useMemo(() => getEventCounts(), [filteredEvents]);
	const topEvents = useMemo(() => getTopEvents(10), [filteredEvents]);

	// Chart data - events over time (daily)
	const eventsOverTimeData = useMemo(() => {
		const days: Record<string, number> = {};

		filteredEvents.forEach((event) => {
			const date = new Date(event.timestamp);
			const dateKey = date.toISOString().split('T')[0];
			days[dateKey] = (days[dateKey] || 0) + 1;
		});

		return Object.entries(days)
			.map(([date, count]) => ({ date, count }))
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [filteredEvents]);

	// Chart data - top events
	const topEventsChartData = useMemo(() => {
		return topEvents.map((event) => ({
			name: event.name.replace(/_/g, ' '),
			count: event.count,
		}));
	}, [topEvents]);

	// Chart data - events by category
	const eventsByCategoryData = useMemo(() => {
		const categories: Record<string, number> = {};
		const definitions = getAllEventDefinitions();

		filteredEvents.forEach((event) => {
			const definition = definitions.find((d) => d.name === event.name);
			const category = definition?.category || 'custom';
			categories[category] = (categories[category] || 0) + 1;
		});

		const colors: Record<string, string> = {
			engagement: 'hsl(var(--primary))',
			conversion: 'hsl(142, 71%, 45%)',
			content: 'hsl(217, 91%, 60%)',
			navigation: 'hsl(262, 83%, 58%)',
			error: 'hsl(0, 84%, 60%)',
			custom: 'hsl(var(--muted-foreground))',
		};

		return Object.entries(categories).map(([category, count]) => ({
			category: category.charAt(0).toUpperCase() + category.slice(1),
			count,
			color: colors[category] || colors.custom,
		}));
	}, [filteredEvents]);

	// Handle create goal
	const handleCreateGoal = () => {
		if (!newGoalEvent || !newGoalTarget) {
			toast.error('Please fill in all fields');
			return;
		}

		const target = parseInt(newGoalTarget, 10);
		if (isNaN(target) || target <= 0) {
			toast.error('Target must be a positive number');
			return;
		}

		const goal = createEventGoal(newGoalEvent, target, newGoalPeriod);
		setGoals([...goals, goal]);
		setCreateGoalOpen(false);
		setNewGoalEvent('');
		setNewGoalTarget('100');
		setNewGoalPeriod('all-time');

		toast.success('Event goal created!');
	};

	// Handle delete goal
	const handleDeleteGoal = (goalId: string) => {
		deleteGoal(goalId);
		setGoals(goals.filter((g) => g.id !== goalId));
		toast.success('Goal deleted');
	};

	// Handle archive goal
	const handleArchiveGoal = (goalId: string) => {
		archiveGoal(goalId);
		setGoals(goals.map((g) => (g.id === goalId ? { ...g, status: 'archived' as const } : g)));
		toast.success('Goal archived');
	};

	// Handle export CSV
	const handleExportCSV = () => {
		try {
			downloadEventsCSV();
			toast.success('Events exported to CSV');
		} catch (error) {
			toast.error('Failed to export events');
			console.error(error);
		}
	};

	// Active goals
	const activeGoals = goals.filter((g) => g.status === 'active');

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">Custom Event Tracking</h2>
					<p className="text-sm text-muted-foreground">
						Track and analyze custom business events across your application
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select value={selectedDateRange} onValueChange={(v: any) => setSelectedDateRange(v)}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7days">Last 7 Days</SelectItem>
							<SelectItem value="30days">Last 30 Days</SelectItem>
							<SelectItem value="all">All Time</SelectItem>
						</SelectContent>
					</Select>

					<Button variant="outline" size="sm" onClick={handleExportCSV}>
						<Download className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Events</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{filteredEvents.length.toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{selectedDateRange === '7days'
								? 'Last 7 days'
								: selectedDateRange === '30days'
								? 'Last 30 days'
								: 'All time'}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Event Types</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{Object.keys(eventCounts).length}</div>
						<p className="text-xs text-muted-foreground mt-1">Unique event types tracked</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Goals</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeGoals.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{goals.filter((g) => g.status === 'completed').length} completed
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Top Event</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-lg font-bold truncate">
							{topEvents[0]?.name.replace(/_/g, ' ') || 'N/A'}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{topEvents[0]?.count.toLocaleString() || 0} occurrences
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="events" className="w-full">
				<TabsList>
					<TabsTrigger value="events">Event Feed</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="goals">Goals</TabsTrigger>
					<TabsTrigger value="library">Event Library</TabsTrigger>
				</TabsList>

				{/* Event Feed Tab */}
				<TabsContent value="events" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Event Feed</CardTitle>
							<CardDescription>All tracked custom events with search and filtering</CardDescription>
						</CardHeader>
						<CardContent>
							{eventsForList.length === 0 ? (
								<div className="text-center py-12">
									<Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-lg text-muted-foreground">No events tracked yet</p>
									<p className="text-sm text-muted-foreground mt-2">
										Events will appear here as they are tracked
									</p>
								</div>
							) : (
								<EventList
									events={eventsForList}
									searchable
									filterable
									sortable
									paginated
									pageSize={12}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Analytics Tab */}
				<TabsContent value="analytics" className="space-y-4">
					{/* Events Over Time */}
					<Card>
						<CardHeader>
							<CardTitle>Events Over Time</CardTitle>
							<CardDescription>Daily event occurrences</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[300px]">
								{eventsOverTimeData.length === 0 ? (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										No data available
									</div>
								) : (
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={eventsOverTimeData}>
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
											<Tooltip
												contentStyle={{
													backgroundColor: 'hsl(var(--card))',
													border: '1px solid hsl(var(--border))',
													borderRadius: '8px',
												}}
											/>
											<Line
												type="monotone"
												dataKey="count"
												stroke="hsl(var(--primary))"
												strokeWidth={2}
												dot={{ fill: 'hsl(var(--primary))' }}
											/>
										</LineChart>
									</ResponsiveContainer>
								)}
							</div>
						</CardContent>
					</Card>

					<div className="grid gap-4 md:grid-cols-2">
						{/* Top Events */}
						<Card>
							<CardHeader>
								<CardTitle>Top Events</CardTitle>
								<CardDescription>Most frequently tracked events</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									{topEventsChartData.length === 0 ? (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											No data available
										</div>
									) : (
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={topEventsChartData}>
												<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
												<XAxis
													dataKey="name"
													stroke="hsl(var(--muted-foreground))"
													fontSize={12}
													tickLine={false}
													axisLine={false}
													angle={-45}
													textAnchor="end"
													height={80}
												/>
												<YAxis
													stroke="hsl(var(--muted-foreground))"
													fontSize={12}
													tickLine={false}
													axisLine={false}
												/>
												<Tooltip
													contentStyle={{
														backgroundColor: 'hsl(var(--card))',
														border: '1px solid hsl(var(--border))',
														borderRadius: '8px',
													}}
												/>
												<Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
											</BarChart>
										</ResponsiveContainer>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Events by Category */}
						<Card>
							<CardHeader>
								<CardTitle>Events by Category</CardTitle>
								<CardDescription>Event distribution across categories</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									{eventsByCategoryData.length === 0 ? (
										<div className="flex items-center justify-center h-full text-muted-foreground">
											No data available
										</div>
									) : (
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={eventsByCategoryData}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={(entry) => `${entry.category}: ${entry.count}`}
													outerRadius={80}
													fill="hsl(var(--primary))"
													dataKey="count"
												>
													{eventsByCategoryData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Goals Tab */}
				<TabsContent value="goals" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Event Goals</CardTitle>
									<CardDescription>Set and track event targets</CardDescription>
								</div>
								<Dialog open={createGoalOpen} onOpenChange={setCreateGoalOpen}>
									<DialogTrigger asChild>
										<Button size="sm">
											<Plus className="mr-2 h-4 w-4" />
											New Goal
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create Event Goal</DialogTitle>
											<DialogDescription>
												Set a target for a specific event to track progress
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="event-name">Event Name</Label>
												<Select value={newGoalEvent} onValueChange={setNewGoalEvent}>
													<SelectTrigger id="event-name">
														<SelectValue placeholder="Select event..." />
													</SelectTrigger>
													<SelectContent>
														{Object.keys(eventCounts).map((name) => (
															<SelectItem key={name} value={name}>
																{name.replace(/_/g, ' ')}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<Label htmlFor="target">Target</Label>
												<Input
													id="target"
													type="number"
													placeholder="100"
													value={newGoalTarget}
													onChange={(e) => setNewGoalTarget(e.target.value)}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="period">Period</Label>
												<Select value={newGoalPeriod} onValueChange={(v: any) => setNewGoalPeriod(v)}>
													<SelectTrigger id="period">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="day">Day</SelectItem>
														<SelectItem value="week">Week</SelectItem>
														<SelectItem value="month">Month</SelectItem>
														<SelectItem value="all-time">All Time</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<DialogFooter>
											<Button variant="outline" onClick={() => setCreateGoalOpen(false)}>
												Cancel
											</Button>
											<Button onClick={handleCreateGoal}>Create Goal</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent>
							{goals.length === 0 ? (
								<div className="text-center py-12">
									<Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
									<p className="text-lg text-muted-foreground">No goals set yet</p>
									<p className="text-sm text-muted-foreground mt-2">
										Create event goals to track progress towards targets
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{goals.map((goal) => {
										const progress = Math.min((goal.current / goal.target) * 100, 100);
										const statusColors = {
											active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
											completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
											failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
											archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
										};

										return (
											<div
												key={goal.id}
												className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
											>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<h4 className="font-medium">{goal.eventName.replace(/_/g, ' ')}</h4>
															<Badge className={statusColors[goal.status]}>{goal.status}</Badge>
														</div>
														<p className="text-sm text-muted-foreground mt-1">
															{goal.current.toLocaleString()} / {goal.target.toLocaleString()} events
															{' · '}
															{goal.period.replace('-', ' ')}
														</p>
													</div>
													<div className="flex gap-1">
														{goal.status === 'active' && (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleArchiveGoal(goal.id)}
															>
																<Archive className="h-4 w-4" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDeleteGoal(goal.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
												<div className="space-y-1">
													<Progress value={progress} className="h-2" />
													<p className="text-xs text-muted-foreground text-right">
														{progress.toFixed(1)}% complete
													</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Event Library Tab */}
				<TabsContent value="library" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Event Library</CardTitle>
							<CardDescription>
								Pre-built events you can use in your application
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{getAllEventDefinitions().map((event) => (
									<div
										key={event.name}
										className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
									>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<span className="text-2xl">{event.icon || '📊'}</span>
												<div>
													<h4 className="font-medium">{event.displayName}</h4>
													<Badge variant="outline" className="mt-1">
														{event.category}
													</Badge>
												</div>
											</div>
										</div>
										<p className="text-sm text-muted-foreground">{event.description}</p>
										<div className="pt-2">
											<p className="text-xs font-medium text-muted-foreground">Code:</p>
											<code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">
												trackEvent('{event.name}', &#123;...&#125;)
											</code>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
