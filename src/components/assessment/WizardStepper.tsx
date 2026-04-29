"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  phases: string[];
  currentPhase: number;
  onPhaseClick: (index: number) => void;
}

const WizardStepper: React.FC<WizardStepperProps> = ({ phases, currentPhase, onPhaseClick }) => {
  return (
    <div className="flex items-center bg-slate-50/50 overflow-x-auto no-scrollbar">
      {phases.map((phase, idx) => {
        const isActive = currentPhase === idx;
        const isCompleted = currentPhase > idx;
        
        return (
          <button
            key={phase}
            onClick={() => onPhaseClick(idx)}
            className={cn(
              "flex-1 min-w-[140px] py-4 px-6 text-sm font-bold transition-all relative border-r last:border-r-0",
              isActive ? "bg-white text-primary shadow-[0_-4px_0_inset_#3b82f6]" : 
              "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {isCompleted ? (
                <Check size={14} className="text-emerald-500" strokeWidth={3} />
              ) : (
                <span className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px]",
                  isActive ? "border-primary text-primary" : "border-slate-300 text-slate-400"
                )}>
                  {idx + 1}
                </span>
              )}
              <span className="whitespace-nowrap">{phase}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default WizardStepper;