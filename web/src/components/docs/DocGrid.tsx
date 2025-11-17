import type { CollectionEntry } from "astro:content";
import { FileText, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type DocEntry = CollectionEntry<"docs">;

type GridColumns = 2 | 3 | 4;

interface DocGridProps {
  entries: DocEntry[];
  columns: GridColumns;
  showDescription?: boolean;
  onTagClick?: (tag: string) => void;
}

export function DocGrid({ entries, columns, showDescription = true, onTagClick }: DocGridProps) {
  const createTagUrl = (tag: string) => `/docs?tag=${encodeURIComponent(tag)}`;

  const gridClass =
    columns === 4
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : columns === 3
        ? "md:grid-cols-2 lg:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <div className={`grid gap-${columns === 4 ? "2" : "3"} ${gridClass}`}>
      {entries
        .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
        .map((entry) => (
          <Card
            key={entry.id}
            className={`h-full ${
              columns === 4 ? "p-2" : "p-3"
            } hover:shadow-md transition-shadow border-muted/50 hover:border-primary/30 bg-background/80 backdrop-blur-sm cursor-pointer group`}
            onClick={() => {
              window.location.href = `/docs/${entry.slug}`;
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="mt-0.5 p-1.5 rounded-md bg-muted/40 group-hover:bg-primary/10 transition-colors">
                <FileText
                  className={`${
                    columns === 4 ? "w-3.5 h-3.5" : "w-4 h-4"
                  } text-muted-foreground group-hover:text-primary transition-colors`}
                />
              </div>
              <h3
                className={`${
                  columns === 4 ? "text-base" : "text-base"
                } font-medium group-hover:text-primary transition-colors line-clamp-1`}
              >
                {entry.data.title}
              </h3>
            </div>

            {showDescription && columns !== 4 && (
              <>
                <p className="text-base text-muted-foreground line-clamp-2 mb-2 ml-8 group-hover:text-muted-foreground/80 transition-colors">
                  {entry.data.description}
                </p>
                <div className="flex flex-wrap gap-1 ml-8">
                  {entry.data.tags
                    ? entry.data.tags.map((tag) => (
                        <a
                          key={tag}
                          href={createTagUrl(tag)}
                          className="no-underline hover:no-underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge className="text-xs px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary border-none flex items-center gap-1 cursor-pointer">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </Badge>
                        </a>
                      ))
                    : null}
                </div>
              </>
            )}
          </Card>
        ))}
    </div>
  );
}
