import React from 'react';
import { ProjectData, RiskItem } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import RiskForm from './RiskForm';

interface RiskIdentificationProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  category: 'Material' | 'Process';
}

const RiskIdentification: React.FC<RiskIdentificationProps> = ({ project, updateProject, category }) => {
  const addRisk = () => {
    const newRisk: RiskItem = {
      id: crypto.randomUUID(),
      category,
      itemName: '',
      itemType: '',
      attribute: '',
      cqa: '',
      failureMode: '',
      effect: '',
      severity: 1,
      occurrence: 1,
      detection: 1,
      rpn: 1,
      riskLevel: 'LOW',
      primary5MCategory: 'Material',
      primary5MExplanation: '',
      secondary5MExplanation: '',
      deviations: [],
      deviationNotes: '',
      preventiveControls: '',
      detectiveControls: '',
      mitigatingControls: ''
    };
    updateProject({ risks: [...project.risks, newRisk] });
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    updateProject({
      risks: project.risks.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRisk = (id: string) => {
    updateProject({ risks: project.risks.filter(r => r.id !== id) });
  };

  const filteredRisks = project.risks.filter(r => r.category === category);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border-2 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
            category === 'Material' ? "bg-blue-600 shadow-blue-100" : "bg-purple-600 shadow-purple-100"
          )}>
            <AlertCircle className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{category} Risk Identification</h3>
            <p className="text-sm text-slate-500 font-medium">Integrated FMEA + 5M Root Cause Analysis</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={addRisk} className="rounded-xl font-black h-12 px-6 shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-5 w-5" /> ADD {category.toUpperCase()} RISK
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No {category.toLowerCase()} risks identified yet.</p>
            <Button variant="link" onClick={addRisk} className="text-primary font-black">Click here to add your first risk</Button>
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <RiskForm 
              key={risk.id} 
              risk={risk} 
              onUpdate={(updates) => updateRisk(risk.id, updates)}
              onRemove={() => removeRisk(risk.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RiskIdentification;