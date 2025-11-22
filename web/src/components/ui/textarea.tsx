import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				// Base: 6-token design system (bg-foreground, border-font/20, text-font)
				"flex min-h-[60px] w-full rounded-md border border-font/20 bg-foreground px-3 py-2 text-base text-font shadow-sm",
				// Placeholder
				"placeholder:text-font/40",
				// Focus state (ring-2 ring-primary)
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				// Disabled state
				"disabled:cursor-not-allowed disabled:opacity-50",
				// Responsive text size
				"md:text-sm",
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
