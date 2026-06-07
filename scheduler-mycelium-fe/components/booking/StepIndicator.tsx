const STEPS = [
  { label: 'Service', number: 1 },
  { label: 'Staff', number: 2 },
  { label: 'Time', number: 3 },
  { label: 'Details', number: 4 },
];

interface StepIndicatorProps {
  currentStep: number;
  soloOperator: boolean;
}

export function StepIndicator({ currentStep, soloOperator }: StepIndicatorProps) {
  const visibleSteps = soloOperator ? STEPS.filter((s) => s.number !== 2) : STEPS;

  return (
    <div className="flex items-center gap-0">
      {visibleSteps.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'h-3 w-3 rounded-full transition-all duration-500',
                  isCompleted
                    ? 'bg-gray-900 scale-100'
                    : isActive
                    ? 'bg-gray-900 ring-4 ring-gray-100 scale-125'
                    : 'bg-gray-200 scale-100',
                ].join(' ')}
              />
              <span
                className={`mt-1 text-xs font-medium transition-colors ${
                  isActive ? 'text-gray-900' : isCompleted ? 'text-gray-400' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < visibleSteps.length - 1 && (
              <div
                className={`mb-5 h-[2px] w-12 sm:w-20 mx-2 transition-all duration-500 rounded-full ${
                  currentStep > step.number ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
