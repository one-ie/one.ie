"use client";

import {
	DollarSign,
	Gauge,
	Globe,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface MetricCard {
	icon: React.ReactNode;
	title: string;
	value: string;
	unit: string;
	description: string;
	color: string;
	bgGradient: string;
	iconGradient: string;
	highlight?: string;
	improvement?: string;
}

const metrics: MetricCard[] = [
	{
		icon: <Zap className="h-6 w-6" />,
		title: "Deploy Speed",
		value: "19",
		unit: "seconds",
		description: "Build → Deploy → Live",
		color: "text-blue-600 dark:text-blue-400",
		bgGradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
		iconGradient: "from-blue-600 via-cyan-500 to-blue-500",
		highlight: "37% faster",
		improvement: "↑ 37% faster",
	},
	{
		icon: <Globe className="h-6 w-6" />,
		title: "Global Latency",
		value: "287",
		unit: "ms avg",
		description: "Across 4 continents",
		color: "text-purple-600 dark:text-purple-400",
		bgGradient: "from-purple-500/20 via-pink-500/10 to-transparent",
		iconGradient: "from-purple-600 via-pink-500 to-purple-500",
		highlight: "330+ edges",
		improvement: "↓ 42% faster",
	},
	{
		icon: <Gauge className="h-6 w-6" />,
		title: "Lighthouse Score",
		value: "100",
		unit: "/100",
		description: "Perfect score",
		color: "text-green-600 dark:text-green-400",
		bgGradient: "from-green-500/20 via-emerald-500/10 to-transparent",
		iconGradient: "from-green-600 via-emerald-500 to-green-500",
		highlight: "4/4 Perfect",
		improvement: "🏆 Perfect",
	},
	{
		icon: <DollarSign className="h-6 w-6" />,
		title: "Monthly Cost",
		value: "$0",
		unit: "/month",
		description: "Forever free tier",
		color: "text-emerald-600 dark:text-emerald-400",
		bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
		iconGradient: "from-emerald-600 via-teal-500 to-emerald-500",
		highlight: "100% Free",
		improvement: "💰 Save $273/mo",
	},
];

interface PerformanceMetricsProps {
	/** Grid layout columns */
	columns?: 1 | 2 | 3 | 4;
	/** Show metric descriptions */
	showDescriptions?: boolean;
	/** Enable animations */
	animate?: boolean;
}

function useCountUp(
	end: number,
	duration: number = 2000,
	enabled: boolean = true,
) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!enabled) {
			setCount(end);
			return;
		}

		let startTime: number | null = null;
		let animationFrame: number;

		const animate = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const progress = Math.min((timestamp - startTime) / duration, 1);

			// Easing function for smooth animation
			const easeOutQuart = 1 - (1 - progress) ** 4;
			setCount(Math.floor(easeOutQuart * end));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		};

		animationFrame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrame);
	}, [end, duration, enabled]);

	return count;
}

