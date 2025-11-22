/**
 * VestingProgressBar Component
 *
 * Visual progress indicator showing vesting progress percentage.
 */

import { Progress } from "@/components/ui/progress";

interface VestingProgressBarProps {
	totalAmount: number;
	vestedAmount: number;
	claimedAmount: number;
	showLabels?: boolean;
}

export function VestingProgressBar({
	totalAmount,
	vestedAmount,
	claimedAmount,
	showLabels = true,
}: VestingProgressBarProps) {
	const vestedPercentage = (vestedAmount / totalAmount) * 100;
	const claimedPercentage = (claimedAmount / totalAmount) * 100;

	return (
		<div className="space-y-2">
			{showLabels && (
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Progress</span>
					<span className="font-medium">
						{vestedPercentage.toFixed(1)}% vested
					</span>
				</div>
			)}

			{/* Combined progress bar */}
			<div className="relative">
				{/* Total vested (background) */}
				<Progress value={vestedPercentage} className="h-3" />

				{/* Claimed amount (overlay) */}
				{claimedAmount > 0 && (
					<div
						className="absolute top-0 left-0 h-3 bg-green-500 rounded-full transition-all"
						style={{ width: `${claimedPercentage}%` }}
					/>
				)}
			</div>

			{showLabels && (
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>
						Claimed: {claimedAmount.toLocaleString()} ({claimedPercentage.toFixed(1)}%)
					</span>
					<span>
						Total: {totalAmount.toLocaleString()}
					</span>
				</div>
			)}

			{/* Legend */}
			<div className="flex gap-4 text-xs">
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-primary rounded-sm" />
					<span className="text-muted-foreground">Vested</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-green-500 rounded-sm" />
					<span className="text-muted-foreground">Claimed</span>
				</div>
			</div>
		</div>
	);
}
