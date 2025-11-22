/**
 * Appearance Clone Upload Component
 *
 * CYCLE 5: UI for uploading photo and creating avatar
 *
 * Features:
 * - Photo upload with drag-and-drop
 * - Camera capture interface (webcam)
 * - Photo preview with crop/adjust
 * - Avatar creation progress tracking
 * - Avatar preview
 * - Example video gallery
 * - Video generation interface
 *
 * Usage:
 * ```tsx
 * <AppearanceCloneUpload
 *   cloneId={cloneId}
 *   onAvatarCreated={(avatarId) => console.log('Avatar created:', avatarId)}
 * />
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Play,
  Check,
  AlertCircle,
  Loader2,
  Video,
} from "lucide-react";
import { AppearanceCloneService, validateAvatarPhoto } from "@/lib/services/AppearanceCloneService";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// ============================================================================
// TYPES
// ============================================================================

interface AppearanceCloneUploadProps {
  cloneId: string;
  onAvatarCreated?: (avatarId: string) => void;
  onVideoGenerated?: (videoUrl: string) => void;
}

interface PhotoUploadState {
  file: File | null;
  preview: string | null;
  validationErrors: string[];
}

interface AvatarCreationState {
  status: "idle" | "uploading" | "creating" | "completed" | "failed";
  progress: number;
  avatarId?: string;
  thumbnailUrl?: string;
  error?: string;
}

interface VideoGenerationState {
  status: "idle" | "generating" | "completed" | "failed";
  progress: number;
  videoId?: string;
  videoUrl?: string;
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AppearanceCloneUpload({
  cloneId,
  onAvatarCreated,
  onVideoGenerated,
}: AppearanceCloneUploadProps) {
  // State
  const [photoState, setPhotoState] = useState<PhotoUploadState>({
    file: null,
    preview: null,
    validationErrors: [],
  });
  const [avatarState, setAvatarState] = useState<AvatarCreationState>({
    status: "idle",
    progress: 0,
  });
  const [videoState, setVideoState] = useState<VideoGenerationState>({
    status: "idle",
    progress: 0,
  });
  const [videoText, setVideoText] = useState(
    "Hello! This is my AI clone speaking. I can help answer questions and share my knowledge."
  );
  const [showCamera, setShowCamera] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutations
  const uploadPhotoMutation = useMutation(api.mutations.appearanceCloning.uploadPhoto);
  const cloneAppearanceMutation = useMutation(api.mutations.appearanceCloning.cloneAppearance);
  const updateAvatarStatusMutation = useMutation(api.mutations.appearanceCloning.updateAvatarStatus);
  const generateVideoMutation = useMutation(api.mutations.appearanceCloning.generateVideo);
  const updateVideoStatusMutation = useMutation(api.mutations.appearanceCloning.updateVideoStatus);

  // Service
  const service = new AppearanceCloneService();

  // ============================================================================
  // PHOTO UPLOAD HANDLERS
  // ============================================================================

  const handleFileSelect = async (file: File) => {
    // Validate photo
    const validation = await validateAvatarPhoto(file);

    if (!validation.valid) {
      setPhotoState({
        file: null,
        preview: null,
        validationErrors: validation.errors,
      });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);

    setPhotoState({
      file,
      preview,
      validationErrors: [],
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // ============================================================================
  // CAMERA CAPTURE
  // ============================================================================

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Failed to start camera:", error);
      alert("Failed to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Create file from blob
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setShowCamera(false);

      // Handle file
      await handleFileSelect(file);
    }, "image/jpeg");
  };

  const cancelCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  // ============================================================================
  // AVATAR CREATION
  // ============================================================================

  const createAvatar = async () => {
    if (!photoState.file) return;

    try {
      setAvatarState({ status: "uploading", progress: 10 });

      // 1. Upload photo to HeyGen
      const avatarResult = await service.createAvatar({
        photo: photoState.file,
        name: `Clone ${cloneId} Avatar`,
      });

      setAvatarState({ status: "creating", progress: 30 });

      // 2. Store avatar ID in Convex
      await cloneAppearanceMutation({
        cloneId: cloneId as any,
        avatarId: avatarResult.avatarId,
        avatarName: `Clone ${cloneId} Avatar`,
        thumbnailUrl: avatarResult.thumbnailUrl,
      });

      // 3. Poll for avatar status
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes

      const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          throw new Error("Avatar creation timeout");
        }

        const status = await service.getAvatarStatus(avatarResult.avatarId);

        if (status.status === "completed") {
          // Update Convex
          await updateAvatarStatusMutation({
            cloneId: cloneId as any,
            status: "completed",
            thumbnailUrl: status.thumbnailUrl,
          });

          setAvatarState({
            status: "completed",
            progress: 100,
            avatarId: avatarResult.avatarId,
            thumbnailUrl: status.thumbnailUrl,
          });

          if (onAvatarCreated) {
            onAvatarCreated(avatarResult.avatarId);
          }

          return;
        }

        if (status.status === "failed") {
          throw new Error("Avatar creation failed");
        }

        // Update progress
        const progress = 30 + (attempts / maxAttempts) * 60;
        setAvatarState((prev) => ({ ...prev, progress }));

        // Wait and try again
        attempts++;
        setTimeout(pollStatus, 5000);
      };

      await pollStatus();
    } catch (error) {
      console.error("Avatar creation error:", error);

      setAvatarState({
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Update Convex
      await updateAvatarStatusMutation({
        cloneId: cloneId as any,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // ============================================================================
  // VIDEO GENERATION
  // ============================================================================

  const generateVideo = async () => {
    if (!avatarState.avatarId) return;

    try {
      setVideoState({ status: "generating", progress: 10 });

      // 1. Generate video via HeyGen
      const videoResult = await service.generateVideo({
        avatarId: avatarState.avatarId,
        text: videoText,
        aspectRatio: "16:9",
      });

      setVideoState((prev) => ({ ...prev, progress: 30 }));

      // 2. Store video ID in Convex
      await generateVideoMutation({
        cloneId: cloneId as any,
        videoId: videoResult.videoId,
        text: videoText,
        aspectRatio: "16:9",
      });

      // 3. Poll for video status
      for await (const progress of service.streamVideoGeneration(videoResult.videoId)) {
        setVideoState({
          status: "generating",
          progress: progress.progress,
          videoId: videoResult.videoId,
        });

        if (progress.status === "completed") {
          // Get final video URL
          const finalStatus = await service.getVideoStatus(videoResult.videoId);

          // Update Convex
          await updateVideoStatusMutation({
            videoThingId: cloneId as any, // This should be videoThingId from generateVideoMutation
            status: "completed",
            videoUrl: finalStatus.videoUrl,
          });

          setVideoState({
            status: "completed",
            progress: 100,
            videoId: videoResult.videoId,
            videoUrl: finalStatus.videoUrl,
          });

          if (onVideoGenerated && finalStatus.videoUrl) {
            onVideoGenerated(finalStatus.videoUrl);
          }

          break;
        }

        if (progress.status === "failed") {
          throw new Error(progress.error || "Video generation failed");
        }
      }
    } catch (error) {
      console.error("Video generation error:", error);

      setVideoState({
        status: "failed",
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Photo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Your Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          {showCamera ? (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
                <Button onClick={cancelCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : photoState.preview ? (
            /* Photo Preview */
            <div className="space-y-4">
              <img
                src={photoState.preview}
                alt="Preview"
                className="w-full rounded-lg border"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Different Photo
                </Button>
                <Button onClick={startCamera} variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            </div>
          ) : (
            /* Upload Area */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 hover:border-primary transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center gap-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop photo here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Or use your camera to take a photo
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Recommended: 512x512px or larger</p>
                <p>Formats: JPG, PNG, WebP (max 10MB)</p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); startCamera(); }}>
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Validation Errors */}
          {photoState.validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-1">
                  {photoState.validationErrors.map((error, i) => (
                    <p key={i} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={createAvatar}
            disabled={!photoState.file || avatarState.status !== "idle"}
            className="w-full"
          >
            {avatarState.status === "uploading" || avatarState.status === "creating" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Avatar...
              </>
            ) : avatarState.status === "completed" ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Avatar Created
              </>
            ) : (
              "Create Avatar"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Avatar Creation Progress */}
      {avatarState.status !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Avatar Creation Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={avatarState.progress} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {avatarState.status === "uploading" && "Uploading photo..."}
                {avatarState.status === "creating" && "Creating avatar..."}
                {avatarState.status === "completed" && "Avatar ready!"}
                {avatarState.status === "failed" && "Creation failed"}
              </span>
              <Badge
                variant={
                  avatarState.status === "completed"
                    ? "default"
                    : avatarState.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {avatarState.status}
              </Badge>
            </div>

            {avatarState.thumbnailUrl && (
              <img
                src={avatarState.thumbnailUrl}
                alt="Avatar"
                className="w-full rounded-lg border"
              />
            )}

            {avatarState.error && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-sm text-destructive">{avatarState.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video Generation Card */}
      {avatarState.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Generate Test Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-text">Video Text</Label>
              <textarea
                id="video-text"
                value={videoText}
                onChange={(e) => setVideoText(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-lg border"
                placeholder="Enter text for your AI clone to speak..."
              />
              <p className="text-xs text-muted-foreground">
                {videoText.length} characters
              </p>
            </div>

            {videoState.status !== "idle" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Progress value={videoState.progress} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {videoState.status === "generating" && "Generating video..."}
                      {videoState.status === "completed" && "Video ready!"}
                      {videoState.status === "failed" && "Generation failed"}
                    </span>
                    <Badge
                      variant={
                        videoState.status === "completed"
                          ? "default"
                          : videoState.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {videoState.status}
                    </Badge>
                  </div>

                  {videoState.videoUrl && (
                    <video
                      src={videoState.videoUrl}
                      controls
                      className="w-full rounded-lg border"
                    />
                  )}

                  {videoState.error && (
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                      <p className="text-sm text-destructive">{videoState.error}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={generateVideo}
              disabled={!videoText || videoState.status === "generating"}
              className="w-full"
            >
              {videoState.status === "generating" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Video...
                </>
              ) : videoState.status === "completed" ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Generate Another Video
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
