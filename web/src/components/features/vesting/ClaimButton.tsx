/**
 * ClaimButton Component
 *
 * Button to claim vested tokens with loading and disabled states.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ClaimButtonProps {
	scheduleId: string;
	claimableAmount: number;
	tokenSymbol: string;
	disabled?: boolean;
	onClaim?: (scheduleId: string) => Promise<void>;
}

export function ClaimButton({
	scheduleId,
	claimableAmount,
	tokenSymbol,
	disabled = false,
	onClaim,
}: ClaimButtonProps) {
	const [claiming, setClaiming] = useState(false);
	const { toast } = useToast();

	const handleClaim = async () => {
		if (claimableAmount === 0) {
			toast({
				title: "Nothing to claim",
				description: "No tokens are currently available to claim.",
				variant: "destructive",
			});
			return;
		}

		setClaiming(true);

		try {
			if (onClaim) {
				await onClaim(scheduleId);
			} else {
				// Default Convex mutation call
				// await useMutation(api.vesting.claim)({ scheduleId });
				throw new Error("onClaim handler not provided");
			}

			toast({
				title: "Claim successful!",
				description: `You claimed ${claimableAmount.toLocaleString()} ${tokenSymbol}`,
			});
		} catch (error) {
			console.error("Claim failed:", error);
			toast({
				title: "Claim failed",
				description: error instanceof Error ? error.message : "Please try again.",
				variant: "destructive",
			});
		} finally {
			setClaiming(false);
		}
	};

	return (
		<Button
			onClick={handleClaim}
			disabled={disabled || claiming || claimableAmount === 0}
			className="w-full"
		>
			{claiming ? (
				<>
					<span className="mr-2">⏳</span>
					Claiming...
				</>
			) : claimableAmount > 0 ? (
				<>
					Claim {claimableAmount.toLocaleString()} {tokenSymbol}
				</>
			) : (
				"Nothing to Claim"
			)}
		</Button>
	);
}
