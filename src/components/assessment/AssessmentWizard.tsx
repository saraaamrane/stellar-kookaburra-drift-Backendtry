import React, { useState } from 'react';
import { ProjectData, RiskItem } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, ShieldCheck, LayoutDashboard, Download, Printer, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

import WizardStepper from './WizardStepper';
import ProjectSetup from './ProjectSetup';
import ProcessFlowchart from './ProcessFlowchart';
import RiskIdentification from './RiskIdentification';
import RiskHeatmap from '../visuals/RiskHeatmap';
import IshikawaDiagram from '../visuals/IshikawaDiagram';
import BowtieDiagram from '../visuals/BowtieDiagram';

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
  const [currentPhase, setCurrentPhase] = useState(0);
  const [project, setProject] = useState<ProjectData>({
    productName: '',
    strength: '',
    dosageForm: '',
    targetMarket: '',
    assessor: '',
    scope: '',
    flowNodes: [],
    risks: []
  });

  const updateProject = (updates: Partial<ProjectData>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return (
          <div className="text-center py-20 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="text-primary" size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Digital Risk Assessment Tool</h2>
            <p className="text-lg text-slate-500 mb-12 leading-relaxed">
              A structured, reproducible ICH Q9(R1)-compliant platform for Quality Risk Management in drug development.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-white border-2 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">Integrated 5M</h4>
                <p className="text-xs text-slate-500">Root cause analysis built directly into the FMEA form.</p>
              </div>
              <div className="p-6 bg-white border-2 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">Auto-Visuals</h4>
                <p className="text-xs text-slate-500">Ishikawa and Bowtie diagrams generated instantly.</p>
              </div>
              <div className="p-6 bg-white border-2 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">Audit Ready</h4>
                <p className="text-xs text-slate-500">Detailed evidence-based justifications for every risk.</p>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => setCurrentPhase(1)}
              className="h-14 px-12 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
            >
              Start New Assessment →
            </Button>
          </div>
        );
      case 1:
        return <ProjectSetup project={project} updateProject={updateProject} />;
      case 2:
        return <ProcessFlowchart project={project} updateProject={updateProject} />;
      case 3:
        return <RiskIdentification project={project} updateProject={updateProject} category="Material" />;
      case 4:
        return <RiskIdentification project={project} updateProject={updateProject} category="Process" />;
      case 5:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Risks', count: project.risks.length, color: 'text-slate-600', bg: 'bg-white border-2' },
                { label: 'High Risk', count: project.risks.filter(r => r.riskLevel === 'HIGH').length, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100 border-2' },
                { label: 'Medium Risk', count: project.risks.filter(r => r.riskLevel === 'MEDIUM').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100 border-2' },
                { label: 'Low Risk', count: project.risks.filter(r => r.riskLevel === 'LOW').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100 border-2' }
              ].map((stat, i) => (
                <Card key={i} className={cn("shadow-sm", stat.bg)}>
                  <CardContent className="pt-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className={cn("text-4xl font-black", stat.color)}>{stat.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskHeatmap risks={project.risks} />
              <Card className="border-2 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" /> 5M Distribution
                  </h3>
                  <div className="space-y-4">
                    {['Material', 'Method', 'Machine', 'Manpower', 'Measurement', 'Environment'].map(cat => {
                      const count = project.risks.filter(r => r.primary5MCategory === cat).length;
                      const percentage = project.risks.length > 0 ? (count / project.risks.length) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>{cat}</span>
                            <span>{count} Risks</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {project.risks.length > 0 && (
              <div className="space-y-12">
                <h3 className="text-2xl font-black text-slate-900 border-b-4 border-slate-900 pb-2 inline-block">Detailed Visualizations</h3>
                {project.risks.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'MEDIUM').map(risk => (
                  <div key={risk.id} className="space-y-8">
                    <IshikawaDiagram risk={risk} />
                    {/* BowtieDiagram would go here if updated to new structure */}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Card className="border-2 shadow-lg overflow-hidden">
              <div className="bg-slate-900 text-white p-8">
                <h2 className="text-2xl font-bold mb-2">Quality Risk Assessment Report</h2>
                <p className="text-slate-400 text-sm">ICH Q9(R1) Compliant Documentation</p>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8 border-b pb-8">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product</h4>
                    <p className="font-bold text-lg">{project.productName || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Site</h4>
                    <p className="font-bold text-lg">{project.assessor || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-2">
                    <Printer className="mr-2 h-4 w-4" /> Print PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-primary/10">
      <header className="bg-slate-900 text-white px-8 py-8 shadow-2xl border-b-4 border-primary">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">IQRAF <span className="text-primary">2.0</span></h1>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Integrated Quality Risk Assessment Framework</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
              Progress: {Math.round((currentPhase / (PHASES.length - 1)) * 100)}%
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(currentPhase / (PHASES.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-1 overflow-hidden">
          <WizardStepper 
            phases={PHASES} 
            currentPhase={currentPhase} 
            onPhaseClick={setCurrentPhase} 
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {currentPhase > 0 && (
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1 uppercase">{PHASES[currentPhase]}</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Step {currentPhase + 1} of {PHASES.length}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
                disabled={currentPhase === 0}
                className="rounded-xl font-black border-2 h-12"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> BACK
              </Button>
              <Button 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.min(PHASES.length - 1, p + 1))}
                disabled={currentPhase === PHASES.length - 1}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-xl font-black px-10 h-12"
              >
                CONTINUE <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-[600px]">
          {renderPhase()}
        </div>
      </main>
    </div>
  );
};

export default AssessmentWizard;