'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Tag } from 'lucide-react';
import type { CollectionEntry } from 'astro:content';

type DocEntry = CollectionEntry<'docs'>;

interface DocListProps {
  entries: DocEntry[];
  onTagClick?: (tag: string) => void;
}

export function DocList({ entries, onTagClick }: DocListProps) {
  const createTagUrl = (tag: string) => `/docs?tag=${encodeURIComponent(tag)}`;

  return (
    <div className="space-y-1.5">
      {entries
        .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
        .map((entry) => (
          <Card
            key={entry.id}
            className="group hover:shadow-sm transition-all duration-300 border-muted/30 hover:border-primary/30 bg-background/80 backdrop-blur-sm py-2 px-3 cursor-pointer"
            onClick={() => {
              window.location.href = `/docs/${entry.slug}`;
            }}
          >
            <div className="flex gap-2">
              <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-md bg-muted/30 group-hover:bg-primary/10 transition-colors h-fit">
                <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="min-w-0 flex flex-col gap-1 flex-grow">
                <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                  {entry.data.title}
                </h3>
                <p className="text-base text-muted-foreground line-clamp-1">
                  {entry.data.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.data.tags ? (
                    entry.data.tags.slice(0, 4).map((tag) => (
                      <a
                        key={tag}
                        href={createTagUrl(tag)}
                        className="no-underline hover:no-underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Badge className="text-base px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary border-none flex items-center gap-1 cursor-pointer">
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                        </Badge>
                      </a>
                    ))
                  ) : null}
                  {entry.data.tags && entry.data.tags.length > 4 && (
                    <span className="text-base text-muted-foreground">
                      +{entry.data.tags.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  );
}
