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
    const rpn_max = s * o * 3;
    if (rpn_max >= 18 || s === 3) return 'bg-red-100 border-red-200';
    if (rpn_max >= 8) return 'bg-amber-100 border-amber-200';
    return 'bg-emerald-100 border-emerald-200';
  };

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Risk Heatmap (S vs O)</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1"></div>
        {[1, 2, 3].map(o => (
          <div key={o} className="text-center text-xs font-medium text-slate-500">Occ: {o}</div>
        ))}
        {[3, 2, 1].map(s => (
          <React.Fragment key={s}>
            <div className="flex items-center justify-end pr-2 text-xs font-medium text-slate-500">Sev: {s}</div>
            {[1, 2, 3].map(o => (
              <div key={`${s}-${o}`} className={cn("h-16 border-2 rounded-lg flex items-center justify-center text-xl font-bold", getCellColor(s, o))}>
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