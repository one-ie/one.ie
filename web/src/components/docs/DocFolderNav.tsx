import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Layers,
  Zap,
  BookText,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface DocFolderNavProps {
  folders: Record<string, number>;
  currentFolder?: string;
}

export function DocFolderNav({ folders, currentFolder }: DocFolderNavProps) {
  const getFolderIcon = (folder: string) => {
    switch (folder.toLowerCase()) {
      case 'getting-started':
        return Rocket;
      case 'overview':
        return Layers;
      case 'develop':
        return Zap;
      case 'advanced':
      case 'ai-sdk':
        return Zap;
      case 'tutorials':
        return BookText;
      case 'troubleshooting':
        return AlertCircle;
      default:
        return FolderOpen;
    }
  };

  const formatFolderName = (folder: string): string => {
    const folderNameMap: Record<string, string> = {
      'root': 'Root',
      'getting-started': 'Quick Start',
      'overview': 'Overview',
      'develop': 'Develop',
    };

    if (folderNameMap[folder]) {
      return folderNameMap[folder];
    }

    return folder
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFolderOrder = (folder: string): number => {
    const orderMap: Record<string, number> = {
      'getting-started': 1,
      'overview': 2,
      'develop': 3,
    };
    return orderMap[folder] ?? 999;
  };

  const createFolderUrl = (folder: string) => `/docs?folder=${encodeURIComponent(folder)}`;

  return (
    <div className="mb-4 overflow-x-auto pb-2">
      <div className="flex gap-2 flex-nowrap">
        {Object.entries(folders)
          .sort(([a], [b]) => {
            const orderA = getFolderOrder(a);
            const orderB = getFolderOrder(b);
            if (orderA !== orderB) return orderA - orderB;
            return a.localeCompare(b);
          })
          .map(([folder, count]) => {
            const Icon = getFolderIcon(folder);
            return (
              <a
                key={folder}
                href={createFolderUrl(folder)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 hover:bg-primary/10 transition whitespace-nowrap no-underline"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-base">{formatFolderName(folder)}</span>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs px-1.5 py-0"
                >
                  {count}
                </Badge>
              </a>
            );
          })}
      </div>
    </div>
  );
}
