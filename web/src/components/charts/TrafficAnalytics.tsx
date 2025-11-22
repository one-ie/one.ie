"use client";

import {
	Activity,
	BarChart3,
	Clock,
	Eye,
	Globe,
	Monitor,
	MousePointer,
	Smartphone,
	Tablet,
	TrendingUp,
	Users,
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

interface TrafficData {
	timestamp: string;
	visitors: number;
	pageViews: number;
	bounceRate: number;
	avgDuration: number;
}

interface DeviceData {
	device: string;
	icon: React.ReactNode;
	percentage: number;
	count: number;
	color: string;
}

interface GeoData {
	country: string;
	flag: string;
	visitors: number;
	percentage: number;
	growth: number;
}

interface PageData {
	path: string;
	views: number;
	uniqueViews: number;
	avgTime: string;
	bounceRate: number;
}

// Generate mock real-time data with deterministic seed for SSR
const generateTrafficData = (seed: number = 1): TrafficData[] => {
	const now = new Date();
	// Simple deterministic pseudo-random generator
	const seededRandom = (index: number) => {
		const x = Math.sin(seed + index) * 10000;
		return x - Math.floor(x);
	};

	return Array.from({ length: 24 }, (_, i) => {
		const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
		return {
			timestamp: hour.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			visitors: Math.floor(seededRandom(i * 4) * 500) + 200,
			pageViews: Math.floor(seededRandom(i * 4 + 1) * 1500) + 500,
			bounceRate: seededRandom(i * 4 + 2) * 30 + 20,
			avgDuration: seededRandom(i * 4 + 3) * 300 + 60,
		};
	});
};

const deviceData: DeviceData[] = [
	{
		device: "Desktop",
		icon: <Monitor className="h-5 w-5" />,
		percentage: 58,
		count: 3847,
		color: "from-blue-600 to-cyan-500",
	},
	{
		device: "Mobile",
		icon: <Smartphone className="h-5 w-5" />,
		percentage: 35,
		count: 2319,
		color: "from-purple-600 to-pink-500",
	},
	{
		device: "Tablet",
		icon: <Tablet className="h-5 w-5" />,
		percentage: 7,
		count: 464,
		color: "from-green-600 to-emerald-500",
	},
];

const geoData: GeoData[] = [
	{
		country: "United States",
		flag: "🇺🇸",
		visitors: 4523,
		percentage: 34.2,
		growth: 12.3,
	},
	{
		country: "United Kingdom",
		flag: "🇬🇧",
		visitors: 2341,
		percentage: 17.7,
		growth: 8.1,
	},
	{
		country: "Germany",
		flag: "🇩🇪",
		visitors: 1876,
		percentage: 14.2,
		growth: -3.2,
	},
	{
		country: "Japan",
		flag: "🇯🇵",
		visitors: 1432,
		percentage: 10.8,
		growth: 23.4,
	},
	{
		country: "Canada",
		flag: "🇨🇦",
		visitors: 987,
		percentage: 7.5,
		growth: 5.6,
	},
];

const topPages: PageData[] = [
	{
		path: "/",
		views: 8234,
		uniqueViews: 5421,
		avgTime: "2:34",
		bounceRate: 23.4,
	},
	{
		path: "/features",
		views: 4532,
		uniqueViews: 3214,
		avgTime: "3:12",
		bounceRate: 18.2,
	},
	{
		path: "/pricing",
		views: 3421,
		uniqueViews: 2987,
		avgTime: "1:45",
		bounceRate: 34.5,
	},
	{
		path: "/docs",
		views: 2198,
		uniqueViews: 1876,
		avgTime: "5:23",
		bounceRate: 12.3,
	},
	{
		path: "/blog",
		views: 1765,
		uniqueViews: 1432,
		avgTime: "4:12",
		bounceRate: 28.7,
	},
];

interface TrafficAnalyticsProps {
	/** Show detailed breakdown */
	showDetails?: boolean;
	/** Enable animations */
	animate?: boolean;
	/** Time range */
	timeRange?: "24h" | "7d" | "30d";
}

function MetricCard({
	icon,
	label,
	value,
	change,
	color,
	index,
	animate,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	change: number;
	color: string;
	index: number;
	animate: boolean;
}) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (animate) {
			const timer = setTimeout(() => setIsVisible(true), index * 100);
			return () => clearTimeout(timer);
		} else {
			setIsVisible(true);
		}
	}, [index, animate]);

	return (
		<div
			className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:scale-105 transition-all duration-500 ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			}`}
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white shadow-lg`}
				>
					{icon}
				</div>
				<Badge
					variant="secondary"
					className={`text-xs font-bold ${change > 0 ? "text-green-600" : "text-red-600"}`}
				>
					{change > 0 ? "+" : ""}
					{change}%
				</Badge>
			</div>
			<p className="text-sm text-muted-foreground mb-1">{label}</p>
			<p className="text-2xl font-black">{value}</p>
		</div>
	);
}

