import { Button } from '@/components/ui/button';
import { List, Table, Grid2X2, Grid3X3, Grid } from 'lucide-react';

type ViewMode = 'list' | 'compact' | 'grid2' | 'grid3' | 'grid4';

interface DocViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  preserveParams?: {
    search?: string;
    tag?: string;
    folder?: string;
  };
}

export function DocViewToggle({
  currentView,
  onViewChange,
  preserveParams = {},
}: DocViewToggleProps) {
  const buildUrl = (view: ViewMode) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (preserveParams.search) params.set('search', preserveParams.search);
    if (preserveParams.tag) params.set('tag', preserveParams.tag);
    if (preserveParams.folder) params.set('folder', preserveParams.folder);
    return `?${params.toString()}`;
  };

  const views: Array<{
    id: ViewMode;
    icon: React.ReactNode;
    label: string;
    title: string;
  }> = [
    { id: 'list', icon: <List className="w-4 h-4" />, label: 'List', title: 'List view' },
    { id: 'compact', icon: <Table className="w-4 h-4" />, label: 'Compact', title: 'Compact view' },
    { id: 'grid2', icon: <Grid2X2 className="w-4 h-4" />, label: 'Grid 2', title: 'Grid view (2 columns)' },
    { id: 'grid3', icon: <Grid3X3 className="w-4 h-4" />, label: 'Grid 3', title: 'Grid view (3 columns)' },
    { id: 'grid4', icon: <Grid className="w-4 h-4" />, label: 'Grid 4', title: 'Grid view (4 columns)' },
  ];

  return (
    <div className="flex gap-1 bg-muted/50 p-0.5 rounded-lg">
      {views.map((view) => (
        <a
          key={view.id}
          href={buildUrl(view.id)}
          className={`p-2 rounded-md transition-all ${
            currentView === view.id
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
          aria-label={view.label}
          title={view.title}
        >
          {view.icon}
        </a>
      ))}
    </div>
  );
}
