import React from 'react';
import { RiskItem, FIVE_M_CATEGORIES } from '@/types/assessment';

interface IshikawaDiagramProps {
  risk: RiskItem;
}

const IshikawaDiagram: React.FC<IshikawaDiagramProps> = ({ risk }) => {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm overflow-x-auto">
      <h3 className="text-lg font-semibold mb-6 text-slate-800">Ishikawa Diagram: {risk.failureMode}</h3>
      <div className="relative min-w-[800px] h-[400px] flex items-center">
        {/* Main Spine */}
        <div className="absolute left-0 right-40 h-1 bg-slate-800 top-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-20 border-2 border-slate-800 flex items-center justify-center bg-slate-50 rounded-md font-bold text-center px-2">
          {risk.failureMode}
        </div>

        {/* Bones */}
        <div className="absolute inset-0 grid grid-cols-3 gap-4">
          {/* Top Bones */}
          {['Material', 'Method', 'Machine'].map((cat, i) => (
            <div key={cat} className="relative h-1/2">
              <div className="absolute bottom-0 left-1/2 w-px h-32 bg-slate-400 -rotate-45 origin-bottom"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 font-semibold text-sm text-blue-600 uppercase tracking-wider">
                {cat}
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full px-4">
                {risk.causes.filter(c => c.category === cat).map((c, idx) => (
                  <div key={idx} className="text-[10px] bg-white border p-1 mb-1 rounded shadow-sm truncate">
                    {c.description}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom Bones */}
          {['Manpower', 'Measurement', 'Environment'].map((cat, i) => (
            <div key={cat} className="relative h-1/2 mt-[200px]">
              <div className="absolute top-0 left-1/2 w-px h-32 bg-slate-400 rotate-45 origin-top"></div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-semibold text-sm text-blue-600 uppercase tracking-wider">
                {cat}
              </div>
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full px-4">
                {risk.causes.filter(c => c.category === cat).map((c, idx) => (
                  <div key={idx} className="text-[10px] bg-white border p-1 mb-1 rounded shadow-sm truncate">
                    {c.description}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IshikawaDiagram;