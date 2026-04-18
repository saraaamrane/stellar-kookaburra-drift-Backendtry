import React, { useState } from 'react';
import { ProjectData, RiskItem } from '@/types/assessment';
import { calculateRPN, getRiskLevel } from '@/lib/risk-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, ShieldCheck, Activity, FileText, LayoutDashboard, Download, Printer } from 'lucide-react';
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
  'Scope Definition',
  'Process Mapping',
  'Material Risk',
  'Process Risk',
  'FMEA Scoring',
  'Risk Dashboard',
  'Report'
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
                <h4 className="font-bold text-slate-800 mb-2">ICH Q9(R1)</h4>
                <p className="text-xs text-slate-500">Fully compliant methodology and documentation.</p>
              </div>
              <div className="p-6 bg-white border-2 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">Standardized</h4>
                <p className="text-xs text-slate-500">1-3 scoring scale removes subjectivity.</p>
              </div>
              <div className="p-6 bg-white border-2 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-2">Audit Ready</h4>
                <p className="text-xs text-slate-500">Mandatory justifications for every score.</p>
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
      case 6:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <RiskHeatmap risks={project.risks} />
          </div>
        );
      case 7:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Card className="border-2 shadow-lg overflow-hidden">
              <div className="bg-slate-900 text-white p-8">
                <h2 className="text-2xl font-bold mb-2">Assessment Report</h2>
                <p className="text-slate-400 text-sm">Generated on {new Date().toLocaleDateString()}</p>
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
        return (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <LayoutDashboard className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600">{PHASES[currentPhase]} Module</h3>
            <p className="text-slate-400">This module is being optimized for the new UI.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] selection:bg-primary/10">
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white px-8 py-8 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight">IQRAF <span className="text-blue-200">2.0</span></h1>
            </div>
            <p className="text-sm font-medium text-blue-100/80">ICH Q9(R1) Quality Risk Management — Generic Drug Development</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-2">
              Progress: {Math.round((currentPhase / (PHASES.length - 1)) * 100)}%
            </div>
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-500" 
                style={{ width: `${(currentPhase / (PHASES.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-1 overflow-hidden">
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
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{PHASES[currentPhase]}</h2>
              <p className="text-slate-500 font-medium">Step {currentPhase + 1} of {PHASES.length}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
                disabled={currentPhase === 0}
                className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button 
                size="lg"
                onClick={() => setCurrentPhase(p => Math.min(PHASES.length - 1, p + 1))}
                disabled={currentPhase === PHASES.length - 1}
                className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold px-10 h-12"
              >
                Continue <ChevronRight className="ml-2 h-5 w-5" />
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