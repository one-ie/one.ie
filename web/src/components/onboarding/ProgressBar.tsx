/**
 * ProgressBar - Multi-step onboarding progress indicator
 *
 * Shows current step in onboarding flow and completion percentage
 */

import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Email', key: 'email_verification' },
  { number: 2, label: 'Profile', key: 'profile' },
  { number: 3, label: 'Workspace', key: 'workspace' },
  { number: 4, label: 'Team', key: 'team' },
  { number: 5, label: 'Wallet', key: 'wallet' },
  { number: 6, label: 'Skills', key: 'skills' },
];

interface ProgressBarProps {
  currentStep: number;
  completedSteps: string[];
  progress: number;
}

export function ProgressBar({ currentStep, completedSteps, progress }: ProgressBarProps) {
  return (
    <div className="w-full space-y-4">
      {/* Progress Percentage */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Onboarding Progress
        </span>
        <span className="text-sm font-semibold text-primary">{progress}%</span>
      </div>

      {/* Linear Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mt-6">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = currentStep === step.number;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary border-primary'
                    : isCurrent
                      ? 'border-primary bg-primary/10'
                      : isUpcoming
                        ? 'border-muted bg-muted'
                        : 'border-muted bg-background'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-primary'
                        : isUpcoming
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                    }`}
                  >
                    {step.number}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-xs mt-2 text-center ${
                  isCurrent
                    ? 'font-semibold text-primary'
                    : isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute w-[calc(100%/6-20px)] h-0.5 top-5 -right-[calc(50%+10px)] transition-all duration-300 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Text */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        Step {currentStep} of {STEPS.length}
      </div>
    </div>
  );
}
