/**
 * Downsell Offer Component
 *
 * Shows when user declines upsell offer.
 * Presents lower-priced alternative with one-click purchase.
 */

import { useState } from "react";
import { CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DownsellOfferProps {
	offerId: string;
	productName: string;
	originalPrice: number;
	downsellPrice: number;
	savings: number;
	features: string[];
	image?: string;
	onAccept: (offerId: string) => Promise<void>;
	onDecline: () => void;
}

export function DownsellOffer({
	offerId,
	productName,
	originalPrice,
	downsellPrice,
	savings,
	features,
	image,
	onAccept,
	onDecline,
}: DownsellOfferProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleAccept = async () => {
		setIsProcessing(true);
		setError(null);

		try {
			await onAccept(offerId);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to process order",
			);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
			<div className="max-w-2xl w-full">
				{/* Urgency Banner */}
				<div className="mb-6 text-center">
					<Badge variant="destructive" className="text-lg px-6 py-2 mb-3">
						<Clock className="w-4 h-4 mr-2 inline" />
						WAIT! Special One-Time Offer
					</Badge>
					<h1 className="text-3xl md:text-4xl font-bold mb-2">
						Before You Go...
					</h1>
					<p className="text-xl text-muted-foreground">
						Get {productName} at an exclusive discount
					</p>
				</div>

				<Card className="border-2 border-primary/20 shadow-xl">
					<CardHeader className="text-center pb-4">
						<div className="flex justify-between items-start mb-4">
							<Badge variant="secondary" className="text-sm">
								Last Chance Offer
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								onClick={onDecline}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
								<span className="sr-only">Skip offer</span>
							</Button>
						</div>

						<CardTitle className="text-2xl md:text-3xl">
							{productName}
						</CardTitle>

						{/* Price Display */}
						<div className="mt-6 mb-4">
							<div className="flex items-center justify-center gap-4">
								<span className="text-2xl text-muted-foreground line-through">
									${originalPrice.toFixed(2)}
								</span>
								<span className="text-5xl font-bold text-primary">
									${downsellPrice.toFixed(2)}
								</span>
							</div>
							<p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
								Save ${savings.toFixed(2)} ({Math.round((savings / originalPrice) * 100)}% OFF)
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								One-time payment • Instant access • 30-day guarantee
							</p>
						</div>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* Product Image */}
						{image && (
							<div className="flex justify-center">
								<img
									src={image}
									alt={productName}
									className="max-w-xs rounded-lg shadow-md"
								/>
							</div>
						)}

						<Separator />

						{/* Value Stack */}
						<div>
							<h3 className="font-semibold text-lg mb-4">
								What You'll Get:
							</h3>
							<ul className="space-y-3">
								{features.map((feature, index) => (
									<li key={index} className="flex items-start gap-3">
										<CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<Separator />

						{/* Urgency Messaging */}
						<div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-semibold text-yellow-900 dark:text-yellow-100">
										This Price Won't Last
									</p>
									<p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
										This special discount is only available right now. If you leave this page, you'll lose access to this exclusive pricing forever.
									</p>
								</div>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="bg-destructive/10 border border-destructive rounded-lg p-4">
								<p className="text-sm text-destructive">{error}</p>
							</div>
						)}
					</CardContent>

					<CardFooter className="flex flex-col gap-3 pt-6">
						{/* Accept Button (One-Click Purchase) */}
						<Button
							size="lg"
							className="w-full text-lg h-14"
							onClick={handleAccept}
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Processing Your Order...
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-5 w-5" />
									Yes! Add to My Order for ${downsellPrice.toFixed(2)}
								</>
							)}
						</Button>

						{/* Decline Button */}
						<Button
							variant="ghost"
							size="sm"
							className="w-full"
							onClick={onDecline}
							disabled={isProcessing}
						>
							No thanks, I'll pass on this offer
						</Button>

						{/* Trust Badges */}
						<div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
							<div className="flex items-center gap-1">
								<CheckCircle2 className="w-3 h-3" />
								<span>Secure Payment</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle2 className="w-3 h-3" />
								<span>30-Day Guarantee</span>
							</div>
							<div className="flex items-center gap-1">
								<CheckCircle2 className="w-3 h-3" />
								<span>Instant Access</span>
							</div>
						</div>
					</CardFooter>
				</Card>

				{/* Additional Social Proof */}
				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>
						Join 10,000+ customers who chose this upgrade • Average rating: 4.9/5 ⭐
					</p>
				</div>
			</div>
		</div>
	);
}
