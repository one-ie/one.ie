import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
	"relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
	{
		variants: {
			variant: {
				default: "bg-background text-font border-font/20 [&>svg]:text-font",
				info: "bg-primary/10 text-primary border-primary/30 [&>svg]:text-primary",
				success: "bg-tertiary/10 text-tertiary border-tertiary/30 [&>svg]:text-tertiary",
				warning: "bg-[hsl(30_100%_50%/0.1)] text-[hsl(30_100%_50%)] border-[hsl(30_100%_50%/0.3)] [&>svg]:text-[hsl(30_100%_50%)]",
				destructive: "bg-destructive/10 text-destructive border-destructive/30 [&>svg]:text-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
	<div
		ref={ref}
		role="alert"
		className={cn(alertVariants({ variant }), className)}
		{...props}
	/>
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("mb-1 font-medium leading-none tracking-tight", className)}
		{...props}
	/>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm [&_p]:leading-relaxed", className)}
		{...props}
	/>
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
