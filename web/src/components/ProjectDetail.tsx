import { Badge } from '@/components/ui/badge';

interface ProjectDetailProps {
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  children?: React.ReactNode;
}

export function ProjectDetail({ title, description, level, children }: ProjectDetailProps) {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0">
            {level}
          </Badge>
        </div>
      </div>
      {children}
    </div>
  );
}
