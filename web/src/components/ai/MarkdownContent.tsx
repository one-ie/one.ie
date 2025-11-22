/**
 * Markdown Content Renderer
 *
 * Renders markdown content with proper styling for chat messages
 * Supports code blocks, lists, links, bold, italic, etc.
 */

import { marked } from 'marked';
import { useMemo } from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
}

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = useMemo(() => {
    if (!content) return '';

    try {
      return marked.parse(content);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return content;
    }
  }, [content]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
