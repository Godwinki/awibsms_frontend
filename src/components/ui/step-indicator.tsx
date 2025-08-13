"use client";

import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step) => (
            <li key={step.id} className="md:flex-1">
              <div
                className={cn(
                  "flex flex-col border-l-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  step.id < currentStep
                    ? "border-primary"
                    : step.id === currentStep
                    ? "border-primary"
                    : "border-muted"
                )}
              >
                <span className="flex items-center md:ml-0 md:mt-0">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "border-2 border-primary bg-background text-primary"
                        : "border-2 border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {step.id < currentStep ? (
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium",
                      step.id < currentStep
                        ? "text-primary"
                        : step.id === currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                </span>
                {step.description && (
                  <span className="mt-0.5 ml-10 md:ml-8 text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
