"use client";

import { FileCode } from "lucide-react";
import { nanoid } from "nanoid";
import type { ReactNode } from "react";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai/elements/task";

const Example = () => {
  const tasks: { key: string; value: ReactNode }[] = [
    { key: nanoid(), value: 'Searching "app/page.tsx, components structure"' },
    {
      key: nanoid(),
      value: (
        <span className="inline-flex items-center gap-1" key="read-page-tsx">
          Read
          <TaskItemFile>
            <FileCode className="size-4 text-blue-500" />
            <span>page.tsx</span>
          </TaskItemFile>
        </span>
      ),
    },
    { key: nanoid(), value: "Scanning 52 files" },
    { key: nanoid(), value: "Scanning 2 files" },
    {
      key: nanoid(),
      value: (
        <span className="inline-flex items-center gap-1" key="read-layout-tsx">
          Reading files
          <TaskItemFile>
            <FileCode className="size-4 text-blue-500" />
            <span>layout.tsx</span>
          </TaskItemFile>
        </span>
      ),
    },
  ];

  return (
    <div style={{ height: "200px" }}>
      <Task className="w-full">
        <TaskTrigger title="Found project files" />
        <TaskContent>
          {tasks.map((task) => (
            <TaskItem key={task.key}>{task.value}</TaskItem>
          ))}
        </TaskContent>
      </Task>
    </div>
  );
};

export default Example;
