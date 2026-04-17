import React, { useState } from 'react';
import { ProjectData, RiskItem, ProcessStep } from '@/types/assessment';
import { calculateRPN, getRiskLevel } from '@/lib/risk-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, ShieldCheck, Activity, FileText, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

import WizardStepper from './WizardStepper';
import ProjectSetup from './ProjectSetup';
import RiskHeatmap from '../visuals/RiskHeatmap';
import IshikawaDiagram from '../visuals/IshikawaDiagram';
import BowtieDiagram from '../visuals/BowtieDiagram';

const PHASES = [
  'Setup',
  'Process',
  'Risk ID',
  'Scoring',
  'Dashboard',
  'Analysis',
  'Controls',
  'Visuals'
];

const AssessmentWizard = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [project, setProject] = useState<ProjectData>({
    productName: '',
    strength: '',
    dosageForm: '',
    targetMarket: '',
    devStage: '',
    processType: '',
    scope: '',
    steps: [],
    risks: []
  });

  const updateProject = (updates: Partial<ProjectData>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return <ProjectSetup project={project} updateProject={updateProject} />;
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'High Risks', count: project.risks.filter(r => r.riskLevel === 'HIGH').length, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Medium Risks', count: project.risks.filter(r => r.riskLevel === 'MEDIUM').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Low Risks', count: project.risks.filter(r => r.riskLevel === 'LOW').length, color: 'text-emerald-600', bg: 'bg-emerald-50' }
              ].map((stat, i) => (
                <Card key={i} className={cn("border-none shadow-sm", stat.bg)}>
                  <CardContent className="pt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                    <p className={cn("text-4xl font-black", stat.color)}>{stat.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <RiskHeatmap risks={project.risks} />
          </div>
        );
      case 7:
        return (
          <div className="space-y-12 animate-in fade-in duration-500">
            {project.risks.length > 0 ? (
              project.risks.map(risk => (
                <div key={risk.id} className="space-y-8">
                  <IshikawaDiagram risk={risk} />
                  <BowtieDiagram risk={risk} />
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                <Activity className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">No risks identified yet</h3>
                <p className="text-slate-400">Complete the previous steps to generate visualizations.</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
            <LayoutDashboard className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">{PHASES[currentPhase]} Module</h3>
            <p className="text-slate-400">This module is being optimized for the new UI.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-primary/10">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">IQRAF <span className="text-primary">2.0</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Risk Framework</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-slate-500 font-bold text-xs uppercase tracking-wider">
              <FileText className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
              <span className="text-xs font-bold text-slate-600">QA Lead</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stepper Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-2">
          <WizardStepper 
            phases={PHASES} 
            currentPhase={currentPhase} 
            onPhaseClick={setCurrentPhase} 
          />
        </div>

        {/* Content Section */}
        <div className="relative">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{PHASES[currentPhase]}</h2>
              <p className="text-slate-500 font-medium">Step {currentPhase + 1} of {PHASES.length}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
                disabled={currentPhase === 0}
                className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.min(PHASES.length - 1, p + 1))}
                disabled={currentPhase === PHASES.length - 1}
                className="rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold px-8"
              >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="min-h-[500px]">
            {renderPhase()}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/60">
        <div className="flex flex-wrap justify-center gap-12 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
            <ShieldCheck size={14} /> ICH Q9 Compliant
          </div>
          <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
            <Activity size={14} /> Real-time Risk Scoring
          </div>
          <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
            <FileText size={14} /> Regulatory Ready
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AssessmentWizard;