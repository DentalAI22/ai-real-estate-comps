'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
  className?: string;
}

const REPORT_STEPS = [
  { label: 'Searching public records...', duration: 3000 },
  { label: 'Analyzing comparable sales...', duration: 4000 },
  { label: 'Gathering neighborhood data...', duration: 3500 },
  { label: 'AI generating analysis...', duration: 5000 },
  { label: 'Building report...', duration: 3000 },
  { label: 'Report ready!', duration: 1000 },
];

export default function LoadingSpinner({
  message,
  showProgress = false,
  className,
}: LoadingSpinnerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!showProgress) return;

    let timeout: NodeJS.Timeout;
    const advanceStep = () => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < REPORT_STEPS.length) {
          timeout = setTimeout(advanceStep, REPORT_STEPS[next].duration);
        }
        return next;
      });
    };

    timeout = setTimeout(advanceStep, REPORT_STEPS[0].duration);
    return () => clearTimeout(timeout);
  }, [showProgress]);

  if (showProgress) {
    return (
      <div className={classNames('flex flex-col items-center space-y-6', className)}>
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-gold-400 border-t-transparent animate-spin" />
        </div>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-3">
          {REPORT_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.label}
                className={classNames(
                  'flex items-center space-x-3 text-sm transition-all duration-300',
                  isComplete && 'text-green-600',
                  isCurrent && 'text-navy-900 font-medium',
                  isPending && 'text-gray-300'
                )}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gold-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  </div>
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(((currentStep + 1) / REPORT_STEPS.length) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col items-center space-y-3', className)}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-gold-400 border-t-transparent animate-spin" />
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
