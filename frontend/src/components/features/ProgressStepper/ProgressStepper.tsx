import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';

export interface Step {
  id: string;
  label: string;
  href?: string;
}

export interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className = '',
}: ProgressStepperProps) {
  return (
    <nav aria-label="Booking Progress" className={`flex items-center gap-space-sm sm:gap-space-md ${className}`.trim()}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = isComplete && Boolean(step.href);

        const StepIndicator = () => (
          <span className={`
            w-6 h-6 rounded-full flex items-center justify-center font-label-sm
            ${isComplete 
              ? 'bg-primary text-on-primary' 
              : isActive 
                ? 'bg-secondary-container text-on-secondary shadow-sm ring-2 ring-secondary-fixed' 
                : 'bg-surface-container-highest text-on-surface-variant'
            }
          `}>
            {isComplete ? (
              <Icon name="check" size={14} />
            ) : (
              <span className="font-label-md font-medium">{index + 1}</span>
            )}
          </span>
        );

        const stepContent = (
          <>
            <StepIndicator />
            <span className={`
              hidden sm:inline font-label-md
              ${isActive ? 'text-primary font-bold' : isComplete ? 'text-on-surface font-medium' : 'text-on-surface-variant'}
            `}>
              {step.label}
            </span>
          </>
        );

        if (isClickable && step.href) {
          return (
            <React.Fragment key={step.id}>
              <Link
                to={step.href}
                onClick={() => onStepClick?.(index)}
                className="flex items-center gap-space-xs hover:opacity-80 transition-opacity"
              >
                {stepContent}
              </Link>
              {index < steps.length - 1 && (
                <div className={`
                  w-6 sm:w-10 h-0.5
                  ${isComplete ? 'bg-primary' : 'bg-surface-container-highest'}
                `} />
              )}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={step.id}>
            <div className={`
              flex items-center gap-space-xs
              ${isActive ? 'bg-surface-container-high px-space-sm py-1.5 rounded-lg shadow-sm' : ''}
            `}>
              {stepContent}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-6 sm:w-10 h-0.5
                ${isComplete ? 'bg-primary' : isActive ? 'bg-secondary-container' : 'bg-surface-container-highest'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
