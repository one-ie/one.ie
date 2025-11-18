/**
 * YouTube Data API v3 Service
 *
 * Fetches video data from YouTube channel using YouTube Data API v3.
 *
 * Required environment variables:
 * - YOUTUBE_API_KEY: Your YouTube Data API v3 key
 * - YOUTUBE_CHANNEL_ID: Your YouTube channel ID
 *
 * Setup instructions:
 * 1. Get API key: https://console.cloud.google.com/apis/credentials
 * 2. Enable YouTube Data API v3
 * 3. Find channel ID: YouTube Studio > Settings > Channel > Advanced settings
 */

// YouTube API types
export interface YouTubeVideo {
	id: string;
	title: string;
	description: string;
	thumbnail: string;
	thumbnails: {
		default: { url: string; width: number; height: number };
		medium: { url: string; width: number; height: number };
		high: { url: string; width: number; height: number };
		standard?: { url: string; width: number; height: number };
		maxres?: { url: string; width: number; height: number };
	};
	publishedAt: Date;
	duration: number; // in seconds
	viewCount: number;
	likeCount: number;
	commentCount: number;
	tags: string[];
	categoryId: string;
	channelTitle: string;
}

export interface YouTubeAPIResponse {
	kind: string;
	etag: string;
	items: YouTubeAPIItem[];
	pageInfo: {
		totalResults: number;
		resultsPerPage: number;
	};
	nextPageToken?: string;
	prevPageToken?: string;
}

export interface YouTubeAPIItem {
	kind: string;
	etag: string;
	id: string | { kind: string; videoId: string };
	snippet: {
		publishedAt: string;
		channelId: string;
		title: string;
		description: string;
		thumbnails: {
			default: { url: string; width: number; height: number };
			medium: { url: string; width: number; height: number };
			high: { url: string; width: number; height: number };
			standard?: { url: string; width: number; height: number };
			maxres?: { url: string; width: number; height: number };
		};
		channelTitle: string;
		tags?: string[];
		categoryId: string;
	};
	contentDetails?: {
		duration: string; // ISO 8601 format (PT4M13S)
		dimension: string;
		definition: string;
		caption: string;
		licensedContent: boolean;
		projection: string;
	};
	statistics?: {
		viewCount: string;
		likeCount: string;
		favoriteCount: string;
		commentCount: string;
	};
}

/**
 * Convert ISO 8601 duration to seconds
 * Example: PT4M13S -> 253 seconds
 */
