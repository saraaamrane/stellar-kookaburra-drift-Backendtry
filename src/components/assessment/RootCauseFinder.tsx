"use client";

import React, { useState } from 'react';
import { RiskItem } from '@/types/assessment';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, AlertCircle, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RootCauseFinderProps {
  risks: RiskItem[];
}

const RootCauseFinder: React.FC<RootCauseFinderProps> = ({ risks }) => {
  const [query, setQuery] = useState('');

  const results = risks.filter(risk => 
    risk.failureMode.toLowerCase().includes(query.toLowerCase()) ||
    risk.effect.toLowerCase().includes(query.toLowerCase()) ||
    risk.cqa.toLowerCase().includes(query.toLowerCase()) ||
    risk.itemName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="border-2 shadow-xl overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary rounded-lg">
            <Search size={20} />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight">Production Root Cause Finder</CardTitle>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by observed effect, failure, or CQA (e.g. 'low assay', 'granulation')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:bg-white focus:text-slate-900 transition-all"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!query ? (
          <div className="text-center py-12 text-slate-400">
            <HelpCircle className="mx-auto mb-2 opacity-20" size={48} />
            <p className="font-bold">Enter an occurrence or deviation to find potential causes.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle className="mx-auto mb-2 opacity-20" size={48} />
            <p className="font-bold">No matching risks found in this assessment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Found {results.length} Potential Root Causes
            </p>
            {results.map((risk) => (
              <div key={risk.id} className="group border-2 rounded-2xl p-5 hover:border-primary/50 transition-all bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{risk.category} - {risk.itemName}</span>
                    <h4 className="text-lg font-black text-slate-900">{risk.failureMode}</h4>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    risk.riskLevel === 'HIGH' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {risk.riskLevel} Risk
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-xl border shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Primary Cause (5M)</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">{risk.primary5MCategory}</span>
                        {risk.primary5MExplanation}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Affected CQA</p>
                      <p className="text-sm font-black text-primary">{risk.cqa}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 flex items-center gap-1">
                        <ShieldCheck size={12} /> Preventive Action
                      </p>
                      <p className="text-xs text-emerald-800 italic">{risk.preventiveActions || 'No action defined'}</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-1 flex items-center gap-1">
                        <AlertCircle size={12} /> Corrective Action
                      </p>
                      <p className="text-xs text-amber-800 italic">{risk.correctiveActions || 'No action defined'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RootCauseFinder;