/**
 * TemplateShareExample - Complete integration example
 *
 * Shows how to use TemplateShareModal with ThingActions and backend
 */

"use client";

import { useState } from "react";
import { ThingActions } from "@/components/ontology-ui/things/ThingActions";
import { TemplateShareModal, type ShareVisibility, type SharePermission } from "./TemplateShareModal";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock template data
const exampleTemplate = {
  _id: "template_123" as any,
  name: "E-commerce Sales Funnel",
  type: "funnel_template",
  groupId: "group_abc",
  properties: {
    visibility: "private" as ShareVisibility,
    sharePermission: "view" as SharePermission,
    stepCount: 5,
    conversionRate: 0.23,
  },
};

export function TemplateShareExample() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [template, setTemplate] = useState(exampleTemplate);

  // Handle share settings update
  const handleShare = async (
    visibility: ShareVisibility,
    permission: SharePermission
  ) => {
    // Simulate API call to update template
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update local state
    setTemplate(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        visibility,
        sharePermission: permission,
      },
    }));

    // In real app, call Convex mutation:
    /*
    await updateShareSettings({
      templateId: template._id,
      visibility,
      permission,
    });
    */

    console.log("Template shared:", { visibility, permission });
  };

  // Handle other actions
  const handleEdit = () => {
    toast.info("Edit clicked", {
      description: "Navigate to template editor",
    });
  };

  const handleDuplicate = () => {
    toast.info("Duplicate clicked", {
      description: "Creating copy of template",
    });
  };

  const handleDelete = () => {
    toast.error("Delete clicked", {
      description: "Are you sure? This action cannot be undone",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Template Sharing Example</h2>
        <p className="text-muted-foreground">
          Complete integration with ThingActions and backend
        </p>
      </div>

      {/* Template Card with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{template.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{template.type}</Badge>
                <Badge
                  variant={
                    template.properties.visibility === "public"
                      ? "default"
                      : "outline"
                  }
                >
                  {template.properties.visibility}
                </Badge>
                <Badge variant="outline">
                  {template.properties.sharePermission}
                </Badge>
              </div>
            </div>

            {/* Thing Actions Menu */}
            <ThingActions
              thing={template}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onShare={() => setShareModalOpen(true)}
              onDelete={handleDelete}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Steps:</span>
              <span className="font-medium">{template.properties.stepCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conversion Rate:</span>
              <span className="font-medium">
                {(template.properties.conversionRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Share Permission:</span>
              <span className="font-medium capitalize">
                {template.properties.sharePermission}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground">
          Click the ••• menu and select "Share" to open the sharing modal
        </CardFooter>
      </Card>

      {/* Share Modal */}
      <TemplateShareModal
        template={template}
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        onShare={handleShare}
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">1. Click ••• menu</p>
            <p className="text-muted-foreground">
              ThingActions provides Edit, Duplicate, Share, and Delete options
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Select "Share"</p>
            <p className="text-muted-foreground">
              Opens TemplateShareModal with current settings
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">3. Choose visibility</p>
            <p className="text-muted-foreground">
              Private (only you), Team (organization), or Public (anyone)
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">4. Set permissions</p>
            <p className="text-muted-foreground">
              View Only (read-only) or Can Duplicate (can copy)
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">5. Copy share link</p>
            <p className="text-muted-foreground">
              Generated URL is copied to clipboard
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">6. Backend creates connection</p>
            <p className="text-muted-foreground">
              Connection with type "shared_template" tracks the share
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
