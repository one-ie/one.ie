"use client";

import {
	CheckCircle,
	Copy,
	ExternalLink,
	Github,
	Package,
	Zap,
} from "lucide-react";
import type React from "react";
import { useState, useState as useStateCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SetupOption {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	badge: string;
	command: string;
	steps: string[];
	benefits: string[];
	timeEstimate: string;
}

const options: SetupOption[] = [
	{
		id: "ai-assisted",
		title: "AI-Assisted Setup",
		description:
			"Fastest way - Claude Code guides you through setup with intelligence",
		icon: <Zap className="w-6 h-6" />,
		badge: "Recommended",
		command: "npx oneie && claude",
		steps: [
			"Install ONE CLI globally",
			"Launch Claude Code IDE",
			"Run `/one` command in Claude",
			"Claude scaffolds your project",
			"Start building with AI assistance",
		],
		benefits: [
			"Real-time AI assistance",
			"Instant error debugging",
			"Best developer experience",
			"Learn patterns as you build",
		],
		timeEstimate: "5 minutes",
	},
	{
		id: "clone-repo",
		title: "Clone Repository",
		description: "Get the full example repo and start building immediately",
		icon: <Github className="w-6 h-6" />,
		badge: "Full Example",
		command: "git clone https://github.com/one-ie/one.git && cd one/web",
		steps: [
			"Clone the repository",
			"Navigate to web directory",
			"Install dependencies (bun install)",
			"Start dev server (bun run dev)",
			"Explore and customize example code",
		],
		benefits: [
			"Full working example",
			"All best practices included",
			"Real components to learn from",
			"Production-ready setup",
		],
		timeEstimate: "10 minutes",
	},
	{
		id: "npm-package",
		title: "Use NPM Package",
		description: "Minimal setup - just install and start using ONE features",
		icon: <Package className="w-6 h-6" />,
		badge: "Lightweight",
		command: "npm create astro@latest -- --template one-ie/minimal",
		steps: [
			"Create new Astro project with ONE template",
			"Install dependencies (npm install)",
			"Set up environment variables",
			"Start dev server (npm run dev)",
			"Begin with minimal boilerplate",
		],
		benefits: [
			"Minimal boilerplate",
			"Full control over structure",
			"Start from scratch",
			"Lightweight setup",
		],
		timeEstimate: "8 minutes",
	},
];

export function QuickStartOptions() {
	const [activeTab, setActiveTab] = useState("ai-assisted");
	const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

	const activeOption =
		options.find((opt) => opt.id === activeTab) || options[0];

	const copyCommand = (command: string) => {
		navigator.clipboard.writeText(command);
		setCopiedCommand(command);
		setTimeout(() => setCopiedCommand(null), 2000);
	};

	return (
		<div className="w-full">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2 bg-transparent">
					{options.map((option) => (
						<TabsTrigger
							key={option.id}
							value={option.id}
							className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							<div className="flex items-center gap-2">
								{option.icon}
								<span className="hidden sm:inline">{option.title}</span>
								<span className="sm:hidden">{option.title.split(" ")[0]}</span>
							</div>
							{option.badge === "Recommended" && (
								<Badge variant="secondary" className="ml-2 text-xs">
									⭐ Rec
								</Badge>
							)}
						</TabsTrigger>
					))}
				</TabsList>

				{options.map((option) => (
					<TabsContent
						key={option.id}
						value={option.id}
						className="mt-6 space-y-6"
					>
						{/* Command Box */}
						<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
							<CardHeader>
								<CardTitle className="text-lg">Get Started</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground">
										{option.description}
									</p>
									<div className="flex items-center gap-2 bg-black dark:bg-slate-900 rounded-lg p-3 font-mono text-sm text-white">
										<code className="flex-1 overflow-x-auto">
											{option.command}
										</code>
										<Button
											size="sm"
											variant="ghost"
											className="text-white hover:bg-white/20"
											onClick={() => copyCommand(option.command)}
										>
											{copiedCommand === option.command ? (
												<CheckCircle className="w-4 h-4" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
									<p className="text-xs text-muted-foreground text-right">
										Estimated time: <strong>{option.timeEstimate}</strong>
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Two Column Layout */}
						<div className="grid md:grid-cols-2 gap-6">
							{/* Steps */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Next Steps</CardTitle>
									<CardDescription>Follow these steps in order</CardDescription>
								</CardHeader>
								<CardContent>
									<ol className="space-y-3">
										{option.steps.map((step, idx) => (
											<li key={idx} className="flex gap-3 items-start">
												<div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
													{idx + 1}
												</div>
												<p className="text-sm pt-0.5">{step}</p>
											</li>
										))}
									</ol>
								</CardContent>
							</Card>

							{/* Benefits */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Why This Method?</CardTitle>
									<CardDescription>Key advantages</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{option.benefits.map((benefit, idx) => (
											<li key={idx} className="flex gap-2 items-start text-sm">
												<CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
												<span>{benefit}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</div>

						{/* CTA Buttons */}
						<div className="flex gap-3 justify-center flex-wrap">
							<Button size="lg" onClick={() => copyCommand(option.command)}>
								Copy Command
							</Button>
							<Button
								size="lg"
								variant="outline"
								onClick={() => window.open("https://docs.one.ie", "_blank")}
							>
								View Docs
								<ExternalLink className="w-4 h-4 ml-2" />
							</Button>
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
