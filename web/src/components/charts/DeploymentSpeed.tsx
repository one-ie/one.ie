"use client";

import { ArrowRight, CheckCircle2, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface DeploymentStage {
	name: string;
	duration: number;
	description: string;
	files?: number | string;
	color: string;
	iconGradient: string;
}

const stages: DeploymentStage[] = [
	{
		name: "Build",
		duration: 14,
		description: "Compile & optimize",
		files: "600+ files",
		color: "from-blue-600 via-cyan-500 to-blue-500",
		iconGradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
	},
	{
		name: "Upload",
		duration: 4.5,
		description: "Transfer assets",
		files: "665 assets",
		color: "from-purple-600 via-pink-500 to-purple-500",
		iconGradient: "from-purple-500/20 via-pink-500/10 to-transparent",
	},
	{
		name: "Deploy",
		duration: 0.5,
		description: "Edge functions",
		files: "Serverless",
		color: "from-green-600 via-emerald-500 to-green-500",
		iconGradient: "from-green-500/20 via-emerald-500/10 to-transparent",
	},
	{
		name: "Replicate",
		duration: 0.8,
		description: "Global propagation",
		files: "330+ edges",
		color: "from-orange-600 via-red-500 to-orange-500",
		iconGradient: "from-orange-500/20 via-red-500/10 to-transparent",
	},
];

const totalTime = stages.reduce((sum, stage) => sum + stage.duration, 0);

interface DeploymentSpeedProps {
	/** Show detailed breakdown */
	showDetails?: boolean;
	/** Timestamp for deployment */
	timestamp?: string;
	/** Enable animations */
	animate?: boolean;
}

function AnimatedStage({
	stage,
	index,
	isActive,
	isComplete,
}: {
	stage: DeploymentStage;
	index: number;
	isActive: boolean;
	isComplete: boolean;
}) {
	return (
		<div className="relative">
			{/* Stage Card */}
			<div
				className={`relative overflow-hidden rounded-xl border-2 p-6 space-y-4 h-full transition-all duration-700 ${
					isActive
						? "border-primary shadow-2xl shadow-primary/50 scale-105"
						: isComplete
							? "border-green-500/50 bg-green-500/5"
							: "border-border/50 bg-card/30"
				}`}
			>
				{/* Animated Background Gradient */}
				<div
					className={`absolute inset-0 bg-gradient-to-br ${stage.iconGradient} opacity-0 transition-opacity duration-700 ${
						isActive ? "opacity-100" : ""
					}`}
				/>

				{/* Glow Effect */}
				{isActive && (
					<div
						className="absolute -inset-2 bg-gradient-to-r opacity-30 blur-2xl -z-10"
						style={{
							background: `linear-gradient(135deg, ${stage.color.includes("blue") ? "#3b82f6" : stage.color.includes("purple") ? "#a855f7" : stage.color.includes("green") ? "#22c55e" : "#f97316"}, transparent)`,
						}}
					/>
				)}

				{/* Stage Number Badge */}
				<div className="relative flex items-center justify-between">
					<div
						className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${stage.color} text-white text-lg font-black shadow-lg transition-all duration-500 ${
							isActive ? "scale-110 animate-pulse" : ""
						}`}
					>
						{isComplete ? <CheckCircle2 className="h-7 w-7" /> : index + 1}
					</div>

					{/* Duration Badge */}
					<Badge
						variant="secondary"
						className={`text-sm font-bold transition-all duration-500 ${
							isActive ? "scale-110 bg-primary/20 text-primary" : ""
						}`}
					>
						<Clock className="h-3 w-3 mr-1" />
						{stage.duration}s
					</Badge>
				</div>

				{/* Stage Info */}
				<div className="relative space-y-2 text-center">
					<p className="font-bold text-lg">{stage.name}</p>
					<p className="text-sm text-muted-foreground">{stage.description}</p>
				</div>

				{/* File Count */}
				{stage.files && (
					<div className="relative text-xs text-center text-muted-foreground bg-background/60 backdrop-blur-sm rounded-lg px-3 py-2 font-medium">
						{stage.files}
					</div>
				)}

				{/* Progress Indicator */}
				<div className="relative">
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div
							className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out`}
							style={{ width: isActive ? "100%" : isComplete ? "100%" : "0%" }}
						/>
					</div>
				</div>
			</div>

			{/* Arrow Connector */}
			{index < stages.length - 1 && (
				<div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:block z-10">
					<ArrowRight
						className={`h-6 w-6 transition-all duration-500 ${
							isComplete
								? "text-green-500"
								: isActive
									? "text-primary animate-pulse"
									: "text-muted"
						}`}
					/>
				</div>
			)}
		</div>
	);
}

