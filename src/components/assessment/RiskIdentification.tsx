import React from 'react';
import { ProjectData, RiskItem, DeviationType, FiveMCategory } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskIdentificationProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  category: 'Material' | 'Process';
}

const DEVIATIONS: DeviationType[] = ['NO', 'LESS', 'MORE', 'REVERSE', 'OTHER THAN'];
const FIVE_M: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Measurement', 'Environment'];

const RiskIdentification: React.FC<RiskIdentificationProps> = ({ project, updateProject, category }) => {
  const addRisk = () => {
    const newRisk: RiskItem = {
      id: crypto.randomUUID(),
      category,
      itemName: '',
      attribute: '',
      cqa: '',
      failureMode: '',
      effect: '',
      causes: [{ description: '', category: 'Material' }],
      deviations: [],
      severity: 1,
      occurrence: 1,
      detection: 1,
      rpn: 1,
      riskLevel: 'LOW',
      controls: []
    };
    updateProject({ risks: [...project.risks, newRisk] });
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    updateProject({
      risks: project.risks.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const toggleDeviation = (riskId: string, dev: DeviationType) => {
    const risk = project.risks.find(r => r.id === riskId);
    if (!risk) return;
    const deviations = risk.deviations.includes(dev)
      ? risk.deviations.filter(d => d !== dev)
      : [...risk.deviations, dev];
    updateRisk(riskId, { deviations });
  };

  const filteredRisks = project.risks.filter(r => r.category === category);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
            category === 'Material' ? "bg-blue-500 shadow-blue-200" : "bg-purple-500 shadow-purple-200"
          )}>
            <AlertCircle className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">{category} Risk Identification</h3>
            <p className="text-sm text-slate-500 font-medium">Identify potential failures and their effects</p>
          </div>
        </div>
        <Button onClick={addRisk} className="rounded-xl font-bold">
          <Plus className="mr-2 h-4 w-4" /> Add {category} Risk
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredRisks.map((risk, idx) => (
          <Card key={risk.id} className="border-2 hover:border-primary/30 transition-all overflow-hidden">
            <div className={cn("h-1.5 w-full", category === 'Material' ? "bg-blue-500" : "bg-purple-500")} />
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">{category === 'Material' ? 'Material Name' : 'Process Step'}</Label>
                  <Input 
                    value={risk.itemName} 
                    onChange={e => updateRisk(risk.id, { itemName: e.target.value })}
                    placeholder={category === 'Material' ? "e.g. Levodopa" : "e.g. Drying"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">{category === 'Material' ? 'CMA' : 'Parameter'}</Label>
                  <Input 
                    value={risk.attribute} 
                    onChange={e => updateRisk(risk.id, { attribute: e.target.value })}
                    placeholder={category === 'Material' ? "e.g. Particle Size" : "e.g. Temperature"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">CQA Impacted</Label>
                  <Input 
                    value={risk.cqa} 
                    onChange={e => updateRisk(risk.id, { cqa: e.target.value })}
                    placeholder="e.g. Content Uniformity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Failure Mode</Label>
                  <Input 
                    value={risk.failureMode} 
                    onChange={e => updateRisk(risk.id, { failureMode: e.target.value })}
                    placeholder="What could go wrong?"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Effect</Label>
                  <Input 
                    value={risk.effect} 
                    onChange={e => updateRisk(risk.id, { effect: e.target.value })}
                    placeholder="Consequence of failure"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-slate-400">Parameter Deviations</Label>
                <div className="flex flex-wrap gap-2">
                  {DEVIATIONS.map(dev => (
                    <button
                      key={dev}
                      onClick={() => toggleDeviation(risk.id, dev)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border-2",
                        risk.deviations.includes(dev)
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Label className="text-xs font-bold uppercase text-slate-400">5M Category:</Label>
                  <Select 
                    value={risk.causes[0].category} 
                    onValueChange={v => {
                      const causes = [...risk.causes];
                      causes[0].category = v as any;
                      updateRisk(risk.id, { causes });
                    }}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateProject({ risks: project.risks.filter(r => r.id !== risk.id) })}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 font-bold"
                >
                  <Trash2 size={14} className="mr-2" /> Remove Risk
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RiskIdentification;