/**
 * WorkspaceForm - Creator workspace creation with slug validation
 *
 * Allows users to create their first workspace with
 * auto-generated and customizable slug
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useCreateWorkspace,
  useCheckWorkspaceSlugAvailable,
} from '@/hooks/useOnboarding';
import { toast } from 'sonner';
import { Check, X, AlertCircle } from 'lucide-react';

interface WorkspaceFormProps {
  userId: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export function WorkspaceForm({
  userId,
  onSuccess,
  onSkip,
}: WorkspaceFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: createWorkspace, loading } = useCreateWorkspace();
  const { check: checkSlug, loading: checkingSlug } = useCheckWorkspaceSlugAvailable();

  // Auto-generate slug from name
  const generateSlug = useCallback((workspaceName: string) => {
    return workspaceName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }, []);

  useEffect(() => {
    if (name && !slug) {
      const generated = generateSlug(name);
      setSlug(generated);
    }
  }, [name, slug, generateSlug]);

  // Debounce slug check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      const available = await checkSlug(slug);
      setSlugStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name || name.trim().length === 0) {
      newErrors.name = 'Workspace name is required';
    } else if (name.length < 2 || name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
    }

    if (!slug || slug.trim().length === 0) {
      newErrors.slug = 'Workspace slug is required';
    } else if (slug.length < 3 || slug.length > 50) {
      newErrors.slug = 'Slug must be 3-50 characters';
    } else if (!/^[a-z0-9\-]+$/.test(slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, slug, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (slugStatus !== 'available') {
      setErrors({
        ...errors,
        slug: slugStatus === 'taken' ? 'Slug already taken' : 'Please check slug',
      });
      return;
    }

    try {
      const result = await createWorkspace({
        userId,
        name,
        slug,
        description: description || undefined,
      });

      if (result.success) {
        toast.success('Workspace created!', {
          description: `Your workspace "${name}" has been created.`,
        });
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Workspace creation failed';
      toast.error('Creation failed', { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="My Workspace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        {errors.name && (
          <p className="text-sm font-medium text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This is the name of your workspace that others will see
        </p>
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label htmlFor="slug">Workspace URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">one.ie/</span>
          <div className="relative flex-1">
            <Input
              id="slug"
              type="text"
              placeholder="my-workspace"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              disabled={loading}
              className={slugStatus === 'checking' ? 'pr-10' : ''}
            />
            {slug && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingSlug ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                ) : slugStatus === 'available' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : slugStatus === 'taken' ? (
                  <X className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            )}
          </div>
        </div>
        {errors.slug && (
          <p className="text-sm font-medium text-destructive">{errors.slug}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-50 characters, lowercase, numbers, and hyphens only
        </p>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="What is this workspace for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-sm font-medium text-destructive">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {description.length}/500 characters
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Your workspace URL is how others will access your workspace.
          Choose something memorable and relevant.
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          !name ||
          (slug && slugStatus !== 'available')
        }
      >
        {loading ? 'Creating...' : 'Create Workspace'}
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
