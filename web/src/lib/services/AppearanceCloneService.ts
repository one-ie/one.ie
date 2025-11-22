/**
 * Appearance Clone Service
 *
 * CYCLE 5: HeyGen API integration for avatar creation and video generation
 *
 * Provides:
 * - Upload creator photo
 * - Create talking head avatar via HeyGen API
 * - Generate video responses with avatar + voice
 * - Stream video responses
 * - Track generation status
 *
 * HeyGen API: https://docs.heygen.com/reference/api-overview
 *
 * Usage:
 *   import { AppearanceCloneService } from '@/lib/services/AppearanceCloneService';
 *
 *   const service = new AppearanceCloneService(apiKey);
 *   const avatarId = await service.createAvatar(photoFile);
 *   const videoUrl = await service.generateVideo(avatarId, text, voiceAudio);
 */

import { Effect } from "effect";

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarCreationInput {
  photo: File | Blob;
  name: string;
  gender?: "male" | "female";
}

export interface AvatarCreationResult {
  avatarId: string;
  status: "processing" | "completed" | "failed";
  thumbnailUrl?: string;
  processingTime?: number;
}

export interface VideoGenerationInput {
  avatarId: string;
  text: string;
  voiceUrl?: string; // Optional: Use cloned voice audio
  voiceId?: string; // Or use HeyGen's built-in voices
  background?: string; // Background color or image
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export interface VideoGenerationResult {
  videoId: string;
  status: "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  processingTime?: number;
}

export interface VideoGenerationProgress {
  videoId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  eta?: number; // Estimated time in seconds
  error?: string;
}

// ============================================================================
// ERRORS
// ============================================================================

export class AppearanceCloneError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppearanceCloneError";
  }
}

export class AvatarCreationError extends AppearanceCloneError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "AvatarCreationError";
  }
}

export class VideoGenerationError extends AppearanceCloneError {
  constructor(message: string, code?: string, statusCode?: number) {
    super(message, code, statusCode);
    this.name = "VideoGenerationError";
  }
}

// ============================================================================
// HEYGEN API SERVICE
// ============================================================================

/**
 * HeyGen API Service for avatar creation and video generation
 *
 * @example
 * ```typescript
 * const service = new AppearanceCloneService(process.env.HEYGEN_API_KEY);
 *
 * // Create avatar from photo
 * const avatar = await service.createAvatar({
 *   photo: photoFile,
 *   name: "John Doe Avatar",
 *   gender: "male"
 * });
 *
 * // Generate video with avatar
 * const video = await service.generateVideo({
 *   avatarId: avatar.avatarId,
 *   text: "Hello! This is my AI clone speaking.",
 *   voiceUrl: "https://example.com/voice.mp3"
 * });
 * ```
 */
export class AppearanceCloneService {
  private apiKey: string;
  private baseUrl = "https://api.heygen.com/v2";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.HEYGEN_API_KEY || "";

