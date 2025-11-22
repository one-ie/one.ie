/**
 * Appearance Clone Upload Test Client
 *
 * Client-side wrapper for AppearanceCloneUpload component
 * with demo clone ID for testing
 */

import React from 'react';
import { AppearanceCloneUpload } from '@/components/ai-clone/AppearanceCloneUpload';

export function AppearanceCloneUploadClient() {
  // For testing, use a mock clone ID
  // In production, this would come from the URL or database
  const mockCloneId = 'test-clone-123';

  const handleAvatarCreated = (avatarId: string) => {
    console.log('✅ Avatar created successfully:', avatarId);
    alert(`Avatar created! ID: ${avatarId}`);
  };

  const handleVideoGenerated = (videoUrl: string) => {
    console.log('✅ Video generated successfully:', videoUrl);
    alert(`Video ready! URL: ${videoUrl}`);
  };

  return (
    <AppearanceCloneUpload
      cloneId={mockCloneId}
      onAvatarCreated={handleAvatarCreated}
      onVideoGenerated={handleVideoGenerated}
    />
  );
}