function TrafficChart({
	data,
	animate,
}: {
	data: TrafficData[];
	animate: boolean;
}) {
	const [visibleBars, setVisibleBars] = useState(0);

	useEffect(() => {
		if (animate) {
			const interval = setInterval(() => {
				setVisibleBars((prev) => Math.min(prev + 1, data.length));
			}, 50);
			return () => clearInterval(interval);
		} else {
			setVisibleBars(data.length);
		}
	}, [data.length, animate]);

	const maxVisitors = Math.max(...data.map((d) => d.visitors));

	return (
		<div className="relative h-48 flex items-end gap-1 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl">
			{data.map((item, idx) => {
				const height = (item.visitors / maxVisitors) * 100;
				return (
					<div key={idx} className="flex-1 relative group">
						{/* Bar */}
						<div
							className={`w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-500 hover:from-primary/80 hover:to-primary`}
							style={{
								height: idx < visibleBars ? `${height}%` : "0%",
								transitionDelay: `${idx * 20}ms`,
							}}
						/>

						{/* Tooltip */}
						<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
							<div className="bg-background border border-border rounded-lg shadow-xl p-2 whitespace-nowrap">
								<p className="text-xs font-bold">{item.timestamp}</p>
								<p className="text-xs text-muted-foreground">
									{item.visitors} visitors
								</p>
							</div>
						</div>
					</div>
				);
			})}

			{/* Y-axis labels */}
			<div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
				<span>{maxVisitors}</span>
				<span>{Math.round(maxVisitors / 2)}</span>
				<span>0</span>
			</div>
		</div>
	);
}

