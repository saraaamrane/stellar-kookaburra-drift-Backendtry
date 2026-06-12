"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectData } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, ShieldCheck, Printer, Link, Check, BarChart3, Save, ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionProvider';
import debounce from 'lodash.debounce';

import WizardStepper from './WizardStepper';
import ProjectSetup from './ProjectSetup';
import ProcessFlowchart from './ProcessFlowchart';
import RiskIdentification from './RiskIdentification';
import RiskHeatmap from '../visuals/RiskHeatmap';
import AssessmentReport from './AssessmentReport';
import CollaboratorManager from './CollaboratorManager';
import RootCauseFinder from './RootCauseFinder';
import { getShareableLink } from '@/utils/share';

const PHASES = [
  'Welcome',
  'Project Setup',
  'Process Mapping',
  'Material Risks',
  'Process Risks',
  'Risk Dashboard',
  'Final Report'
];

const AssessmentWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(id === 'new' ? null : id || null);
  const [isOwner, setIsOwner] = useState(false);
  const isCreatingRef = useRef(false);
  
  const [project, setProject] = useState<ProjectData>({
    productName: '',
    strength: '',
    dosageForm: '',
    targetMarket: '',
    assessor: '',
    scope: '',
    nodes: [],
    edges: [],
    flowNodes: [],
    risks: []
  });

  // Auto-save function
  const debouncedSave = useCallback(
    debounce(async (currentProject: ProjectData, currentId: string | null) => {
      if (!session?.user || !currentId) return;
      
      setIsSaving(true);
      const { error } = await supabase
        .from('assessments')
        .update({
          product_name: currentProject.productName || 'Untitled Assessment',
          project_data: currentProject,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentId);

      if (error) {
        console.error("Auto-save failed:", error);
      }
      setIsSaving(false);
    }, 1500),
    [session]
  );

  // Handle initial creation for "new" assessments
  useEffect(() => {
    const handleInitialCreation = async () => {
      if (id === 'new' && !assessmentId && !isCreatingRef.current && project.productName.trim().length > 2 && session?.user) {
        isCreatingRef.current = true;
        setIsSaving(true);
        
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            user_id: session.user.id,
            product_name: project.productName,
            project_data: project,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (data && !error) {
          setAssessmentId(data.id);
          setIsOwner(true);
          window.history.replaceState(null, '', `/assessment/${data.id}`);
          toast.success("Assessment created and auto-saving enabled");
        }
        setIsSaving(false);
        isCreatingRef.current = false;
      }
    };

    handleInitialCreation();
  }, [project.productName, id, assessmentId, session]);

  // Trigger auto-save on project changes
  useEffect(() => {
    if (assessmentId) {
      debouncedSave(project, assessmentId);
    }
  }, [project, assessmentId, debouncedSave]);

  // Load existing assessment
  useEffect(() => {
    const loadData = async () => {
      if (assessmentId && assessmentId !== 'new' && session?.user) {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', assessmentId)
          .single();

        if (data && !error) {
          const loadedProject = data.project_data as ProjectData;
          setProject({
            ...loadedProject,
            nodes: loadedProject.nodes || [],
            edges: loadedProject.edges || []
          });
          setIsOwner(data.user_id === session.user.id);
          if (currentPhase === 0) setCurrentPhase(1);
        } else if (error) {
          toast.error("Failed to load assessment");
          navigate('/');
        }
      }
    };

    loadData();
  }, [assessmentId, session]);

  const updateProject = (updates: Partial<ProjectData>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const saveToCloud = async () => {
    if (!session?.user) return;
    setIsSaving(true);
    
    const payload = {
      user_id: session.user.id,
      product_name: project.productName || 'Untitled Assessment',
      project_data: project,
      updated_at: new Date().toISOString()
    };

    let result;
    if (assessmentId) {
      result = await supabase
        .from('assessments')
        .update(payload)
        .eq('id', assessmentId);
    } else {
      result = await supabase
        .from('assessments')
        .insert(payload)
        .select()
        .single();
      
      if (result.data) {
        setAssessmentId(result.data.id);
        setIsOwner(true);
        navigate(`/assessment/${result.data.id}`, { replace: true });
      }
    }

    setIsSaving(false);
    if (result.error) {
      toast.error("Failed to save to cloud");
    } else {
      toast.success("Assessment saved to cloud!");
    }
  };

  const handleCopyLink = () => {
    const link = getShareableLink(project);
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return (
          <div className="text-center py-20 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="text-primary" size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">IQRAF 2.0</h2>
            <p className="text-lg text-slate-500 mb-12">
              Integrated Quality Risk Assessment Framework for ICH Q9(R1) compliance.
            </p>
            <Button size="lg" onClick={() => setCurrentPhase(1)} className="h-14 px-12 rounded-2xl text-lg font-bold">
              Start New Assessment →
            </Button>
          </div>
        );
      case 1: return <ProjectSetup project={project} updateProject={updateProject} />;
      case 2: return <ProcessFlowchart project={project} updateProject={updateProject} />;
      case 3: return <RiskIdentification project={project} updateProject={updateProject} category="Material" />;
      case 4: return <RiskIdentification project={project} updateProject={updateProject} category="Process" />;
      case 5:
        const sorted5M = ['Material', 'Method', 'Machine', 'Manpower', 'Medium']
          .map(cat => ({
            cat,
            count: project.risks.filter(r => r.primary5MCategory === cat).length
          }))
          .sort((a, b) => b.count - a.count);

        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskHeatmap risks={project.risks} />
              <Card className="border-2 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" /> 5M Pareto Analysis
                  </h3>
                  <div className="space-y-6">
                    {sorted5M.map(({ cat, count }, idx) => {
                      const percentage = project.risks.length > 0 ? (count / project.risks.length) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                            <span className={cn(idx === 0 && "text-red-500")}>{cat} {idx === 0 && "(Critical Source)"}</span>
                            <span>{count} Risks ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-1000", idx === 0 ? "bg-red-500" : "bg-primary")} 
                              style={{ width: `${percentage}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border-2 border-dashed">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
                      <TrendingUp size={16} className="text-primary" />
                      Pareto Interpretation
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The analysis shows that <span className="font-bold text-slate-900">{sorted5M[0].cat}</span> is the primary contributor to risk in this process. 
                      Focusing control strategies on this category will yield the highest impact on overall quality stability.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <RootCauseFinder risks={project.risks} />

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Risk Ranking (High to Low)</h3>
              <div className="grid grid-cols-1 gap-4">
                {project.risks
                  .sort((a, b) => b.rpn - a.rpn)
                  .map(risk => (
                    <div key={risk.id} className="flex items-center justify-between p-4 bg-white border-2 rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center font-black text-white",
                          risk.riskLevel === 'HIGH' ? "bg-red-500" : risk.riskLevel === 'MEDIUM' ? "bg-amber-500" : "bg-emerald-500"
                        )}>
                          {risk.rpn}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">{risk.category} - {risk.itemName}</p>
                          <p className="font-bold text-slate-900">{risk.failureMode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Affected CQA</p>
                        <p className="font-bold text-primary">{risk.cqa}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-end gap-4 no-print">
              <Button onClick={handleCopyLink} className="h-12 rounded-xl font-bold bg-blue-600">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Link className="mr-2 h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Shareable Link"}
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="h-12 rounded-xl font-bold border-2">
                <Printer className="mr-2 h-4 w-4" /> Print PDF
              </Button>
            </div>
            
            <Card className="border-2 shadow-2xl overflow-hidden bg-white">
              <CardContent className="p-12">
                <AssessmentReport project={project} />
              </CardContent>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-slate-900 text-white px-8 py-8 shadow-2xl border-b-4 border-primary no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/10 p-2">
              <ArrowLeft size={24} />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">IQRAF <span className="text-primary">2.0</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {assessmentId && (
              <CollaboratorManager assessmentId={assessmentId} isOwner={isOwner} />
            )}
            <Button 
              variant="secondary" 
              onClick={saveToCloud} 
              disabled={isSaving}
              className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90 border-2 border-white/10"
            >
              <Save className={cn("mr-2 h-4 w-4", isSaving && "animate-spin")} />
              {isSaving ? "Saving..." : "Manual Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 -mt-6 no-print">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-1 overflow-hidden">
          <WizardStepper phases={PHASES} currentPhase={currentPhase} onPhaseClick={setCurrentPhase} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {currentPhase > 0 && (
          <div className="flex justify-between items-end mb-10 no-print">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1 uppercase">{PHASES[currentPhase]}</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Step {currentPhase + 1} of {PHASES.length}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" onClick={() => setCurrentPhase(p => Math.max(0, p - 1))} disabled={currentPhase === 0} className="rounded-xl font-black border-2 h-12">
                <ChevronLeft className="mr-2 h-5 w-5" /> BACK
              </Button>
              <Button size="lg" onClick={() => setCurrentPhase(p => Math.min(PHASES.length - 1, p + 1))} disabled={currentPhase === PHASES.length - 1} className="rounded-xl bg-primary hover:bg-primary/90 shadow-xl font-black px-10 h-12 text-white">
                CONTINUE <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        <div className="min-h-[600px]">{renderPhase()}</div>
      </main>
    </div>
  );
};

export default AssessmentWizard;