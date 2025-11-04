import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  return (
    <form className="relative w-full md:w-80" method="GET" action="/docs">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        placeholder="Search documentation..."
        className="pl-9 h-9 w-full bg-muted/40 focus:bg-background"
        defaultValue={value}
      />
      {viewMode && viewMode !== 'list' && (
        <input type="hidden" name="view" value={viewMode} />
      )}
      {folderFilter && <input type="hidden" name="folder" value={folderFilter} />}
      {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
