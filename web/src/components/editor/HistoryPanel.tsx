/**
 * History Panel - Visual History Timeline
 *
 * Displays undo/redo history with:
 * - Timeline view of all changes
 * - Click to jump to any point
 * - Undo/redo buttons
 * - Change filtering (AI vs User)
 * - Diff preview
 */

import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  historyStack$,
  canUndo$,
  canRedo$,
  historyStats$,
  undo,
  redo,
  goto,
  clear,
  closeHistoryPanel,
} from "@/stores/funnelHistory";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Undo2,
  Redo2,
  Trash2,
  X,
  Clock,
  Sparkles,
  User,
  Settings,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const stack = useStore(historyStack$);
  const canUndoValue = useStore(canUndo$);
  const canRedoValue = useStore(canRedo$);
  const stats = useStore(historyStats$);

  const handleUndo = async () => {
    await undo();
  };

  const handleRedo = async () => {
    await redo();
  };

  const handleGoto = async (index: number) => {
    await goto(index);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      clear();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 sm:max-w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            History
          </SheetTitle>
          <SheetDescription>
            View and navigate your editing history
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{stats.totalEntries}</div>
                  <div className="text-xs text-muted-foreground">Changes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.aiChanges}
                  </div>
                  <div className="text-xs text-muted-foreground">AI</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {stats.userChanges}
                  </div>
                  <div className="text-xs text-muted-foreground">User</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndoValue}
              className="flex-1"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedoValue}
              className="flex-1"
            >
              <Redo2 className="mr-2 h-4 w-4" />
              Redo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={stack.entries.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <div className="mb-2 text-sm font-medium">Timeline</div>
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {stack.entries.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No history yet. Make some changes to see them here.
                </div>
              ) : (
                <div className="space-y-2">
                  {stack.entries.map((entry, index) => (
                    <HistoryEntry
                      key={entry.id}
                      entry={entry}
                      index={index}
                      isActive={index === stack.currentIndex}
                      onClick={() => handleGoto(index)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// HISTORY ENTRY COMPONENT
// ============================================================================

interface HistoryEntryProps {
  entry: any;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function HistoryEntry({ entry, index, isActive, onClick }: HistoryEntryProps) {
  const source = entry.metadata?.source || "user";

  const sourceIcon = {
    ai: <Sparkles className="h-3 w-3" />,
    user: <User className="h-3 w-3" />,
    system: <Settings className="h-3 w-3" />,
  }[source];

  const sourceColor = {
    ai: "bg-primary text-primary-foreground",
    user: "bg-secondary text-secondary-foreground",
    system: "bg-muted text-muted-foreground",
  }[source];

  return (
    <button
      onClick={onClick}
      className={`
        w-full rounded-lg border p-3 text-left transition-all hover:border-primary
        ${isActive ? "border-primary bg-primary/5" : "border-border"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`${sourceColor} h-5 px-1.5`}>
              <span className="mr-1">{sourceIcon}</span>
              <span className="text-xs capitalize">{source}</span>
            </Badge>
            {isActive && (
              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                Current
              </Badge>
            )}
          </div>
          <div className="font-medium text-sm truncate">{entry.action}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// COMPACT HISTORY CONTROLS
// ============================================================================

/**
 * Compact undo/redo controls for toolbar
 */
export function HistoryControls() {
  const canUndoValue = useStore(canUndo$);
  const canRedoValue = useStore(canRedo$);

  const handleUndo = async () => {
    const result = await undo();
    if (result.success && result.entry) {
      // Show toast notification
      console.log(`Undone: ${result.entry.action}`);
    }
  };

  const handleRedo = async () => {
    const result = await redo();
    if (result.success && result.entry) {
      // Show toast notification
      console.log(`Redone: ${result.entry.action}`);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        disabled={!canUndoValue}
        title="Undo (Cmd/Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRedo}
        disabled={!canRedoValue}
        title="Redo (Cmd/Ctrl+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ============================================================================
// HISTORY BUTTON (Opens Panel)
// ============================================================================

/**
 * Button to open history panel
 */
export function HistoryButton({ onClick }: { onClick: () => void }) {
  const stats = useStore(historyStats$);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      title="History (Cmd/Ctrl+H)"
    >
      <Clock className="mr-2 h-4 w-4" />
      History
      {stats.totalEntries > 0 && (
        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
          {stats.totalEntries}
        </Badge>
      )}
    </Button>
  );
}
