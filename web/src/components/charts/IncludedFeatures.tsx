"use client";

import {
	BarChart3,
	CheckCircle2,
	Cpu,
	DollarSign,
	Globe,
	Lock,
	Shield,
	Sparkles,
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

interface Feature {
	icon: React.ReactNode;
	name: string;
	description: string;
	included: boolean;
}

const features: Feature[] = [
	{
		icon: <Zap className="h-6 w-6" />,
		name: "Unlimited Bandwidth",
		description: "Transfer unlimited data globally",
		included: true,
	},
	{
		icon: <Globe className="h-6 w-6" />,
		name: "330+ Edge Locations",
		description: "Deploy to any location worldwide",
		included: true,
	},
	{
		icon: <Shield className="h-6 w-6" />,
		name: "DDoS Protection",
		description: "Enterprise-grade security included",
		included: true,
	},
	{
		icon: <Lock className="h-6 w-6" />,
		name: "SSL Certificates",
		description: "Free HTTPS for all domains",
		included: true,
	},
	{
		icon: <Cpu className="h-6 w-6" />,
		name: "100k Functions/day",
		description: "Serverless computing included",
		included: true,
	},
	{
		icon: <BarChart3 className="h-6 w-6" />,
		name: "Analytics Dashboard",
		description: "Real-time performance metrics",
		included: true,
	},
];

interface IncludedFeaturesProps {
	/** Grid columns */
	columns?: 1 | 2 | 3;
	/** Show footer summary */
	showFooter?: boolean;
	/** Show descriptions */
	showDescriptions?: boolean;
	/** Enable animations */
	animate?: boolean;
}

function FeatureCard({
	feature,
	index,
	showDescription,
	animate,
}: {
	feature: Feature;
	index: number;
	showDescription: boolean;
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
		<Card
			className={`relative overflow-hidden border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-700 group ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
			}`}
		>
			{/* Animated Gradient Border Effect */}
			<div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-700 -z-10" />

			{/* Corner Sparkle */}
			<div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				<Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
			</div>

			{/* Shimmer Effect */}
			<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

			<CardHeader className="relative pb-4">
				<div className="flex items-start justify-between">
					{/* Animated Icon */}
					<div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-600 via-emerald-500 to-green-600 text-white flex items-center justify-center shadow-xl shadow-green-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
						<div className="group-hover:rotate-[-12deg] transition-transform duration-500">
							{feature.icon}
						</div>
					</div>

					{/* Free Badge with Pulse */}
					<Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-2 border-green-500/40 text-xs font-black px-3 py-1 shadow-lg shadow-green-500/30 animate-pulse">
						✓ Free
					</Badge>
				</div>

				<CardTitle className="text-lg font-bold mt-4 group-hover:text-green-600 transition-colors duration-300">
					{feature.name}
				</CardTitle>
			</CardHeader>

			<CardContent className="relative space-y-3">
				{showDescription && (
					<p className="text-sm text-muted-foreground leading-relaxed">
						{feature.description}
					</p>
				)}

				{/* Status Indicator with Animation */}
				<div className="flex items-center gap-2 pt-2 border-t border-green-500/20">
					<CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
					<span className="text-sm font-black text-green-700 dark:text-green-400">
						Included in free tier
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function IncludedFeatures({
	columns = 3,
	showFooter = true,
	showDescriptions = true,
	animate = true,
}: IncludedFeaturesProps) {
	const gridClass =
		{
			1: "grid-cols-1",
			2: "md:grid-cols-2",
			3: "md:grid-cols-3",
		}[columns] || "md:grid-cols-3";

	const savings = 229 + 240 + 350;
	const monthlyValue = Math.round(savings / 3);

	return (
		<div className="w-full space-y-10">
			{/* Features Grid */}
			<div className={`grid gap-6 ${gridClass}`}>
				{features.map((feature, idx) => (
					<FeatureCard
						key={idx}
						feature={feature}
						index={idx}
						showDescription={showDescriptions}
						animate={animate}
					/>
				))}
			</div>

			{/* Value Proposition Card */}
			<Card className="relative overflow-hidden border-4 border-primary/30 bg-gradient-to-br from-primary/15 via-purple-500/5 to-background shadow-2xl">
				{/* Animated Background Orbs */}
				<div className="absolute -top-20 -right-20 h-48 w-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
				<div className="absolute -bottom-20 -left-20 h-48 w-48 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-700" />

				<CardHeader className="relative">
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-3xl font-black flex items-center gap-3 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
								<DollarSign className="h-8 w-8 text-primary" />
								Zero Cost Breakdown
							</CardTitle>
							<CardDescription className="text-lg mt-3 font-medium">
								All features are completely free. No hidden costs,{" "}
								<span className="font-black text-green-600">ever</span>.
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="relative space-y-8">
					{/* Feature Checklist - Organized in Two Columns */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* Left Column */}
						<div className="space-y-4">
							<h4 className="font-bold text-lg mb-4 text-primary">
								What You Get
							</h4>
							{features.slice(0, 3).map((feature, idx) => (
								<div
									key={idx}
									className="flex items-start gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-300 group/item"
								>
									<CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform duration-300" />
									<div>
										<p className="font-bold text-base">{feature.name}</p>
										<p className="text-sm text-muted-foreground mt-1">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Right Column */}
						<div className="space-y-4">
							<h4 className="font-bold text-lg mb-4 text-purple-600">
								Plus More
							</h4>
							{features.slice(3).map((feature, idx) => (
								<div
									key={idx}
									className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-500/5 transition-colors duration-300 group/item"
								>
									<CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform duration-300" />
									<div>
										<p className="font-bold text-base">{feature.name}</p>
										<p className="text-sm text-muted-foreground mt-1">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Separator */}
					<div className="border-t-2 border-primary/20" />

					{/* Monthly Savings Highlight */}
					<div className="rounded-2xl border-2 border-green-500/40 bg-gradient-to-br from-green-500/15 via-emerald-500/5 to-transparent p-8 space-y-4 shadow-xl shadow-green-500/20">
						<p className="text-base text-muted-foreground font-medium">
							Typical Monthly Value
						</p>

						<div className="space-y-3">
							{[
								{ platform: "Vercel", price: 229 },
								{ platform: "Netlify", price: 240 },
								{ platform: "AWS", price: 350 },
							].map((item, idx) => (
								<div
									key={idx}
									className="flex justify-between items-baseline p-2 rounded-lg hover:bg-muted/30 transition-colors duration-300"
								>
									<span className="text-base font-medium">
										{item.platform} comparable plan
									</span>
									<span className="text-lg font-black">${item.price}/mo</span>
								</div>
							))}
						</div>

						<div className="border-t-2 border-green-500/30 pt-4 flex justify-between items-baseline">
							<p className="text-xl font-black text-green-700 dark:text-green-400">
								ONE Platform Total
							</p>
							<p className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
								$0
							</p>
						</div>

						<p className="text-sm text-green-700 dark:text-green-400 pt-3 font-bold bg-green-500/10 rounded-lg px-4 py-3 text-center">
							💰 You save an average of ${monthlyValue}/month compared to
							competitors
						</p>
					</div>

					{/* Annual Savings */}
					<div className="rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 border-2 border-primary/30 p-8 text-center space-y-3 shadow-xl">
						<p className="text-base text-muted-foreground font-medium">
							Annual Savings
						</p>
						<p className="text-6xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
							${(monthlyValue * 12).toLocaleString()}
						</p>
						<p className="text-base text-muted-foreground font-medium">
							Keep this money.{" "}
							<span className="font-black text-green-600">
								Grow your business.
							</span>
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Footer Summary */}
			{showFooter && (
				<Card className="border-2 border-border/50 bg-card/50 backdrop-blur-xl shadow-xl">
					<CardContent className="pt-8 pb-8">
						<div className="text-center space-y-6">
							<h3 className="text-2xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
								Ready to Deploy?
							</h3>

							<p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
								All features above are included in your free tier.{" "}
								<span className="font-bold text-foreground">
									No credit card required.
								</span>{" "}
								<span className="font-bold text-foreground">
									No trial limits.
								</span>
								<br />
								Deploy unlimited apps. Scale globally.{" "}
								<span className="font-black text-green-600">
									Keep 100% of your revenue.
								</span>
							</p>

							{/* Feature Badges */}
							<div className="flex flex-wrap justify-center gap-3 pt-6">
								{[
									{
										label: "No Credit Card",
										icon: "💳",
										color: "from-blue-500 to-cyan-500",
									},
									{
										label: "No Trial Limits",
										icon: "⏱️",
										color: "from-purple-500 to-pink-500",
									},
									{
										label: "Production Ready",
										icon: "🚀",
										color: "from-green-500 to-emerald-500",
									},
									{
										label: "100% Free Forever",
										icon: "✨",
										color: "from-orange-500 to-red-500",
									},
								].map((item, idx) => (
									<Badge
										key={idx}
										variant="outline"
										className={`text-sm px-4 py-2 gap-2 border-2 bg-gradient-to-r ${item.color} bg-clip-text text-transparent border-current hover:scale-110 transition-transform duration-300 shadow-lg`}
									>
										<span className="text-2xl">{item.icon}</span>
										<span className="font-bold">{item.label}</span>
									</Badge>
								))}
							</div>

							{/* CTA Message */}
							<div className="pt-6 pb-2">
								<p className="text-xl font-bold text-foreground">
									Start building now.{" "}
									<span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
										Ship faster.
									</span>{" "}
									Pay nothing.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
