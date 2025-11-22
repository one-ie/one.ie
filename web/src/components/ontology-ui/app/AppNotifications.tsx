/**
 * AppNotifications - Notification center component
 *
 * Uses 6-token design system for notification displays.
 */

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "../utils";
import { Bell, Check, X } from "lucide-react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  type?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}

export interface AppNotificationsProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

/**
 * AppNotifications - Notification dropdown
 *
 * @example
 * ```tsx
 * <AppNotifications
 *   notifications={notifications}
 *   onMarkAsRead={(id) => markRead(id)}
 *   onMarkAllAsRead={() => markAllRead()}
 *   onDismiss={(id) => dismissNotification(id)}
 * />
 * ```
 */
export function AppNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  className,
}: AppNotificationsProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeColors = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-font">Notifications</h3>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-4 border-b hover:bg-background transition-colors",
                  !notification.read && "bg-primary/5"
                )}
              >
                {/* Icon/Unread Indicator */}
                <div className="flex-shrink-0">
                  {notification.icon || (
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-2",
                        !notification.read ? "bg-primary" : "bg-transparent"
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-font mb-1">
                    {notification.title}
                  </p>
                  <p className="text-xs text-font/60 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-font/40">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-1">
                  {!notification.read && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-6 w-6"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDismiss(notification.id)}
                      className="h-6 w-6"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-font/60">
              No notifications
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
