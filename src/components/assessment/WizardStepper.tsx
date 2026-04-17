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
    <div className="w-full py-6 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between min-w-[800px] relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" 
          style={{ width: `${(currentPhase / (phases.length - 1)) * 100}%` }}
        />

        {phases.map((phase, idx) => {
          const isActive = currentPhase === idx;
          const isCompleted = currentPhase > idx;
          
          return (
            <button
              key={phase}
              onClick={() => onPhaseClick(idx)}
              className="flex flex-col items-center group relative"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2",
                isActive ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" :
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                "bg-white border-slate-200 text-slate-400 hover:border-primary/50"
              )}>
                {isCompleted ? <Check size={18} strokeWidth={3} /> : idx + 1}
              </div>
              <span className={cn(
                "mt-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {phase}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WizardStepper;