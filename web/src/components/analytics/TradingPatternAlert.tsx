import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	TrendingUp,
	TrendingDown,
	Activity,
	Minus,
	AlertTriangle,
} from "lucide-react";
import type { TradingPattern } from "./types";
import { formatDistanceToNow } from "date-fns";

interface TradingPatternAlertProps {
	pattern: TradingPattern | null;
}

export function TradingPatternAlert({ pattern }: TradingPatternAlertProps) {
	if (!pattern) {
		return null;
	}

	const getPatternConfig = (patternType: TradingPattern["pattern"]) => {
		switch (patternType) {
			case "accumulation":
				return {
					variant: "default" as const,
					icon: TrendingUp,
					color: "text-green-600",
					bgColor: "bg-green-50 dark:bg-green-950",
					title: "Accumulation Pattern Detected",
					description:
						"Large wallets are accumulating tokens. This could signal confidence in the project.",
				};
			case "distribution":
				return {
					variant: "destructive" as const,
					icon: TrendingDown,
					color: "text-red-600",
					bgColor: "bg-red-50 dark:bg-red-950",
					title: "Distribution Pattern Detected",
					description:
						"Large wallets are distributing tokens. Exercise caution as this may indicate profit-taking.",
				};
			case "pump":
				return {
					variant: "destructive" as const,
					icon: AlertTriangle,
					color: "text-orange-600",
					bgColor: "bg-orange-50 dark:bg-orange-950",
					title: "Pump Pattern Detected",
					description:
						"Unusual price movement detected. This could be a coordinated pump. Trade with extreme caution.",
				};
			case "stable":
				return {
					variant: "default" as const,
					icon: Minus,
					color: "text-blue-600",
					bgColor: "bg-blue-50 dark:bg-blue-950",
					title: "Stable Trading Pattern",
					description:
						"Price and volume are stable with normal trading activity.",
				};
		}
	};

	const config = getPatternConfig(pattern.pattern);
	const Icon = config.icon;

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.8) return "bg-green-500";
		if (confidence >= 0.6) return "bg-yellow-500";
		return "bg-orange-500";
	};

	return (
		<Alert variant={config.variant} className={config.bgColor}>
			<Icon className="h-4 w-4" />
			<AlertTitle className="flex items-center justify-between">
				<span>{config.title}</span>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs">
						{(pattern.confidence * 100).toFixed(0)}% confidence
					</Badge>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(pattern.detectedAt), {
							addSuffix: true,
						})}
					</span>
				</div>
			</AlertTitle>
			<AlertDescription className="space-y-2">
				<p>{config.description}</p>
				{pattern.description && (
					<p className="text-sm text-muted-foreground">{pattern.description}</p>
				)}
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium">Confidence Level:</span>
					<div className="flex h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-muted">
						<div
							className={`${getConfidenceColor(pattern.confidence)} transition-all`}
							style={{ width: `${pattern.confidence * 100}%` }}
						/>
					</div>
				</div>
			</AlertDescription>
		</Alert>
	);
}
