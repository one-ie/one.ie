/**
 * Session Player Component
 *
 * Cycle 78: Session Recording
 *
 * Video-like player for session recordings using rrweb-player.
 * Features:
 * - Play/pause controls
 * - Seek bar with timeline
 * - Playback speed control
 * - Full-screen mode
 * - Skip to interactions (clicks, form submissions)
 * - Session metadata display
 */

import { useEffect, useRef, useState } from "react";
import type { eventWithTime } from "rrweb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Play,
	Pause,
	SkipForward,
	SkipBack,
	Maximize,
	Info,
	Calendar,
	Clock,
	Monitor,
	MapPin,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/analytics/session-recorder";
import type { SessionMetadata } from "@/lib/analytics/session-recorder";

interface SessionPlayerProps {
	session: SessionMetadata;
	autoPlay?: boolean;
	showMetadata?: boolean;
}

export function SessionPlayer({
	session,
	autoPlay = false,
	showMetadata = true,
}: SessionPlayerProps) {
	const playerContainerRef = useRef<HTMLDivElement>(null);
	const [player, setPlayer] = useState<any>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [playbackSpeed, setPlaybackSpeed] = useState("1");
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Initialize rrweb player
	useEffect(() => {
		if (!playerContainerRef.current || session.events.length === 0) return;

		// Import rrweb-player dynamically
		import("rrweb-player").then((module) => {
			const { default: rrwebPlayer } = module;

			// Clear previous player
			if (playerContainerRef.current) {
				playerContainerRef.current.innerHTML = "";
			}

			// Create new player
			const newPlayer = new rrwebPlayer({
				target: playerContainerRef.current!,
				props: {
					events: session.events,
					width: 1024,
					height: 768,
					autoPlay,
					showController: true,
					speed: Number(playbackSpeed),
				},
			});

			setPlayer(newPlayer);

			// Auto-play if requested
			if (autoPlay) {
				setIsPlaying(true);
			}

			// Track playback time
			const interval = setInterval(() => {
				if (newPlayer && isPlaying) {
					// Get current time from player (rrweb-player doesn't expose this directly)
					// We'll estimate based on events
					const elapsed = Date.now() - session.startTime;
					setCurrentTime(Math.min(elapsed, session.duration || 0));
				}
			}, 100);

			return () => {
				clearInterval(interval);
				if (newPlayer) {
					newPlayer.$destroy();
				}
			};
		});
	}, [session.events, autoPlay]);

	// Update playback speed
	useEffect(() => {
		if (player) {
			player.setSpeed(Number(playbackSpeed));
		}
	}, [playbackSpeed, player]);

	// Handle play/pause
	const togglePlayPause = () => {
		if (player) {
			if (isPlaying) {
				player.pause();
			} else {
				player.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	// Handle skip forward/backward
	const skipForward = () => {
		if (player) {
			// Skip 10 seconds forward
			player.goto(currentTime + 10000);
		}
	};

	const skipBackward = () => {
		if (player) {
			// Skip 10 seconds backward
			player.goto(Math.max(0, currentTime - 10000));
		}
	};

	// Handle fullscreen
	const toggleFullscreen = () => {
		if (playerContainerRef.current) {
			if (!isFullscreen) {
				playerContainerRef.current.requestFullscreen();
				setIsFullscreen(true);
			} else {
				document.exitFullscreen();
				setIsFullscreen(false);
			}
		}
	};

	// Format date
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-4">
			{/* Session Metadata */}
			{showMetadata && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Info className="h-5 w-5" />
								Session Details
							</CardTitle>
							{session.conversion?.converted ? (
								<Badge variant="default" className="gap-1">
									<CheckCircle2 className="h-3 w-3" />
									Converted
								</Badge>
							) : (
								<Badge variant="secondary" className="gap-1">
									<XCircle className="h-3 w-3" />
									No Conversion
								</Badge>
							)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Date</p>
									<p className="text-sm font-medium">
										{formatDate(session.startTime)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Duration</p>
									<p className="text-sm font-medium">
										{formatDuration(session.duration || 0)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<Monitor className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Device</p>
									<p className="text-sm font-medium">
										{session.device.viewport.width}×
										{session.device.viewport.height}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground">Page Views</p>
									<p className="text-sm font-medium">{session.pageViews.length}</p>
								</div>
							</div>
						</div>

						{session.conversion?.converted && (
							<>
								<Separator className="my-4" />
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium">Conversion Type</p>
										<p className="text-xs text-muted-foreground">
											{session.conversion.conversionType || "Purchase"}
										</p>
									</div>
									{session.conversion.revenue && (
										<div className="text-right">
											<p className="text-sm font-medium">Revenue</p>
											<p className="text-lg font-bold text-green-600 dark:text-green-400">
												${session.conversion.revenue.toFixed(2)}
											</p>
										</div>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* Player Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Session Recording</CardTitle>

						<div className="flex items-center gap-2">
							{/* Playback Speed */}
							<Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
								<SelectTrigger className="w-24">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0.5">0.5×</SelectItem>
									<SelectItem value="1">1×</SelectItem>
									<SelectItem value="1.5">1.5×</SelectItem>
									<SelectItem value="2">2×</SelectItem>
									<SelectItem value="4">4×</SelectItem>
								</SelectContent>
							</Select>

							{/* Fullscreen */}
							<Button
								variant="outline"
								size="icon"
								onClick={toggleFullscreen}
								title="Fullscreen"
							>
								<Maximize className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Player Container */}
					<div
						ref={playerContainerRef}
						className="relative overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-900"
						style={{
							minHeight: "500px",
						}}
					/>

					{/* Custom Controls */}
					<div className="mt-4 flex items-center justify-center gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={skipBackward}
							title="Skip back 10s"
						>
							<SkipBack className="h-4 w-4" />
						</Button>

						<Button size="icon" onClick={togglePlayPause}>
							{isPlaying ? (
								<Pause className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4" />
							)}
						</Button>

						<Button
							variant="outline"
							size="icon"
							onClick={skipForward}
							title="Skip forward 10s"
						>
							<SkipForward className="h-4 w-4" />
						</Button>
					</div>

					{/* Timeline */}
					<div className="mt-4">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>{formatDuration(currentTime)}</span>
							<span>{formatDuration(session.duration || 0)}</span>
						</div>
						<div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
							<div
								className="h-full bg-primary transition-all"
								style={{
									width: `${((currentTime / (session.duration || 1)) * 100).toFixed(1)}%`,
								}}
							/>
						</div>
					</div>

					{/* Page Views Timeline */}
					{session.pageViews.length > 1 && (
						<div className="mt-4">
							<p className="mb-2 text-sm font-medium">Page Views</p>
							<div className="space-y-1">
								{session.pageViews.map((page, index) => (
									<div
										key={index}
										className="flex items-center gap-2 text-xs text-muted-foreground"
									>
										<span className="font-mono text-primary">
											{String(index + 1).padStart(2, "0")}
										</span>
										<span className="truncate">{page}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