    if (!this.apiKey) {
      throw new AppearanceCloneError(
        "HeyGen API key not configured. Set HEYGEN_API_KEY environment variable."
      );
    }
  }

  /**
   * Create avatar from photo
   *
   * Uploads creator photo and initiates avatar creation.
   * Processing typically takes 30-60 seconds.
   *
   * @param input - Avatar creation parameters
   * @returns Avatar creation result with status
   */
  async createAvatar(
    input: AvatarCreationInput
  ): Promise<AvatarCreationResult> {
    try {
      // 1. Upload photo to HeyGen
      const uploadedUrl = await this.uploadPhoto(input.photo);

      // 2. Create avatar request
      const response = await fetch(`${this.baseUrl}/avatar`, {
        method: "POST",
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar_name: input.name,
          avatar_image: uploadedUrl,
          gender: input.gender || "male",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AvatarCreationError(
          error.message || "Avatar creation failed",
          error.code,
          response.status
        );
      }

      const data = await response.json();

      return {
        avatarId: data.data.avatar_id,
        status: data.data.status || "processing",
        thumbnailUrl: data.data.thumbnail_url,
        processingTime: data.data.processing_time,
      };
    } catch (error) {
      if (error instanceof AvatarCreationError) {
        throw error;
      }
      throw new AvatarCreationError(
        `Failed to create avatar: ${String(error)}`
      );
    }
  }

  /**
   * Upload photo to HeyGen storage
   *
   * @param photo - Photo file or blob
   * @returns Uploaded photo URL
   */
  private async uploadPhoto(photo: File | Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", photo);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        headers: {
          "X-Api-Key": this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AppearanceCloneError(
          error.message || "Photo upload failed",
          error.code,
          response.status
        );
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      if (error instanceof AppearanceCloneError) {
        throw error;
      }
      throw new AppearanceCloneError(`Failed to upload photo: ${String(error)}`);
    }
  }

  /**
   * Generate video with avatar
   *
   * Creates a talking head video with the specified avatar and text.
   * Supports custom voice audio or HeyGen's built-in voices.
   *
   * @param input - Video generation parameters
   * @returns Video generation result with status
   */
  async generateVideo(
    input: VideoGenerationInput
  ): Promise<VideoGenerationResult> {
    try {
      // Build video generation request
      const requestBody: any = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: input.avatarId,
              avatar_style: "normal",
            },
            voice: input.voiceUrl
              ? {
                  type: "audio",
                  audio_url: input.voiceUrl,
                }
              : {
                  type: "text",
                  input_text: input.text,
                  voice_id: input.voiceId || "en-US-JennyNeural",
                },
            background: input.background || "#FFFFFF",
          },
        ],
        dimension: {
          width: input.aspectRatio === "9:16" ? 1080 : input.aspectRatio === "1:1" ? 1080 : 1920,
          height: input.aspectRatio === "9:16" ? 1920 : input.aspectRatio === "1:1" ? 1080 : 1080,
        },
        test: false,
      };

      const response = await fetch(`${this.baseUrl}/video/generate`, {
        method: "POST",
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new VideoGenerationError(
          error.message || "Video generation failed",
          error.code,
          response.status
        );
      }

      const data = await response.json();

      return {
        videoId: data.data.video_id,
        status: data.data.status || "processing",
        videoUrl: data.data.video_url,
        thumbnailUrl: data.data.thumbnail_url,
        duration: data.data.duration,
        processingTime: data.data.processing_time,
      };
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Failed to generate video: ${String(error)}`
      );
    }
  }

  /**
   * Get video generation status
   *
   * Poll this endpoint to track video generation progress.
   * Videos typically take 30-60 seconds to generate.
   *
   * @param videoId - Video ID from generateVideo
   * @returns Video generation progress
   */
  async getVideoStatus(videoId: string): Promise<VideoGenerationProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/video/${videoId}`, {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new VideoGenerationError(
          error.message || "Failed to get video status",
          error.code,
          response.status
        );
      }

      const data = await response.json();

      return {
        videoId: data.data.video_id,
        status: data.data.status,
        progress: this.calculateProgress(data.data.status),
        eta: data.data.eta,
        error: data.data.error,
      };
    } catch (error) {
      if (error instanceof VideoGenerationError) {
        throw error;
      }
      throw new VideoGenerationError(
        `Failed to get video status: ${String(error)}`
      );
    }
  }

  /**
   * Get avatar status
   *
   * Check if avatar creation is complete.
   *
   * @param avatarId - Avatar ID from createAvatar
   * @returns Avatar creation result
   */
  async getAvatarStatus(avatarId: string): Promise<AvatarCreationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/avatar/${avatarId}`, {
        method: "GET",
        headers: {
          "X-Api-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AvatarCreationError(
          error.message || "Failed to get avatar status",
          error.code,
          response.status
        );
      }

      const data = await response.json();

      return {
        avatarId: data.data.avatar_id,
        status: data.data.status,
        thumbnailUrl: data.data.thumbnail_url,
        processingTime: data.data.processing_time,
      };
    } catch (error) {
      if (error instanceof AvatarCreationError) {
        throw error;
      }
      throw new AvatarCreationError(
        `Failed to get avatar status: ${String(error)}`
      );
    }
  }

  /**
   * Stream video generation
   *
   * Returns async generator that yields progress updates.
   * Automatically polls until video is ready or fails.
   *
   * @param videoId - Video ID from generateVideo
   * @param pollInterval - Polling interval in milliseconds (default: 5000)
   *
   * @example
   * ```typescript
   * for await (const progress of service.streamVideoGeneration(videoId)) {
   *   console.log(`Progress: ${progress.progress}%`);
   *   if (progress.status === 'completed') {
   *     console.log(`Video ready: ${progress.videoUrl}`);
   *     break;
   *   }
   * }
   * ```
   */
  async *streamVideoGeneration(
    videoId: string,
    pollInterval = 5000
  ): AsyncGenerator<VideoGenerationProgress> {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (60 * 5s)

    while (attempts < maxAttempts) {
      const status = await this.getVideoStatus(videoId);
      yield status;

      if (status.status === "completed" || status.status === "failed") {
        break;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new VideoGenerationError("Video generation timeout after 5 minutes");
    }
  }

  /**
   * Calculate progress percentage from status
   *
   * @param status - Video generation status
   * @returns Progress percentage (0-100)
   */
  private calculateProgress(status: string): number {
    const progressMap: Record<string, number> = {
      queued: 10,
      processing: 50,
      completed: 100,
      failed: 0,
    };

    return progressMap[status] || 0;
  }

  /**
   * Delete avatar
   *
   * Remove avatar from HeyGen account.
   *
   * @param avatarId - Avatar ID to delete
   */
  async deleteAvatar(avatarId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/avatar/${avatarId}`, {
        method: "DELETE",
        headers: {
          "X-Api-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AvatarCreationError(
          error.message || "Failed to delete avatar",
          error.code,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof AvatarCreationError) {
        throw error;
      }
      throw new AvatarCreationError(
        `Failed to delete avatar: ${String(error)}`
      );
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create appearance clone service instance
 *
 * @param apiKey - Optional HeyGen API key (defaults to env var)
 * @returns AppearanceCloneService instance
 */
export const makeAppearanceCloneService = (apiKey?: string) => {
  return new AppearanceCloneService(apiKey);
};

/**
 * Validate photo for avatar creation
 *
 * Checks file size, type, and dimensions.
 *
 * @param photo - Photo file to validate
 * @returns Validation result with errors
 */
export async function validateAvatarPhoto(
  photo: File
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check file type
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(photo.type)) {
    errors.push("Photo must be JPEG, PNG, or WebP format");
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (photo.size > maxSize) {
    errors.push("Photo must be less than 10MB");
  }

  // Check dimensions (recommended: at least 512x512)
  const img = new Image();
  const imageUrl = URL.createObjectURL(photo);

  try {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    if (img.width < 512 || img.height < 512) {
      errors.push("Photo should be at least 512x512 pixels for best quality");
    }
  } catch (error) {
    errors.push("Failed to load image");
  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format video duration
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "1:23")
 */
export function formatVideoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
