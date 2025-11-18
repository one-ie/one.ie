import { VideoPlayer } from "@/components/media/VideoPlayer";
import { Button } from "@/components/ui/button";

interface Chapter {
	startTime: number;
	text: string;
}

interface FeaturedPodcastProps {
	title: string;
	description: string;
	audioUrl: string;
	duration: string;
	slug: string;
	chapters?: Chapter[];
}

/**
 * Featured Podcast Component
 *
 * Displays a prominent featured podcast with audio player on the home page.
 * Designed to showcase the ONE ontology podcast above the "How It Works" section.
 */
export function FeaturedPodcast({
	title,
	description,
	audioUrl,
	duration,
	slug,
	chapters = [],
}: FeaturedPodcastProps) {
	return (
		<section className="px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32 bg-muted/30">
			<div className="mx-auto max-w-full sm:max-w-6xl">
				<div className="mb-12 space-y-4 text-center">
					<div className="rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground mb-2 inline-flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4"
						>
							<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
							<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
							<line x1="12" x2="12" y1="19" y2="22"></line>
						</svg>
						Featured Podcast · {duration} min
					</div>
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
						{title}
					</h2>
					<p className="mx-auto max-w-3xl text-base sm:text-lg leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>

				{/* Audio Player */}
				<div className="mb-8">
					<div className="w-full max-w-4xl mx-auto">
						<audio
							controls
							className="w-full rounded-lg shadow-lg bg-card border"
							preload="metadata"
						>
							<source src={audioUrl} type="audio/mpeg" />
							Your browser does not support the audio element.
						</audio>
					</div>
				</div>

				{/* CTA Button */}
				<div className="text-center">
					<a href={`/podcasts/${slug}`}>
						<Button
							size="lg"
							className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
						>
							Read Full Transcript
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="ml-2 h-5 w-5"
							>
								<path d="M5 12h14"></path>
								<path d="m12 5 7 7-7 7"></path>
							</svg>
						</Button>
					</a>
				</div>
			</div>
		</section>
	);
}