export function DeploymentSpeed({
	showDetails = true,
	timestamp = "Nov 6, 2025",
	animate = true,
}: DeploymentSpeedProps) {
	const [activeStage, setActiveStage] = useState(-1);
	const [completedStages, setCompletedStages] = useState<number[]>([]);

	useEffect(() => {
		if (!animate) {
			setCompletedStages([0, 1, 2, 3]);
			return;
		}

		let accumulatedTime = 0;
		const timers: NodeJS.Timeout[] = [];

		stages.forEach((stage, index) => {
			// Start stage
			timers.push(
				setTimeout(() => {
					setActiveStage(index);
				}, accumulatedTime * 1000),
			);

			// Complete stage
			accumulatedTime += stage.duration;
			timers.push(
				setTimeout(() => {
					setCompletedStages((prev) => [...prev, index]);
					setActiveStage(-1);
				}, accumulatedTime * 1000),
			);
		});

		return () => timers.forEach(clearTimeout);
	}, [animate]);

	const getPercentage = (duration: number): number => {
		return (duration / totalTime) * 100;
	};

	const isStageActive = (index: number) => animate && activeStage === index;
	const isStageComplete = (index: number) =>
		!animate || completedStages.includes(index);

	return (
		<div className="w-full space-y-8">
			{/* Main Speed Card */}
			<Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl">
				{/* Animated Background Orbs */}
				<div className="absolute -top-20 -right-20 h-40 w-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
				<div className="absolute -bottom-20 -left-20 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />

				<CardHeader className="relative pb-6">
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
								37% Faster Deployments
							</CardTitle>
							<CardDescription className="text-base mt-2">
								4-stage pipeline optimized for blazing speed
							</CardDescription>
						</div>
						<Badge
							variant="secondary"
							className="text-sm font-bold bg-primary/20 text-primary"
						>
							<Zap className="h-4 w-4 mr-1 animate-pulse" />
							Lightning Fast
						</Badge>
					</div>
				</CardHeader>

				<CardContent className="relative space-y-8">
					{/* Animated Stages Grid */}
					<div className="grid gap-6 md:grid-cols-4">
						{stages.map((stage, idx) => (
							<AnimatedStage
								key={idx}
								stage={stage}
								index={idx}
								isActive={isStageActive(idx)}
								isComplete={isStageComplete(idx)}
							/>
						))}
					</div>

					{/* Enhanced Progress Bar Timeline */}
					<div className="space-y-4">
						<h4 className="text-sm font-bold flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
							Pipeline Timeline
						</h4>

						{/* Main Progress Bar */}
						<div className="relative h-4 w-full overflow-hidden rounded-full bg-muted shadow-inner">
							{stages.map((stage, idx) => (
								<div
									key={idx}
									className={`absolute h-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out shadow-lg`}
									style={{
										left: `${stages
											.slice(0, idx)
											.reduce(
												(sum, s) => sum + getPercentage(s.duration),
												0,
											)}%`,
										width: `${getPercentage(stage.duration)}%`,
										transform: isStageComplete(idx) ? "scaleX(1)" : "scaleX(0)",
										transformOrigin: "left",
									}}
								/>
							))}
						</div>

						<div className="flex justify-between items-center text-sm font-medium">
							<span className="text-muted-foreground">0s</span>
							<span className="text-primary font-bold text-lg">
								{totalTime}s total
							</span>
							<span className="text-green-600">100%</span>
						</div>
					</div>

					{/* Live Status with Pulse */}
					<div className="rounded-xl border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent p-6 flex items-center gap-4 shadow-lg shadow-green-500/20">
						<div className="relative">
							<div className="h-4 w-4 rounded-full bg-green-500 animate-ping absolute" />
							<div className="h-4 w-4 rounded-full bg-green-500" />
						</div>

						<div className="flex-1">
							<p className="text-lg font-black text-green-700 dark:text-green-400">
								✓ Live at oneie.pages.dev
							</p>
							<p className="text-sm text-green-600 dark:text-green-400/80">
								Deployed {timestamp} • All systems operational
							</p>
						</div>

						<Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50 text-sm font-bold">
							Active
						</Badge>
					</div>

					{/* Cost Breakdown with Shimmer */}
					<div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 group">
						{/* Shimmer Effect */}
						<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

						<p className="text-sm text-muted-foreground mb-2 font-medium">
							Deployment Cost
						</p>
						<p className="text-4xl font-black text-primary mb-2">$0.00</p>
						<p className="text-sm text-muted-foreground">
							Unlimited deployments.{" "}
							<span className="font-bold text-green-600">Completely free.</span>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Detailed Breakdown */}
			{showDetails && (
				<Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
					<CardHeader>
						<CardTitle className="text-xl font-bold">Stage Details</CardTitle>
						<CardDescription>
							Deep dive into each deployment phase
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="space-y-6">
							{stages.map((stage, idx) => (
								<div
									key={idx}
									className={`flex items-start gap-6 pb-6 border-b border-border/50 last:border-0 transition-all duration-500 hover:bg-primary/5 rounded-lg p-4 ${
										isStageComplete(idx) ? "opacity-100" : "opacity-50"
									}`}
								>
									{/* Stage Icon */}
									<div
										className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stage.color} text-white text-lg font-black flex-shrink-0 shadow-lg hover:scale-110 transition-transform duration-300`}
									>
										{isStageComplete(idx) ? (
											<CheckCircle2 className="h-7 w-7" />
										) : (
											idx + 1
										)}
									</div>

									{/* Stage Info */}
									<div className="flex-1 space-y-2">
										<div className="flex items-baseline gap-3">
											<p className="font-bold text-lg">{stage.name}</p>
											<p className="text-base text-primary font-black">
												{stage.duration}s
											</p>
										</div>
										<p className="text-sm text-muted-foreground">
											{stage.description}
										</p>
										{stage.files && (
											<p className="text-xs text-muted-foreground font-medium bg-muted/50 rounded px-2 py-1 inline-block">
												{stage.files}
											</p>
										)}
									</div>

									{/* Mini Progress Bar */}
									<div className="w-32 h-3 bg-muted rounded-full overflow-hidden flex-shrink-0 shadow-inner">
										<div
											className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out shadow-lg`}
											style={{
												width: `${Math.min((stage.duration / 15) * 100, 100)}%`,
												transform: isStageComplete(idx)
													? "scaleX(1)"
													: "scaleX(0)",
												transformOrigin: "left",
											}}
										/>
									</div>
								</div>
							))}

							{/* Summary Stats */}
							<div className="grid gap-6 md:grid-cols-3 pt-6 border-t-2 border-primary/20">
								<div className="space-y-2 text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent">
									<p className="text-sm text-muted-foreground font-medium">
										Total Time
									</p>
									<p className="text-4xl font-black text-primary">
										{totalTime}s
									</p>
								</div>
								<div className="space-y-2 text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent">
									<p className="text-sm text-muted-foreground font-medium">
										Files Processed
									</p>
									<p className="text-4xl font-black text-purple-600 dark:text-purple-400">
										1,265+
									</p>
								</div>
								<div className="space-y-2 text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent">
									<p className="text-sm text-muted-foreground font-medium">
										Speed Improvement
									</p>
									<p className="text-4xl font-black text-green-600">37% ↓</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
