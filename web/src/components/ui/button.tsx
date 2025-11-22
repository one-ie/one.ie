import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-in-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
	{
		variants: {
			variant: {
				primary: "bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				default: "bg-[hsl(216_55%_25%)] text-white shadow-lg hover:bg-[hsl(216_55%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				secondary:
					"bg-[hsl(219_14%_28%)] text-white shadow-lg hover:bg-[hsl(219_14%_23%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				tertiary:
					"bg-[hsl(105_22%_25%)] text-white shadow-lg hover:bg-[hsl(105_22%_20%)] hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				destructive:
					"bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:shadow-xl hover:scale-[1.02] active:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 dark:bg-destructive/60",
				outline:
					"border-2 border-font/20 bg-transparent shadow-md hover:bg-primary/10 hover:shadow-lg hover:scale-[1.02] active:shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				ghost:
					"bg-transparent shadow-sm hover:bg-font/10 hover:shadow-md hover:scale-[1.02] active:shadow-xs active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
				link: "text-primary underline-offset-4 hover:underline hover:opacity-90 active:opacity-80",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
