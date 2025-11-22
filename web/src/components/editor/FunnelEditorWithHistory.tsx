/**
 * Funnel Editor with History - Example Integration
 *
 * Complete example showing how to integrate the history system
 * with a funnel editor component.
 */

import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  currentFunnel$,
  isHistoryPanelOpen$,
  recordChange,
  setupKeyboardShortcuts,
  openHistoryPanel,
  closeHistoryPanel,
} from "@/stores/funnelHistory";
import { HistoryPanel, HistoryControls, HistoryButton } from "./HistoryPanel";
import { trackUserChange, trackAIChange, startAIBatch, endAIBatch } from "@/lib/ai/history-tools";
import type { FunnelProperties } from "@/lib/schemas/funnel-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ============================================================================
// EXAMPLE EDITOR COMPONENT
// ============================================================================

export function FunnelEditorWithHistory() {
  const currentFunnel = useStore(currentFunnel$);
  const isHistoryOpen = useStore(isHistoryPanelOpen$);

  // Local state for form
  const [name, setName] = useState(currentFunnel?.name || "");
  const [slug, setSlug] = useState(currentFunnel?.slug || "");
  const [description, setDescription] = useState(currentFunnel?.description || "");

  // Setup keyboard shortcuts on mount
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts();
    return cleanup;
  }, []);

  // Sync local state when history changes
  useEffect(() => {
    if (currentFunnel) {
      setName(currentFunnel.name);
      setSlug(currentFunnel.slug);
      setDescription(currentFunnel.description || "");
    }
  }, [currentFunnel]);

  // Handle user changes
  const handleNameChange = (newName: string) => {
    if (!currentFunnel) return;

    const before = currentFunnel;
    const after = { ...currentFunnel, name: newName };

    trackUserChange("Changed funnel name", before, after);
    setName(newName);
  };

  const handleSlugChange = (newSlug: string) => {
    if (!currentFunnel) return;

    const before = currentFunnel;
    const after = { ...currentFunnel, slug: newSlug };

    trackUserChange("Changed funnel slug", before, after);
    setSlug(newSlug);
  };

  const handleDescriptionChange = (newDescription: string) => {
    if (!currentFunnel) return;

    const before = currentFunnel;
    const after = { ...currentFunnel, description: newDescription };

    trackUserChange("Changed funnel description", before, after);
    setDescription(newDescription);
  };

  // Simulate AI making multiple changes
  const handleAIOptimize = () => {
    if (!currentFunnel) return;

    // Start batch operation
    const batchId = startAIBatch();

    let state = currentFunnel;

    // Change 1: Update name
    const newName = state.name + " (AI Optimized)";
    trackAIChange("AI optimized funnel name", state, { ...state, name: newName }, batchId);
    state = { ...state, name: newName };

    // Change 2: Update description
    const newDescription = "AI-optimized funnel for maximum conversions";
    trackAIChange("AI optimized description", state, { ...state, description: newDescription }, batchId);
    state = { ...state, description: newDescription };

    // Change 3: Update theme
    trackAIChange("AI set theme to dark", state, { ...state, theme: "dark" as const }, batchId);
    state = { ...state, theme: "dark" as const };

    // End batch operation
    endAIBatch();

    // Update UI
    setName(state.name);
    setDescription(state.description || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with History Controls */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Funnel Editor</h1>
        <div className="flex items-center gap-2">
          <HistoryControls />
          <HistoryButton onClick={openHistoryPanel} />
        </div>
      </div>

      {/* Editor Form */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter funnel name"
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="funnel-slug"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Enter funnel description"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleAIOptimize} variant="outline">
              ✨ AI Optimize (Demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Help */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + Z</kbd>
              <span className="ml-2 text-muted-foreground">Undo</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + Shift + Z</kbd>
              <span className="ml-2 text-muted-foreground">Redo</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + Y</kbd>
              <span className="ml-2 text-muted-foreground">Redo (alternative)</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd/Ctrl + H</kbd>
              <span className="ml-2 text-muted-foreground">Toggle history</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Panel */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={closeHistoryPanel} />
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Track simple user change
 */
export function exampleTrackUserChange() {
  const before: FunnelProperties = {
    name: "My Funnel",
    slug: "my-funnel",
    status: "draft",
  };

  const after: FunnelProperties = {
    ...before,
    name: "My Updated Funnel",
  };

  trackUserChange("Changed funnel name", before, after);
}

/**
 * Example 2: Track AI batch changes
 */
export function exampleTrackAIBatch() {
  const batchId = startAIBatch();

  let state: FunnelProperties = {
    name: "My Funnel",
    slug: "my-funnel",
    status: "draft",
  };

  // Change 1
  const newState1 = { ...state, primaryColor: "#FF0000" };
  trackAIChange("AI set primary color", state, newState1, batchId);
  state = newState1;

  // Change 2
  const newState2 = { ...state, secondaryColor: "#00FF00" };
  trackAIChange("AI set secondary color", state, newState2, batchId);
  state = newState2;

  // Change 3
  const newState3 = { ...state, theme: "dark" as const };
  trackAIChange("AI set theme to dark", state, newState3, batchId);

  endAIBatch();
}

/**
 * Example 3: Manual undo/redo
 */
export async function exampleManualUndoRedo() {
  const { undo, redo } = await import("@/stores/funnelHistory");

  // Undo last change
  const undoResult = await undo();
  console.log(undoResult.success ? "Undone!" : "Nothing to undo");

  // Redo
  const redoResult = await redo();
  console.log(redoResult.success ? "Redone!" : "Nothing to redo");
}