export function TrafficAnalytics({
	showDetails = true,
	animate = true,
	timeRange = "24h",
}: TrafficAnalyticsProps) {
	const [trafficData] = useState(() => generateTrafficData(1));
	const [currentVisitors, setCurrentVisitors] = useState(87); // Start with fixed value

	useEffect(() => {
		if (animate && typeof window !== "undefined") {
			// Only animate on client side
			const interval = setInterval(() => {
				setCurrentVisitors((prev) => {
					const change = Math.floor(Math.random() * 10) - 5;
					return Math.max(0, prev + change);
				});
			}, 3000);

			return () => clearInterval(interval);
		}
	}, [animate]);

	const totalVisitors = trafficData.reduce((sum, d) => sum + d.visitors, 0);
	const totalPageViews = trafficData.reduce((sum, d) => sum + d.pageViews, 0);
	const avgBounceRate = Math.round(
		trafficData.reduce((sum, d) => sum + d.bounceRate, 0) / trafficData.length,
	);
	const avgDuration = Math.round(
		trafficData.reduce((sum, d) => sum + d.avgDuration, 0) / trafficData.length,
	);

	return (
		<div className="w-full space-y-8">
			{/* Main Analytics Card */}
			<Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
				{/* Animated Background */}
				<div className="absolute -top-20 -right-20 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
				<div className="absolute -bottom-20 -left-20 h-40 w-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700" />

				<CardHeader className="relative">
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
								Traffic Analytics
							</CardTitle>
							<CardDescription className="text-base mt-2">
								Real-time visitor insights and engagement metrics
							</CardDescription>
						</div>
						<div className="flex items-center gap-3">
							<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base px-4 py-2 shadow-lg shadow-green-500/50">
								<span className="relative flex h-3 w-3 mr-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
									<span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
								</span>
								{currentVisitors} Live
							</Badge>
							<Badge variant="outline" className="text-sm font-bold">
								{timeRange === "24h"
									? "Last 24 Hours"
									: timeRange === "7d"
										? "Last 7 Days"
										: "Last 30 Days"}
							</Badge>
						</div>
					</div>
				</CardHeader>

				<CardContent className="relative space-y-6">
					{/* Key Metrics */}
					<div className="grid gap-4 md:grid-cols-4">
						<MetricCard
							icon={<Users className="h-5 w-5" />}
							label="Total Visitors"
							value={totalVisitors.toLocaleString()}
							change={12.3}
							color="from-blue-600 to-cyan-500"
							index={0}
							animate={animate}
						/>
						<MetricCard
							icon={<Eye className="h-5 w-5" />}
							label="Page Views"
							value={totalPageViews.toLocaleString()}
							change={8.7}
							color="from-purple-600 to-pink-500"
							index={1}
							animate={animate}
						/>
						<MetricCard
							icon={<MousePointer className="h-5 w-5" />}
							label="Bounce Rate"
							value={`${avgBounceRate}%`}
							change={-5.2}
							color="from-green-600 to-emerald-500"
							index={2}
							animate={animate}
						/>
						<MetricCard
							icon={<Clock className="h-5 w-5" />}
							label="Avg Duration"
							value={`${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, "0")}`}
							change={15.4}
							color="from-orange-600 to-yellow-500"
							index={3}
							animate={animate}
						/>
					</div>

					{/* Traffic Chart */}
					<div className="space-y-3">
						<h3 className="text-lg font-bold flex items-center gap-2">
							<BarChart3 className="h-5 w-5 text-primary" />
							Visitor Timeline
						</h3>
						<TrafficChart data={trafficData} animate={animate} />
					</div>
				</CardContent>
			</Card>

			{/* Device & Geographic Breakdown */}
			<div className="grid gap-8 lg:grid-cols-2">
				{/* Device Breakdown */}
				<Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
					<CardHeader>
						<CardTitle className="text-lg">Device Breakdown</CardTitle>
						<CardDescription>How users access your site</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{deviceData.map((device, idx) => (
							<div key={idx} className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`p-2 rounded-lg bg-gradient-to-br ${device.color} text-white`}
										>
											{device.icon}
										</div>
										<div>
											<p className="font-semibold">{device.device}</p>
											<p className="text-sm text-muted-foreground">
												{device.count.toLocaleString()} users
											</p>
										</div>
									</div>
									<span className="text-lg font-black">
										{device.percentage}%
									</span>
								</div>
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div
										className={`h-full bg-gradient-to-r ${device.color} transition-all duration-1000`}
										style={{
											width: animate ? `${device.percentage}%` : "0%",
											transitionDelay: `${idx * 200}ms`,
										}}
									/>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Geographic Distribution */}
				<Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
					<CardHeader>
						<CardTitle className="text-lg">Top Countries</CardTitle>
						<CardDescription>
							Geographic distribution of traffic
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{geoData.map((country, idx) => (
							<div
								key={idx}
								className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-300"
							>
								<div className="flex items-center gap-3">
									<span className="text-2xl">{country.flag}</span>
									<div>
										<p className="font-semibold">{country.country}</p>
										<p className="text-sm text-muted-foreground">
											{country.visitors.toLocaleString()} visitors
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-black">{country.percentage}%</p>
									<p
										className={`text-xs font-bold ${country.growth > 0 ? "text-green-600" : "text-red-600"}`}
									>
										{country.growth > 0 ? "+" : ""}
										{country.growth}%
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{/* Top Pages */}
			{showDetails && (
				<Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl">
					<CardHeader>
						<CardTitle>Top Pages</CardTitle>
						<CardDescription>Most visited pages on your site</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/50">
										<th className="text-left p-3 text-sm font-medium text-muted-foreground">
											Page
										</th>
										<th className="text-right p-3 text-sm font-medium text-muted-foreground">
											Views
										</th>
										<th className="text-right p-3 text-sm font-medium text-muted-foreground">
											Unique
										</th>
										<th className="text-right p-3 text-sm font-medium text-muted-foreground">
											Avg Time
										</th>
										<th className="text-right p-3 text-sm font-medium text-muted-foreground">
											Bounce Rate
										</th>
									</tr>
								</thead>
								<tbody>
									{topPages.map((page, idx) => (
										<tr
											key={idx}
											className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-300"
										>
											<td className="p-3 font-medium">{page.path}</td>
											<td className="p-3 text-right">
												{page.views.toLocaleString()}
											</td>
											<td className="p-3 text-right">
												{page.uniqueViews.toLocaleString()}
											</td>
											<td className="p-3 text-right">{page.avgTime}</td>
											<td className="p-3 text-right">
												<Badge
													variant={
														page.bounceRate < 20
															? "default"
															: page.bounceRate > 30
																? "destructive"
																: "secondary"
													}
												>
													{page.bounceRate}%
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
