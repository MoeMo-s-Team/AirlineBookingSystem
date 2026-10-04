import { Icon } from '../Icon/Icon';

export interface Step {
  id: string;
  label: string;
  status: 'complete' | 'active' | 'pending';
}

export interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className = '' }: StepperProps) {
  return (
    <div 
      className={`grid gap-space-sm relative ${className}`}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, index) => {
        const isComplete = step.status === 'complete';
        const isActive = step.status === 'active';

        return (
          <div 
            key={step.id} 
            className={`
              flex items-center gap-space-sm
              ${isActive ? 'bg-surface-container-high px-space-sm py-1.5 rounded-lg shadow-sm' : ''}
            `}
          >
            {/* Step indicator */}
            <div 
              className={`
                w-7 h-7 rounded-full flex items-center justify-center
                ${isComplete 
                  ? 'bg-primary text-on-primary' 
                  : isActive 
                    ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary-fixed-dim' 
                    : 'bg-surface-container text-on-surface-variant'
                }
                font-bold text-[12px]
              `}
            >
              {isComplete ? (
                <Icon name="check" size={16} />
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step label */}
            <div className="min-w-0">
              <p className={`
                font-label-sm uppercase tracking-wider
                ${isActive ? 'text-on-secondary-container font-semibold' : 'text-on-surface-variant'}
              `}>
                {isActive ? 'Active' : `Step ${index + 1}`}
              </p>
              <p className={`
                font-label-md truncate
                ${isActive ? 'text-primary font-bold' : 'text-on-surface font-semibold'}
              `}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