function parseDuration(duration: string): number {
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;

	const hours = parseInt(match[1] || "0");
	const minutes = parseInt(match[2] || "0");
	const seconds = parseInt(match[3] || "0");

	return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration in seconds to human-readable format
 * Example: 253 -> "4:13"
 */
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Fetch videos from YouTube channel
 *
 * @param apiKey YouTube Data API v3 key
 * @param channelId YouTube channel ID
 * @param maxResults Maximum number of videos to fetch (default: 50, max: 50)
 * @returns Array of YouTubeVideo objects
 */
export async function fetchYouTubeVideos(
	apiKey: string,
	channelId: string,
	maxResults: number = 50,
): Promise<YouTubeVideo[]> {
	try {
		// Step 1: Get list of video IDs from channel
		const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
		searchUrl.searchParams.set("key", apiKey);
		searchUrl.searchParams.set("channelId", channelId);
		searchUrl.searchParams.set("part", "snippet");
		searchUrl.searchParams.set("order", "date"); // Sort by newest first
		searchUrl.searchParams.set("type", "video");
		searchUrl.searchParams.set(
			"maxResults",
			Math.min(maxResults, 50).toString(),
		);

		const searchResponse = await fetch(searchUrl.toString());

		if (!searchResponse.ok) {
			const errorData = await searchResponse.json();
			throw new Error(
				`YouTube API error: ${searchResponse.status} - ${errorData.error?.message || "Unknown error"}`,
			);
		}

		const searchData: YouTubeAPIResponse = await searchResponse.json();

		if (!searchData.items || searchData.items.length === 0) {
			console.warn("No videos found for channel:", channelId);
			return [];
		}

		// Extract video IDs
		const videoIds = searchData.items
			.map((item) => {
				if (typeof item.id === "string") return item.id;
				if (typeof item.id === "object" && item.id.videoId)
					return item.id.videoId;
				return null;
			})
			.filter((id): id is string => id !== null);

		if (videoIds.length === 0) {
			console.warn("No valid video IDs found");
			return [];
		}

		// Step 2: Get detailed video information (including duration, stats)
		const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
		videosUrl.searchParams.set("key", apiKey);
		videosUrl.searchParams.set("id", videoIds.join(","));
		videosUrl.searchParams.set("part", "snippet,contentDetails,statistics");

		const videosResponse = await fetch(videosUrl.toString());

		if (!videosResponse.ok) {
			const errorData = await videosResponse.json();
			throw new Error(
				`YouTube API error: ${videosResponse.status} - ${errorData.error?.message || "Unknown error"}`,
			);
		}

		const videosData: YouTubeAPIResponse = await videosResponse.json();

		// Step 3: Transform API response to our format
		const videos: YouTubeVideo[] = videosData.items.map((item) => ({
			id: typeof item.id === "string" ? item.id : item.id.videoId,
			title: item.snippet.title,
			description: item.snippet.description,
			thumbnail:
				item.snippet.thumbnails.high?.url ||
				item.snippet.thumbnails.medium?.url ||
				item.snippet.thumbnails.default.url,
			thumbnails: item.snippet.thumbnails,
			publishedAt: new Date(item.snippet.publishedAt),
			duration: item.contentDetails
				? parseDuration(item.contentDetails.duration)
				: 0,
			viewCount: parseInt(item.statistics?.viewCount || "0"),
			likeCount: parseInt(item.statistics?.likeCount || "0"),
			commentCount: parseInt(item.statistics?.commentCount || "0"),
			tags: item.snippet.tags || [],
			categoryId: item.snippet.categoryId,
			channelTitle: item.snippet.channelTitle,
		}));

		return videos;
	} catch (error) {
		console.error("Error fetching YouTube videos:", error);
		throw error;
	}
}

/**
 * Fetch a single video by ID
 *
 * @param apiKey YouTube Data API v3 key
 * @param videoId YouTube video ID
 * @returns YouTubeVideo object or null if not found
 */
export async function fetchYouTubeVideo(
	apiKey: string,
	videoId: string,
): Promise<YouTubeVideo | null> {
	try {
		const url = new URL("https://www.googleapis.com/youtube/v3/videos");
		url.searchParams.set("key", apiKey);
		url.searchParams.set("id", videoId);
		url.searchParams.set("part", "snippet,contentDetails,statistics");

		const response = await fetch(url.toString());

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`YouTube API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
			);
		}

		const data: YouTubeAPIResponse = await response.json();

		if (!data.items || data.items.length === 0) {
			return null;
		}

		const item = data.items[0];

		return {
			id: typeof item.id === "string" ? item.id : item.id.videoId,
			title: item.snippet.title,
			description: item.snippet.description,
			thumbnail:
				item.snippet.thumbnails.high?.url ||
				item.snippet.thumbnails.medium?.url ||
				item.snippet.thumbnails.default.url,
			thumbnails: item.snippet.thumbnails,
			publishedAt: new Date(item.snippet.publishedAt),
			duration: item.contentDetails
				? parseDuration(item.contentDetails.duration)
				: 0,
			viewCount: parseInt(item.statistics?.viewCount || "0"),
			likeCount: parseInt(item.statistics?.likeCount || "0"),
			commentCount: parseInt(item.statistics?.commentCount || "0"),
			tags: item.snippet.tags || [],
			categoryId: item.snippet.categoryId,
			channelTitle: item.snippet.channelTitle,
		};
	} catch (error) {
		console.error("Error fetching YouTube video:", error);
		throw error;
	}
}

/**
 * Get channel information
 *
 * @param apiKey YouTube Data API v3 key
 * @param channelId YouTube channel ID
 * @returns Channel information
 */
export async function fetchChannelInfo(apiKey: string, channelId: string) {
	try {
		const url = new URL("https://www.googleapis.com/youtube/v3/channels");
		url.searchParams.set("key", apiKey);
		url.searchParams.set("id", channelId);
		url.searchParams.set("part", "snippet,statistics");

		const response = await fetch(url.toString());

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`YouTube API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
			);
		}

		const data = await response.json();

		if (!data.items || data.items.length === 0) {
			throw new Error("Channel not found");
		}

		const channel = data.items[0];

		return {
			id: channel.id,
			title: channel.snippet.title,
			description: channel.snippet.description,
			customUrl: channel.snippet.customUrl,
			publishedAt: new Date(channel.snippet.publishedAt),
			thumbnails: channel.snippet.thumbnails,
			subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
			videoCount: parseInt(channel.statistics?.videoCount || "0"),
			viewCount: parseInt(channel.statistics?.viewCount || "0"),
		};
	} catch (error) {
		console.error("Error fetching channel info:", error);
		throw error;
	}
}
