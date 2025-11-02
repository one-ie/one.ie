import { useState, useEffect } from 'react';
import * as React from 'react';
import { ExternalLink, Code2, Rocket, FileText, ShoppingBag, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/CopyButton';
import { SendToClaudeCodeModal } from '@/components/SendToClaudeCodeModal';

interface Project {
  id: string;
  title: string;
  description: string;
  prompt: string;
  demoUrl: string;
  iconName: 'Rocket' | 'FileText' | 'ShoppingBag' | 'BarChart3' | 'Users';
  borderColor: string;
  bgColor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  levelColor: string;
}

interface ClientProjectsManagerProps {
  projects: Project[];
  viewMode: 'list' | 'grid';
  gridColumns: '2' | '3';
}

export function ClientProjectsManager({
  projects,
  viewMode,
  gridColumns,
}: ClientProjectsManagerProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderIcon = (iconName: Project['iconName'], className = 'h-4 w-4') => {
    const iconMap: Record<Project['iconName'], React.ComponentType<{ className?: string }>> = {
      Rocket,
      FileText,
      ShoppingBag,
      BarChart3,
      Users,
    };
    const IconComponent = iconMap[iconName];
    return <IconComponent className={className} />;
  };

  useEffect(() => {
    // Initialize with all projects
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      const query = e.detail?.query || '';
      if (!query) {
        setFilteredProjects(projects);
      } else {
        const lowerQuery = query.toLowerCase();
        const filtered = projects.filter(
          (project) =>
            project.title.toLowerCase().includes(lowerQuery) ||
            project.description.toLowerCase().includes(lowerQuery) ||
            project.level.toLowerCase().includes(lowerQuery) ||
            project.prompt.toLowerCase().includes(lowerQuery)
        );
        setFilteredProjects(filtered);
      }
    };

    window.addEventListener('projectSearch', handleSearch as EventListener);
    return () => window.removeEventListener('projectSearch', handleSearch as EventListener);
  }, [projects]);

  const handleSendToClaudeCode = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="mx-auto max-w-4xl space-y-4">
          {filteredProjects.map((project) => {
            return (
              <Card
                key={project.id}
                className={`group relative overflow-hidden ${project.borderColor} border-l-4 hover:shadow-lg transition-all duration-300 p-3`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg ${project.bgColor} ${project.levelColor} flex-shrink-0`}
                  >
                    {renderIcon(project.iconName, 'h-4 w-4')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base text-foreground">
                        {project.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {project.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.prompt.split('\n')[0]}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Demo
                      </a>
                      <CopyButton
                        text={project.prompt}
                        className="h-8 text-xs"
                      />
                      <button
                        onClick={() => handleSendToClaudeCode(project)}
                        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Send to Claude Code
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        {selectedProject && (
          <SendToClaudeCodeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            prompt={selectedProject.prompt}
            projectTitle={selectedProject.title}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`mx-auto max-w-full grid gap-4 ${
          gridColumns === '2'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {filteredProjects.map((project) => {
          return (
            <Card
              key={project.id}
              className={`group relative overflow-hidden ${project.borderColor} border-l-4 hover:shadow-lg transition-all duration-300 h-full flex flex-col p-3`}
            >
              <div className="flex items-start gap-2 mb-2">
                <div
                  className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg ${project.bgColor} ${project.levelColor} flex-shrink-0`}
                >
                  {renderIcon(project.iconName, 'h-3.5 w-3.5')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {project.level}
                </Badge>
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {project.prompt.split('\n')[0]}
                </p>
                <div className="flex gap-1.5 flex-wrap mt-auto">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Demo
                  </a>
                  <CopyButton
                    text={project.prompt}
                    className="h-7 text-xs px-2"
                  />
                  <button
                    onClick={() => handleSendToClaudeCode(project)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                  >
                    <Code2 className="h-3 w-3" />
                    Send
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {selectedProject && (
        <SendToClaudeCodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          prompt={selectedProject.prompt}
          projectTitle={selectedProject.title}
        />
      )}
    </>
  );
}
