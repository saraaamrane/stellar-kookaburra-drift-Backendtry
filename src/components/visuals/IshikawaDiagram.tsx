import React from 'react';
import { RiskItem, FiveMCategory } from '@/types/assessment';

interface IshikawaDiagramProps {
  risk: RiskItem;
}

const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({ risk }) => {
  const categories: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Measurement', 'Environment'];
  
  const getExplanationForCategory = (cat: FiveMCategory) => {
    if (risk.primary5MCategory === cat) return risk.primary5MExplanation;
    if (risk.secondary5MCategory === cat) return risk.secondary5MExplanation;
    return null;
  };

  return (
    <div className="p-8 bg-white rounded-2xl border-2 shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ishikawa Diagram: {risk.failureMode || 'Untitled Failure'}</h3>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full border border-blue-100">AUTO-GENERATED FROM 5M</div>
      </div>
      
      <div className="relative min-w-[900px] h-[500px] flex items-center">
        {/* Main Spine */}
        <div className="absolute left-0 right-48 h-1.5 bg-slate-900 top-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-24 border-4 border-slate-900 flex items-center justify-center bg-slate-50 rounded-xl font-black text-center px-4 shadow-xl z-10">
          {risk.failureMode || 'FAILURE MODE'}
        </div>

        {/* Bones */}
        <div className="absolute inset-0 grid grid-cols-3 gap-8">
          {/* Top Bones */}
          {categories.slice(0, 3).map((cat, i) => {
            const explanation = getExplanationForCategory(cat);
            const isPrimary = risk.primary5MCategory === cat;
            return (
              <div key={cat} className="relative h-1/2">
                <div className="absolute bottom-0 left-1/2 w-1 h-40 bg-slate-300 -rotate-45 origin-bottom"></div>
                <div className={cn(
                  "absolute top-4 left-1/2 -translate-x-1/2 font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border-2",
                  isPrimary ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"
                )}>
                  {cat}
                </div>
                {explanation && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-full px-6">
                    <div className="text-[10px] bg-white border-2 p-3 rounded-lg shadow-sm leading-relaxed font-medium border-slate-100">
                      {explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Bones */}
          {categories.slice(3, 6).map((cat, i) => {
            const explanation = getExplanationForCategory(cat);
            const isPrimary = risk.primary5MCategory === cat;
            return (
              <div key={cat} className="relative h-1/2 mt-[250px]">
                <div className="absolute top-0 left-1/2 w-1 h-40 bg-slate-300 rotate-45 origin-top"></div>
                <div className={cn(
                  "absolute bottom-4 left-1/2 -translate-x-1/2 font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full border-2",
                  isPrimary ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"
                )}>
                  {cat}
                </div>
                {explanation && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-full px-6">
                    <div className="text-[10px] bg-white border-2 p-3 rounded-lg shadow-sm leading-relaxed font-medium border-slate-100">
                      {explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { cn } from '@/lib/utils';
export default IshikawaDiagram;