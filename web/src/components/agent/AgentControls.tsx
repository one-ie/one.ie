/**
 * Agent Controls - CYCLE-048
 * Controls to pause, resume, and execute agent actions
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlayIcon, PauseIcon, StopIcon, MoreVerticalIcon } from 'lucide-react';

interface AgentControlsProps {
  agent: {
    _id: string;
    status: 'active' | 'paused' | 'disabled';
  };
}

export function AgentControls({ agent }: AgentControlsProps) {
  const [status, setStatus] = useState(agent.status);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePause = async () => {
    setIsProcessing(true);
    try {
      // TODO: Call backend mutation to pause agent
      console.log('Pausing agent:', agent._id);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus('paused');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      // TODO: Call backend mutation to resume agent
      console.log('Resuming agent:', agent._id);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus('active');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable this agent? You can re-enable it later.')) {
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Call backend mutation to disable agent
      console.log('Disabling agent:', agent._id);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatus('disabled');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteNow = async () => {
    setIsProcessing(true);
    try {
      // TODO: Call backend mutation to execute agent task
      console.log('Executing agent task:', agent._id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Primary Action Button */}
      {status === 'active' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          disabled={isProcessing}
        >
          <PauseIcon className="mr-2 h-4 w-4" />
          Pause
        </Button>
      )}

      {status === 'paused' && (
        <Button
          variant="default"
          size="sm"
          onClick={handleResume}
          disabled={isProcessing}
        >
          <PlayIcon className="mr-2 h-4 w-4" />
          Resume
        </Button>
      )}

      {status === 'disabled' && (
        <Button
          variant="default"
          size="sm"
          onClick={handleResume}
          disabled={isProcessing}
        >
          <PlayIcon className="mr-2 h-4 w-4" />
          Enable
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExecuteNow} disabled={status !== 'active' || isProcessing}>
            Execute Task Now
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {status !== 'paused' && (
            <DropdownMenuItem onClick={handlePause} disabled={isProcessing}>
              Pause Agent
            </DropdownMenuItem>
          )}
          {status === 'paused' && (
            <DropdownMenuItem onClick={handleResume} disabled={isProcessing}>
              Resume Agent
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisable}
            disabled={isProcessing}
            className="text-destructive"
          >
            <StopIcon className="mr-2 h-4 w-4" />
            Disable Agent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
