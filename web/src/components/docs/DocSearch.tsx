'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';

interface DocSearchProps {
  value: string;
  viewMode?: string;
  folderFilter?: string;
  tagFilter?: string;
}

export function DocSearch({
  value,
  viewMode,
  folderFilter,
  tagFilter,
}: DocSearchProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;

    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (viewMode && viewMode !== 'list') params.set('view', viewMode);
    if (folderFilter) params.set('folder', folderFilter);
    if (tagFilter) params.set('tag', tagFilter);

    const url = params.toString() ? `/docs?${params.toString()}` : '/docs';
    window.location.href = url;
  };

  return (
    <form className="relative w-full md:w-80" onSubmit={handleSubmit}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Search documentation..."
        className="pl-9 h-9 w-full bg-muted/40 focus:bg-background"
        defaultValue={value}
        autoComplete="off"
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
