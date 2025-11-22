/**
 * Session List Component
 *
 * Cycle 78: Session Recording
 *
 * Displays a table of recorded sessions with:
 * - Filtering by conversion status, device, date range
 * - Sorting by date, duration, page views
 * - Link to session player
 * - Export to CSV
 * - Pagination
 */

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Video,
	Search,
	Filter,
	Download,
	Calendar,
	Clock,
	Monitor,
	MapPin,
	CheckCircle2,
	XCircle,
	ChevronDown,
	ChevronUp,
	PlayCircle,
} from "lucide-react";
import {
	formatDuration,
	formatDeviceInfo,
	formatViewport,
	getSessionSummary,
} from "@/lib/analytics/session-recorder";
import type { SessionMetadata } from "@/lib/analytics/session-recorder";

interface SessionListProps {
	funnelId: string;
	groupId: string;
}

type SortField = "startTime" | "duration" | "pageViews" | "converted";
type SortDirection = "asc" | "desc";

export function SessionList({ funnelId, groupId }: SessionListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterConverted, setFilterConverted] = useState<string>("all");
	const [filterDevice, setFilterDevice] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("startTime");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;

	// Fetch session events from Convex
	// Sessions are stored as events with type "session_recorded"
	const sessionEvents = useQuery(api.queries.events.byType, {
		type: "session_recorded",
		// Filter by funnel if needed (stored in metadata)
	});

	// Parse sessions from events
	const sessions = useMemo(() => {
		if (!sessionEvents) return [];

		return sessionEvents
			.filter((event) => {
				// Filter by funnel
				if (event.metadata?.funnelId !== funnelId) return false;
				return true;
			})
			.map((event) => event.metadata as SessionMetadata)
			.filter(Boolean);
	}, [sessionEvents, funnelId]);

	// Filter and sort sessions
	const filteredSessions = useMemo(() => {
		let filtered = [...sessions];

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(session) =>
					session.sessionId.toLowerCase().includes(query) ||
					session.visitorId.toLowerCase().includes(query) ||
					session.pageViews.some((page) => page.toLowerCase().includes(query))
			);
		}

		// Conversion filter
		if (filterConverted !== "all") {
			const isConverted = filterConverted === "converted";
			filtered = filtered.filter(
				(session) => session.conversion?.converted === isConverted
			);
		}

		// Device filter
		if (filterDevice !== "all") {
			filtered = filtered.filter((session) => {
				const device = formatDeviceInfo(session.device);
				return device.toLowerCase().includes(filterDevice.toLowerCase());
			});
		}

		// Sort
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (sortField) {
				case "startTime":
					aValue = a.startTime;
					bValue = b.startTime;
					break;
				case "duration":
					aValue = a.duration || 0;
					bValue = b.duration || 0;
					break;
				case "pageViews":
					aValue = a.pageViews.length;
					bValue = b.pageViews.length;
					break;
				case "converted":
					aValue = a.conversion?.converted ? 1 : 0;
					bValue = b.conversion?.converted ? 1 : 0;
					break;
				default:
					aValue = a.startTime;
					bValue = b.startTime;
			}

			if (sortDirection === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	}, [sessions, searchQuery, filterConverted, filterDevice, sortField, sortDirection]);

	// Pagination
	const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
	const paginatedSessions = filteredSessions.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Handle sort
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Handle export
	const handleExport = () => {
		const csv = [
			// Header
			[
				"Session ID",
				"Visitor ID",
				"Date",
				"Duration",
				"Page Views",
				"Device",
				"Viewport",
				"Converted",
				"Revenue",
			].join(","),
			// Data
			...filteredSessions.map((session) => {
				const summary = getSessionSummary(session);
				return [
					session.sessionId,
					session.visitorId,
					new Date(session.startTime).toISOString(),
					formatDuration(session.duration || 0),
					session.pageViews.length,
					summary.device,
					summary.viewport,
					session.conversion?.converted ? "Yes" : "No",
					session.conversion?.revenue || 0,
				].join(",");
			}),
		].join("\n");

		// Download CSV
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `sessions-${funnelId}-${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// Format date
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Loading state
	if (!sessionEvents) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex items-center justify-center">
						<div className="text-center">
							<Video className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
							<p className="mt-4 text-sm text-muted-foreground">
								Loading session recordings...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Empty state
	if (sessions.length === 0) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="text-center">
						<Video className="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-semibold">No recordings yet</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Session recordings will appear here once visitors interact with your
							funnel.
						</p>
						<p className="mt-4 text-xs text-muted-foreground">
							Sessions are automatically recorded when visitors enter your funnel.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Sessions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{sessions.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Converted
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400">
							{sessions.filter((s) => s.conversion?.converted).length}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Avg Duration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">
							{formatDuration(
								sessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
									sessions.length
							)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Revenue
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400">
							$
							{sessions
								.reduce((sum, s) => sum + (s.conversion?.revenue || 0), 0)
								.toFixed(2)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Filters & Search
						</CardTitle>
						<Button variant="outline" size="sm" onClick={handleExport}>
							<Download className="mr-2 h-4 w-4" />
							Export CSV
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search sessions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Conversion filter */}
						<Select value={filterConverted} onValueChange={setFilterConverted}>
							<SelectTrigger>
								<SelectValue placeholder="Conversion" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sessions</SelectItem>
								<SelectItem value="converted">Converted</SelectItem>
								<SelectItem value="not-converted">Not Converted</SelectItem>
							</SelectContent>
						</Select>

						{/* Device filter */}
						<Select value={filterDevice} onValueChange={setFilterDevice}>
							<SelectTrigger>
								<SelectValue placeholder="Device" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Devices</SelectItem>
								<SelectItem value="mobile">Mobile</SelectItem>
								<SelectItem value="tablet">Tablet</SelectItem>
								<SelectItem value="desktop">Desktop</SelectItem>
							</SelectContent>
						</Select>

						{/* Results count */}
						<div className="flex items-center text-sm text-muted-foreground">
							Showing {paginatedSessions.length} of {filteredSessions.length}{" "}
							sessions
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Sessions Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Video className="h-5 w-5" />
						Session Recordings
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead
										className="cursor-pointer"
										onClick={() => handleSort("startTime")}
									>
										<div className="flex items-center gap-1">
											Date
											{sortField === "startTime" &&
												(sortDirection === "asc" ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												))}
										</div>
									</TableHead>
									<TableHead
										className="cursor-pointer"
										onClick={() => handleSort("duration")}
									>
										<div className="flex items-center gap-1">
											Duration
											{sortField === "duration" &&
												(sortDirection === "asc" ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												))}
										</div>
									</TableHead>
									<TableHead
										className="cursor-pointer"
										onClick={() => handleSort("pageViews")}
									>
										<div className="flex items-center gap-1">
											Page Views
											{sortField === "pageViews" &&
												(sortDirection === "asc" ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												))}
										</div>
									</TableHead>
									<TableHead>Device</TableHead>
									<TableHead
										className="cursor-pointer"
										onClick={() => handleSort("converted")}
									>
										<div className="flex items-center gap-1">
											Conversion
											{sortField === "converted" &&
												(sortDirection === "asc" ? (
													<ChevronUp className="h-4 w-4" />
												) : (
													<ChevronDown className="h-4 w-4" />
												))}
										</div>
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paginatedSessions.map((session) => {
									const summary = getSessionSummary(session);

									return (
										<TableRow key={session.sessionId}>
											<TableCell>
												<div>
													<p className="text-sm font-medium">
														{formatDate(session.startTime)}
													</p>
													<p className="text-xs text-muted-foreground">
														{session.visitorId.substring(0, 12)}...
													</p>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1 text-sm">
													<Clock className="h-3 w-3 text-muted-foreground" />
													{formatDuration(session.duration || 0)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1 text-sm">
													<MapPin className="h-3 w-3 text-muted-foreground" />
													{session.pageViews.length}
												</div>
											</TableCell>
											<TableCell>
												<div>
													<p className="text-sm">{summary.device}</p>
													<p className="text-xs text-muted-foreground">
														{summary.viewport}
													</p>
												</div>
											</TableCell>
											<TableCell>
												{session.conversion?.converted ? (
													<Badge variant="default" className="gap-1">
														<CheckCircle2 className="h-3 w-3" />
														Converted
														{session.conversion.revenue && (
															<span className="ml-1">
																${session.conversion.revenue.toFixed(2)}
															</span>
														)}
													</Badge>
												) : (
													<Badge variant="secondary" className="gap-1">
														<XCircle className="h-3 w-3" />
														No Conversion
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="outline"
													size="sm"
													asChild
												>
													<a
														href={`/funnels/${funnelId}/sessions/${session.sessionId}`}
													>
														<PlayCircle className="mr-2 h-4 w-4" />
														Watch
													</a>
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Page {currentPage} of {totalPages}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onClick={() => setCurrentPage(currentPage - 1)}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === totalPages}
									onClick={() => setCurrentPage(currentPage + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
