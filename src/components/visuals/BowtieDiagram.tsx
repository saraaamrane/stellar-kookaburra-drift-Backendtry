"use client";

import React from 'react';
import { RiskItem } from '@/types/assessment';
import { ShieldCheck, AlertTriangle, Zap } from 'lucide-react';

interface BowtieDiagramProps {
  risk: RiskItem;
}

const BowtieDiagram: React.FC<BowtieDiagramProps> = ({ risk }) => {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm overflow-x-auto">
      <h3 className="text-lg font-semibold mb-8 text-slate-800">Bowtie Analysis: {risk.failureMode}</h3>
      <div className="flex items-center justify-between min-w-[900px] gap-8">
        <div className="flex-1 space-y-4">
          <div className="text-center font-bold text-slate-500 uppercase text-xs mb-2">Threats</div>
          <div className="p-3 bg-slate-50 border rounded-lg text-sm">{risk.primary5MExplanation}</div>
        </div>
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center p-4 text-center bg-white shadow-xl">
            <AlertTriangle className="text-amber-500 mb-2" size={32} />
            <span className="font-bold text-sm leading-tight">{risk.failureMode}</span>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="text-center font-bold text-slate-500 uppercase text-xs mb-2">Consequences</div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm">{risk.effect}</div>
        </div>
      </div>
    </div>
  );
};

export default BowtieDiagram;