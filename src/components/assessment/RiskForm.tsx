import React from 'react';
import { RiskItem, DeviationType, FiveMCategory } from '@/types/assessment';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Star, AlertTriangle, ShieldCheck, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateRPN, getRiskLevel } from '@/lib/risk-utils';

interface RiskFormProps {
  risk: RiskItem;
  onUpdate: (updates: Partial<RiskItem>) => void;
  onRemove: () => void;
}

const DEVIATIONS: DeviationType[] = ['NO', 'LESS', 'MORE', 'REVERSE', 'OTHER THAN'];
const FIVE_M: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Measurement', 'Environment'];

const RiskForm: React.FC<RiskFormProps> = ({ risk, onUpdate, onRemove }) => {
  const handleScoreChange = (field: 'severity' | 'occurrence' | 'detection', value: string) => {
    const numVal = parseInt(value);
    const updates: any = { [field]: numVal };
    
    const s = field === 'severity' ? numVal : risk.severity;
    const o = field === 'occurrence' ? numVal : risk.occurrence;
    const d = field === 'detection' ? numVal : risk.detection;
    
    updates.rpn = calculateRPN(s, o, d);
    updates.riskLevel = getRiskLevel(s, o, d);
    onUpdate(updates);
  };

  const toggleDeviation = (dev: DeviationType) => {
    const deviations = risk.deviations.includes(dev)
      ? risk.deviations.filter(d => d !== dev)
      : [...risk.deviations, dev];
    onUpdate({ deviations });
  };

  return (
    <Card className="border-2 shadow-xl overflow-hidden bg-white mb-12">
      <div className={cn(
        "px-6 py-4 flex justify-between items-center text-white font-black tracking-widest uppercase text-sm",
        risk.category === 'Material' ? "bg-blue-600" : "bg-purple-600"
      )}>
        <span>{risk.category} FAILURE IDENTIFICATION</span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-white hover:bg-white/20">
          <Trash2 size={16} className="mr-2" /> Remove
        </Button>
      </div>

      <CardContent className="p-0 divide-y-2 divide-slate-100">
        {/* SECTION 1: IDENTIFICATION */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 1</div>
            <h4 className="text-xs font-black uppercase text-slate-500">What is failing?</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">{risk.category === 'Material' ? 'Material Name' : 'Process Step'}</Label>
              <Input value={risk.itemName} onChange={e => onUpdate({ itemName: e.target.value })} className="h-9 text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">{risk.category === 'Material' ? 'Material Type' : 'Process Parameter'}</Label>
              <Input value={risk.itemType} onChange={e => onUpdate({ itemType: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">{risk.category === 'Material' ? 'CMA' : 'CPP'}</Label>
              <Input value={risk.attribute} onChange={e => onUpdate({ attribute: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Affected CQA</Label>
              <Input value={risk.cqa} onChange={e => onUpdate({ cqa: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* SECTION 2: FAILURE MODE & EFFECT */}
        <div className="p-6 space-y-4 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 2</div>
            <h4 className="text-xs font-black uppercase text-slate-500">Failure Mode & Effect</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Failure Mode</Label>
              <Textarea value={risk.failureMode} onChange={e => onUpdate({ failureMode: e.target.value })} className="min-h-[80px] text-sm" placeholder="Describe exactly what goes wrong..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Effect</Label>
              <Textarea value={risk.effect} onChange={e => onUpdate({ effect: e.target.value })} className="min-h-[80px] text-sm" placeholder="Consequence of this failure..." />
            </div>
          </div>
        </div>

        {/* SECTION 3: RISK SCORING */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 3</div>
            <h4 className="text-xs font-black uppercase text-slate-500">Risk Scoring</h4>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Severity</Label>
              <Select value={risk.severity.toString()} onValueChange={v => handleScoreChange('severity', v)}>
                <SelectTrigger className="w-40 h-10 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Low</SelectItem>
                  <SelectItem value="2">2 - Moderate</SelectItem>
                  <SelectItem value="3">3 - High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Occurrence</Label>
              <Select value={risk.occurrence.toString()} onValueChange={v => handleScoreChange('occurrence', v)}>
                <SelectTrigger className="w-40 h-10 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Rare</SelectItem>
                  <SelectItem value="2">2 - Occasional</SelectItem>
                  <SelectItem value="3">3 - Frequent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Detection</Label>
              <Select value={risk.detection.toString()} onValueChange={v => handleScoreChange('detection', v)}>
                <SelectTrigger className="w-40 h-10 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - High</SelectItem>
                  <SelectItem value="2">2 - Moderate</SelectItem>
                  <SelectItem value="3">3 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn(
              "flex-1 min-w-[200px] h-10 rounded-lg flex items-center justify-between px-4 border-2",
              risk.riskLevel === 'HIGH' ? "bg-red-50 border-red-200 text-red-700" :
              risk.riskLevel === 'MEDIUM' ? "bg-amber-50 border-amber-200 text-amber-700" :
              "bg-emerald-50 border-emerald-200 text-emerald-700"
            )}>
              <span className="text-xs font-black uppercase">RPN = {risk.rpn}</span>
              <span className="text-xs font-black uppercase flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {risk.riskLevel} PRIORITY
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: 5M SOURCE CATEGORIZATION */}
        <div className="p-6 space-y-6 bg-blue-50/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 4</div>
            <h4 className="text-xs font-black uppercase text-slate-500 flex items-center gap-1">
              5M Source Categorization (Integrated) <Star size={12} className="text-amber-500 fill-amber-500" />
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Primary 5M Source Category</Label>
                <Select value={risk.primary5MCategory} onValueChange={v => onUpdate({ primary5MCategory: v as any })}>
                  <SelectTrigger className="h-10 font-bold bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Why did you select this source? (Evidence & Reasoning)</Label>
                  <Textarea 
                    value={risk.primary5MExplanation} 
                    onChange={e => onUpdate({ primary5MExplanation: e.target.value })}
                    className="min-h-[150px] text-sm bg-white border-2"
                    placeholder="Provide evidence, reasoning, observations..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Secondary 5M Source (Optional)</Label>
                <Select value={risk.secondary5MCategory} onValueChange={v => onUpdate({ secondary5MCategory: v as any })}>
                  <SelectTrigger className="h-10 font-bold bg-white"><SelectValue placeholder="Select secondary source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Details on secondary source</Label>
                  <Textarea 
                    value={risk.secondary5MExplanation} 
                    onChange={e => onUpdate({ secondary5MExplanation: e.target.value })}
                    className="min-h-[150px] text-sm bg-white border-2"
                    placeholder="How does this secondary source contribute?"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: PARAMETER DEVIATION ANALYSIS */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 5</div>
            <h4 className="text-xs font-black uppercase text-slate-500">Parameter Deviation Analysis</h4>
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase text-slate-400">How could this {risk.category === 'Material' ? 'material property' : 'process parameter'} deviate?</Label>
            <div className="flex flex-wrap gap-3">
              {DEVIATIONS.map(dev => (
                <button
                  key={dev}
                  onClick={() => toggleDeviation(dev)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black transition-all border-2 flex items-center gap-2",
                    risk.deviations.includes(dev)
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  )}
                >
                  <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center", risk.deviations.includes(dev) ? "bg-white border-white" : "border-slate-300")}>
                    {risk.deviations.includes(dev) && <div className="w-1.5 h-1.5 bg-slate-900 rounded-sm" />}
                  </div>
                  {dev}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Primary Deviation Notes</Label>
              <Input value={risk.deviationNotes} onChange={e => onUpdate({ deviationNotes: e.target.value })} className="h-9 text-sm" placeholder="e.g. Moisture too high due to hygroscopic nature..." />
            </div>
          </div>
        </div>

        {/* SECTION 6: CONTROL STRATEGY */}
        <div className="p-6 space-y-4 bg-emerald-50/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">SECTION 6</div>
            <h4 className="text-xs font-black uppercase text-slate-500">Control Strategy</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={14} />
                <Label className="text-[10px] font-black uppercase">Preventive</Label>
              </div>
              <Textarea 
                value={risk.preventiveControls} 
                onChange={e => onUpdate({ preventiveControls: e.target.value })}
                className="min-h-[120px] text-sm border-emerald-100 focus:border-emerald-300"
                placeholder="Address the root cause..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap size={14} />
                <Label className="text-[10px] font-black uppercase">Detective</Label>
              </div>
              <Textarea 
                value={risk.detectiveControls} 
                onChange={e => onUpdate({ detectiveControls: e.target.value })}
                className="min-h-[120px] text-sm border-blue-100 focus:border-blue-300"
                placeholder="Catch before release..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={14} />
                <Label className="text-[10px] font-black uppercase">Mitigating</Label>
              </div>
              <Textarea 
                value={risk.mitigatingControls} 
                onChange={e => onUpdate({ mitigatingControls: e.target.value })}
                className="min-h-[120px] text-sm border-amber-100 focus:border-amber-300"
                placeholder="Handle if it happens..."
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskForm;