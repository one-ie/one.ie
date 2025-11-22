import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	// Base: rounded-sm (6px), inline-flex, text-xs
	"inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				// Default: bg-background, text-font
				default:
					"border-transparent bg-background text-font shadow",
				// Primary: bg-primary/10, text-primary
				primary:
					"border-transparent bg-primary/10 text-primary",
				// Secondary: bg-secondary/10, text-secondary
				secondary:
					"border-transparent bg-secondary/10 text-secondary",
				// Tertiary: bg-tertiary/10, text-tertiary
				tertiary:
					"border-transparent bg-tertiary/10 text-tertiary",
				// Outline: border-font/20, bg-transparent
				outline:
					"border-font/20 bg-transparent text-font",
				// Destructive (kept for compatibility)
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
