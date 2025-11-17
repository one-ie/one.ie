/**
 * Date utility functions
 */

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateISO(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toISOString().split("T")[0];
}

export function getRelativeTime(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return formatDate(date);
}

/**
 * Format duration in seconds to readable format (e.g., "7:00" or "1:23:45")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
