/**
 * LessonCard - Card for individual lessons within courses
 *
 * Displays lesson information with progress, duration, and completion status.
 * Supports thing-level branding for different educational platforms.
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
import { cn } from "../utils";

interface LessonCardProps {
  lesson: Thing;
  completed?: boolean;
  duration?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LessonCard({
  lesson,
  completed = false,
  duration,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: LessonCardProps) {
  const lessonCompleted = completed ?? (lesson.properties?.completed as boolean) ?? false;
  const lessonDuration = duration ?? (lesson.properties?.duration as string);
  const lessonType = (lesson.properties?.type as string) || "video";

  const typeIcons: Record<string, string> = {
    video: "🎥",
    reading: "📖",
    quiz: "📝",
    assignment: "✍️",
  };

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={lesson}
      className={cn(
        interactive && "cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        lessonCompleted && "opacity-75",
        className
      )}
    >
      <div
        onClick={onClick}
        className={cn("bg-foreground rounded-md", contentPadding[size])}
      >
        <CardHeader className="px-0 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={cn(
                "flex items-center gap-2 text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                <span className="text-2xl">{typeIcons[lessonType] || "📚"}</span>
                <span className="line-clamp-1">{lesson.name}</span>
              </CardTitle>
              {lesson.properties.description && (
                <CardDescription className="mt-1 line-clamp-2 text-font/70">
                  {lesson.properties.description}
                </CardDescription>
              )}
            </div>
            {lessonCompleted ? (
              <Badge
                variant="outline"
                className="ml-2 bg-tertiary/10 text-tertiary border-tertiary/30"
              >
                ✓ Completed
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="ml-2 border-font/20 text-font"
              >
                {lessonType}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex items-center gap-4 text-sm text-font/60">
            {lessonDuration && (
              <div className="flex items-center gap-1">
                <span>⏱️</span>
                <span>{lessonDuration}</span>
              </div>
            )}
            {!lessonCompleted && interactive && (
              <div className="text-xs text-primary">
                Start lesson →
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </ThingCard>
  );
}
