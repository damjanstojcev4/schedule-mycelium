interface StepIndicatorProps {
  currentStep: number;
  soloOperator: boolean;
  onStepClick?: (stepNumber: number) => void;
  totalSteps: number;
  currentStepIndex: number;
}

export function StepIndicator({ currentStep, soloOperator, onStepClick, totalSteps, currentStepIndex }: StepIndicatorProps) {
  const steps = soloOperator
    ? [
        { number: 1, label: 'Service' },
        { number: 3, label: 'Time' },
        { number: 4, label: 'Details' },
      ]
    : [
        { number: 1, label: 'Service' },
        { number: 2, label: 'Staff' },
        { number: 3, label: 'Time' },
        { number: 4, label: 'Details' },
      ];

  return (
    <div className="flex items-center gap-2">
      {/* Thin segmented progress bar */}
      <div className="flex-1 flex gap-1">
        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isClickable = step.number < currentStep;
          return (
            <button
              key={step.number}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.number)}
              className={[
                'flex-1 h-1 rounded-full transition-all duration-500 ease-out',
                isDone || isActive ? 'bg-zinc-900' : 'bg-zinc-200',
                isClickable ? 'cursor-pointer hover:bg-zinc-700' : 'cursor-default',
              ].join(' ')}
              aria-label={`Step ${step.number}: ${step.label}`}
            />
          );
        })}
      </div>

      {/* Step count */}
      <span className="text-xs font-semibold text-zinc-400 shrink-0 tabular-nums">
        {currentStepIndex}/{totalSteps}
      </span>
    </div>
  );
}
