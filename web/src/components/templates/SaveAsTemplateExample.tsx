/**
 * SaveAsTemplateExample - Example usage of SaveAsTemplateModal
 *
 * This demonstrates how to integrate the "Save as Template" functionality
 * into your funnel builder UI.
 */

import { useState } from "react";
import { SaveAsTemplateModal } from "./SaveAsTemplateModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookTemplate, MoreVertical } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface FunnelActionsProps {
  funnelId: Id<"things">;
  funnelName: string;
  funnelDescription?: string;
  stepCount: number;
}

/**
 * Example 1: Simple Button
 *
 * Use this for dedicated "Save as Template" buttons
 */
export function SimpleSaveTemplateButton({ funnelId, funnelName, funnelDescription, stepCount }: FunnelActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <BookTemplate className="mr-2 h-4 w-4" />
        Save as Template
      </Button>

      <SaveAsTemplateModal
        funnelId={funnelId}
        funnelName={funnelName}
        funnelDescription={funnelDescription}
        stepCount={stepCount}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(templateId) => {
          console.log("Template created:", templateId);
          // Optional: Navigate to templates page
          // window.location.href = `/templates/${templateId}`;
        }}
      />
    </>
  );
}

/**
 * Example 2: Dropdown Menu Item
 *
 * Use this for funnel action menus (alongside Edit, Duplicate, Delete, etc.)
 */
export function FunnelActionsDropdown({ funnelId, funnelName, funnelDescription, stepCount }: FunnelActionsProps) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit Funnel</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSaveTemplate(true)}>
            <BookTemplate className="mr-2 h-4 w-4" />
            Save as Template
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaveAsTemplateModal
        funnelId={funnelId}
        funnelName={funnelName}
        funnelDescription={funnelDescription}
        stepCount={stepCount}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSuccess={(templateId) => {
          console.log("Template created:", templateId);
        }}
      />
    </>
  );
}

/**
 * Example 3: In Funnel Builder
 *
 * Use this in the main funnel builder toolbar
 */
export function FunnelBuilderToolbar({ funnelId, funnelName, funnelDescription, stepCount }: FunnelActionsProps) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h2 className="text-lg font-semibold">{funnelName}</h2>
        <p className="text-sm text-muted-foreground">{stepCount} steps</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline">Preview</Button>
        <Button variant="outline" onClick={() => setShowSaveTemplate(true)}>
          <BookTemplate className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
        <Button>Publish</Button>
      </div>

      <SaveAsTemplateModal
        funnelId={funnelId}
        funnelName={funnelName}
        funnelDescription={funnelDescription}
        stepCount={stepCount}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSuccess={(templateId) => {
          // Show success toast
          console.log("Template saved successfully:", templateId);
          // Optional: Navigate to templates
          // router.push(`/templates`);
        }}
      />
    </div>
  );
}

/**
 * Example 4: Funnel Card (Dashboard)
 *
 * Use this in funnel dashboard/list views
 */
export function FunnelCard({ funnelId, funnelName, funnelDescription, stepCount }: FunnelActionsProps) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  return (
    <>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{funnelName}</h3>
            <p className="text-sm text-muted-foreground">{funnelDescription}</p>
          </div>
          <FunnelActionsDropdown
            funnelId={funnelId}
            funnelName={funnelName}
            funnelDescription={funnelDescription}
            stepCount={stepCount}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">{stepCount} steps</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSaveTemplate(true)}>
              <BookTemplate className="mr-2 h-3 w-3" />
              Template
            </Button>
          </div>
        </div>
      </div>

      <SaveAsTemplateModal
        funnelId={funnelId}
        funnelName={funnelName}
        funnelDescription={funnelDescription}
        stepCount={stepCount}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSuccess={(templateId) => {
          console.log("Template created:", templateId);
        }}
      />
    </>
  );
}
