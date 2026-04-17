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
        
        {/* Left Side: Causes & Preventive Barriers */}
        <div className="flex-1 space-y-4">
          <div className="text-center font-bold text-slate-500 uppercase text-xs mb-2">Threats / Causes</div>
          {risk.causes.map((cause, i) => (
            <div key={i} className="relative flex items-center">
              <div className="flex-1 p-3 bg-slate-50 border rounded-lg text-sm shadow-sm">
                {cause.description}
              </div>
              <div className="w-8 h-px bg-slate-300"></div>
              <div className="flex flex-col gap-1">
                {risk.controls.filter(c => c.type === 'Preventive').map((ctrl, ci) => (
                  <div key={ci} className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-[10px] flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-600" />
                    {ctrl.description}
                  </div>
                ))}
              </div>
              <div className="w-8 h-px bg-slate-300"></div>
            </div>
          ))}
        </div>

        {/* Center: Top Event */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center p-4 text-center bg-white shadow-xl z-10 relative">
            <AlertTriangle className="text-amber-500 mb-2" size={32} />
            <span className="font-bold text-sm leading-tight">{risk.failureMode}</span>
          </div>
          {/* Connecting lines to center */}
          <div className="absolute top-1/2 left-[-32px] w-8 h-px bg-slate-800"></div>
          <div className="absolute top-1/2 right-[-32px] w-8 h-px bg-slate-800"></div>
        </div>

        {/* Right Side: Consequences & Mitigating Barriers */}
        <div className="flex-1 space-y-4">
          <div className="text-center font-bold text-slate-500 uppercase text-xs mb-2">Consequences / Effects</div>
          <div className="relative flex items-center">
            <div className="w-8 h-px bg-slate-300"></div>
            <div className="flex flex-col gap-1">
              {risk.controls.filter(c => c.type !== 'Preventive').map((ctrl, ci) => (
                <div key={ci} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[10px] flex items-center gap-1">
                  <Zap size={10} className="text-blue-600" />
                  {ctrl.description}
                </div>
              ))}
            </div>
            <div className="w-8 h-px bg-slate-300"></div>
            <div className="flex-1 p-3 bg-red-50 border border-red-100 rounded-lg text-sm shadow-sm">
              {risk.effect}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BowtieDiagram;