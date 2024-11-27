import { Check, ChevronRight } from 'lucide-react';
import type { AnalysisStep } from '@/lib/types';

interface StepIndicatorProps {
  currentStep: AnalysisStep;
}

const steps = [
  { id: 'json' as const, label: 'JSON Input' },
  { id: 'text' as const, label: 'Text Input' },
  { id: 'analysis' as const, label: 'Analysis' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="flex items-center justify-center space-x-2">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isComplete || isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={`ml-2 ${
                isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}