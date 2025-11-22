import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import type { RiskScore } from "./types";

interface RiskScoreCardProps {
	score: RiskScore | null;
	isLoading?: boolean;
}

export function RiskScoreCard({
	score,
	isLoading = false,
}: RiskScoreCardProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Risk Assessment</CardTitle>
				</CardHeader>
				<CardContent>
					<Skeleton className="h-[300px] w-full" />
				</CardContent>
			</Card>
		);
	}

	if (!score) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Risk Assessment</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No risk data available
					</div>
				</CardContent>
			</Card>
		);
	}

	const getRiskLevel = (score: number) => {
		if (score >= 70) return { label: "High Risk", color: "text-red-600" };
		if (score >= 40) return { label: "Medium Risk", color: "text-yellow-600" };
		return { label: "Low Risk", color: "text-green-600" };
	};

	const risk = getRiskLevel(score.overallScore);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Risk Assessment</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Overall Score */}
				<div className="flex flex-col items-center justify-center space-y-2">
					<div className={`text-6xl font-bold ${risk.color}`}>
						{score.overallScore}
					</div>
					<Badge
						variant={
							score.overallScore >= 70
								? "destructive"
								: score.overallScore >= 40
									? "outline"
									: "default"
						}
						className="text-sm"
					>
						{risk.label}
					</Badge>
				</div>

				{/* Risk Factors */}
				<div className="space-y-3">
					<h4 className="text-sm font-medium">Risk Factors</h4>
					<div className="space-y-3">
						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Rug Pull Risk</span>
								<span className="font-medium">
									{score.factors.rugPullRisk}/100
								</span>
							</div>
							<Progress value={score.factors.rugPullRisk} className="h-2" />
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Liquidity Risk</span>
								<span className="font-medium">
									{score.factors.liquidityRisk}/100
								</span>
							</div>
							<Progress value={score.factors.liquidityRisk} className="h-2" />
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Concentration Risk</span>
								<span className="font-medium">
									{score.factors.concentrationRisk}/100
								</span>
							</div>
							<Progress
								value={score.factors.concentrationRisk}
								className="h-2"
							/>
						</div>

						<div className="space-y-1">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Contract Risk</span>
								<span className="font-medium">
									{score.factors.contractRisk}/100
								</span>
							</div>
							<Progress value={score.factors.contractRisk} className="h-2" />
						</div>
					</div>
				</div>

				{/* Signals */}
				<div className="space-y-3">
					{score.signals.redFlags.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-red-600">
								<AlertTriangle className="h-4 w-4" />
								<span>Red Flags</span>
							</div>
							<ul className="space-y-1 text-xs text-muted-foreground">
								{score.signals.redFlags.map((flag, index) => (
									<li key={index} className="flex items-start gap-2">
										<span className="mt-0.5">•</span>
										<span>{flag}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{score.signals.yellowFlags.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
								<AlertCircle className="h-4 w-4" />
								<span>Warnings</span>
							</div>
							<ul className="space-y-1 text-xs text-muted-foreground">
								{score.signals.yellowFlags.map((flag, index) => (
									<li key={index} className="flex items-start gap-2">
										<span className="mt-0.5">•</span>
										<span>{flag}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{score.signals.greenFlags.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-green-600">
								<CheckCircle className="h-4 w-4" />
								<span>Positive Signals</span>
							</div>
							<ul className="space-y-1 text-xs text-muted-foreground">
								{score.signals.greenFlags.map((flag, index) => (
									<li key={index} className="flex items-start gap-2">
										<span className="mt-0.5">•</span>
										<span>{flag}</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
