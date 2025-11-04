import { Badge } from '@/components/ui/badge';
import { Search, Tag, Folder } from 'lucide-react';

interface DocFilterResultsProps {
  searchQuery?: string;
  tagFilter?: string;
  folderFilter?: string;
  resultCount: number;
}

export function DocFilterResults({
  searchQuery,
  tagFilter,
  folderFilter,
  resultCount,
}: DocFilterResultsProps) {
  const formatFolderName = (folder: string): string => {
    if (folder === 'root') return 'Get Started';

    return folder
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!searchQuery && !tagFilter && !folderFilter) {
    return null;
  }

  return (
    <div className="mb-4 bg-primary/5 rounded-lg p-2 text-base">
      <div className="flex items-center gap-2">
        {searchQuery ? (
          <>
            <Search className="w-4 h-4 text-primary" />
            <span>
              Found {resultCount} result{resultCount !== 1 ? 's' : ''} for{' '}
              <strong>"{searchQuery}"</strong>
            </span>
          </>
        ) : tagFilter ? (
          <>
            <Tag className="w-4 h-4 text-primary" />
            <span>
              Found {resultCount} document{resultCount !== 1 ? 's' : ''} tagged{' '}
              <strong>"{tagFilter}"</strong>
            </span>
          </>
        ) : (
          <>
            <Folder className="w-4 h-4 text-primary" />
            <span>
              Found {resultCount} document{resultCount !== 1 ? 's' : ''} in folder{' '}
              <strong>"{formatFolderName(folderFilter)}"</strong>
            </span>
          </>
        )}
        <a href="/docs" className="ml-auto text-primary hover:underline text-base">
          Clear
        </a>
      </div>
    </div>
  );
}
