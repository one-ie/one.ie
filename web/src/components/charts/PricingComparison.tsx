"use client";

import {
	Check,
	DollarSign,
	PartyPopper,
	Sparkles,
	TrendingDown,
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

interface PricingComparisonProps {
	/** Show comparison details */
	showDetails?: boolean;
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

export function PricingComparison({
	showDetails = true,
	animate = true,
}: PricingComparisonProps) {
	const competitors = [
		{
			name: "Vercel",
			price: 229,
			color: "from-gray-900 via-gray-700 to-gray-600",
		},
		{
			name: "Netlify",
			price: 240,
			color: "from-teal-600 via-cyan-500 to-teal-500",
		},
		{
			name: "AWS",
			price: 350,
			color: "from-orange-600 via-amber-500 to-orange-500",
		},
	];

	const savings = Math.floor(
		competitors.reduce((sum, c) => sum + c.price, 0) / competitors.length,
	);
	const annualSavings = useCountUp(savings * 12, 2500, animate);
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (animate) {
			const timer = setTimeout(() => setShowConfetti(true), 2000);
			return () => clearTimeout(timer);
		}
	}, [animate]);

	const features = [
		{ icon: "∞", label: "Unlimited Bandwidth", included: true },
		{ icon: "🌍", label: "330+ Edge Locations", included: true },
		{ icon: "🛡️", label: "DDoS Protection", included: true },
		{ icon: "🔒", label: "SSL Certificates", included: true },
		{ icon: "⚡", label: "100k Functions/day", included: true },
		{ icon: "📊", label: "Analytics Dashboard", included: true },
	];

	return (
		<div className="w-full space-y-8">
			{/* Main Comparison Card */}
			<div className="grid gap-8 lg:grid-cols-2 items-start">
				{/* Our Offer - Featured */}
				<Card className="relative overflow-hidden border-4 border-primary/50 bg-gradient-to-br from-primary/20 via-primary/5 to-background shadow-2xl hover:shadow-primary/30 transition-all duration-700 group">
					{/* Animated Background Orbs */}
					<div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
					<div className="absolute -bottom-10 -left-10 h-32 w-32 bg-green-500/30 rounded-full blur-3xl animate-pulse delay-700" />

					{/* Shimmer Effect */}
					<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

					<CardHeader className="relative pb-6">
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
									ONE Platform
								</CardTitle>
								<CardDescription className="text-lg mt-2 font-medium">
									Powered by Cloudflare ⚡
								</CardDescription>
							</div>
							<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base px-4 py-2 shadow-lg shadow-green-500/50 animate-pulse">
								<Sparkles className="h-4 w-4 mr-1" />
								100% Free
							</Badge>
						</div>
					</CardHeader>

					<CardContent className="relative space-y-8">
						{/* Price Display with Animation */}
						<div className="space-y-3">
							<div className="flex items-baseline gap-3">
								<span className="text-7xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
									$0
								</span>
								<span className="text-2xl text-muted-foreground font-bold">
									/month
								</span>
							</div>
							<p className="text-base text-muted-foreground font-medium">
								Forever free tier.{" "}
								<span className="text-green-600 font-bold">
									No hidden costs. Ever.
								</span>
							</p>
						</div>

						{/* Feature Checklist with Stagger Animation */}
						<div className="space-y-4 border-t-2 border-primary/20 pt-6">
							{features.map((feature, idx) => (
								<div
									key={idx}
									className="flex items-center gap-3 animate-in slide-in-from-left duration-700"
									style={{ animationDelay: `${idx * 100}ms` }}
								>
									<div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50">
										<Check className="h-5 w-5 text-white font-bold" />
									</div>
									<span className="text-base font-semibold">
										{feature.label}
									</span>
								</div>
							))}
						</div>

						{/* Savings Highlight with Confetti Effect */}
						<div className="relative rounded-2xl border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent p-6 shadow-xl shadow-green-500/20 overflow-hidden group/savings">
							{/* Animated Background */}
							<div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 opacity-0 group-hover/savings:opacity-100 transition-opacity duration-700" />

							{showConfetti && (
								<div className="absolute top-2 right-2">
									<PartyPopper className="h-6 w-6 text-yellow-500 animate-bounce" />
								</div>
							)}

							<div className="relative flex items-center gap-3 mb-2">
								<TrendingDown className="h-6 w-6 text-green-600 animate-bounce" />
								<p className="text-xl font-black text-green-700 dark:text-green-400">
									Save ${savings}/month
								</p>
							</div>
							<p className="relative text-sm text-green-600 dark:text-green-400 font-medium">
								vs average competitor pricing
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Competitor Comparison with Animated Bars */}
				<div className="space-y-6">
					<h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
						Traditional Platforms Cost:
					</h3>

					{competitors.map((competitor, idx) => (
						<CompetitorCard
							key={idx}
							competitor={competitor}
							index={idx}
							animate={animate}
						/>
					))}

					{/* Annual Savings with Count-Up Animation */}
					<div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-6 shadow-xl group">
						{/* Shimmer Effect */}
						<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

						<p className="relative text-sm text-muted-foreground mb-2 font-medium">
							Annual Savings
						</p>
						<p className="relative text-5xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
							${annualSavings.toLocaleString()}/year
						</p>
						<p className="relative text-sm text-green-600 dark:text-green-400 font-bold mt-2">
							🎉 That's real money you keep!
						</p>
					</div>
				</div>
			</div>

			{/* Detailed Breakdown */}
			{showDetails && (
				<Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
					<CardHeader>
						<CardTitle className="text-2xl font-bold flex items-center gap-3">
							<DollarSign className="h-7 w-7 text-primary" />
							Zero Cost Breakdown
						</CardTitle>
						<CardDescription className="text-base">
							Everything included. No upgrades needed.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{features.map((feature, idx) => (
								<div
									key={idx}
									className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 space-y-3 hover:scale-105 hover:shadow-xl transition-all duration-500 group"
								>
									{/* Glow Effect */}
									<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

									<div
										className="text-4xl animate-in zoom-in duration-700"
										style={{ animationDelay: `${idx * 50}ms` }}
									>
										{feature.icon}
									</div>
									<p className="text-base font-bold">{feature.label}</p>
									<p className="text-sm text-green-600 font-black flex items-center gap-1.5">
										<Check className="h-4 w-4" />
										Included Free
									</p>
								</div>
							))}
						</div>

						{/* Total Value Card */}
						<div className="mt-8 rounded-2xl bg-gradient-to-r from-green-500/20 via-primary/10 to-purple-500/20 border-2 border-primary/30 p-8 text-center space-y-3 shadow-xl">
							<p className="text-base text-muted-foreground font-medium">
								Total Monthly Value
							</p>
							<p className="text-6xl font-black bg-gradient-to-r from-green-600 via-primary to-purple-600 bg-clip-text text-transparent">
								$229-350
							</p>
							<p className="text-base text-muted-foreground max-w-2xl mx-auto">
								Typical pricing from competitors.{" "}
								<span className="font-black text-green-600">
									You get this completely free.
								</span>
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function CompetitorCard({
	competitor,
	index,
	animate,
}: {
	competitor: { name: string; price: number; color: string };
	index: number;
	animate: boolean;
}) {
	const [progress, setProgress] = useState(0);
	const animatedPrice = useCountUp(competitor.price, 2000, animate);

	useEffect(() => {
		if (animate) {
			const timer = setTimeout(() => {
				setProgress((competitor.price / 400) * 100);
			}, index * 200);
			return () => clearTimeout(timer);
		} else {
			setProgress((competitor.price / 400) * 100);
		}
	}, [competitor.price, index, animate]);

	return (
		<div className="relative overflow-hidden rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-xl group">
			{/* Background Gradient */}
			<div
				className={`absolute inset-0 bg-gradient-to-r ${competitor.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
			/>

			<div className="relative flex items-center justify-between mb-4">
				<span className="font-bold text-lg">{competitor.name}</span>
				<span className="text-3xl font-black text-muted-foreground">
					${animatedPrice}
					<span className="text-base font-medium">/mo</span>
				</span>
			</div>

			{/* Animated Progress Bar */}
			<div className="relative h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner">
				<div
					className={`absolute h-full bg-gradient-to-r ${competitor.color} shadow-lg transition-all duration-1500 ease-out`}
					style={{ width: `${progress}%` }}
				/>
			</div>

			<p className="relative text-sm text-muted-foreground mt-3 font-medium">
				<span className="font-bold text-red-600">${competitor.price}</span> more
				than ONE per month
			</p>
		</div>
	);
}
