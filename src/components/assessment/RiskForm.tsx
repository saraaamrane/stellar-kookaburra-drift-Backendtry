"use client";

import React from 'react';
import { RiskItem, FiveMCategory, ProcessDeviation } from '@/types/assessment';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Star, ShieldCheck, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateRPN, getRiskLevel } from '@/lib/risk-utils';

interface RiskFormProps {
  risk: RiskItem;
  onUpdate: (updates: Partial<RiskItem>) => void;
  onRemove: () => void;
}

const FIVE_M: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Medium'];

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

  return (
    <Card className="border-2 shadow-xl overflow-hidden bg-white mb-12">
      <div className={cn(
        "px-6 py-4 flex justify-between items-center text-white font-black uppercase text-sm",
        risk.category === 'Material' ? "bg-blue-600" : "bg-purple-600"
      )}>
        <span>{risk.category} FMEA IDENTIFICATION</span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-white hover:bg-white/20">
          <Trash2 size={16} className="mr-2" /> Remove
        </Button>
      </div>

      <CardContent className="p-0 divide-y-2 divide-slate-100">
        {/* Section 1: Identification & Failure Mode */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">{risk.category === 'Material' ? 'Material Name' : 'Process Step'}</Label>
              <Input value={risk.itemName} onChange={e => onUpdate({ itemName: e.target.value })} className="h-9 text-sm font-bold" />
            </div>
            
            {risk.category === 'Material' ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Role</Label>
                  <Input value={risk.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="e.g. Diluent" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">CMA</Label>
                  <Input value={risk.cma} onChange={e => onUpdate({ cma: e.target.value })} placeholder="e.g. Particle Size" className="h-9 text-sm" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">CCP</Label>
                  <Input value={risk.ccp} onChange={e => onUpdate({ ccp: e.target.value })} placeholder="e.g. Blending Time" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Deviation</Label>
                  <Select value={risk.processDeviation} onValueChange={v => onUpdate({ processDeviation: v as ProcessDeviation })}>
                    <SelectTrigger className="h-9 text-sm font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Above Target">Above Target</SelectItem>
                      <SelectItem value="Below Target">Below Target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Affected CQA</Label>
              <Input value={risk.cqa} onChange={e => onUpdate({ cqa: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Failure Mode</Label>
              <Textarea value={risk.failureMode} onChange={e => onUpdate({ failureMode: e.target.value })} className="min-h-[80px] text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Potential Effect</Label>
              <Textarea value={risk.effect} onChange={e => onUpdate({ effect: e.target.value })} className="min-h-[80px] text-sm" />
            </div>
          </div>
        </div>

        {/* Section 2: Scoring */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Severity</Label>
              <Select value={risk.severity.toString()} onValueChange={v => handleScoreChange('severity', v)}>
                <SelectTrigger className="w-32 h-10 font-bold"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="w-32 h-10 font-bold"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="w-32 h-10 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Easy</SelectItem>
                  <SelectItem value="2">2 - Moderate</SelectItem>
                  <SelectItem value="3">3 - Difficult</SelectItem>
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

        {/* Section 3: 5M Root Cause */}
        <div className="p-6 space-y-6 bg-blue-50/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Primary 5M Source</Label>
              <Select value={risk.primary5MCategory} onValueChange={v => onUpdate({ primary5MCategory: v as any })}>
                <SelectTrigger className="h-10 font-bold bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea 
                value={risk.primary5MExplanation} 
                onChange={e => onUpdate({ primary5MExplanation: e.target.value })}
                className="min-h-[100px] text-sm bg-white"
                placeholder="Primary root cause explanation..."
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Secondary 5M Source (Optional)</Label>
              <Select value={risk.secondary5MCategory} onValueChange={v => onUpdate({ secondary5MCategory: v as any })}>
                <SelectTrigger className="h-10 font-bold bg-white"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea 
                value={risk.secondary5MExplanation} 
                onChange={e => onUpdate({ secondary5MExplanation: e.target.value })}
                className="min-h-[100px] text-sm bg-white"
                placeholder="Secondary root cause explanation..."
              />
            </div>
          </div>
        </div>

        {/* Section 4: CAPA */}
        <div className="p-6 space-y-4 bg-emerald-50/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={14} />
                <Label className="text-[10px] font-black uppercase">Preventive Actions</Label>
              </div>
              <Textarea value={risk.preventiveActions} onChange={e => onUpdate({ preventiveActions: e.target.value })} className="min-h-[100px] text-sm" placeholder="Actions to prevent occurrence..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={14} />
                <Label className="text-[10px] font-black uppercase">Corrective Actions</Label>
              </div>
              <Textarea value={risk.correctiveActions} onChange={e => onUpdate({ correctiveActions: e.target.value })} className="min-h-[100px] text-sm" placeholder="Actions to correct if failure occurs..." />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskForm;