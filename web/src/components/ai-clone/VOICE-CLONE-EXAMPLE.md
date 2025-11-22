# Voice Clone Integration - Usage Examples

This guide shows how to use the voice cloning components in your AI clone implementation.

---

## 1. Basic Setup

### Install Dependencies

```bash
# Already included in package.json
npm install effect @anthropic-ai/sdk convex
```

### Configure ElevenLabs API Key

```typescript
// Add to your group's environment variables via backend
import { useMutation } from 'convex/react';
import { api } from '../../backend/convex/_generated/api';

function ConfigureElevenLabs() {
  const setEnvVar = useMutation(api.mutations.environmentVariables.create);

  const handleConfigure = async () => {
    await setEnvVar({
      groupId: yourGroupId,
      name: 'ELEVENLABS_API_KEY',
      value: 'your_api_key_here',
      valueType: 'secret',
      environment: 'production',
      category: 'integration',
      isSecret: true,
      actorId: yourActorId
    });
  };

  return <button onClick={handleConfigure}>Configure API Key</button>;
}
```

---

## 2. Voice Clone Upload Component

### Basic Usage

```typescript
import { VoiceCloneUpload } from '@/components/ai-clone/VoiceCloneUpload';

function AICloneSetup() {
  const handleCloneComplete = (voiceId: string) => {
    console.log('Voice cloned successfully!', voiceId);
    // Navigate to next step or show success message
  };

  const handleError = (error: Error) => {
    console.error('Voice cloning error:', error);
    // Show error message to user
  };

  return (
    <VoiceCloneUpload
      cloneId="j97abc123" // Your AI clone ID
      groupId="j97org456" // Your organization ID
      actorId="j97user789" // Current user ID
      onCloneComplete={handleCloneComplete}
      onError={handleError}
    />
  );
}
```

### With Custom Styling

```typescript
function StyledVoiceCloneUpload() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <VoiceCloneUpload
          cloneId={cloneId}
          groupId={groupId}
          actorId={actorId}
          onCloneComplete={(voiceId) => {
            // Show success toast
            toast.success(`Voice cloned! ID: ${voiceId}`);
            // Update clone status in UI
            setCloneStatus('voice_ready');
          }}
          onError={(error) => {
            // Show error toast
            toast.error(error.message);
          }}
        />
      </div>
    </div>
  );
}
```

---

## 3. Voice Clone Service Usage

### Direct Service Usage (Advanced)

```typescript
import { createVoiceCloneService } from '@/lib/services/VoiceCloneService';
import { Effect } from 'effect';

async function useVoiceCloneService() {
  // Create service instance
  const service = createVoiceCloneService(elevenLabsApiKey);

  // Upload voice sample
  const uploadResult = await Effect.runPromise(
    service.uploadVoiceSample({
      cloneId: 'j97abc123',
      audioFile: audioFile,
      sampleName: 'Sample 1',
      groupId: 'j97org456',
      userId: 'j97user789'
    })
  );

  console.log('Upload result:', uploadResult);
  // {
  //   sampleId: 'sample_1732234567_abc123',
  //   duration: 180,
  //   fileSize: 5242880,
  //   status: 'uploaded'
  // }

  // Clone voice
  const cloneResult = await Effect.runPromise(
    service.cloneVoice({
      cloneId: 'j97abc123',
      name: 'John Doe Voice',
      sampleIds: [uploadResult.sampleId],
      groupId: 'j97org456',
      userId: 'j97user789'
    })
  );

  console.log('Clone result:', cloneResult);
  // {
  //   voiceId: 'voice_xyz789',
  //   status: 'processing',
  //   estimatedTimeMs: 60000,
  //   metadata: { ... }
  // }

  // Generate speech
  const speechResult = await Effect.runPromise(
    service.generateSpeech({
      cloneId: 'j97abc123',
      voiceId: cloneResult.voiceId,
      text: 'Hello, this is my AI clone speaking!',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75
      }
    })
  );

  console.log('Speech result:', speechResult);
  // {
  //   audioUrl: 'https://...',
  //   duration: 3200,
  //   characterCount: 42
  // }
}
```

---

## 4. Backend Mutations Usage

### Upload Voice Sample

```typescript
import { useMutation } from 'convex/react';
import { api } from '../../backend/convex/_generated/api';

function UploadSampleButton() {
  const uploadSample = useMutation(api.mutations.voiceCloning.uploadVoiceSample);

  const handleUpload = async (file: File) => {
    // First, upload file to Convex storage
    const audioFileId = await uploadToConvexStorage(file);

    // Get audio duration
    const duration = await getAudioDuration(file);

    // Create voice sample in database
    const sampleId = await uploadSample({
      cloneId: 'j97abc123',
      audioFileId: audioFileId,
      sampleName: file.name,
      duration: duration,
      fileSize: file.size,
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    console.log('Sample uploaded:', sampleId);
  };

  return <button onClick={() => handleUpload(selectedFile)}>Upload</button>;
}
```

### Clone Voice

```typescript
function CloneVoiceButton() {
  const cloneVoice = useMutation(api.mutations.voiceCloning.cloneVoice);

  const handleClone = async () => {
    const result = await cloneVoice({
      cloneId: 'j97abc123',
      name: 'My Voice Clone',
      description: 'Professional voice clone from podcast samples',
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    console.log('Voice cloned:', result);
    // {
    //   voiceId: 'voice_xyz789',
    //   status: 'processing',
    //   samplesUsed: 3,
    //   totalDuration: 360
    // }
  };

  return <button onClick={handleClone}>Clone Voice</button>;
}
```

### Generate Speech

```typescript
function GenerateSpeechButton() {
  const generateSpeech = useMutation(api.mutations.voiceCloning.generateSpeech);

  const handleGenerate = async (text: string) => {
    const result = await generateSpeech({
      cloneId: 'j97abc123',
      text: text,
      voiceSettings: {
        stability: 0.6,
        similarityBoost: 0.8,
        useSpeakerBoost: true
      },
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    console.log('Speech generated:', result);
    // {
    //   speechId: 'j97speech999',
    //   audioFileId: 'audio_def456',
    //   characterCount: 54,
    //   duration: 3200
    // }

    // Play audio
    playAudio(result.audioFileId);
  };

  return (
    <div>
      <textarea onChange={(e) => setText(e.target.value)} />
      <button onClick={() => handleGenerate(text)}>Generate Speech</button>
    </div>
  );
}
```

---

## 5. Complete Example: AI Clone Creation Wizard

```typescript
import { useState } from 'react';
import { VoiceCloneUpload } from '@/components/ai-clone/VoiceCloneUpload';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../backend/convex/_generated/api';

function AICloneCreationWizard() {
  const [step, setStep] = useState(1);
  const [cloneId, setCloneId] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);

  const createClone = useMutation(api.mutations.aiClones.create);
  const updateClone = useMutation(api.mutations.aiClones.update);

  // Step 1: Create Clone
  const handleCreateClone = async (name: string) => {
    const id = await createClone({
      name: name,
      description: 'AI clone with voice cloning',
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    setCloneId(id);
    setStep(2);
  };

  // Step 2: Voice Cloning (handled by VoiceCloneUpload component)
  const handleVoiceCloneComplete = async (newVoiceId: string) => {
    setVoiceId(newVoiceId);

    // Update clone with voice ID
    await updateClone({
      cloneId: cloneId!,
      properties: {
        voiceId: newVoiceId,
        voiceStatus: 'complete'
      },
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    setStep(3);
  };

  // Step 3: Test Voice
  const handleTestVoice = async () => {
    // Generate test speech
    const result = await generateSpeech({
      cloneId: cloneId!,
      text: 'Hello! This is a test of my cloned voice.',
      groupId: 'j97org456',
      actorId: 'j97user789'
    });

    // Play audio
    playAudio(result.audioFileId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Step number={1} title="Create Clone" active={step === 1} complete={step > 1} />
          <Step number={2} title="Voice Cloning" active={step === 2} complete={step > 2} />
          <Step number={3} title="Test & Deploy" active={step === 3} complete={false} />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div>
          <h2>Create Your AI Clone</h2>
          <input
            type="text"
            placeholder="Clone name"
            onChange={(e) => setCloneName(e.target.value)}
          />
          <button onClick={() => handleCreateClone(cloneName)}>
            Next: Voice Cloning
          </button>
        </div>
      )}

      {step === 2 && cloneId && (
        <div>
          <h2>Clone Your Voice</h2>
          <VoiceCloneUpload
            cloneId={cloneId}
            groupId="j97org456"
            actorId="j97user789"
            onCloneComplete={handleVoiceCloneComplete}
            onError={(error) => console.error(error)}
          />
        </div>
      )}

      {step === 3 && voiceId && (
        <div>
          <h2>Test Your Voice Clone</h2>
          <p>Voice ID: {voiceId}</p>
          <button onClick={handleTestVoice}>Test Voice</button>
          <button onClick={() => navigate('/clone/' + cloneId)}>
            Go to Clone Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

function Step({ number, title, active, complete }: StepProps) {
  return (
    <div className={`flex items-center ${active ? 'text-blue-600' : complete ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        active ? 'bg-blue-600 text-white' :
        complete ? 'bg-green-600 text-white' :
        'bg-gray-300'
      }`}>
        {complete ? '✓' : number}
      </div>
      <span className="ml-2 font-medium">{title}</span>
    </div>
  );
}
```

---

## 6. Audio Playback Component

```typescript
import { useState, useRef } from 'react';

function AudioPlayer({ audioFileId }: { audioFileId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get audio URL from Convex storage
  const audioUrl = useConvexFileUrl(audioFileId);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="flex-1">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Streaming Audio Example

```typescript
import { createVoiceCloneService } from '@/lib/services/VoiceCloneService';

async function streamVoiceClone(text: string, voiceId: string) {
  const service = createVoiceCloneService(elevenLabsApiKey);

  // Create audio context
  const audioContext = new AudioContext();
  const chunks: Uint8Array[] = [];

  // Stream audio chunks
  for await (const chunk of service.streamAudio({
    cloneId: 'j97abc123',
    voiceId: voiceId,
    text: text,
    optimizeStreamingLatency: 3 // 0-4, higher = faster but lower quality
  })) {
    chunks.push(chunk);

    // Optional: Play chunks immediately (requires more complex audio buffering)
    // ...
  }

  // Combine chunks into single audio blob
  const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);

  // Play audio
  const audio = new Audio(audioUrl);
  await audio.play();
}
```

---

## 8. Error Handling Patterns

```typescript
import { VoiceCloneService } from '@/lib/services/VoiceCloneService';
import { Effect } from 'effect';

function handleVoiceCloneErrors() {
  const service = new VoiceCloneService(apiKey);

  // Pattern 1: Match on error types
  Effect.runPromise(
    service.uploadVoiceSample(request).pipe(
      Effect.catchTags({
        ValidationError: (error) => {
          console.error('Validation failed:', error.message);
          // Show user-friendly error
          toast.error(`Invalid input: ${error.field}`);
          return Effect.succeed(null);
        },
        AudioProcessingError: (error) => {
          console.error('Audio processing failed:', error);
          // Retry or show error
          toast.error('Failed to process audio. Please try again.');
          return Effect.succeed(null);
        },
        APIError: (error) => {
          console.error('API error:', error);
          // Show API error with details
          toast.error(`ElevenLabs error: ${error.message}`);
          return Effect.succeed(null);
        }
      })
    )
  );

  // Pattern 2: Generic error handling
  Effect.runPromise(
    service.cloneVoice(request)
  ).catch((error) => {
    if (error instanceof ValidationError) {
      // Handle validation errors
    } else if (error instanceof VoiceCloningError) {
      // Handle cloning errors
    } else {
      // Generic error
      console.error('Unexpected error:', error);
    }
  });
}
```

---

## 9. Testing Examples

```typescript
import { describe, it, expect, vi } from 'vitest';
import { VoiceCloneService } from '@/lib/services/VoiceCloneService';
import { Effect } from 'effect';

describe('VoiceCloneService', () => {
  it('should upload voice sample successfully', async () => {
    const service = new VoiceCloneService('test-api-key');

    const mockFile = new File(['audio data'], 'sample.mp3', { type: 'audio/mpeg' });

    const result = await Effect.runPromise(
      service.uploadVoiceSample({
        cloneId: 'test-clone',
        audioFile: mockFile,
        sampleName: 'Test Sample',
        groupId: 'test-group',
        userId: 'test-user'
      })
    );

    expect(result.status).toBe('uploaded');
    expect(result.fileSize).toBe(mockFile.size);
  });

  it('should reject files over 10MB', async () => {
    const service = new VoiceCloneService('test-api-key');

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.mp3', {
      type: 'audio/mpeg'
    });

    await expect(
      Effect.runPromise(
        service.uploadVoiceSample({
          cloneId: 'test-clone',
          audioFile: largeFile,
          sampleName: 'Large Sample',
          groupId: 'test-group',
          userId: 'test-user'
        })
      )
    ).rejects.toThrow('Audio file too large');
  });

  it('should clone voice with multiple samples', async () => {
    const service = new VoiceCloneService('test-api-key');

    const result = await Effect.runPromise(
      service.cloneVoice({
        cloneId: 'test-clone',
        name: 'Test Voice',
        sampleIds: ['sample1', 'sample2', 'sample3'],
        groupId: 'test-group',
        userId: 'test-user'
      })
    );

    expect(result.status).toBe('processing');
    expect(result.metadata.samplesUsed).toBe(3);
  });
});
```

---

## 10. Production Deployment

### Environment Setup

```bash
# .env.local
ELEVENLABS_API_KEY=your_api_key_here
CONVEX_DEPLOYMENT=your_deployment_id
```

### Convex Schema Deployment

```bash
# Deploy schema changes (if any)
cd backend
npx convex deploy
```

### Frontend Build

```bash
# Build with voice cloning components
cd web
bun run build
```

### Monitoring

```typescript
// Track voice cloning usage
const voiceCloningEvents = await ctx.db
  .query('events')
  .withIndex('by_type', (q) => q.eq('type', 'voice_cloned'))
  .collect();

console.log(`Total voice clones created: ${voiceCloningEvents.length}`);
```

---

**Ready to clone voices! 🎤**
