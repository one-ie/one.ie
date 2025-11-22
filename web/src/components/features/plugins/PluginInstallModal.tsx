/**
 * PluginInstallModal Component
 * Installation flow for plugins with dependency resolution and configuration
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { Plugin } from "@/types/plugin";
import { AlertCircle, CheckCircle2, Download, Package } from "lucide-react";
import { useState } from "react";
import { PluginConfigForm } from "./PluginConfigForm";

interface PluginInstallModalProps {
  plugin: Plugin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall?: (plugin: Plugin, config: Record<string, unknown>) => Promise<void>;
}

type InstallStep = "review" | "dependencies" | "config" | "installing" | "success" | "error";

export function PluginInstallModal({
  plugin,
  open,
  onOpenChange,
  onInstall,
}: PluginInstallModalProps) {
  const [step, setStep] = useState<InstallStep>("review");
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!plugin) return null;

  const hasDependencies = plugin.dependencies && plugin.dependencies.length > 0;
  const hasSettings = plugin.settings && plugin.settings.length > 0;

  const handleInstall = async () => {
    try {
      setStep("installing");
      setProgress(0);

      // Simulate installation progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onInstall?.(plugin, config);

      clearInterval(progressInterval);
      setProgress(100);
      setStep("success");

      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Installation failed");
      setStep("error");
    }
  };

  const resetModal = () => {
    setStep("review");
    setConfig({});
    setProgress(0);
    setError(null);
  };

  const handleNext = () => {
    if (step === "review" && hasDependencies) {
      setStep("dependencies");
    } else if (step === "review" || step === "dependencies") {
      if (hasSettings) {
        setStep("config");
      } else {
        handleInstall();
      }
    } else if (step === "config") {
      handleInstall();
    }
  };

  const handleBack = () => {
    if (step === "config") {
      setStep(hasDependencies ? "dependencies" : "review");
    } else if (step === "dependencies") {
      setStep("review");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "review" && `Install ${plugin.name}`}
            {step === "dependencies" && "Review Dependencies"}
            {step === "config" && "Configure Plugin"}
            {step === "installing" && "Installing..."}
            {step === "success" && "Installation Complete"}
            {step === "error" && "Installation Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "review" && `Review plugin details before installation`}
            {step === "dependencies" && `This plugin requires additional dependencies`}
            {step === "config" && `Configure plugin settings`}
            {step === "installing" && `Please wait while we install ${plugin.name}`}
            {step === "success" && `${plugin.name} has been successfully installed`}
            {step === "error" && `An error occurred during installation`}
          </DialogDescription>
        </DialogHeader>

        {/* Review Step */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {plugin.thumbnail && (
                <img
                  src={plugin.thumbnail}
                  alt={plugin.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{plugin.name}</h3>
                <p className="text-sm text-muted-foreground">{plugin.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">v{plugin.version}</Badge>
                  <Badge variant="outline">by {plugin.author}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {plugin.capabilities.map((cap) => (
                  <Badge key={cap} variant="secondary">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            {hasDependencies && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Dependencies ({plugin.dependencies.length})</h4>
                  <p className="text-sm text-muted-foreground">
                    This plugin requires {plugin.dependencies.length} additional package(s)
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Dependencies Step */}
        {step === "dependencies" && hasDependencies && (
          <div className="space-y-3">
            {plugin.dependencies.map((dep) => (
              <div key={dep} className="flex items-center gap-3 p-3 border rounded-lg">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{dep}</p>
                  <p className="text-xs text-muted-foreground">Required dependency</p>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Config Step */}
        {step === "config" && hasSettings && (
          <PluginConfigForm
            settings={plugin.settings!}
            values={config}
            onChange={setConfig}
          />
        )}

        {/* Installing Step */}
        {step === "installing" && (
          <div className="space-y-4 py-6">
            <div className="flex flex-col items-center gap-4">
              <Download className="w-12 h-12 text-primary animate-bounce" />
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress < 30 && "Downloading plugin..."}
                {progress >= 30 && progress < 60 && "Installing dependencies..."}
                {progress >= 60 && progress < 90 && "Configuring plugin..."}
                {progress >= 90 && "Finalizing installation..."}
              </p>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-center font-medium">
              {plugin.name} is now installed and ready to use!
            </p>
          </div>
        )}

        {/* Error Step */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
            <div className="text-center space-y-2">
              <p className="font-medium">Installation failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {(step === "review" || step === "dependencies" || step === "config") && (
            <>
              {step !== "review" && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext}>
                {step === "config" || (!hasDependencies && !hasSettings && step === "review")
                  ? "Install"
                  : "Next"}
              </Button>
            </>
          )}
          {step === "error" && (
            <Button onClick={() => setStep("review")}>Try Again</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
