/**
 * GroupInvite Component
 *
 * Invite form for adding members
 * Part of GROUPS dimension (ontology-ui)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "../types";
import { cn, isValidEmail, getRoleDisplay } from "../utils";

export interface GroupInviteProps {
  groupName: string;
  onInvite?: (emails: string[], role: UserRole) => void;
  onCancel?: () => void;
  className?: string;
}

export function GroupInvite({
  groupName,
  onInvite,
  onCancel,
  className,
}: GroupInviteProps) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole>("org_user");

  const handleAddEmail = () => {
    if (email && isValidEmail(email) && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length > 0) {
      onInvite?.(emails, role);
    }
  };

  const isValidNewEmail = email && isValidEmail(email) && !emails.includes(email);

  return (
    <Card className={cn("bg-background p-1 shadow-sm rounded-md", className)}>
      <div className="bg-foreground rounded-md p-6 text-font">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-font">
            <span>✉️</span>
            Invite to {groupName}
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-font">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (isValidNewEmail) handleAddEmail();
                    }
                  }}
                  className="bg-foreground text-font border-font/20"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddEmail}
                  disabled={!isValidNewEmail}
                >
                  Add
                </Button>
              </div>
            </div>

            {emails.length > 0 && (
              <div className="space-y-2">
                <Label className="text-font">Invited ({emails.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors duration-150"
                      onClick={() => handleRemoveEmail(email)}
                    >
                      {email} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role" className="text-font">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_owner">{getRoleDisplay("org_owner")}</SelectItem>
                  <SelectItem value="org_user">{getRoleDisplay("org_user")}</SelectItem>
                  <SelectItem value="customer">{getRoleDisplay("customer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 p-0 pt-6 border-t border-font/10">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={emails.length === 0}>
              Send {emails.length} Invite{emails.length !== 1 ? "s" : ""}
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}
