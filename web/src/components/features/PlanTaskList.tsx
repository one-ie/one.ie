/**
 * PlanTaskList Component
 * Beautiful, interactive task list for plan cycles with completion toggling
 */

import { AlertCircle, CheckCircle, ChevronDown, Clock } from "lucide-react";
import { useMemo, useState } from "react";

interface Task {
  cycleNumber: number;
  content: string;
  status: "pending" | "in_progress" | "completed";
  activeForm: string;
  dependencies?: number[];
}

interface CyclePhase {
  range: string;
  phase: string;
  description: string;
}

interface PlanTaskListProps {
  tasks?: Task[];
  phases?: CyclePhase[];
  editable?: boolean;
  onTaskToggle?: (cycleNumber: number, newStatus: "pending" | "in_progress" | "completed") => void;
}

const DEFAULT_PHASES = [
  { range: "1-10", phase: "Foundation & Setup", description: "Validate requirements and plan" },
  {
    range: "11-20",
    phase: "Backend Schema & Services",
    description: "Design database and services",
  },
  {
    range: "21-30",
    phase: "Frontend Pages & Components",
    description: "Build UI and interactions",
  },
  { range: "31-40", phase: "Integration & Connections", description: "Connect external systems" },
  { range: "41-50", phase: "Authentication & Authorization", description: "Implement security" },
  { range: "51-60", phase: "Knowledge & RAG", description: "Create embeddings and search" },
  { range: "61-70", phase: "Quality & Testing", description: "Write tests and ensure quality" },
  { range: "71-80", phase: "Design & Wireframes", description: "Create UI/UX designs" },
  { range: "81-90", phase: "Performance & Optimization", description: "Optimize and profile" },
  { range: "91-100", phase: "Deployment & Documentation", description: "Deploy and document" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "in_progress":
      return Clock;
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "in_progress":
      return "text-blue-600";
    default:
      return "text-gray-400";
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    case "in_progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "✓";
    case "in_progress":
      return "⟳";
    default:
      return "○";
  }
};

const _getPhaseRange = (start: number, end: number) => {
  return DEFAULT_PHASES.find((p) => {
    const [s, e] = p.range.split("-").map(Number);
    return s === start && e === end;
  });
};

export function PlanTaskList({
  tasks = [],
  phases = DEFAULT_PHASES,
  editable = false,
  onTaskToggle,
}: PlanTaskListProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [taskStatuses, setTaskStatuses] = useState<Record<number, string>>(
    tasks.reduce((acc, task) => ({ ...acc, [task.cycleNumber]: task.status }), {})
  );

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    return phases.map((phase) => {
      const [start, end] = phase.range.split("-").map(Number);
      const phaseTasks = tasks.filter((t) => t.cycleNumber >= start && t.cycleNumber <= end);
      return {
        phase,
        tasks: phaseTasks,
        completed: phaseTasks.filter((t) => taskStatuses[t.cycleNumber] === "completed").length,
      };
    });
  }, [tasks, taskStatuses, phases]);

  const handleTaskToggle = (cycleNumber: number) => {
    const currentStatus = taskStatuses[cycleNumber];
    const statusCycle: Record<string, "pending" | "in_progress" | "completed"> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "pending",
    };

    const newStatus = statusCycle[currentStatus] || "pending";
    setTaskStatuses((prev) => ({ ...prev, [cycleNumber]: newStatus }));

    if (onTaskToggle) {
      onTaskToggle(cycleNumber, newStatus);
    }
  };

  const togglePhase = (range: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(range)) {
      newExpanded.delete(range);
    } else {
      newExpanded.add(range);
    }
    setExpandedPhases(newExpanded);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks defined for this plan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasksByPhase.map((item) => {
        if (item.tasks.length === 0) return null;

        const phaseProgress = Math.round((item.completed / item.tasks.length) * 100);
        const isExpanded = expandedPhases.has(item.phase.range);

        return (
          <div key={item.phase.range} className="bg-card border rounded-lg overflow-hidden">
            {/* Phase Header - Clickable to expand */}
            <button
              onClick={() => togglePhase(item.phase.range)}
              className="w-full text-left bg-muted px-6 py-4 border-b hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                    />
                    <h3 className="font-semibold text-lg">
                      Cycle {item.phase.range}: {item.phase.phase}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.phase.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.completed}/{item.tasks.length} tasks complete
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-accent">{phaseProgress}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-background rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${phaseProgress}%` }}
                ></div>
              </div>
            </button>

            {/* Tasks List - Shown when expanded */}
            {isExpanded && (
              <div className="divide-y">
                {item.tasks.map((task) => {
                  const Icon = getStatusIcon(taskStatuses[task.cycleNumber] || task.status);
                  const currentStatus = taskStatuses[task.cycleNumber] || task.status;

                  return (
                    <div
                      key={task.cycleNumber}
                      className={`px-6 py-4 hover:bg-muted/50 transition-colors ${
                        editable ? "cursor-pointer" : ""
                      }`}
                      onClick={() => editable && handleTaskToggle(task.cycleNumber)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 pt-0.5">
                          {editable ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskToggle(task.cycleNumber);
                              }}
                              className={`p-1 rounded-full hover:bg-muted transition-colors ${getStatusColor(
                                currentStatus
                              )}`}
                              title="Click to cycle status"
                            >
                              <Icon className="w-5 h-5" />
                            </button>
                          ) : (
                            <Icon className={`w-5 h-5 ${getStatusColor(currentStatus)}`} />
                          )}
                        </div>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium ${
                              currentStatus === "completed"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.content}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Cycle {task.cycleNumber} • {task.activeForm}
                          </div>

                          {/* Dependencies */}
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="mt-2 text-xs">
                              <div className="text-muted-foreground">
                                Depends on:{" "}
                                {task.dependencies.map((dep) => `Cycle ${dep}`).join(", ")}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusBg(currentStatus)}`}
                          >
                            {getStatusLabel(currentStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => taskStatuses[t.cycleNumber] === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter((t) => taskStatuses[t.cycleNumber] === "in_progress").length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tasks.filter((t) => taskStatuses[t.cycleNumber] === "pending").length}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>
      )}
    </div>
  );
}
