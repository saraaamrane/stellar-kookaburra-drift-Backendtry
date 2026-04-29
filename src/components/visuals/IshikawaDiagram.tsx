"use client";

import React from 'react';
import { RiskItem, FiveMCategory } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface IshikawaDiagramProps {
  risk: RiskItem;
}

const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({ risk }) => {
  const categories: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Medium'];
  
  const getExplanationForCategory = (cat: FiveMCategory) => {
    if (risk.primary5MCategory === cat) return risk.primary5MExplanation;
    if (risk.secondary5MCategory === cat) return risk.secondary5MExplanation;
    return null;
  };

  return (
    <div className="p-8 bg-white rounded-2xl border-2 shadow-sm overflow-x-auto">
      <h3 className="text-xl font-black text-slate-900 uppercase mb-8">Ishikawa: {risk.failureMode}</h3>
      <div className="relative min-w-[900px] h-[500px] flex items-center">
        <div className="absolute left-0 right-48 h-1.5 bg-slate-900 top-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-24 border-4 border-slate-900 flex items-center justify-center bg-slate-50 rounded-xl font-black text-center px-4 shadow-xl z-10">
          {risk.failureMode || 'FAILURE'}
        </div>
        <div className="absolute inset-0 grid grid-cols-3 gap-8">
          {categories.slice(0, 3).map((cat) => (
            <div key={cat} className="relative h-1/2">
              <div className="absolute bottom-0 left-1/2 w-1 h-40 bg-slate-300 -rotate-45 origin-bottom"></div>
              <div className={cn("absolute top-4 left-1/2 -translate-x-1/2 font-black text-xs uppercase px-3 py-1 rounded-full border-2", risk.primary5MCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-400")}>
                {cat}
              </div>
              {getExplanationForCategory(cat) && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-full px-6">
                  <div className="text-[10px] bg-white border-2 p-3 rounded-lg shadow-sm">{getExplanationForCategory(cat)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IshikawaDiagram;