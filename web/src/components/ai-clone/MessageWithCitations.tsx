/**
 * Message With Citations Component
 *
 * Displays AI clone messages with:
 * - Markdown-rendered content
 * - Citation footnotes
 * - Click to view source documents
 * - Highlight which knowledge chunks were used
 * - Thinking/reasoning process (optional)
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageCitation {
  chunkId: string;
  text: string;
  sourceId: string;
  sourceTitle: string;
  relevance: number;
}

interface MessageWithCitationsProps {
  content: string;
  citations?: MessageCitation[];
  reasoning?: string;
}

export function MessageWithCitations({
  content,
  citations = [],
  reasoning,
}: MessageWithCitationsProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  // Group citations by source
  const citationsBySource = citations.reduce((acc, citation) => {
    if (!acc[citation.sourceId]) {
      acc[citation.sourceId] = {
        sourceTitle: citation.sourceTitle,
        chunks: [],
      };
    }
    acc[citation.sourceId].chunks.push(citation);
    return acc;
  }, {} as Record<string, { sourceTitle: string; chunks: MessageCitation[] }>);

  return (
    <div className="space-y-4">
      {/* Reasoning process (if available) */}
      {reasoning && (
        <Collapsible open={showReasoning} onOpenChange={setShowReasoning}>
          <div className="rounded-lg border bg-muted/50 p-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between font-medium"
              >
                <span className="flex items-center gap-2">
                  {showReasoning ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  View reasoning process
                </span>
                <Badge variant="secondary" className="text-xs">
                  {citations.length} sources
                </Badge>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reasoning}
                </ReactMarkdown>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Main message content */}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom link renderer to highlight citation links
            a: ({ node, ...props }) => {
              const isCitation = props.href?.startsWith('#citation-');
              return (
                <a
                  {...props}
                  className={cn(
                    isCitation && 'text-primary hover:underline cursor-pointer',
                    props.className
                  )}
                  onClick={(e) => {
                    if (isCitation) {
                      e.preventDefault();
                      const citationId = props.href?.replace('#citation-', '');
                      setSelectedCitation(citationId || null);
                    }
                  }}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Citations section */}
      {citations.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="size-4" />
            <span>Sources ({citations.length})</span>
          </div>

          <div className="space-y-2">
            {Object.entries(citationsBySource).map(([sourceId, { sourceTitle, chunks }]) => (
              <Card
                key={sourceId}
                className={cn(
                  'p-3 hover:bg-accent/50 transition-colors cursor-pointer',
                  selectedCitation === sourceId && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedCitation(sourceId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{sourceTitle}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {chunks.length} {chunks.length === 1 ? 'chunk' : 'chunks'}
                      </Badge>
                    </div>

                    {/* Show first chunk preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {chunks[0].text}
                    </p>

                    {/* Relevance score */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Relevance:</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.round(chunks[0].relevance * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {Math.round(chunks[0].relevance * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Citation hover card for additional chunks */}
                  {chunks.length > 1 && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ExternalLink className="size-4" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">All chunks from {sourceTitle}</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {chunks.map((chunk, index) => (
                              <div
                                key={chunk.chunkId}
                                className="p-2 rounded-md bg-muted text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Chunk {index + 1}</span>
                                  <span className="text-muted-foreground">
                                    {Math.round(chunk.relevance * 100)}% relevant
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{chunk.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No citations fallback */}
      {citations.length === 0 && reasoning && (
        <div className="text-xs text-muted-foreground italic">
          This response was generated without specific source citations.
        </div>
      )}
    </div>
  );
}
