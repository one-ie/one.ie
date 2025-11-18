import {
	Activity,
	Clock,
	Globe,
	Hammer,
	Rocket,
	TrendingUp,
	Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Deployment timeline data - matching actual build stages
const deploymentTimelineData = [
	{
		phase: "Clone",
		time: 2.1,
		cumulative: 2.1,
		percentage: 10.0,
		status: "complete",
		color: "#8b5cf6",
	},
	{
		phase: "Install",
		time: 3.8,
		cumulative: 5.9,
		percentage: 18.2,
		status: "complete",
		color: "#3b82f6",
	},
	{
		phase: "Type Check",
		time: 2.6,
		cumulative: 8.5,
		percentage: 12.4,
		status: "complete",
		color: "#06b6d4",
	},
	{
		phase: "Build",
		time: 6.0,
		cumulative: 14.5,
		percentage: 28.7,
		status: "complete",
		color: "#10b981",
	},
	{
		phase: "Optimize",
		time: 3.2,
		cumulative: 17.7,
		percentage: 15.3,
		status: "complete",
		color: "#f59e0b",
	},
	{
		phase: "Push Edge",
		time: 3.2,
		cumulative: 20.9,
		percentage: 15.3,
		status: "complete",
		color: "#ef4444",
	},
];

// Build optimization metrics
const optimizationMetrics = [
	{
		metric: "Speed",
		improvement: "3.2x",
		baseline: 100,
		optimized: 320,
		unit: "faster",
	},
	{
		metric: "Bundle Size",
		improvement: "-67%",
		baseline: 100,
		optimized: 33,
		unit: "smaller",
	},
	{
		metric: "First Paint",
		improvement: "0.8s",
		baseline: 2.5,
		optimized: 0.8,
		unit: "seconds",
	},
	{
		metric: "Lighthouse",
		improvement: "100",
		baseline: 75,
		optimized: 100,
		unit: "score",
	},
];

const buildSteps = [
	{
		icon: Hammer,
		title: "Build",
		time: "14s",
		description: "600+ files",
		color: "blue",
		details: "10,104 modules",
	},
	{
		icon: Upload,
		title: "Upload",
		time: "4.5s",
		description: "665 assets",
		color: "purple",
		details: "23.4 MB total",
	},
	{
		icon: Rocket,
		title: "Deploy",
		time: "0.5s",
		description: "Edge functions",
		color: "green",
		details: "Worker compiled",
	},
	{
		icon: Globe,
		title: "Replicate",
		time: "<1s",
		description: "330+ edges",
		color: "orange",
		details: "Global CDN",
	},
];

// Build timeline stages with exact timings
const buildTimelineStages = [
	{
		id: "clone",
		name: "Clone",
		description: "Clone Repository",
		details: "Fetching latest code from GitHub",
		startTime: 0,
		duration: 2.1,
		stats: ["main branch", "142 commits", "23.4 MB"],
		color: "purple",
	},
	{
		id: "install",
		name: "Install Dependencies",
		description: "Installing node_modules with Bun",
		details: "",
		startTime: 2.1,
		duration: 3.8,
		stats: ["1,247 packages", "Bun v1.0.14", "Cached: 89%"],
		color: "blue",
	},
	{
		id: "typecheck",
		name: "Type Checking",
		description: "Running TypeScript compiler",
		details: "",
		startTime: 5.9,
		duration: 2.6,
		stats: ["665 files checked", "0 errors", "0 warnings"],
		color: "cyan",
	},
	{
		id: "build",
		name: "Build Production",
		description: "Compiling and optimizing assets",
		details: "",
		startTime: 8.5,
		duration: 6.0,
		stats: ["10,104 modules", "Tree shaking", "Code splitting"],
		color: "green",
	},
	{
		id: "optimize",
		name: "Optimize Assets",
		description: "Minifying and compressing files",
		details: "",
		startTime: 14.5,
		duration: 3.2,
		stats: ["JS: 234 KB", "CSS: 42 KB", "Images: 1.2 MB"],
		color: "yellow",
	},
	{
		id: "push",
		name: "Push to Edge",
		description: "Deploying to 330+ edge locations",
		details: "",
		startTime: 17.7,
		duration: 3.2,
		stats: ["330+ locations", "Global CDN", "Instant propagation"],
		color: "orange",
	},
];

const totalBuildTime = 20.9;

export default function DeployBuildTimeline() {
	const [activeStep, setActiveStep] = useState(0);
	const [animationProgress, setAnimationProgress] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [activeTimelineStage, setActiveTimelineStage] = useState(0);

	// Cycle through steps every 2.5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveStep((prev) => (prev + 1) % buildSteps.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	// Animate progress
	useEffect(() => {
		const timer = setInterval(() => {
			setAnimationProgress((prev) => {
				if (prev >= 100) return 0;
				return prev + 2;
			});
		}, 50);
		return () => clearInterval(timer);
	}, []);

	// Animate build timeline based on actual timing
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime((prev) => {
				const newTime = prev + 0.1;
				if (newTime >= totalBuildTime) {
					return 0; // Reset animation
				}

				// Find active stage based on current time
				const activeIndex = buildTimelineStages.findIndex(
					(stage) =>
						newTime >= stage.startTime &&
						newTime < stage.startTime + stage.duration,
				);
				if (activeIndex !== -1) {
					setActiveTimelineStage(activeIndex);
				}

				return newTime;
			});
		}, 100); // Update every 100ms for smooth animation

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-background p-8 md:p-12 space-y-8">
			{/* Enhanced Graph Section at the Top */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-2xl font-bold flex items-center gap-2">
						<Activity className="h-6 w-6 text-primary" />
						Track Every Step from Code to Production
					</h3>
					<Badge variant="secondary" className="text-sm">
						<TrendingUp className="h-3 w-3 mr-1" />
						20.9s total
					</Badge>
				</div>

				{/* Main Timeline Graph - Animated */}
				<div className="rounded-xl border border-primary/20 bg-card/50 backdrop-blur p-6">
					<ResponsiveContainer width="100%" height={200}>
						<AreaChart
							data={deploymentTimelineData.map((item) => ({
								...item,
								// Only show cumulative value if currentTime has reached this point
								cumulative:
									currentTime >= item.cumulative
										? item.cumulative
										: currentTime >=
												(deploymentTimelineData[
													deploymentTimelineData.indexOf(item) - 1
												]?.cumulative || 0)
											? currentTime
											: null,
							}))}
						>
							<defs>
								<linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
							<XAxis dataKey="phase" tick={{ fontSize: 12 }} tickLine={false} />
							<YAxis
								label={{
									value: "Time (s)",
									angle: -90,
									position: "insideLeft",
									style: { fontSize: 12 },
								}}
								tick={{ fontSize: 12 }}
								tickLine={false}
								domain={[0, 21]}
							/>
							<Tooltip
								content={({ active, payload }) => {
									if (active && payload && payload[0]) {
										const data = payload[0].payload;
										return (
											<div className="rounded-lg border bg-background p-3 shadow-lg">
												<p className="font-semibold text-sm">{data.phase}</p>
												<p className="text-xs text-muted-foreground">
													Duration: {data.time}s
												</p>
												<p className="text-xs text-muted-foreground">
													Cumulative: {data.cumulative}s
												</p>
												<p className="text-xs text-muted-foreground">
													Progress: {data.percentage.toFixed(1)}%
												</p>
											</div>
										);
									}
									return null;
								}}
							/>
							<Area
								type="monotone"
								dataKey="cumulative"
								stroke="#3b82f6"
								strokeWidth={3}
								fill="url(#deployGradient)"
								animationDuration={100}
							/>
						</AreaChart>
					</ResponsiveContainer>

					{/* Real-time Progress Indicator */}
					<div className="mt-4 space-y-2">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Progress</span>
							<span className="font-medium">{animationProgress}%</span>
						</div>
						<div className="h-2 rounded-full bg-muted overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-300"
								style={{ width: `${animationProgress}%` }}
							/>
						</div>
					</div>

					{/* Real Numbers Timeline */}
					<div className="mt-6 pt-4 border-t border-border/50">
						<div className="grid grid-cols-6 gap-2 text-center">
							{deploymentTimelineData.map((stage, index) => {
								const isComplete = currentTime >= stage.cumulative;
								const isActive =
									currentTime >=
										(deploymentTimelineData[index - 1]?.cumulative || 0) &&
									!isComplete;
								const isPending = !isComplete && !isActive;

								return (
									<div
										key={stage.phase}
										className="transition-all duration-300"
										style={{ opacity: isComplete ? 1 : isActive ? 0.7 : 0.3 }}
									>
										<div className="text-xs font-medium text-foreground">
											{stage.phase}
										</div>
										<div
											className="text-lg font-bold"
											style={{
												color: isComplete
													? "#16a34a"
													: isActive
														? "#3b82f6"
														: "hsl(var(--color-muted-foreground))",
											}}
										>
											{stage.time}s
										</div>
										<div className="text-xs text-muted-foreground">
											@{stage.cumulative}s
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Build Timeline Details */}
				<div className="mt-6 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-lg font-semibold">Build Timeline</h4>
							<p className="text-sm text-muted-foreground">
								Track every step from code to production
							</p>
						</div>
						<Badge variant="outline" className="text-sm">
							<Clock className="h-3 w-3 mr-1" />
							{currentTime.toFixed(1)}s / {totalBuildTime}s
						</Badge>
					</div>

					{/* Master Progress Bar */}
					<div className="space-y-2">
						<div className="flex h-4 overflow-hidden rounded-full bg-muted">
							<div
								className="bg-gradient-to-r from-blue-500 to-primary transition-all duration-100"
								style={{ width: `${(currentTime / totalBuildTime) * 100}%` }}
							/>
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0s</span>
							{buildTimelineStages.map((stage) => (
								<span
									key={stage.id}
									className={
										currentTime >= stage.startTime ? "text-foreground" : ""
									}
								>
									{stage.startTime}s
								</span>
							))}
							<span className="font-medium text-foreground">
								{totalBuildTime}s
							</span>
						</div>
					</div>

					{/* Animated Timeline Steps */}
					<div className="space-y-3">
						{buildTimelineStages.map((stage, index) => {
							const isActive =
								index === activeTimelineStage &&
								currentTime >= stage.startTime &&
								currentTime < stage.startTime + stage.duration;
							const isComplete =
								currentTime >= stage.startTime + stage.duration;
							const isPending = currentTime < stage.startTime;
							const progress = isActive
								? ((currentTime - stage.startTime) / stage.duration) * 100
								: isComplete
									? 100
									: 0;

							return (
								<div
									key={stage.id}
									className={`rounded-lg border transition-all duration-500 transform p-4 ${
										isActive
											? "bg-[hsl(216_55%_25%)] border-[hsl(216_55%_25%)] shadow-2xl shadow-blue-500/50 scale-[1.02]"
											: isComplete
												? "border-green-500/30 bg-green-500/5"
												: "border-border/50 bg-background/50 opacity-60"
									}`}
								>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1">
											<div className="flex items-center gap-2">
												<h5
													className={`font-medium ${isActive ? "text-white" : ""}`}
												>
													{stage.name}
												</h5>
												{isActive && (
													<Badge
														variant="default"
														className="text-xs bg-white/20 text-white"
													>
														Running
													</Badge>
												)}
												{isComplete && (
													<Badge
														variant="secondary"
														className="text-xs bg-green-500/20 text-green-600"
													>
														Complete
													</Badge>
												)}
												{isPending && (
													<Badge variant="outline" className="text-xs">
														Pending
													</Badge>
												)}
											</div>
											<p
												className={`text-sm ${isActive ? "text-white/90" : "text-muted-foreground"}`}
											>
												{stage.description}
											</p>
											{stage.details && (
												<p
													className={`text-xs ${isActive ? "text-white/70" : "text-muted-foreground"}`}
												>
													{stage.details}
												</p>
											)}
										</div>
										<div className="text-right space-y-1">
											<p
												className={`text-sm font-bold ${
													isActive
														? "text-white"
														: isComplete
															? "text-green-600"
															: "text-muted-foreground"
												}`}
											>
												{isActive
													? `${(currentTime - stage.startTime).toFixed(1)}s`
													: isComplete
														? `${stage.duration}s`
														: "0s"}
											</p>
											<p
												className={`text-xs ${
													isActive
														? "text-white/90"
														: isComplete
															? "text-green-600"
															: "text-muted-foreground"
												}`}
											>
												{progress.toFixed(0)}%
											</p>
										</div>
									</div>
									<div
										className={`mt-3 grid grid-cols-3 gap-4 text-xs ${
											isActive ? "text-white/80" : "text-muted-foreground"
										}`}
									>
										{stage.stats.map((stat, i) => (
											<span
												key={i}
												className={
													stat.includes("0 errors") ||
													stat.includes("0 warnings")
														? isActive
															? "text-green-300"
															: "text-green-600"
														: ""
												}
											>
												{stat}
											</span>
										))}
									</div>
									<div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
										<div
											className={`h-full transition-all duration-100 ${
												isActive
													? "bg-white/50 shadow-lg"
													: isComplete
														? "bg-green-500"
														: "bg-gray-300"
											}`}
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>

					{/* Console Output */}
					<div className="rounded-lg border border-border/50 bg-black/90 p-4 font-mono text-xs">
						<div className="text-green-400">$ bunx astro build</div>
						<div className="text-gray-400 mt-1">
							[2025-11-06T04:22:57.098Z] Starting build process...
						</div>

						{buildTimelineStages.map((stage, index) => {
							const isActive =
								index === activeTimelineStage &&
								currentTime >= stage.startTime &&
								currentTime < stage.startTime + stage.duration;
							const isComplete =
								currentTime >= stage.startTime + stage.duration;
							const isPending = currentTime < stage.startTime;

							if (isPending) return null;

							return (
								<div key={stage.id} className="mt-1">
									<div
										className={isActive ? "text-blue-400" : "text-green-400"}
									>
										{isActive ? "▶" : "✓"} {stage.name}...
									</div>
									{(isActive || isComplete) &&
										stage.stats.map((stat, i) => (
											<div
												key={i}
												className={`ml-2 ${
													stat.includes("0 errors") ||
													stat.includes("0 warnings")
														? "text-green-400"
														: "text-gray-300"
												}`}
											>
												• {stat}
											</div>
										))}
									{isActive && (
										<div className="ml-2 text-yellow-400">
											⚡ Processing...{" "}
											{(
												((currentTime - stage.startTime) / stage.duration) *
												100
											).toFixed(0)}
											%
										</div>
									)}
								</div>
							);
						})}

						{currentTime >= totalBuildTime && (
							<div className="mt-2 text-green-400 font-bold">
								✨ Build complete! Deploy successful to 330+ edge locations.
							</div>
						)}

						<div className="text-gray-400 mt-1 animate-pulse">_</div>
					</div>
				</div>
			</div>

			<h3 className="text-xl font-bold text-center">
				19-Second Deployment Pipeline
			</h3>

			{/* Enhanced Pipeline Steps with Primary Blue Active State */}
			<div className="grid grid-cols-4 gap-4">
				{buildSteps.map((step, index) => {
					const Icon = step.icon;
					const isActive = activeStep === index;

					return (
						<Card
							key={index}
							className={`text-center transition-all duration-700 transform ${
								isActive
									? "scale-110 shadow-2xl border-2"
									: "bg-card/50 backdrop-blur hover:scale-105 hover:shadow-lg"
							}`}
							style={
								isActive
									? {
											backgroundColor: "#16a34a",
											borderColor: "#16a34a",
											boxShadow: "0 25px 50px -12px rgba(22, 163, 74, 0.5)",
											color: "white",
										}
									: {}
							}
						>
							<CardHeader className="pb-3">
								<div
									className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-700 ${
										isActive
											? "bg-white/20 shadow-xl ring-4 ring-white/20"
											: "bg-primary/10"
									}`}
								>
									<Icon
										className={`h-8 w-8 transition-all duration-700 ${
											isActive ? "text-white scale-125" : "text-primary"
										}`}
									/>
								</div>
								<div
									className={`text-2xl font-bold transition-colors duration-700 ${
										isActive ? "text-white" : "text-primary"
									}`}
								>
									{step.time}
								</div>
							</CardHeader>
							<CardContent className="space-y-2 pb-4">
								<p
									className={`text-sm font-semibold transition-colors duration-700 ${
										isActive ? "text-white" : "text-foreground"
									}`}
								>
									{step.title}
								</p>
								<p
									className={`text-xs transition-all duration-700 ${
										isActive
											? "text-white/90 font-medium"
											: "text-muted-foreground"
									}`}
								>
									{step.description}
								</p>
								{isActive && (
									<p className="text-xs text-white/70 animate-fade-in">
										{step.details}
									</p>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Enhanced Progress Bar with Colors */}
			<div className="space-y-2">
				<div className="flex h-3 overflow-hidden rounded-full bg-muted">
					<div
						className="bg-blue-500 transition-all duration-700"
						style={{ width: activeStep >= 0 ? "37%" : "0%" }}
					/>
					<div
						className="bg-purple-500 transition-all duration-700"
						style={{ width: activeStep >= 1 ? "24%" : "0%" }}
					/>
					<div
						className="bg-green-500 transition-all duration-700"
						style={{ width: activeStep >= 2 ? "3%" : "0%" }}
					/>
					<div
						className="bg-orange-500 transition-all duration-700"
						style={{ width: activeStep >= 3 ? "36%" : "0%" }}
					/>
				</div>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>0s</span>
					<span>Build 14s</span>
					<span>Upload 18.5s</span>
					<span>Deploy 19s</span>
					<span className="font-medium text-foreground">19s total</span>
				</div>
			</div>

			{/* Live Status with Enhanced Animation */}
			<div className="rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/5 to-green-500/10 p-4">
				<div className="flex items-center gap-3 justify-center">
					<div className="relative">
						<div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
						<div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping" />
					</div>
					<p className="text-sm font-medium">Live at oneie.pages.dev</p>
					<Badge
						variant="outline"
						className="ml-2 text-xs border-green-500/30 text-green-700 dark:text-green-400"
					>
						Nov 6, 2025
					</Badge>
				</div>
			</div>
		</div>
	);
}
