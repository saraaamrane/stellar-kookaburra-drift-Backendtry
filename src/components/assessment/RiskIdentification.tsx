"use client";

import React from 'react';
import { ProjectData, RiskItem } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import RiskForm from './RiskForm';
import RiskLibraryDialog from './RiskLibraryDialog';

interface RiskIdentificationProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  category: 'Material' | 'Process';
}

const RiskIdentification: React.FC<RiskIdentificationProps> = ({ project, updateProject, category }) => {
  const addRisk = (template?: Partial<RiskItem>) => {
    const newRisk: RiskItem = {
      id: crypto.randomUUID(),
      category,
      itemName: template?.itemName || '',
      role: template?.role || '',
      cma: template?.cma || '',
      cpp: template?.cpp || '',
      processDeviation: template?.processDeviation || (category === 'Process' ? 'Above Target' : undefined),
      cqa: template?.cqa || '',
      failureMode: template?.failureMode || '',
      effect: template?.effect || '',
      severity: template?.severity || 1,
      occurrence: template?.occurrence || 1,
      detection: template?.detection || 1,
      rpn: template?.rpn || 1,
      riskLevel: template?.riskLevel || 'LOW',
      primary5MCategory: template?.primary5MCategory || (category === 'Material' ? 'Material' : 'Method'),
      primary5MExplanation: template?.primary5MExplanation || '',
      secondary5MCategory: template?.secondary5MCategory,
      secondary5MExplanation: template?.secondary5MExplanation || '',
      preventiveActions: template?.preventiveActions || '',
      correctiveActions: template?.correctiveActions || ''
    };
    // Prepend new risk to the top
    updateProject({ risks: [newRisk, ...project.risks] });
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    updateProject({
      risks: project.risks.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRisk = (id: string) => {
    updateProject({ risks: project.risks.filter(r => r.id !== id) });
  };

  const duplicateRisk = (risk: RiskItem) => {
    const { id, ...rest } = risk;
    addRisk({
      ...rest,
      // Clear specific outcome fields but keep identification fields
      cqa: '',
      effect: '',
      severity: 1,
      occurrence: 1,
      detection: 1,
      rpn: 1,
      riskLevel: 'LOW',
      primary5MExplanation: '',
      secondary5MExplanation: '',
      preventiveActions: '',
      correctiveActions: ''
    });
  };

  const filteredRisks = project.risks.filter(r => r.category === category);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border-2 shadow-sm sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
            category === 'Material' ? "bg-blue-600" : "bg-purple-600"
          )}>
            <AlertCircle className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{category} Risk Identification</h3>
            <p className="text-sm text-slate-500 font-medium">Integrated FMEA + HAZOP Analysis</p>
          </div>
        </div>
        <div className="flex gap-3">
          <RiskLibraryDialog category={category} onImport={addRisk} />
          <Button onClick={() => addRisk()} className="rounded-2xl font-black h-14 px-8 shadow-xl hover:scale-105 transition-transform">
            <Plus className="mr-2 h-6 w-6" /> ADD NEW {category.toUpperCase()} RISK
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
            <Layers className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-bold text-xl">No {category.toLowerCase()} risks identified yet.</p>
            <p className="text-slate-300 text-sm mt-2">Click the button above to start your assessment.</p>
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <RiskForm 
              key={risk.id} 
              risk={risk} 
              onUpdate={(updates) => updateRisk(risk.id, updates)}
              onRemove={() => removeRisk(risk.id)}
              onDuplicate={() => duplicateRisk(risk)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RiskIdentification;