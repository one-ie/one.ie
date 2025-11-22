/**
 * ContentCard - Card for content items (articles, videos, podcasts)
 *
 * Displays content with metadata like views, author, and creation date.
 * Supports thing-level branding for different content platforms.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "../universal/ThingCard";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber, cn } from "../utils";

interface ContentCardProps {
  content: Thing;
  showViews?: boolean;
  views?: number;
  showAuthor?: boolean;
  author?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ContentCard({
  content,
  showViews = false,
  views = 0,
  showAuthor = false,
  author,
  variant = "default",
  size = "md",
  interactive = false,
  onClick,
  className = "",
}: ContentCardProps) {
  // Extract content type from properties or default to 'article'
  const contentType = (content.properties?.contentType as string) || "article";
  const contentViews = views || (content.properties?.views as number) || 0;
  const contentAuthor = author || (content.properties?.author as string);

  // Content type badge colors
  const contentTypeColors: Record<string, string> = {
    article: "bg-primary/10 text-primary border-primary/20",
    video: "bg-secondary/10 text-secondary border-secondary/20",
    podcast: "bg-tertiary/10 text-tertiary border-tertiary/20",
  };

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={content}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md", contentPadding[size])}
      >
        <CardHeader className="px-0 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">📄</span>
              <CardTitle className={cn(
                "text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                {content.name}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn("shrink-0", contentTypeColors[contentType] || "border-font/20 text-font")}
            >
              {contentType}
            </Badge>
          </div>
          {content.properties.description && (
            <CardDescription className="line-clamp-2 text-font/70">
              {content.properties.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex items-center gap-4 text-sm text-font/60">
            {showAuthor && contentAuthor && (
              <div className="flex items-center gap-1">
                <span>👤</span>
                <span>{contentAuthor}</span>
              </div>
            )}
            {showViews && (
              <div className="flex items-center gap-1">
                <span>👁️</span>
                <span>{formatNumber(contentViews)} views</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{formatDate(content.createdAt)}</span>
            </div>
          </div>

          {content.properties.tags && Array.isArray(content.properties.tags) && content.properties.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {content.properties.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-font/20 text-font"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </ThingCard>
  );
}