function MetricCard({
	metric,
	index,
	animate,
	showDescription,
}: {
	metric: MetricCard;
	index: number;
	animate: boolean;
	showDescription: boolean;
}) {
	const numericValue = parseInt(metric.value.replace(/[^0-9]/g, "")) || 0;
	const animatedValue = useCountUp(numericValue, 2000, animate);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Stagger entrance animation
		const timer = setTimeout(() => setIsVisible(true), index * 150);
		return () => clearTimeout(timer);
	}, [index]);

	// Format the display value
	const displayValue = metric.value.startsWith("$")
		? `$${animatedValue}`
		: animatedValue.toString();

	return (
		<Card
			className={`relative overflow-hidden border-2 bg-card/50 backdrop-blur-xl hover:scale-105 transition-all duration-500 ease-out group ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			}`}
			style={{
				borderImage: `linear-gradient(135deg, ${metric.iconGradient.includes("blue") ? "#3b82f6" : metric.iconGradient.includes("purple") ? "#a855f7" : metric.iconGradient.includes("green") ? "#22c55e" : "#10b981"}, transparent) 1`,
			}}
		>
			{/* Animated Gradient Background */}
			<div
				className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
			/>

			{/* Glow Effect on Hover */}
			<div
				className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700 -z-10"
				style={{
					background: `linear-gradient(135deg, ${metric.iconGradient.includes("blue") ? "#3b82f6" : metric.iconGradient.includes("purple") ? "#a855f7" : metric.iconGradient.includes("green") ? "#22c55e" : "#10b981"}, transparent)`,
				}}
			/>

			{/* Sparkle Effect for Perfect Score */}
			{metric.value === "100" && (
				<div className="absolute top-4 right-4 animate-pulse">
					<Sparkles className="h-5 w-5 text-yellow-500" />
				</div>
			)}

			<CardHeader className="relative pb-3">
				<div className="flex items-start justify-between">
					{/* Animated Icon */}
					<div
						className={`p-3 rounded-xl bg-gradient-to-br ${metric.iconGradient} text-white shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}
					>
						<div className="group-hover:rotate-[-12deg] transition-transform duration-500">
							{metric.icon}
						</div>
					</div>

					{/* Highlight Badge */}
					{metric.highlight && (
						<Badge
							variant="secondary"
							className="text-xs font-bold animate-in fade-in slide-in-from-right-2 duration-700"
						>
							{metric.highlight}
						</Badge>
					)}
				</div>

				<CardTitle className="text-sm font-medium text-muted-foreground mt-4">
					{metric.title}
				</CardTitle>
			</CardHeader>

			<CardContent className="relative space-y-4">
				{/* Animated Value Display */}
				<div className="space-y-1">
					<div className="flex items-baseline gap-2">
						<span
							className={`text-6xl font-black ${metric.color} transition-all duration-300 group-hover:scale-110`}
							style={{
								textShadow: "0 0 30px currentColor",
							}}
						>
							{displayValue}
						</span>
						<span className="text-lg text-muted-foreground font-medium">
							{metric.unit}
						</span>
					</div>

					{/* Improvement Indicator */}
					{metric.improvement && (
						<div className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400">
							<TrendingUp className="h-4 w-4" />
							{metric.improvement}
						</div>
					)}
				</div>

				{/* Description */}
				{showDescription && (
					<p className="text-sm text-muted-foreground">{metric.description}</p>
				)}

				{/* Enhanced Mini Visualizations with Animations */}
				<div className="pt-2">
					{index === 0 && <DeploySpeedVisualization />}
					{index === 1 && <LatencyVisualization />}
					{index === 2 && <LighthouseVisualization />}
					{index === 3 && <CostVisualization />}
				</div>
			</CardContent>

			{/* Rainbow Border for Perfect Score */}
			{metric.value === "100" && (
				<div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 blur-sm" />
			)}
		</Card>
	);
}

// Deploy Speed Visualization with Animation
function DeploySpeedVisualization() {
	const [progress, setProgress] = useState([0, 0, 0]);

	useEffect(() => {
		const timers = [
			setTimeout(() => setProgress([100, 0, 0]), 100),
			setTimeout(() => setProgress([100, 100, 0]), 600),
			setTimeout(() => setProgress([100, 100, 100]), 900),
		];
		return () => timers.forEach(clearTimeout);
	}, []);

	return (
		<div className="space-y-2">
			<div className="flex h-2 w-full overflow-hidden rounded-full bg-muted gap-0.5">
				<div
					className="w-3/5 bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-out"
					style={{
						transform: `scaleX(${progress[0] / 100})`,
						transformOrigin: "left",
					}}
				/>
				<div
					className="w-1/4 bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-700 delay-300 ease-out"
					style={{
						transform: `scaleX(${progress[1] / 100})`,
						transformOrigin: "left",
					}}
				/>
				<div
					className="flex-1 bg-gradient-to-r from-orange-600 to-red-500 transition-all duration-500 delay-600 ease-out"
					style={{
						transform: `scaleX(${progress[2] / 100})`,
						transformOrigin: "left",
					}}
				/>
			</div>
			<p className="text-xs text-muted-foreground text-center">
				Build • Upload • Deploy
			</p>
		</div>
	);
}

// Global Latency Visualization with Pulse Animation
function LatencyVisualization() {
	return (
		<div className="space-y-2">
			<div className="grid grid-cols-4 gap-1">
				{["NA", "EU", "APAC", "SA"].map((region, idx) => (
					<div
						key={region}
						className="text-center animate-in slide-in-from-bottom duration-700"
						style={{ animationDelay: `${idx * 100}ms` }}
					>
						<div className="h-8 bg-gradient-to-t from-purple-600 via-pink-500 to-purple-400 rounded-lg mb-1 hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/50" />
						<p className="text-xs text-muted-foreground font-medium">
							{region}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

// Lighthouse Score with Bounce Animation
function LighthouseVisualization() {
	return (
		<div className="flex gap-1.5">
			{["Perf", "A11y", "BP", "SEO"].map((badge, idx) => (
				<div
					key={badge}
					className="flex-1 h-10 rounded-lg bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-green-500/10 border-2 border-green-500/50 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg shadow-green-500/30 animate-in zoom-in"
					style={{ animationDelay: `${idx * 100}ms` }}
				>
					<span className="text-xs font-bold text-green-700 dark:text-green-400">
						{badge}
					</span>
				</div>
			))}
		</div>
	);
}

// Cost Comparison with Animated Bars
function CostVisualization() {
	const [heights, setHeights] = useState([0, 0, 0]);

	useEffect(() => {
		setTimeout(() => setHeights([10, 40, 70]), 100);
	}, []);

	return (
		<div className="space-y-2">
			<div className="flex items-end gap-1 h-12 justify-center">
				<div
					className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/50"
					style={{ height: `${heights[0]}%` }}
				/>
				<div
					className="flex-1 bg-gray-400 rounded-t-lg opacity-50 transition-all duration-1000 delay-200 ease-out"
					style={{ height: `${heights[1]}%` }}
				/>
				<div
					className="flex-1 bg-gray-400 rounded-t-lg opacity-50 transition-all duration-1000 delay-400 ease-out"
					style={{ height: `${heights[2]}%` }}
				/>
			</div>
			<p className="text-xs text-muted-foreground text-center font-medium">
				ONE vs Competitors
			</p>
		</div>
	);
}

export function PerformanceMetrics({
	columns = 2,
	showDescriptions = true,
	animate = true,
}: PerformanceMetricsProps) {
	const gridClass =
		{
			1: "grid-cols-1",
			2: "md:grid-cols-2",
			3: "md:grid-cols-3",
			4: "md:grid-cols-4",
		}[columns] || "md:grid-cols-2";

	return (
		<div className="w-full space-y-8">
			{/* Main Metrics Grid */}
			<div className={`grid gap-6 ${gridClass}`}>
				{metrics.map((metric, idx) => (
					<MetricCard
						key={idx}
						metric={metric}
						index={idx}
						animate={animate}
						showDescription={showDescriptions}
					/>
				))}
			</div>

			{/* Key Benefits Section */}
			<Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
				<CardHeader>
					<CardTitle>Why These Numbers Matter</CardTitle>
					<CardDescription>
						Every metric translates to a better user experience and lower costs
						for you
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid gap-6 md:grid-cols-2">
						{/* Deploy Speed Benefit */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-blue-500" />
								<p className="font-semibold">19-Second Deployments</p>
							</div>
							<p className="text-sm text-muted-foreground ml-4">
								Iterate faster. Ship bug fixes and features in seconds, not
								minutes.
							</p>
						</div>

						{/* Latency Benefit */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-purple-500" />
								<p className="font-semibold">287ms Global Latency</p>
							</div>
							<p className="text-sm text-muted-foreground ml-4">
								Users worldwide experience sub-300ms response times. Faster =
								higher conversion.
							</p>
						</div>

						{/* Lighthouse Benefit */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<p className="font-semibold">Perfect Lighthouse Scores</p>
							</div>
							<p className="text-sm text-muted-foreground ml-4">
								SEO friendly. Accessibility compliant. Performance optimized for
								all devices.
							</p>
						</div>

						{/* Cost Benefit */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 rounded-full bg-emerald-500" />
								<p className="font-semibold">100% Free Forever</p>
							</div>
							<p className="text-sm text-muted-foreground ml-4">
								No surprise bills. Scale infinitely. Same price whether you have
								1 user or 1M.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Comparison with Competitors */}
			<Card className="border-border/50 bg-card/50 backdrop-blur">
				<CardHeader>
					<CardTitle className="text-lg">How We Compare</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="space-y-4">
						{[
							{
								platform: "Vercel",
								deploy: "45s",
								latency: "340ms",
								cost: "$229/mo",
								lighthouse: "95",
							},
							{
								platform: "Netlify",
								deploy: "60s",
								latency: "365ms",
								cost: "$240/mo",
								lighthouse: "92",
							},
							{
								platform: "AWS",
								deploy: "120s",
								latency: "420ms",
								cost: "$350/mo",
								lighthouse: "88",
							},
							{
								platform: "ONE Platform",
								deploy: "19s",
								latency: "287ms",
								cost: "$0/mo",
								lighthouse: "100",
							},
						].map((row, idx) => (
							<div
								key={idx}
								className={`grid grid-cols-5 gap-4 p-3 rounded-lg border transition-colors ${
									row.platform === "ONE Platform"
										? "bg-primary/10 border-primary/30"
										: "bg-muted/30 border-border/50"
								}`}
							>
								<div
									className={`font-semibold text-sm ${
										row.platform === "ONE Platform" ? "text-primary" : ""
									}`}
								>
									{row.platform}
								</div>
								<div className="text-sm text-muted-foreground">
									{row.deploy}
								</div>
								<div className="text-sm text-muted-foreground">
									{row.latency}
								</div>
								<div
									className={`font-medium text-sm ${
										row.cost === "$0/mo" ? "text-green-600" : ""
									}`}
								>
									{row.cost}
								</div>
								<div
									className={`text-sm ${
										row.lighthouse === "100"
											? "text-green-600 font-semibold"
											: "text-muted-foreground"
									}`}
								>
									{row.lighthouse}
								</div>
							</div>
						))}
					</div>

					{/* Table Header */}
					<div className="grid grid-cols-5 gap-4 p-3 border-b border-border/50 mt-4 mb-2 text-xs font-medium text-muted-foreground">
						<div>Platform</div>
						<div>Deploy</div>
						<div>Latency</div>
						<div>Cost</div>
						<div>LightHouse</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
