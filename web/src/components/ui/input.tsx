import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				// Base: 6-token design system (bg-foreground, border-font/20, text-font)
				"h-9 w-full min-w-0 rounded-md border border-font/20 bg-foreground px-3 py-1 text-base text-font shadow-sm transition-[color,box-shadow] outline-none",
				// Placeholder
				"placeholder:text-font/40",
				// Selection
				"selection:bg-primary selection:text-primary-foreground",
				// Focus state (ring-2 ring-primary)
				"focus:ring-2 focus:ring-primary focus:border-primary",
				// Disabled state (opacity-50, cursor-not-allowed)
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				// Invalid state
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20",
				// File input
				"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-font",
				// Responsive text size
				"md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
