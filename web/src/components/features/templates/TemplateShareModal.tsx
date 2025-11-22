/**
 * TemplateShareModal - Share funnel templates with team or publicly
 *
 * Features:
 * - Share visibility: Private, Team, Public
 * - Permission controls: View-only, Can-duplicate
 * - Generate shareable URLs
 * - Copy to clipboard
 * - Track shares via connections (shared_template)
 *
 * Integrates with ThingActions via onShare callback
 */

"use client";

import { useState } from "react";
import { Check, Copy, Globe, Lock, Users, Eye, FileEdit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Types
type ShareVisibility = "private" | "team" | "public";
type SharePermission = "view" | "duplicate";

interface Template {
  _id: string;
  name: string;
  type: string;
  groupId?: string;
  properties?: {
    visibility?: ShareVisibility;
    sharePermission?: SharePermission;
  };
}

interface TemplateShareModalProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (visibility: ShareVisibility, permission: SharePermission) => Promise<void>;
}

export function TemplateShareModal({
  template,
  open,
  onOpenChange,
  onShare,
}: TemplateShareModalProps) {
  // State
  const [visibility, setVisibility] = useState<ShareVisibility>(
    template.properties?.visibility || "private"
  );
  const [permission, setPermission] = useState<SharePermission>(
    template.properties?.sharePermission || "view"
  );
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate shareable URL
  const generateShareUrl = (): string => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    // Different URL patterns based on visibility
    switch (visibility) {
      case "public":
        return `${baseUrl}/templates/${template._id}`;
      case "team":
        return `${baseUrl}/team/templates/${template._id}`;
      case "private":
      default:
        return `${baseUrl}/templates/${template._id}?private=true`;
    }
  };

  const shareUrl = generateShareUrl();

  // Handle copy to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      toast.success("Link copied!", {
        description: "Share URL copied to clipboard",
        duration: 2000,
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy", {
        description: "Please copy the URL manually",
        duration: 3000,
      });
    }
  };

  // Handle share settings update
  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Call parent onShare handler if provided
      if (onShare) {
        await onShare(visibility, permission);
      }

      toast.success("Template shared!", {
        description: `Template is now ${visibility} with ${permission} permission`,
        duration: 3000,
      });

      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (err) {
      console.error("Failed to share template:", err);
      toast.error("Failed to share", {
        description: "Please try again",
        duration: 3000,
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Visibility options with icons
  const visibilityOptions = [
    {
      value: "private" as ShareVisibility,
      label: "Private",
      description: "Only you can access",
      icon: Lock,
    },
    {
      value: "team" as ShareVisibility,
      label: "Team",
      description: "Anyone in your organization",
      icon: Users,
    },
    {
      value: "public" as ShareVisibility,
      label: "Public",
      description: "Anyone with the link",
      icon: Globe,
    },
  ];

  // Permission options with icons
  const permissionOptions = [
    {
      value: "view" as SharePermission,
      label: "View Only",
      description: "Can view template details",
      icon: Eye,
    },
    {
      value: "duplicate" as SharePermission,
      label: "Can Duplicate",
      description: "Can copy and customize",
      icon: FileEdit,
    },
  ];

  const selectedVisibility = visibilityOptions.find(opt => opt.value === visibility);
  const selectedPermission = permissionOptions.find(opt => opt.value === permission);
  const VisibilityIcon = selectedVisibility?.icon || Lock;
  const PermissionIcon = selectedPermission?.icon || Eye;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VisibilityIcon className="h-5 w-5 text-primary" />
            Share Template
          </DialogTitle>
          <DialogDescription>
            Share "{template.name}" with your team or make it public
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visibility Selection */}
          <div className="space-y-3">
            <Label htmlFor="visibility" className="text-sm font-medium">
              Who can access
            </Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as ShareVisibility)}
            >
              <SelectTrigger id="visibility" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Permission Selection */}
          <div className="space-y-3">
            <Label htmlFor="permission" className="text-sm font-medium">
              What they can do
            </Label>
            <Select
              value={permission}
              onValueChange={(value) => setPermission(value as SharePermission)}
            >
              <SelectTrigger id="permission" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {permissionOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Share URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Share Link</Label>
              <Badge variant={visibility === "public" ? "default" : "secondary"}>
                {selectedVisibility?.label}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-xs"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={handleCopyUrl}
                variant={copied ? "default" : "outline"}
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {visibility === "public" && "Anyone with this link can access the template"}
              {visibility === "team" && "Only members of your organization can access"}
              {visibility === "private" && "Only you can access this template"}
            </p>
          </div>

          {/* Permission Badge */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <PermissionIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedPermission?.label}</p>
              <p className="text-xs text-muted-foreground">
                {selectedPermission?.description}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              "Update Share Settings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { ShareVisibility, SharePermission, Template, TemplateShareModalProps };
