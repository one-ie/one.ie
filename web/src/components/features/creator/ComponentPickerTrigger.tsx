"use client";

/**
 * Component Picker Trigger
 *
 * CYCLE 15: Button to open component picker
 * Can be placed anywhere in the UI
 */

import { openComponentPicker } from "@/stores/componentPicker";
import { Button } from "@/components/ui/button";
import { PlusIcon, PackageIcon } from "lucide-react";

interface ComponentPickerTriggerProps {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
	label?: string;
	showIcon?: boolean;
	className?: string;
}

export function ComponentPickerTrigger({
	variant = "default",
	size = "default",
	label = "Add Component",
	showIcon = true,
	className,
}: ComponentPickerTriggerProps) {
	return (
		<Button
			variant={variant}
			size={size}
			onClick={openComponentPicker}
			className={className}
		>
			{showIcon && <PlusIcon className="h-4 w-4 mr-2" />}
			{label}
		</Button>
	);
}

/**
 * Floating Action Button (FAB) variant
 */
export function ComponentPickerFAB() {
	return (
		<Button
			size="icon"
			onClick={openComponentPicker}
			className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
		>
			<PackageIcon className="h-6 w-6" />
		</Button>
	);
}
