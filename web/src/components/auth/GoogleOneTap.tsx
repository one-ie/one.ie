/**
 * Google One Tap Component
 *
 * Implements Google One Tap for fast, one-click sign-in.
 * Automatically shows One Tap prompt for returning Google users.
 *
 * Cycle 48: Google One Tap Implementation
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: GoogleOneTapNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleOneTapNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getMomentType: () => string;
}

interface GoogleOneTapProps {
  clientId: string;
  onSuccess?: (credential: string) => void;
  onError?: (error: Error) => void;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
}

export function GoogleOneTap({
  clientId,
  onSuccess,
  onError,
  autoSelect = true,
  cancelOnTapOutside = false,
}: GoogleOneTapProps) {
  const scriptLoadedRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Don't initialize if already done
    if (initializedRef.current) return;

    const loadGoogleScript = () => {
      // Check if script already exists
      if (scriptLoadedRef.current || document.querySelector('script[src*="accounts.google.com"]')) {
        scriptLoadedRef.current = true;
        initializeOneTap();
        return;
      }

      // Load Google One Tap script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        initializeOneTap();
      };
      script.onerror = () => {
        const error = new Error('Failed to load Google One Tap script');
        console.error(error);
        onError?.(error);
      };

      document.head.appendChild(script);
    };

    const initializeOneTap = () => {
      if (!window.google?.accounts?.id) {
        console.error('Google One Tap API not loaded');
        return;
      }

      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: autoSelect,
          cancel_on_tap_outside: cancelOnTapOutside,
          context: 'signin',
        });

        // Show One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
          }

          if (notification.isDismissedMoment()) {
            console.log('One Tap dismissed by user');
          }
        });
      } catch (error) {
        console.error('Failed to initialize Google One Tap:', error);
        onError?.(error as Error);
      }
    };

    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
      try {
        // Send credential to backend for verification
        const result = await fetch('/api/auth/google/onetap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        if (!result.ok) {
          throw new Error('Failed to authenticate with Google One Tap');
        }

        const data = await result.json();

        if (data.success) {
          toast.success('Welcome back!', {
            description: 'Signed in with Google. Redirecting...',
          });

          onSuccess?.(response.credential);

          // Redirect to account page
          setTimeout(() => {
            window.location.href = '/account';
          }, 1000);
        } else {
          throw new Error(data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Google One Tap error:', error);
        toast.error('Sign in failed', {
          description: error instanceof Error ? error.message : 'Unable to sign in with Google',
        });
        onError?.(error as Error);
      }
    };

    loadGoogleScript();

    // Cleanup on unmount
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [clientId, autoSelect, cancelOnTapOutside, onSuccess, onError]);

  // One Tap renders itself via Google's SDK, no visual component needed
  return null;
}
