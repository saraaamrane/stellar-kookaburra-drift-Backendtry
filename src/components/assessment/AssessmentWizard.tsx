import React, { useState } from 'react';
import { ProjectData, RiskItem, ProcessStep } from '@/types/assessment';
import { calculateRPN, getRiskLevel, HAZOP_GUIDEWORDS, FIVE_M_CATEGORIES, ROOT_CAUSE_CLASSES } from '@/lib/risk-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2, Info, FileText, BarChart3, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskHeatmap from '../visuals/RiskHeatmap';
import IshikawaDiagram from '../visuals/IshikawaDiagram';
import BowtieDiagram from '../visuals/BowtieDiagram';

const PHASES = [
  'Project Setup',
  'Process Flow',
  'Risk ID',
  'Scoring',
  'Dashboard',
  '5 Whys',
  'Controls',
  'Regulatory',
  'Visuals',
  'Export'
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

  const addStep = () => {
    const newStep: ProcessStep = {
      id: crypto.randomUUID(),
      name: 'New Process Step',
      description: '',
      inputs: [],
      outputs: []
    };
    updateProject({ steps: [...project.steps, newStep] });
  };

  const addRisk = (stepId: string) => {
    const newRisk: RiskItem = {
      id: crypto.randomUUID(),
      stepId,
      failureMode: '',
      effect: '',
      causes: [{ description: '', category: 'Material' }],
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
    const updatedRisks = project.risks.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates };
        if ('severity' in updates || 'occurrence' in updates || 'detection' in updates) {
          merged.rpn = calculateRPN(merged.severity, merged.occurrence, merged.detection);
          merged.riskLevel = getRiskLevel(merged.severity, merged.occurrence, merged.detection);
        }
        return merged;
      }
      return r;
    });
    updateProject({ risks: updatedRisks });
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0: // Project Setup
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={project.productName} onChange={e => updateProject({ productName: e.target.value })} placeholder="e.g. Metformin/Sitagliptin FDC" />
              </div>
              <div className="space-y-2">
                <Label>Strength</Label>
                <Input value={project.strength} onChange={e => updateProject({ strength: e.target.value })} placeholder="e.g. 500mg/50mg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dosage Form</Label>
              <Select value={project.dosageForm} onValueChange={v => updateProject({ dosageForm: v })}>
                <SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Liquid">Liquid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scope Boundaries</Label>
              <Textarea value={project.scope} onChange={e => updateProject({ scope: e.target.value })} placeholder="Define what is included/excluded in this assessment..." />
            </div>
          </div>
        );

      case 1: // Process Flow
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Process Steps</h3>
              <Button onClick={addStep} size="sm" className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Add Step</Button>
            </div>
            <div className="grid gap-4">
              {project.steps.map((step, idx) => (
                <Card key={step.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4 items-start">
                      <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                      <div className="flex-1 space-y-4">
                        <Input value={step.name} onChange={e => {
                          const steps = [...project.steps];
                          steps[idx].name = e.target.value;
                          updateProject({ steps });
                        }} className="font-semibold" />
                        <Textarea value={step.description} onChange={e => {
                          const steps = [...project.steps];
                          steps[idx].description = e.target.value;
                          updateProject({ steps });
                        }} placeholder="Step description..." />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => updateProject({ steps: project.steps.filter(s => s.id !== step.id) })}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2: // Risk ID
        return (
          <div className="space-y-8">
            {project.steps.map(step => (
              <div key={step.id} className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Badge variant="outline" className="bg-slate-100">Step: {step.name}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => addRisk(step.id)} className="text-blue-600"><Plus className="h-4 w-4 mr-1" /> Add Failure Mode</Button>
                </div>
                <div className="grid gap-4">
                  {project.risks.filter(r => r.stepId === step.id).map(risk => (
                    <Card key={risk.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-slate-500">Failure Mode</Label>
                            <Input value={risk.failureMode} onChange={e => updateRisk(risk.id, { failureMode: e.target.value })} placeholder="e.g. Content non-uniformity" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase text-slate-500">Effect</Label>
                            <Input value={risk.effect} onChange={e => updateRisk(risk.id, { effect: e.target.value })} placeholder="e.g. Sub-potent dose to patient" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs uppercase text-slate-500">Causes (5M Tagged)</Label>
                          {risk.causes.map((cause, cIdx) => (
                            <div key={cIdx} className="flex gap-2">
                              <Input value={cause.description} onChange={e => {
                                const causes = [...risk.causes];
                                causes[cIdx].description = e.target.value;
                                updateRisk(risk.id, { causes });
                              }} className="flex-1" placeholder="Cause description..." />
                              <Select value={cause.category} onValueChange={v => {
                                const causes = [...risk.causes];
                                causes[cIdx].category = v as any;
                                updateRisk(risk.id, { causes });
                              }}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {FIVE_M_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <Label className="text-xs font-semibold text-slate-400">HAZOP GUIDEWORD (OPTIONAL):</Label>
                          <div className="flex gap-1">
                            {HAZOP_GUIDEWORDS.map(gw => (
                              <Button 
                                key={gw} 
                                variant={risk.hazopGuideword === gw ? 'default' : 'outline'} 
                                size="sm" 
                                className="text-[10px] h-7 px-2"
                                onClick={() => updateRisk(risk.id, { hazopGuideword: risk.hazopGuideword === gw ? undefined : gw })}
                              >
                                {gw}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Scoring
        return (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Failure Mode</TableHead>
                  <TableHead className="w-32 text-center">Severity (S)</TableHead>
                  <TableHead className="w-32 text-center">Occurrence (O)</TableHead>
                  <TableHead className="w-32 text-center">Detection (D)</TableHead>
                  <TableHead className="w-24 text-center">RPN</TableHead>
                  <TableHead className="w-32 text-center">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.risks.map(risk => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.failureMode || 'Unnamed Risk'}</TableCell>
                    <TableCell>
                      <Select value={risk.severity.toString()} onValueChange={v => updateRisk(risk.id, { severity: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Minor</SelectItem>
                          <SelectItem value="2">2 - Moderate</SelectItem>
                          <SelectItem value="3">3 - Major</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={risk.occurrence.toString()} onValueChange={v => updateRisk(risk.id, { occurrence: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Rare</SelectItem>
                          <SelectItem value="2">2 - Occasional</SelectItem>
                          <SelectItem value="3">3 - Frequent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={risk.detection.toString()} onValueChange={v => updateRisk(risk.id, { detection: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - High</SelectItem>
                          <SelectItem value="2">2 - Moderate</SelectItem>
                          <SelectItem value="3">3 - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center font-bold">{risk.rpn}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={risk.riskLevel === 'HIGH' ? 'bg-red-500' : risk.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}>
                        {risk.riskLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 4: // Dashboard
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <Card className="bg-red-50 border-red-100">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">High Risks</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-red-700">{project.risks.filter(r => r.riskLevel === 'HIGH').length}</div></CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-100">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-600">Medium Risks</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-amber-700">{project.risks.filter(r => r.riskLevel === 'MEDIUM').length}</div></CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-600">Low Risks</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-emerald-700">{project.risks.filter(r => r.riskLevel === 'LOW').length}</div></CardContent>
              </Card>
            </div>
            <RiskHeatmap risks={project.risks} />
          </div>
        );

      case 5: // 5 Whys (Selective)
        const highRisks = project.risks.filter(r => r.riskLevel === 'HIGH');
        return (
          <div className="space-y-8">
            {highRisks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold">No High Risks Identified</h3>
                <p className="text-slate-500">Deep dive analysis is only required for high-risk items.</p>
              </div>
            ) : (
              highRisks.map(risk => (
                <Card key={risk.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="text-red-500" size={20} />
                      Root Cause Analysis: {risk.failureMode}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-16 text-xs font-bold text-slate-400">WHY {i}?</div>
                          <Input 
                            value={risk.fiveWhys?.whys[i-1] || ''} 
                            onChange={e => {
                              const whys = [...(risk.fiveWhys?.whys || ['', '', '', '', ''])];
                              whys[i-1] = e.target.value;
                              updateRisk(risk.id, { fiveWhys: { ...risk.fiveWhys!, whys, rootCause: risk.fiveWhys?.rootCause || '', classification: risk.fiveWhys?.classification || '' } });
                            }}
                            placeholder={`Reason for previous level...`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label>Final Root Cause</Label>
                        <Input 
                          value={risk.fiveWhys?.rootCause || ''} 
                          onChange={e => updateRisk(risk.id, { fiveWhys: { ...risk.fiveWhys!, rootCause: e.target.value, whys: risk.fiveWhys?.whys || [], classification: risk.fiveWhys?.classification || '' } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Classification</Label>
                        <Select 
                          value={risk.fiveWhys?.classification} 
                          onValueChange={v => updateRisk(risk.id, { fiveWhys: { ...risk.fiveWhys!, classification: v, whys: risk.fiveWhys?.whys || [], rootCause: risk.fiveWhys?.rootCause || '' } })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {ROOT_CAUSE_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 6: // Control Strategy
        const priorityRisks = project.risks.filter(r => r.riskLevel !== 'LOW');
        return (
          <div className="space-y-8">
            {priorityRisks.map(risk => (
              <Card key={risk.id}>
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{risk.failureMode}</CardTitle>
                    <Badge className={risk.riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}>{risk.riskLevel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold">Controls & Barriers</Label>
                      <Button size="sm" variant="outline" onClick={() => {
                        const controls = [...risk.controls, { id: crypto.randomUUID(), type: 'Preventive', description: '', responsibility: '', deadline: '', status: 'Planned' }];
                        updateRisk(risk.id, { controls: controls as any });
                      }}><Plus className="h-4 w-4 mr-1" /> Add Control</Button>
                    </div>
                    {risk.controls.map((ctrl, idx) => (
                      <div key={ctrl.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-slate-50">
                        <div className="col-span-3 space-y-1">
                          <Label className="text-[10px]">Type</Label>
                          <Select value={ctrl.type} onValueChange={v => {
                            const controls = [...risk.controls];
                            controls[idx].type = v as any;
                            updateRisk(risk.id, { controls });
                          }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Preventive">Preventive</SelectItem>
                              <SelectItem value="Detective">Detective</SelectItem>
                              <SelectItem value="Mitigating">Mitigating</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-5 space-y-1">
                          <Label className="text-[10px]">Description</Label>
                          <Input value={ctrl.description} onChange={e => {
                            const controls = [...risk.controls];
                            controls[idx].description = e.target.value;
                            updateRisk(risk.id, { controls });
                          }} className="h-8 text-xs" />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px]">Resp.</Label>
                          <Input value={ctrl.responsibility} onChange={e => {
                            const controls = [...risk.controls];
                            controls[idx].responsibility = e.target.value;
                            updateRisk(risk.id, { controls });
                          }} className="h-8 text-xs" />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                            updateRisk(risk.id, { controls: risk.controls.filter(c => c.id !== ctrl.id) });
                          }}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 8: // Visuals
        return (
          <div className="space-y-12">
            {project.risks.length > 0 ? (
              <Tabs defaultValue="ishikawa">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ishikawa">Ishikawa (5M)</TabsTrigger>
                  <TabsTrigger value="bowtie">Bowtie Analysis</TabsTrigger>
                </TabsList>
                <div className="mt-6 space-y-8">
                  {project.risks.map(risk => (
                    <div key={risk.id} className="space-y-8">
                      <TabsContent value="ishikawa">
                        <IshikawaDiagram risk={risk} />
                      </TabsContent>
                      <TabsContent value="bowtie">
                        <BowtieDiagram risk={risk} />
                      </TabsContent>
                    </div>
                  ))}
                </div>
              </Tabs>
            ) : (
              <div className="text-center py-20 text-slate-400">Add risks to generate visualizations</div>
            )}
          </div>
        );

      default:
        return <div className="text-center py-20 text-slate-400">Phase {currentPhase + 1} content coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IQRAF Tool</h1>
            <p className="text-slate-500">Integrated Quality Risk Assessment Framework for FDC Generics</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">ICH Q9 Compliant</Badge>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">FMEA Backbone</Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex justify-between mb-4">
            {PHASES.map((phase, idx) => (
              <div key={phase} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  currentPhase === idx ? "bg-blue-600 text-white ring-4 ring-blue-100" : 
                  currentPhase > idx ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {currentPhase > idx ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  currentPhase === idx ? "text-blue-600" : "text-slate-400"
                )}>{phase}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="bg-blue-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPhase + 1) / PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <Card className="min-h-[600px] shadow-lg border-slate-200/60">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{PHASES[currentPhase]}</CardTitle>
                <CardDescription>Phase {currentPhase + 1} of {PHASES.length}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
                  disabled={currentPhase === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button 
                  onClick={() => setCurrentPhase(p => Math.min(PHASES.length - 1, p + 1))}
                  disabled={currentPhase === PHASES.length - 1}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderPhase()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="flex justify-center gap-8 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <div className="flex items-center gap-2"><Settings2 size={14} /> Automated Workflow</div>
          <div className="flex items-center gap-2"><BarChart3 size={14} /> Real-time Analytics</div>
          <div className="flex items-center gap-2"><FileText size={14} /> Regulatory Ready</div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentWizard;