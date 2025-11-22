/**
 * Session Recording Integration Example
 *
 * Cycle 78: Session Recording
 *
 * This file shows how to integrate session recording into a funnel page.
 * Copy and adapt this pattern for your funnels.
 */

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { startRecording } from "./session-recorder";
import type { SessionMetadata } from "./session-recorder";

/**
 * Example 1: Basic Integration
 *
 * Automatically start recording when visitor enters funnel.
 */
export function FunnelPage({ funnelId }: { funnelId: string }) {
	const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);
	const [isRecording, setIsRecording] = useState(false);

	useEffect(() => {
		// Start recording when page loads
		const stopRecording = startRecording({
			funnelId,
			onUpload: async (sessionData: SessionMetadata) => {
				try {
					await saveRecording({
						sessionId: sessionData.sessionId,
						visitorId: sessionData.visitorId,
						funnelId: sessionData.funnelId,
						startTime: sessionData.startTime,
						endTime: sessionData.endTime || Date.now(),
						duration: sessionData.duration || 0,
						pageViews: sessionData.pageViews,
						device: sessionData.device,
						conversion: sessionData.conversion,
						events: sessionData.events,
					});
					console.log("Session recording saved successfully");
				} catch (error) {
					console.error("Failed to save session recording:", error);
				}
			},
		});

		setIsRecording(true);

		// Stop recording when component unmounts
		return () => {
			stopRecording();
			setIsRecording(false);
		};
	}, [funnelId, saveRecording]);

	return (
		<div>
			{/* Optional: Show recording indicator */}
			{isRecording && (
				<div className="fixed bottom-4 right-4 z-50">
					<div className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white shadow-lg">
						<div className="h-2 w-2 animate-pulse rounded-full bg-white" />
						Recording
					</div>
				</div>
			)}

			{/* Your funnel content */}
			<h1>Welcome to Our Funnel</h1>
			{/* ... */}
		</div>
	);
}

/**
 * Example 2: With Conversion Tracking
 *
 * Track conversions and pass to session metadata.
 */
export function FunnelPageWithConversion({
	funnelId,
}: {
	funnelId: string;
}) {
	const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);
	const [sessionData, setSessionData] = useState<SessionMetadata | null>(null);
	const [recordingStop, setRecordingStop] = useState<(() => void) | null>(null);

	useEffect(() => {
		const stopRecording = startRecording({
			funnelId,
			onUpload: async (data: SessionMetadata) => {
				// Store session data for later
				setSessionData(data);

				// Save to Convex
				await saveRecording({
					sessionId: data.sessionId,
					visitorId: data.visitorId,
					funnelId: data.funnelId,
					startTime: data.startTime,
					endTime: data.endTime || Date.now(),
					duration: data.duration || 0,
					pageViews: data.pageViews,
					device: data.device,
					conversion: data.conversion,
					events: data.events,
				});
			},
		});

		setRecordingStop(() => stopRecording);

		return () => {
			stopRecording();
		};
	}, [funnelId, saveRecording]);

	// Handle conversion
	const handlePurchaseComplete = async (amount: number) => {
		if (sessionData) {
			// Update session with conversion data
			const updatedSession: SessionMetadata = {
				...sessionData,
				endTime: Date.now(),
				duration: Date.now() - sessionData.startTime,
				conversion: {
					converted: true,
					conversionType: "purchase",
					revenue: amount,
				},
			};

			// Save updated session
			await saveRecording({
				sessionId: updatedSession.sessionId,
				visitorId: updatedSession.visitorId,
				funnelId: updatedSession.funnelId,
				startTime: updatedSession.startTime,
				endTime: updatedSession.endTime || Date.now(),
				duration: updatedSession.duration || 0,
				pageViews: updatedSession.pageViews,
				device: updatedSession.device,
				conversion: updatedSession.conversion,
				events: updatedSession.events,
			});

			// Stop recording after conversion
			if (recordingStop) {
				recordingStop();
			}
		}
	};

	return (
		<div>
			<h1>Complete Your Purchase</h1>
			<button onClick={() => handlePurchaseComplete(99.99)}>
				Buy Now - $99.99
			</button>
		</div>
	);
}

/**
 * Example 3: Opt-in Recording (GDPR Compliant)
 *
 * Ask for user consent before recording.
 */
export function FunnelPageWithConsent({ funnelId }: { funnelId: string }) {
	const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);
	const [hasConsent, setHasConsent] = useState(false);
	const [showBanner, setShowBanner] = useState(true);

	useEffect(() => {
		// Check if user has already given consent
		const consent = localStorage.getItem("recording-consent");
		if (consent === "true") {
			setHasConsent(true);
			setShowBanner(false);
		}
	}, []);

	useEffect(() => {
		if (!hasConsent) return;

		// Only start recording if consent given
		const stopRecording = startRecording({
			funnelId,
			onUpload: async (sessionData: SessionMetadata) => {
				await saveRecording({
					sessionId: sessionData.sessionId,
					visitorId: sessionData.visitorId,
					funnelId: sessionData.funnelId,
					startTime: sessionData.startTime,
					endTime: sessionData.endTime || Date.now(),
					duration: sessionData.duration || 0,
					pageViews: sessionData.pageViews,
					device: sessionData.device,
					conversion: sessionData.conversion,
					events: sessionData.events,
				});
			},
		});

		return () => {
			stopRecording();
		};
	}, [hasConsent, funnelId, saveRecording]);

	const handleAccept = () => {
		localStorage.setItem("recording-consent", "true");
		setHasConsent(true);
		setShowBanner(false);
	};

	const handleDecline = () => {
		localStorage.setItem("recording-consent", "false");
		setShowBanner(false);
	};

	return (
		<div>
			{/* Consent Banner */}
			{showBanner && (
				<div className="fixed bottom-0 left-0 right-0 z-50 bg-card p-4 shadow-lg">
					<div className="mx-auto max-w-4xl">
						<p className="text-sm text-foreground">
							We use session recording to improve your experience. This includes
							recording your interactions with our website.{" "}
							<a href="/privacy" className="text-primary underline">
								Learn more
							</a>
						</p>
						<div className="mt-3 flex gap-3">
							<button
								onClick={handleAccept}
								className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
							>
								Accept
							</button>
							<button
								onClick={handleDecline}
								className="rounded border px-4 py-2 text-sm"
							>
								Decline
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Your funnel content */}
			<h1>Welcome to Our Funnel</h1>
			{/* ... */}
		</div>
	);
}

/**
 * Example 4: Astro Page Integration
 *
 * Use in Astro pages with client:load directive.
 */

// In your Astro page:
/*
---
// src/pages/funnels/[id]/index.astro
import { FunnelPage } from '@/components/funnel/FunnelPage';

const { id } = Astro.params;
---

<Layout>
  <FunnelPage funnelId={id} client:load />
</Layout>
*/

/**
 * Example 5: Privacy-Enhanced Recording
 *
 * Block sensitive pages and mask custom fields.
 */
export function PrivacyEnhancedFunnelPage({
	funnelId,
	isAuthPage = false,
}: {
	funnelId: string;
	isAuthPage?: boolean;
}) {
	const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);

	useEffect(() => {
		// Don't record on authentication pages
		if (isAuthPage) {
			console.log("Skipping recording on auth page");
			return;
		}

		const stopRecording = startRecording({
			funnelId,
			onUpload: async (sessionData: SessionMetadata) => {
				await saveRecording({
					sessionId: sessionData.sessionId,
					visitorId: sessionData.visitorId,
					funnelId: sessionData.funnelId,
					startTime: sessionData.startTime,
					endTime: sessionData.endTime || Date.now(),
					duration: sessionData.duration || 0,
					pageViews: sessionData.pageViews,
					device: sessionData.device,
					conversion: sessionData.conversion,
					events: sessionData.events,
				});
			},
		});

		return () => {
			stopRecording();
		};
	}, [isAuthPage, funnelId, saveRecording]);

	return (
		<div>
			{/* Sensitive data - will be masked automatically */}
			<input
				type="password"
				placeholder="Password"
				// Automatically masked as ••••••••
			/>

			{/* Custom masking */}
			<div data-recording="mask">
				This content will be masked in recordings
			</div>

			{/* Block from recording entirely */}
			<div data-recording="block">
				This content will NOT appear in recordings
			</div>

			{/* Credit card - will be masked */}
			<input
				data-type="credit-card"
				placeholder="Card Number"
				// Masked as •••• •••• •••• ••••
			/>
		</div>
	);
}

/**
 * Example 6: Multi-Step Funnel
 *
 * Track progress through multi-step funnels.
 */
export function MultiStepFunnel({ funnelId }: { funnelId: string }) {
	const saveRecording = useMutation(api.mutations.analytics.saveSessionRecording);
	const [currentStep, setCurrentStep] = useState(1);
	const [sessionData, setSessionData] = useState<SessionMetadata | null>(null);

	useEffect(() => {
		const stopRecording = startRecording({
			funnelId,
			onUpload: async (data: SessionMetadata) => {
				setSessionData(data);

				await saveRecording({
					sessionId: data.sessionId,
					visitorId: data.visitorId,
					funnelId: data.funnelId,
					startTime: data.startTime,
					endTime: data.endTime || Date.now(),
					duration: data.duration || 0,
					pageViews: data.pageViews,
					device: data.device,
					conversion: data.conversion,
					events: data.events,
				});
			},
		});

		return () => {
			stopRecording();
		};
	}, [funnelId, saveRecording]);

	const nextStep = () => {
		setCurrentStep(currentStep + 1);
	};

	const previousStep = () => {
		setCurrentStep(currentStep - 1);
	};

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Step {currentStep} of 3
				</div>
				<div className="flex gap-1">
					{[1, 2, 3].map((step) => (
						<div
							key={step}
							className={`h-2 w-8 rounded ${
								step === currentStep
									? "bg-primary"
									: step < currentStep
										? "bg-green-500"
										: "bg-gray-300"
							}`}
						/>
					))}
				</div>
			</div>

			{currentStep === 1 && (
				<div>
					<h2>Step 1: Your Information</h2>
					<button onClick={nextStep}>Next</button>
				</div>
			)}

			{currentStep === 2 && (
				<div>
					<h2>Step 2: Choose Plan</h2>
					<button onClick={previousStep}>Back</button>
					<button onClick={nextStep}>Next</button>
				</div>
			)}

			{currentStep === 3 && (
				<div>
					<h2>Step 3: Payment</h2>
					<button onClick={previousStep}>Back</button>
					<button>Complete Purchase</button>
				</div>
			)}
		</div>
	);
}
