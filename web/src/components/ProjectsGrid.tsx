import { useState, useEffect } from "react";
import { ExternalLink, Code2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/CopyButton";
import { SendToClaudeCodeModal } from "@/components/SendToClaudeCodeModal";

interface Project {
  id: string;
  title: string;
  description: string;
  prompt: string;
  demoUrl: string;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  bgColor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  levelColor: string;
}

interface ProjectsGridProps {
  projects: Project[];
  viewMode: "list" | "grid";
  gridColumns: "2" | "3";
}

export function ProjectsGrid({
  projects,
  viewMode,
  gridColumns,
}: ProjectsGridProps) {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<{ query: string }>) => {
      const query = e.detail?.query || "";
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

    window.addEventListener("projectSearch", handleSearch as EventListener);
    return () => window.removeEventListener("projectSearch", handleSearch as EventListener);
  }, [projects]);

  const handleSendToClaudeCode = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold text-foreground mb-2">
          No projects found
        </p>
        <p className="text-muted-foreground">
          Try adjusting your search or clear the filter to see all projects.
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === "list" && (
        <div className="mx-auto max-w-4xl space-y-4">
          {filteredProjects.map((project) => {
            const IconComponent = project.icon;
            return (
              <Card
                key={project.id}
                className={`group relative overflow-hidden ${project.borderColor} border-l-4 hover:shadow-lg transition-all duration-300 p-4`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg ${project.bgColor} ${project.levelColor} flex-shrink-0`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        {project.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {project.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.prompt.split("\n")[0]}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Demo
                      </a>
                      <CopyButton
                        text={project.prompt}
                        className="h-10 text-sm px-4"
                      />
                      <Button
                        onClick={() => handleSendToClaudeCode(project)}
                        variant="outline"
                        size="sm"
                        className="h-10 text-sm px-4"
                      >
                        <Code2 className="h-4 w-4 mr-2" />
                        Send to Claude Code
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === "grid" && (
        <div
          className={`mx-auto max-w-full grid gap-6 ${
            gridColumns === "2"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredProjects.map((project) => {
            const IconComponent = project.icon;
            return (
              <Card
                key={project.id}
                className={`group relative overflow-hidden ${project.borderColor} border-l-4 hover:shadow-lg transition-all duration-300 h-full flex flex-col p-5`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg ${project.bgColor} ${project.levelColor} flex-shrink-0`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight text-foreground">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {project.level}
                  </Badge>
                </div>
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.prompt.split("\n")[0]}
                  </p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center gap-2 text-sm px-3 py-2.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Demo
                    </a>
                    <div className="flex gap-2">
                      <CopyButton
                        text={project.prompt}
                        className="flex-1 h-10 text-sm"
                      />
                      <Button
                        onClick={() => handleSendToClaudeCode(project)}
                        variant="outline"
                        size="sm"
                        className="h-10 px-3"
                        title="Send to Claude Code"
                      >
                        <Code2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Send to Claude Code Modal */}
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
