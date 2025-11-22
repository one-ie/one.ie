/**
 * A/B Test Status Badge Component
 *
 * Enhanced status badges for A/B tests with:
 * - Running (animated pulse)
 * - Completed (blue)
 * - Paused (outline)
 * - Scheduled (purple)
 * - Archived (secondary)
 * - Draft (gray)
 *
 * Part of Cycle 95: A/B Test UI Polish
 */

import { Badge } from "@/components/ui/badge";
import {
	Clock,
	Pause,
	CheckCircle,
	Archive,
	FileEdit,
	Calendar,
} from "lucide-react";

type TestStatus = "running" | "completed" | "paused" | "scheduled" | "archived" | "draft";

interface ABTestStatusBadgeProps {
	status: TestStatus;
	className?: string;
	showIcon?: boolean;
	size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
	TestStatus,
	{
		label: string;
		className: string;
		icon: any;
		animated?: boolean;
	}
> = {
	running: {
		label: "Running",
		className: "bg-green-600 text-white hover:bg-green-700",
		icon: Clock,
		animated: true,
	},
	completed: {
		label: "Completed",
		className: "bg-blue-600 text-white hover:bg-blue-700",
		icon: CheckCircle,
	},
	paused: {
		label: "Paused",
		className: "border-yellow-600 text-yellow-700 dark:text-yellow-400",
		icon: Pause,
	},
	scheduled: {
		label: "Scheduled",
		className: "bg-purple-600 text-white hover:bg-purple-700",
		icon: Calendar,
	},
	archived: {
		label: "Archived",
		className: "bg-gray-500 text-white hover:bg-gray-600",
		icon: Archive,
	},
	draft: {
		label: "Draft",
		className: "border-gray-400 text-gray-600 dark:text-gray-400",
		icon: FileEdit,
	},
};

export function ABTestStatusBadge({
	status,
	className = "",
	showIcon = true,
	size = "md",
}: ABTestStatusBadgeProps) {
	const config = STATUS_CONFIG[status];
	const Icon = config.icon;

	const sizeClasses = {
		sm: "text-xs px-2 py-0.5",
		md: "text-sm px-2.5 py-1",
		lg: "text-base px-3 py-1.5",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-5 w-5",
	};

	return (
		<Badge
			variant={status === "paused" || status === "draft" ? "outline" : "default"}
			className={`${config.className} ${sizeClasses[size]} ${className}`}
		>
			<span className="flex items-center gap-1.5">
				{showIcon && (
					<>
						{config.animated ? (
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
							</span>
						) : (
							<Icon className={iconSizes[size]} />
						)}
					</>
				)}
				{config.label}
			</span>
		</Badge>
	);
}
