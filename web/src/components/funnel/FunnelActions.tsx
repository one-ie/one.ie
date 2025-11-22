/**
 * FunnelActions - Comprehensive action menu for funnel operations
 *
 * Provides dropdown menu with all funnel actions:
 * - Edit, Duplicate, Publish/Unpublish, Archive, Delete, Export
 * - Confirmation dialogs for destructive actions
 * - Keyboard shortcuts support
 * - Status-based action visibility
 * - Permission-aware rendering
 */

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Edit,
  Copy,
  Upload,
  DownloadCloud,
  Archive,
  Trash2,
  FileDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Thing } from "@/components/ontology-ui/types";

export interface FunnelAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void | Promise<void>;
  shortcut?: string;
  variant?: "default" | "destructive";
  confirm?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  showWhen?: (funnel: Thing) => boolean;
}

interface FunnelActionsProps {
  funnel: Thing;
  onEdit?: (funnel: Thing) => void | Promise<void>;
  onDuplicate?: (funnel: Thing) => void | Promise<void>;
  onPublish?: (funnel: Thing) => void | Promise<void>;
  onUnpublish?: (funnel: Thing) => void | Promise<void>;
  onArchive?: (funnel: Thing) => void | Promise<void>;
  onDelete?: (funnel: Thing) => void | Promise<void>;
  onExport?: (funnel: Thing) => void | Promise<void>;
  showShortcuts?: boolean;
  className?: string;
}

export function FunnelActions({
  funnel,
  onEdit,
  onDuplicate,
  onPublish,
  onUnpublish,
  onArchive,
  onDelete,
  onExport,
  showShortcuts = true,
  className,
}: FunnelActionsProps) {
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<FunnelAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Funnel status helpers
  const isPublished = funnel.status === "published";
  const isDraft = funnel.status === "draft";
  const isArchived = funnel.status === "archived";

  // Define all available actions
  const actions: FunnelAction[] = [
    // Edit action
    ...(onEdit
      ? [
          {
            id: "edit",
            label: "Edit Funnel",
            icon: Edit,
            onClick: async () => {
              await onEdit(funnel);
            },
            shortcut: "⌘E",
            showWhen: () => !isArchived,
          } as FunnelAction,
        ]
      : []),

    // Duplicate action
    ...(onDuplicate
      ? [
          {
            id: "duplicate",
            label: "Duplicate",
            icon: Copy,
            onClick: async () => {
              await onDuplicate(funnel);
              toast({
                title: "Funnel duplicated",
                description: `"${funnel.name}" has been duplicated successfully.`,
              });
            },
            shortcut: "⌘D",
          } as FunnelAction,
        ]
      : []),

    // Publish action
    ...(onPublish && !isPublished
      ? [
          {
            id: "publish",
            label: "Publish",
            icon: Upload,
            onClick: async () => {
              await onPublish(funnel);
              toast({
                title: "Funnel published",
                description: `"${funnel.name}" is now live and accessible.`,
              });
            },
            shortcut: "⌘P",
            confirm: true,
            confirmTitle: "Publish funnel?",
            confirmDescription: `This will make "${funnel.name}" publicly accessible. Are you sure you want to continue?`,
            showWhen: () => !isArchived,
          } as FunnelAction,
        ]
      : []),

    // Unpublish action
    ...(onUnpublish && isPublished
      ? [
          {
            id: "unpublish",
            label: "Unpublish",
            icon: EyeOff,
            onClick: async () => {
              await onUnpublish(funnel);
              toast({
                title: "Funnel unpublished",
                description: `"${funnel.name}" is no longer publicly accessible.`,
              });
            },
            shortcut: "⌘U",
            confirm: true,
            confirmTitle: "Unpublish funnel?",
            confirmDescription: `This will make "${funnel.name}" private and inaccessible to visitors. Are you sure?`,
          } as FunnelAction,
        ]
      : []),

    // Export action
    ...(onExport
      ? [
          {
            id: "export",
            label: "Export",
            icon: FileDown,
            onClick: async () => {
              await onExport(funnel);
              toast({
                title: "Export started",
                description: `Exporting "${funnel.name}"...`,
              });
            },
            shortcut: "⌘⇧E",
          } as FunnelAction,
        ]
      : []),

    // Archive action
    ...(onArchive && !isArchived
      ? [
          {
            id: "archive",
            label: "Archive",
            icon: Archive,
            onClick: async () => {
              await onArchive(funnel);
              toast({
                title: "Funnel archived",
                description: `"${funnel.name}" has been archived.`,
              });
            },
            shortcut: "⌘⇧A",
            variant: "destructive",
            confirm: true,
            confirmTitle: "Archive funnel?",
            confirmDescription: `This will archive "${funnel.name}". You can restore it later from the archived funnels section.`,
          } as FunnelAction,
        ]
      : []),

    // Delete action
    ...(onDelete
      ? [
          {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            onClick: async () => {
              await onDelete(funnel);
              toast({
                title: "Funnel deleted",
                description: `"${funnel.name}" has been permanently deleted.`,
                variant: "destructive",
              });
            },
            shortcut: "⌘⌫",
            variant: "destructive",
            confirm: true,
            confirmTitle: "Delete funnel permanently?",
            confirmDescription: `This will permanently delete "${funnel.name}". This action cannot be undone.`,
          } as FunnelAction,
        ]
      : []),
  ];

  // Filter actions based on showWhen conditions
  const visibleActions = actions.filter(
    (action) => !action.showWhen || action.showWhen(funnel)
  );

  // Handle action execution
  const executeAction = async (action: FunnelAction) => {
    if (action.confirm) {
      setConfirmAction(action);
    } else {
      setIsExecuting(true);
      try {
        await action.onClick();
      } catch (error) {
        toast({
          title: "Action failed",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsExecuting(false);
      }
    }
  };

  // Handle confirmed action
  const handleConfirm = async () => {
    if (!confirmAction) return;

    setIsExecuting(true);
    try {
      await confirmAction.onClick();
      setConfirmAction(null);
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!showShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (!cmdKey) return;

      // Find matching action by shortcut
      for (const action of visibleActions) {
        if (!action.shortcut) continue;

        const shortcut = action.shortcut.replace("⌘", "");
        const isShiftRequired = shortcut.includes("⇧");
        const key = shortcut.replace("⇧", "").toLowerCase();

        if (
          e.key.toLowerCase() === key &&
          (!isShiftRequired || e.shiftKey)
        ) {
          e.preventDefault();
          executeAction(action);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleActions, showShortcuts]);

  if (visibleActions.length === 0) {
    return null;
  }

  // Separate destructive actions
  const regularActions = visibleActions.filter((a) => a.variant !== "destructive");
  const destructiveActions = visibleActions.filter((a) => a.variant === "destructive");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={className}
            aria-label="Funnel actions"
            disabled={isExecuting}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Funnel Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {regularActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => executeAction(action)}
                disabled={isExecuting}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
                {showShortcuts && action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            );
          })}

          {destructiveActions.length > 0 && regularActions.length > 0 && (
            <DropdownMenuSeparator />
          )}

          {destructiveActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => executeAction(action)}
                disabled={isExecuting}
                className="text-destructive focus:text-destructive"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
                {showShortcuts && action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || confirmAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription ||
                `Are you sure you want to ${confirmAction?.label.toLowerCase()}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isExecuting}
              className={
                confirmAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {isExecuting ? "Processing..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
