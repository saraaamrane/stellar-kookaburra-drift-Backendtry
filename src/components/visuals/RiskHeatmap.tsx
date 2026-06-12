"use client";

import React from 'react';
import { RiskItem } from '@/types/assessment';
import { cn } from '@/lib/utils';

interface RiskHeatmapProps {
  risks: RiskItem[];
}

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
  const getCellRisks = (s: number, o: number) => {
    return risks.filter(r => r.severity === s && r.occurrence === o).length;
  };

  const getCellColor = (s: number, o: number) => {
    // Standard 3x3 Risk Matrix Diagonal Separation
    // High (Red): (3,3), (3,2), (2,3)
    // Medium (Yellow): (3,1), (2,2), (1,3)
    // Low (Green): (2,1), (1,2), (1,1)
    
    if ((s === 3 && o >= 2) || (s === 2 && o === 3)) {
      return 'bg-red-100 border-red-200 text-red-700';
    }
    if ((s === 3 && o === 1) || (s === 2 && o === 2) || (s === 1 && o === 3)) {
      return 'bg-amber-100 border-amber-200 text-amber-700';
    }
    return 'bg-emerald-100 border-emerald-200 text-emerald-700';
  };

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm">
      <h3 className="text-lg font-black mb-4 text-slate-800 uppercase tracking-tight">Risk Heatmap (S vs O)</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1"></div>
        {[1, 2, 3].map(o => (
          <div key={o} className="text-center text-[10px] font-black text-slate-400 uppercase">Occ: {o}</div>
        ))}
        {[3, 2, 1].map(s => (
          <React.Fragment key={s}>
            <div className="flex items-center justify-end pr-2 text-[10px] font-black text-slate-400 uppercase">Sev: {s}</div>
            {[1, 2, 3].map(o => (
              <div key={`${s}-${o}`} className={cn("h-16 border-2 rounded-lg flex items-center justify-center text-xl font-black transition-colors", getCellColor(s, o))}>
                {getCellRisks(s, o)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RiskHeatmap;