"use client";

import React, { useEffect, useState } from 'react';
import { RiskItem, FiveMCategory, ProcessDeviation } from '@/types/assessment';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Star, ShieldCheck, AlertCircle, Copy, Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateRPN, getRiskLevel } from '@/lib/risk-utils';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionProvider';
import { toast } from 'sonner';

interface RiskFormProps {
  risk: RiskItem;
  onUpdate: (updates: Partial<RiskItem>) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
}

const FIVE_M: FiveMCategory[] = ['Material', 'Method', 'Machine', 'Manpower', 'Medium'];
const DEVIATIONS: ProcessDeviation[] = ['Above Target', 'Below Target', 'Other than'];

const RiskForm: React.FC<RiskFormProps> = ({ risk, onUpdate, onRemove, onDuplicate }) => {
  const { session } = useSession();
  const [isSavingToLib, setIsSavingToLib] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const saveToLibrary = async () => {
    if (!risk.itemName || !risk.failureMode) {
      toast.error("Item name and failure mode are required to save to library");
      return;
    }

    if (!session?.user) {
      toast.error("You must be logged in to save to the library");
      return;
    }

    setIsSavingToLib(true);
    
    try {
      const { error } = await supabase
        .from('risk_library')
        .insert({
          user_id: session.user.id,
          category: risk.category,
          item_name: risk.itemName,
          risk_data: risk
        });

      if (error) throw error;

      toast.success("Saved to your risk library!");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      console.error("Library save error:", error);
      toast.error(error.message || "Failed to save to library. Ensure the table exists.");
    } finally {
      setIsSavingToLib(false);
    }
  };

  // Sync Failure Mode for Process risks when Deviation or CPP changes
  useEffect(() => {
    if (risk.category === 'Process' && risk.processDeviation && risk.cpp) {
      const autoFailureMode = `${risk.processDeviation} ${risk.cpp}`;
      if (risk.failureMode !== autoFailureMode) {
        onUpdate({ failureMode: autoFailureMode });
      }
    }
  }, [risk.processDeviation, risk.cpp, risk.category]);

  return (
    <Card className="border-2 shadow-xl overflow-hidden bg-white mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={cn(
        "px-6 py-3 flex justify-between items-center text-white font-black uppercase text-[10px] tracking-widest",
        risk.category === 'Material' ? "bg-blue-600" : "bg-purple-600"
      )}>
        <div className="flex items-center gap-4">
          <span>{risk.category} RISK ENTRY</span>
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-6 text-[10px] text-white hover:bg-white/20 px-2">
              <Copy size={12} className="mr-1" /> Duplicate Step
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={saveToLibrary} 
            disabled={isSavingToLib}
            className="h-6 text-[10px] text-white hover:bg-white/20 px-2"
          >
            {isSaved ? <BookmarkCheck size={12} className="mr-1" /> : <Bookmark size={12} className="mr-1" />}
            {isSaved ? "Saved!" : isSavingToLib ? "Saving..." : "Save to Library"}
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 text-[10px] text-white hover:bg-white/20 px-2">
          <Trash2 size={12} className="mr-1" /> Remove
        </Button>
      </div>

      <CardContent className="p-0 divide-y-2 divide-slate-100">
        {/* Section 1: Identification */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">{risk.category === 'Material' ? 'Material Name' : 'Process Step'}</Label>
              <Input 
                value={risk.itemName} 
                onChange={e => onUpdate({ itemName: e.target.value })} 
                className="h-10 text-sm font-bold border-2 focus:border-primary placeholder:font-normal" 
                placeholder={risk.category === 'Material' ? "e.g. Lactose Monohydrate" : "e.g. Dry Mixing"}
              />
            </div>
            
            {risk.category === 'Material' ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Role</Label>
                  <Input value={risk.role} onChange={e => onUpdate({ role: e.target.value })} placeholder="e.g. Diluent" className="h-10 text-sm border-2 placeholder:font-normal" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">CMA</Label>
                  <Input value={risk.cma} onChange={e => onUpdate({ cma: e.target.value })} placeholder="e.g. Particle Size" className="h-10 text-sm border-2 placeholder:font-normal" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">CPP (Parameter)</Label>
                  <Input value={risk.cpp} onChange={e => onUpdate({ cpp: e.target.value })} placeholder="e.g. Mixing Speed" className="h-10 text-sm border-2 placeholder:font-normal" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Deviation (HAZOP)</Label>
                  <Select value={risk.processDeviation} onValueChange={v => onUpdate({ processDeviation: v as ProcessDeviation })}>
                    <SelectTrigger className="h-10 text-sm font-bold border-2 bg-white"><SelectValue placeholder="Select deviation" /></SelectTrigger>
                    <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                      {DEVIATIONS.map(d => <SelectItem key={d} value={d} className="font-bold hover:bg-slate-100">{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Section 2: Failure Mode -> Effect -> CQA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">
                {risk.category === 'Process' ? 'Failure Mode (Auto-generated)' : 'Failure Mode'}
              </Label>
              <Textarea 
                value={risk.failureMode} 
                onChange={e => onUpdate({ failureMode: e.target.value })} 
                readOnly={risk.category === 'Process'}
                className={cn("min-h-[100px] text-sm border-2 placeholder:font-normal", risk.category === 'Process' && "bg-slate-50 font-medium")}
                placeholder="Describe how it fails..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Potential Effect</Label>
              <Textarea 
                value={risk.effect} 
                onChange={e => onUpdate({ effect: e.target.value })} 
                className="min-h-[100px] text-sm border-2 placeholder:font-normal" 
                placeholder="Impact on intermediate or final product..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Affected CQA</Label>
              <Textarea 
                value={risk.cqa} 
                onChange={e => onUpdate({ cqa: e.target.value })} 
                className="min-h-[100px] text-sm border-2 font-bold text-primary placeholder:font-normal" 
                placeholder="e.g. Assay, Dissolution, Content Uniformity"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scoring */}
        <div className="p-6 bg-slate-50/50">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Severity (S)</Label>
              <Select value={risk.severity.toString()} onValueChange={v => handleScoreChange('severity', v)}>
                <SelectTrigger className="w-32 h-10 font-bold border-2 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                  <SelectItem value="1">1 - Low</SelectItem>
                  <SelectItem value="2">2 - Moderate</SelectItem>
                  <SelectItem value="3">3 - High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Occurrence (O)</Label>
              <Select value={risk.occurrence.toString()} onValueChange={v => handleScoreChange('occurrence', v)}>
                <SelectTrigger className="w-32 h-10 font-bold border-2 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                  <SelectItem value="1">1 - Rare</SelectItem>
                  <SelectItem value="2">2 - Occasional</SelectItem>
                  <SelectItem value="3">3 - Frequent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Detection (D)</Label>
              <Select value={risk.detection.toString()} onValueChange={v => handleScoreChange('detection', v)}>
                <SelectTrigger className="w-32 h-10 font-bold border-2 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                  <SelectItem value="1">1 - Easy</SelectItem>
                  <SelectItem value="2">2 - Moderate</SelectItem>
                  <SelectItem value="3">3 - Difficult</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn(
              "flex-1 min-w-[200px] h-10 rounded-xl flex items-center justify-between px-6 border-2 shadow-inner",
              risk.riskLevel === 'HIGH' ? "bg-red-100 border-red-300 text-red-700" :
              risk.riskLevel === 'MEDIUM' ? "bg-amber-100 border-amber-300 text-amber-700" :
              "bg-emerald-100 border-emerald-300 text-emerald-700"
            )}>
              <span className="text-xs font-black uppercase tracking-tighter">RPN = {risk.rpn}</span>
              <span className="text-xs font-black uppercase flex items-center gap-2">
                <Star size={14} fill="currentColor" /> {risk.riskLevel} PRIORITY
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: 5M Root Cause */}
        <div className="p-6 space-y-6 bg-blue-50/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Primary 5M Source</Label>
              <Select value={risk.primary5MCategory} onValueChange={v => onUpdate({ primary5MCategory: v as any })}>
                <SelectTrigger className="h-10 font-bold bg-white border-2"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                  {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea 
                value={risk.primary5MExplanation} 
                onChange={e => onUpdate({ primary5MExplanation: e.target.value })}
                className="min-h-[80px] text-sm bg-white border-2 placeholder:font-normal"
                placeholder="Primary root cause explanation..."
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Secondary 5M Source (Optional)</Label>
              <Select value={risk.secondary5MCategory} onValueChange={v => onUpdate({ secondary5MCategory: v as any })}>
                <SelectTrigger className="h-10 font-bold bg-white border-2"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl z-[100]">
                  {FIVE_M.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea 
                value={risk.secondary5MExplanation} 
                onChange={e => onUpdate({ secondary5MExplanation: e.target.value })}
                className="min-h-[80px] text-sm bg-white border-2 placeholder:font-normal"
                placeholder="Secondary root cause explanation..."
              />
            </div>
          </div>
        </div>

        {/* Section 5: CAPA */}
        <div className="p-6 space-y-4 bg-emerald-50/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck size={14} />
                <Label className="text-[10px] font-black uppercase">Preventive Actions</Label>
              </div>
              <Textarea value={risk.preventiveActions} onChange={e => onUpdate({ preventiveActions: e.target.value })} className="min-h-[100px] text-sm border-2 placeholder:font-normal" placeholder="Actions to prevent occurrence..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={14} />
                <Label className="text-[10px] font-black uppercase">Corrective Actions</Label>
              </div>
              <Textarea value={risk.correctiveActions} onChange={e => onUpdate({ correctiveActions: e.target.value })} className="min-h-[100px] text-sm border-2 placeholder:font-normal" placeholder="Actions to correct if failure occurs..." />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskForm;