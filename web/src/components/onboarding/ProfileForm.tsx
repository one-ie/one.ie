/**
 * ProfileForm - Creator profile setup with username, bio, avatar
 *
 * Allows users to complete their profile information with
 * real-time validation for username availability
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useUpdateProfile,
  useCheckUsernameAvailable,
} from '@/hooks/useOnboarding';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

interface ProfileFormProps {
  userId: string;
  initialData?: {
    username?: string;
    bio?: string;
    avatar?: string;
  };
  onSuccess: () => void;
  onSkip?: () => void;
}

export function ProfileForm({
  userId,
  initialData,
  onSuccess,
  onSkip,
}: ProfileFormProps) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: updateProfile, loading } = useUpdateProfile();
  const { check: checkUsername, loading: checkingUsername } = useCheckUsernameAvailable();

  // Debounce username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      const available = await checkUsername(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (username && (username.length < 3 || username.length > 20)) {
      newErrors.username = 'Username must be 3-20 characters';
    }

    if (username && !/^[a-z0-9\-]+$/.test(username)) {
      newErrors.username = 'Username can only contain lowercase letters, numbers, and hyphens';
    }

    if (bio && bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, bio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (username && usernameStatus !== 'available') {
      setErrors({
        username: usernameStatus === 'taken' ? 'Username already taken' : 'Please check username',
      });
      return;
    }

    try {
      const result = await updateProfile({
        userId,
        username: username || undefined,
        bio: bio || undefined,
      });

      if (result.success) {
        toast.success('Profile updated!', {
          description: 'Your profile has been saved successfully.',
        });
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      toast.error('Update failed', { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username (Optional)</Label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="your-username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            disabled={loading}
            className={usernameStatus === 'checking' ? 'pr-10' : ''}
          />
          {username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingUsername ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              ) : usernameStatus === 'available' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : usernameStatus === 'taken' ? (
                <X className="w-4 h-4 text-destructive" />
              ) : null}
            </div>
          )}
        </div>
        {errors.username && (
          <p className="text-sm font-medium text-destructive">{errors.username}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-20 characters, lowercase letters, numbers, and hyphens only
        </p>
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={loading}
          rows={4}
          className="resize-none"
        />
        {errors.bio && (
          <p className="text-sm font-medium text-destructive">{errors.bio}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {bio.length}/500 characters
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertDescription className="text-sm">
          You can update your profile picture and other details later in your account settings.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          (username && usernameStatus !== 'available')
        }
      >
        {loading ? 'Saving...' : 'Continue'}
      </Button>

      {/* Skip Button */}
      {onSkip && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onSkip}
          disabled={loading}
        >
          Skip for Now
        </Button>
      )}
    </form>
  );
}
