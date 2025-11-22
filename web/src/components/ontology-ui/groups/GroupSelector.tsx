/**
 * GroupSelector Component
 *
 * Dropdown selector for choosing groups
 * Part of GROUPS dimension (ontology-ui)
 */

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Group } from "../types";
import { cn } from "../utils";

export interface GroupSelectorProps {
  groups: Group[];
  value?: string;
  onChange?: (groupId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GroupSelector({
  groups,
  value,
  onChange,
  placeholder = "Select a group",
  disabled = false,
  className,
}: GroupSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full bg-foreground text-font border-font/20", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-foreground border-font/20">
        {groups.map((group) => (
          <SelectItem key={group._id} value={group._id} className="text-font hover:bg-background">
            <div className="flex items-center gap-2">
              <span>🏢</span>
              <span>{group.name}</span>
              {group.parentGroupId && (
                <span className="text-xs text-font/60">(nested)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
