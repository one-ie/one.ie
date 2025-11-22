/**
 * Voice Clone Service
 *
 * Effect.ts service for voice cloning using ElevenLabs API.
 * Implements business logic for:
 * - Uploading voice samples
 * - Cloning voices
 * - Text-to-speech with cloned voices
 * - Streaming audio responses
 */

import { Effect, Data } from "effect";

// ============================================
// ERROR TYPES (Tagged Unions)
// ============================================

export class APIError extends Data.TaggedError("APIError")<{
  message: string;
  code: string;
  details?: unknown;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
  field?: string;
}> {}

export class VoiceCloningError extends Data.TaggedError("VoiceCloningError")<{
  message: string;
  voiceId?: string;
  attempts: number;
}> {}

export class AudioProcessingError extends Data.TaggedError("AudioProcessingError")<{
  message: string;
  audioFile?: string;
}> {}

export type VoiceCloneServiceError =
  | APIError
  | ValidationError
  | VoiceCloningError
  | AudioProcessingError;

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface UploadVoiceSampleRequest {
  cloneId: string;
  audioFile: File | Blob;
  sampleName: string;
  groupId: string;
  userId: string;
}

export interface UploadVoiceSampleResponse {
  sampleId: string;
  duration: number;
  fileSize: number;
  status: "uploaded" | "processing" | "ready";
}

export interface CloneVoiceRequest {
  cloneId: string;
  name: string;
  description?: string;
  sampleIds: string[];
  groupId: string;
  userId: string;
  labels?: Record<string, string>;
}

export interface CloneVoiceResponse {
  voiceId: string;
  status: "pending" | "processing" | "complete" | "failed";
  estimatedTimeMs?: number;
  metadata: {
    cloneId: string;
    samplesUsed: number;
    totalDuration: number;
  };
}

export interface GenerateSpeechRequest {
  cloneId: string;
  voiceId: string;
  text: string;
  modelId?: string; // ElevenLabs model (e.g., "eleven_multilingual_v2")
  voiceSettings?: {
    stability?: number; // 0-1
    similarityBoost?: number; // 0-1
    style?: number; // 0-1
    useSpeakerBoost?: boolean;
  };
  optimizeStreamingLatency?: number; // 0-4
}

export interface GenerateSpeechResponse {
  audioUrl: string;
  audioData?: ArrayBuffer;
  duration: number;
  characterCount: number;
  metadata: {
    modelUsed: string;
    voiceId: string;
    estimatedCost: number;
  };
}

export interface VoiceCloneStatus {
  voiceId: string;
  status: "pending" | "processing" | "complete" | "failed";
  progress?: number; // 0-100
  errorMessage?: string;
  metadata: {
    createdAt: number;
    updatedAt: number;
    samplesProcessed: number;
    totalSamples: number;
  };
}

// ============================================
// ELEVENLABS API TYPES
// ============================================

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples: Array<{
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    hash: string;
  }>;
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: Record<string, unknown>;
    verification_failures: string[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

export class VoiceCloneService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.elevenlabs.io/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Upload voice sample to ElevenLabs
   *
   * @param request - Upload request with audio file
   * @returns Effect with upload response or error
   */
  uploadVoiceSample(
    request: UploadVoiceSampleRequest
  ): Effect.Effect<UploadVoiceSampleResponse, VoiceCloneServiceError> {
    return Effect.tryPromise({
      try: async () => {
        // Validate audio file
        if (!request.audioFile) {
          throw new ValidationError({
            message: "Audio file is required",
            field: "audioFile",
          });
        }

        // Check file size (ElevenLabs max: 10MB per sample)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (request.audioFile.size > maxSize) {
          throw new ValidationError({
            message: `Audio file too large. Max size: 10MB, got: ${(request.audioFile.size / 1024 / 1024).toFixed(2)}MB`,
            field: "audioFile",
          });
        }

        // Check file type
        const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
        if (request.audioFile instanceof File && !allowedTypes.includes(request.audioFile.type)) {
          throw new ValidationError({
            message: `Invalid audio format. Allowed: MP3, WAV, OGG. Got: ${request.audioFile.type}`,
            field: "audioFile",
          });
        }

        // For now, return mock response (will integrate with ElevenLabs API)
        // TODO: Implement actual ElevenLabs upload
        const duration = await this.getAudioDuration(request.audioFile);

        return {
          sampleId: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          duration,
          fileSize: request.audioFile.size,
          status: "uploaded" as const,
        };
      },
      catch: (error) => {
        if (error instanceof ValidationError) {
          return error;
        }
        return new AudioProcessingError({
          message: `Failed to upload voice sample: ${error}`,
          audioFile: request.sampleName,
        });
      },
    });
  }

  /**
   * Clone voice using uploaded samples
   *
   * @param request - Clone voice request
   * @returns Effect with clone response or error
   */
  cloneVoice(
    request: CloneVoiceRequest
  ): Effect.Effect<CloneVoiceResponse, VoiceCloneServiceError> {
    return Effect.tryPromise({
      try: async () => {
        // Validate samples
        if (!request.sampleIds || request.sampleIds.length === 0) {
          throw new ValidationError({
            message: "At least one voice sample is required",
            field: "sampleIds",
          });
        }

        // ElevenLabs requires 3-5 minutes of audio for optimal cloning
        // Minimum 1 sample, recommended 3-5 samples
        if (request.sampleIds.length < 1) {
          throw new ValidationError({
            message: "At least 1 voice sample required (3-5 recommended)",
            field: "sampleIds",
          });
        }

        // Call ElevenLabs API to add voice
        const response = await fetch(`${this.baseUrl}/voices/add`, {
          method: "POST",
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: request.name,
            description: request.description || `AI Clone: ${request.name}`,
            files: request.sampleIds,
            labels: request.labels || {
              cloneId: request.cloneId,
              groupId: request.groupId,
              userId: request.userId,
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new APIError({
            message: `ElevenLabs API error: ${error.detail?.message || response.statusText}`,
            code: `HTTP_${response.status}`,
            details: error,
          });
        }

        const data = await response.json() as { voice_id: string };

        return {
          voiceId: data.voice_id,
          status: "processing" as const,
          estimatedTimeMs: 60000, // ~1 minute for processing
          metadata: {
            cloneId: request.cloneId,
            samplesUsed: request.sampleIds.length,
            totalDuration: 0, // Will be calculated from samples
          },
        };
      },
      catch: (error) => {
        if (error instanceof ValidationError || error instanceof APIError) {
          return error;
        }
        return new VoiceCloningError({
          message: `Failed to clone voice: ${error}`,
          attempts: 1,
        });
      },
    });
  }

  /**
   * Generate speech using cloned voice
   *
   * @param request - Speech generation request
   * @returns Effect with audio response or error
   */
  generateSpeech(
    request: GenerateSpeechRequest
  ): Effect.Effect<GenerateSpeechResponse, VoiceCloneServiceError> {
    return Effect.tryPromise({
      try: async () => {
        // Validate text
        if (!request.text || request.text.trim().length === 0) {
          throw new ValidationError({
            message: "Text is required for speech generation",
            field: "text",
          });
        }

        // ElevenLabs character limit (varies by plan, using 5000 as default)
        const maxChars = 5000;
        if (request.text.length > maxChars) {
          throw new ValidationError({
            message: `Text too long. Max: ${maxChars} characters, got: ${request.text.length}`,
            field: "text",
          });
        }

        // Call ElevenLabs TTS API
        const modelId = request.modelId || "eleven_multilingual_v2";
        const voiceSettings = request.voiceSettings || {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
        };

        const response = await fetch(
          `${this.baseUrl}/text-to-speech/${request.voiceId}/stream`,
          {
            method: "POST",
            headers: {
              "xi-api-key": this.apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: request.text,
              model_id: modelId,
              voice_settings: {
                stability: voiceSettings.stability,
                similarity_boost: voiceSettings.similarityBoost,
                style: voiceSettings.style,
                use_speaker_boost: voiceSettings.useSpeakerBoost,
              },
              optimize_streaming_latency: request.optimizeStreamingLatency || 3,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new APIError({
            message: `ElevenLabs TTS error: ${error.detail?.message || response.statusText}`,
            code: `HTTP_${response.status}`,
            details: error,
          });
        }

        // Get audio data
        const audioData = await response.arrayBuffer();

        // Estimate duration (rough: ~150 words per minute, ~5 chars per word)
        const estimatedWords = request.text.length / 5;
        const estimatedDuration = (estimatedWords / 150) * 60 * 1000; // ms

        // Estimate cost (ElevenLabs charges per character)
        // Example: $0.30 per 1,000 characters
        const estimatedCost = (request.text.length / 1000) * 0.30;

        return {
          audioUrl: "", // Will be populated after storing in Convex
          audioData,
          duration: estimatedDuration,
          characterCount: request.text.length,
          metadata: {
            modelUsed: modelId,
            voiceId: request.voiceId,
            estimatedCost,
          },
        };
      },
      catch: (error) => {
        if (error instanceof ValidationError || error instanceof APIError) {
          return error;
        }
        return new AudioProcessingError({
          message: `Failed to generate speech: ${error}`,
        });
      },
    });
  }

  /**
   * Get voice clone status from ElevenLabs
   *
   * @param voiceId - ElevenLabs voice ID
   * @returns Effect with status or error
   */
  getVoiceStatus(
    voiceId: string
  ): Effect.Effect<VoiceCloneStatus, VoiceCloneServiceError> {
    return Effect.tryPromise({
      try: async () => {
        const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
          headers: {
            "xi-api-key": this.apiKey,
          },
        });

        if (!response.ok) {
          throw new APIError({
            message: `Failed to get voice status: ${response.statusText}`,
            code: `HTTP_${response.status}`,
          });
        }

        const voice = await response.json() as ElevenLabsVoice;

        return {
          voiceId: voice.voice_id,
          status: "complete" as const,
          progress: 100,
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            samplesProcessed: voice.samples.length,
            totalSamples: voice.samples.length,
          },
        };
      },
      catch: (error) => {
        if (error instanceof APIError) {
          return error;
        }
        return new VoiceCloningError({
          message: `Failed to get voice status: ${error}`,
          voiceId,
          attempts: 1,
        });
      },
    });
  }

  /**
   * Stream audio response (for real-time playback)
   *
   * @param request - Speech generation request
   * @returns AsyncIterable of audio chunks
   */
  async *streamAudio(
    request: GenerateSpeechRequest
  ): AsyncIterable<Uint8Array> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${request.voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.modelId || "eleven_multilingual_v2",
          voice_settings: request.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          optimize_streaming_latency: request.optimizeStreamingLatency || 3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Get audio duration from file
   *
   * @param audioFile - Audio file or blob
   * @returns Duration in seconds
   */
  private async getAudioDuration(audioFile: File | Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(audioFile);

      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      });

      audio.addEventListener("error", (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load audio: ${error}`));
      });

      audio.src = objectUrl;
    });
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create VoiceCloneService instance
 *
 * @param apiKey - ElevenLabs API key
 * @returns VoiceCloneService instance
 */
export function createVoiceCloneService(apiKey: string): VoiceCloneService {
  return new VoiceCloneService(apiKey);
}
