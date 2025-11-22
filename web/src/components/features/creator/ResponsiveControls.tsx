"use client";

import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewportSize = "desktop" | "tablet" | "mobile";

interface ResponsiveControlsProps {
	viewport: ViewportSize;
	onChange: (viewport: ViewportSize) => void;
	className?: string;
}

export function ResponsiveControls({
	viewport,
	onChange,
	className,
}: ResponsiveControlsProps) {
	const viewports: Array<{
		id: ViewportSize;
		label: string;
		icon: typeof MonitorIcon;
		width: string;
	}> = [
		{
			id: "desktop",
			label: "Desktop",
			icon: MonitorIcon,
			width: "1920px",
		},
		{
			id: "tablet",
			label: "Tablet",
			icon: TabletIcon,
			width: "768px",
		},
		{
			id: "mobile",
			label: "Mobile",
			icon: SmartphoneIcon,
			width: "375px",
		},
	];

	return (
		<div className={cn("flex items-center gap-1", className)}>
			{viewports.map((v) => {
				const Icon = v.icon;
				return (
					<Button
						key={v.id}
						variant={viewport === v.id ? "default" : "ghost"}
						size="sm"
						onClick={() => onChange(v.id)}
						className={cn(
							"h-8 gap-2 px-3",
							viewport === v.id && "bg-primary text-primary-foreground"
						)}
					>
						<Icon className="h-4 w-4" />
						<span className="hidden sm:inline">{v.label}</span>
						<span className="text-xs text-muted-foreground hidden md:inline">
							{v.width}
						</span>
					</Button>
				);
			})}
		</div>
	);
}

/**
 * Get viewport width for a given size
 */
export function getViewportWidth(viewport: ViewportSize): string {
	switch (viewport) {
		case "mobile":
			return "375px";
		case "tablet":
			return "768px";
		default:
			return "100%";
	}
}

/**
 * Get viewport class for a given size
 */
export function getViewportClass(viewport: ViewportSize): string {
	switch (viewport) {
		case "mobile":
			return "max-w-[375px]";
		case "tablet":
			return "max-w-[768px]";
		default:
			return "w-full";
	}
}
