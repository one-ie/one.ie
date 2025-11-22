/**
 * CourseCard - Card for courses and learning content
 *
 * Displays course information with price, progress, and enrollment.
 * Supports thing-level branding for course providers.
 */

import type { Thing } from "@/lib/ontology/types";
import { ThingCard } from "../universal/ThingCard";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "../utils";

interface CourseCardProps {
  course: Thing;
  showPrice?: boolean;
  showProgress?: boolean;
  progress?: number;
  price?: number;
  onEnroll?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CourseCard({
  course,
  showPrice = true,
  showProgress = false,
  progress = 0,
  price,
  onEnroll,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className,
}: CourseCardProps) {
  const coursePrice = price ?? (course.properties?.price as number);
  const courseProgress = progress ?? (course.properties?.progress as number) ?? 0;
  const lessons = course.properties?.lessons as number;
  const duration = course.properties?.duration as string;

  const contentPadding = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <ThingCard
      thing={course}
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
            <div className="flex-1">
              <CardTitle className={cn(
                "flex items-center gap-2 text-font",
                size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
              )}>
                <span className="text-2xl">📚</span>
                <span className="line-clamp-1">{course.name}</span>
              </CardTitle>
              {course.properties.description && (
                <CardDescription className="mt-1 line-clamp-2 text-font/70">
                  {course.properties.description}
                </CardDescription>
              )}
            </div>
            {course.status && (
              <Badge
                variant="outline"
                className="ml-2 border-font/20 text-font"
              >
                {course.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-0">
          {showPrice && coursePrice !== undefined && (
            <div className="flex items-center justify-between p-3 bg-background rounded-md">
              <span className="text-sm text-font/60">Price</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(coursePrice)}
              </span>
            </div>
          )}

          {showProgress && (
            <div className="space-y-2 p-3 bg-background rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-font/60">Progress</span>
                <span className="font-medium text-font">{courseProgress}%</span>
              </div>
              <Progress
                value={courseProgress}
                className="h-2 bg-font/10"
              />
            </div>
          )}

          {lessons && (
            <div className="flex items-center gap-2 text-sm text-font/60">
              <span>📖</span>
              <span>{lessons} lessons</span>
            </div>
          )}

          {duration && (
            <div className="flex items-center gap-2 text-sm text-font/60">
              <span>⏱️</span>
              <span>{duration}</span>
            </div>
          )}
        </CardContent>

        {onEnroll && (
          <CardFooter className="px-0 pt-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEnroll();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Enroll Now
            </Button>
          </CardFooter>
        )}
      </div>
    </ThingCard>
  );
}
