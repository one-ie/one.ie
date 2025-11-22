/**
 * PluginConfigForm Component
 * Dynamic configuration form for plugin settings
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { PluginSetting } from "@/types/plugin";
import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";

interface PluginConfigFormProps {
  settings: PluginSetting[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function PluginConfigForm({
  settings,
  values,
  onChange,
}: PluginConfigFormProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleChange = (id: string, value: unknown) => {
    onChange({ ...values, [id]: value });
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderField = (setting: PluginSetting) => {
    const value = values[setting.id] ?? setting.defaultValue;
    const isSecret = setting.type === "secret";
    const showSecret = showSecrets[setting.id];

    switch (setting.type) {
      case "string":
      case "secret":
        return (
          <div className="relative">
            <Input
              type={isSecret && !showSecret ? "password" : "text"}
              value={value as string || ""}
              onChange={(e) => handleChange(setting.id, e.target.value)}
              placeholder={setting.defaultValue as string}
            />
            {isSecret && (
              <button
                type="button"
                onClick={() => toggleSecretVisibility(setting.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={value as number || ""}
            onChange={(e) => handleChange(setting.id, parseFloat(e.target.value))}
            placeholder={setting.defaultValue?.toString()}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`checkbox-${setting.id}`}
              checked={value as boolean || false}
              onCheckedChange={(checked) => handleChange(setting.id, checked)}
            />
            <Label
              htmlFor={`checkbox-${setting.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              Enable {setting.name.toLowerCase()}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  // Group settings by required/optional
  const requiredSettings = settings.filter((s) => s.required);
  const optionalSettings = settings.filter((s) => !s.required);

  return (
    <div className="space-y-6">
      {/* Required Settings */}
      {requiredSettings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Required Settings</h4>
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          </div>
          <div className="space-y-4">
            {requiredSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.name}
                  </Label>
                  {setting.type === "secret" && (
                    <Badge variant="outline" className="text-xs">
                      Secret
                    </Badge>
                  )}
                </div>
                {setting.description && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{setting.description}</p>
                  </div>
                )}
                {renderField(setting)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Separator */}
      {requiredSettings.length > 0 && optionalSettings.length > 0 && (
        <Separator />
      )}

      {/* Optional Settings */}
      {optionalSettings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">Optional Settings</h4>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          </div>
          <div className="space-y-4">
            {optionalSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.name}
                  </Label>
                  {setting.type === "secret" && (
                    <Badge variant="outline" className="text-xs">
                      Secret
                    </Badge>
                  )}
                </div>
                {setting.description && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{setting.description}</p>
                  </div>
                )}
                {renderField(setting)}
              </div>
            ))}
          </div>
        </div>
      )}

      {settings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No configuration required</p>
        </div>
      )}
    </div>
  );
}
