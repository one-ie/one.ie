/**
 * Voice Clone Upload Component
 *
 * React component for uploading voice samples and cloning voices.
 * Implements:
 * - File upload UI for voice samples
 * - Audio recording interface (record directly in browser)
 * - Preview uploaded samples
 * - Progress tracking during cloning
 * - Voice preview/playback
 *
 * Follows ontology:
 * - Creates voice_sample things
 * - Links samples to ai_clone via has_voice_sample connection
 * - Logs voice_cloned event
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import type { Id } from '../../../backend/convex/_generated/dataModel';

// ============================================
// TYPES
// ============================================

interface VoiceSample {
  id: Id<'things'>;
  name: string;
  duration: number;
  fileSize: number;
  audioFileId: string;
  status: 'uploaded' | 'processing' | 'ready';
  createdAt: number;
}

interface VoiceCloneUploadProps {
  cloneId: Id<'things'>;
  groupId: Id<'groups'>;
  actorId: Id<'people'>;
  onCloneComplete?: (voiceId: string) => void;
  onError?: (error: Error) => void;
}

// ============================================
// COMPONENT
// ============================================

export function VoiceCloneUpload({
  cloneId,
  groupId,
  actorId,
  onCloneComplete,
  onError,
}: VoiceCloneUploadProps) {
  // State
  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloningProgress, setCloningProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const uploadVoiceSample = useMutation(api.mutations.voiceCloning.uploadVoiceSample);
  const cloneVoice = useMutation(api.mutations.voiceCloning.cloneVoice);
  const deleteSample = useMutation(api.mutations.voiceCloning.deleteVoiceSample);

  // Calculate total duration
  const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
  const totalDurationMinutes = Math.floor(totalDuration / 60);
  const totalDurationSeconds = Math.floor(totalDuration % 60);

  // Recommended duration: 3-5 minutes
  const isEnoughAudio = totalDuration >= 180; // 3 minutes
  const isOptimalAudio = totalDuration >= 180 && totalDuration <= 300; // 3-5 minutes

  // ============================================
  // FILE UPLOAD HANDLERS
  // ============================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      onError?.(new Error('Invalid file type. Please upload MP3, WAV, or OGG files.'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.(
        new Error(
          `File too large. Max size: 10MB, got: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        )
      );
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const audioUrl = URL.createObjectURL(file);
    setPreviewAudio(audioUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get audio duration
      const duration = await getAudioDuration(selectedFile);

      // Mock upload (in real implementation, upload to Convex storage)
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Upload to Convex
      const audioFileId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const sampleId = await uploadVoiceSample({
        cloneId,
        audioFileId,
        sampleName: selectedFile.name,
        duration,
        fileSize: selectedFile.size,
        groupId,
        actorId,
      });

      // Add to samples list
      const newSample: VoiceSample = {
        id: sampleId,
        name: selectedFile.name,
        duration,
        fileSize: selectedFile.size,
        audioFileId,
        status: 'ready',
        createdAt: Date.now(),
      };

      setSamples((prev) => [...prev, newSample]);
      setSelectedFile(null);
      setPreviewAudio(null);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onError?.(error instanceof Error ? error : new Error('Upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================
  // AUDIO RECORDING HANDLERS
  // ============================================

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        setSelectedFile(audioFile);

        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudio(audioUrl);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(new Error('Failed to access microphone. Please check permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // ============================================
  // VOICE CLONING HANDLER
  // ============================================

  const handleCloneVoice = async () => {
    if (samples.length === 0) {
      onError?.(new Error('Please upload at least one voice sample.'));
      return;
    }

    setIsCloning(true);
    setCloningProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setCloningProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Clone voice
      const result = await cloneVoice({
        cloneId,
        name: `Voice Clone ${Date.now()}`,
        description: 'AI clone voice generated from uploaded samples',
        groupId,
        actorId,
      });

      clearInterval(progressInterval);
      setCloningProgress(100);

      // Success!
      setTimeout(() => {
        onCloneComplete?.(result.voiceId);
      }, 500);
    } catch (error) {
      console.error('Voice cloning failed:', error);
      onError?.(error instanceof Error ? error : new Error('Voice cloning failed'));
    } finally {
      setIsCloning(false);
    }
  };

  // ============================================
  // SAMPLE MANAGEMENT
  // ============================================

  const handleDeleteSample = async (sampleId: Id<'things'>) => {
    try {
      await deleteSample({
        sampleId,
        cloneId,
        groupId,
        actorId,
      });

      setSamples((prev) => prev.filter((s) => s.id !== sampleId));
    } catch (error) {
      console.error('Failed to delete sample:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to delete sample'));
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      });

      audio.addEventListener('error', (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load audio'));
      });

      audio.src = objectUrl;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Voice Clone Setup</h2>
        <p className="mt-2 text-sm text-gray-600">
          Upload 3-5 minutes of clear audio samples for best results.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">
            Total Audio Duration: {totalDurationMinutes}m {totalDurationSeconds}s
          </span>
          <span
            className={`text-sm font-medium ${
              isOptimalAudio
                ? 'text-green-600'
                : isEnoughAudio
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {isOptimalAudio
              ? 'Optimal'
              : isEnoughAudio
              ? 'Good'
              : `Need ${Math.ceil((180 - totalDuration) / 60)}m more`}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOptimalAudio
                ? 'bg-green-500'
                : isEnoughAudio
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((totalDuration / 300) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio</h3>

        {/* File Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Audio File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              disabled={isUploading || isRecording}
            />
            <p className="mt-1 text-xs text-gray-500">MP3, WAV, or OGG (max 10MB)</p>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Audio
            </label>
            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isUploading || !!selectedFile}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Stop Recording</span>
                  </button>
                  <span className="text-sm text-gray-700 font-mono">
                    {formatTime(recordingTime)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600">Recording...</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewAudio && selectedFile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Preview</p>
              <audio controls src={previewAudio} className="w-full mb-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
                <span className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Sample'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Samples List */}
      {samples.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Samples ({samples.length})
          </h3>
          <div className="space-y-3">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sample.name}</p>
                  <p className="text-xs text-gray-600">
                    {formatTime(sample.duration)} • {formatFileSize(sample.fileSize)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSample(sample.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                  title="Delete sample"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clone Voice Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-300">
        <div className="text-sm text-gray-600">
          {samples.length === 0
            ? 'Upload at least 1 sample to continue'
            : isOptimalAudio
            ? 'Ready to clone voice!'
            : isEnoughAudio
            ? 'Good amount of audio. More samples = better quality.'
            : 'Upload more audio for better quality'}
        </div>
        <button
          onClick={handleCloneVoice}
          disabled={samples.length === 0 || isCloning}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCloning ? `Cloning Voice... ${cloningProgress}%` : 'Clone Voice'}
        </button>
      </div>

      {/* Cloning Progress */}
      {isCloning && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-2">
            Cloning your voice...
          </p>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${cloningProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-purple-700">
            This may take 1-2 minutes. Please don't close this window.
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceCloneUpload;
