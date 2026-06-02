"use client";

import React, { useState } from 'react';
import { ProjectData, FlowNode } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ArrowDown, Beaker, Settings, Activity, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProcessFlowchartProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const ProcessFlowchart: React.FC<ProcessFlowchartProps> = ({ project, updateProject }) => {
  const [newNode, setNewNode] = useState<Partial<FlowNode>>({ type: 'Process' });

  const addNode = () => {
    if (!newNode.label) return;
    const node: FlowNode = {
      id: crypto.randomUUID(),
      label: newNode.label,
      type: newNode.type as any,
      details: newNode.details
    };
    updateProject({ flowNodes: [...project.flowNodes, node] });
    setNewNode({ type: 'Process', label: '', details: '' });
  };

  const removeNode = (id: string) => {
    updateProject({ flowNodes: project.flowNodes.filter(n => n.id !== id) });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Ingredient': return <Beaker size={16} className="text-blue-500" />;
      case 'IPC': return <Activity size={16} className="text-amber-500" />;
      case 'Output': return <Package size={16} className="text-emerald-500" />;
      default: return <Settings size={16} className="text-slate-500" />;
    }
  };

  const ingredients = project.flowNodes.filter(n => n.type === 'Ingredient');
  const processes = project.flowNodes.filter(n => n.type === 'Process' || n.type === 'Output');
  const ipcs = project.flowNodes.filter(n => n.type === 'IPC');

  const NodeCard = ({ node }: { node: FlowNode }) => (
    <div className="group relative w-full">
      <Card className="border-2 hover:border-primary/50 transition-all shadow-sm bg-white">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg">
              {getIcon(node.type)}
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{node.type}</p>
              <p className="font-bold text-slate-900 text-sm leading-tight">{node.label}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeNode(node.id)}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Input Section */}
      <Card className="border-2 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-3 border-b">
          <h3 className="text-white font-black text-xs uppercase tracking-widest">Add Flow Element</h3>
        </div>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Element Type</Label>
              <Select value={newNode.type} onValueChange={(v) => setNewNode({ ...newNode, type: v as any })}>
                <SelectTrigger className="h-11 border-2 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-2xl">
                  <SelectItem value="Ingredient">Material / Prep Step</SelectItem>
                  <SelectItem value="Process">Main Process Step</SelectItem>
                  <SelectItem value="IPC">In-Process Control (IPC)</SelectItem>
                  <SelectItem value="Output">Final Output</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500">Label / Name</Label>
              <Input 
                value={newNode.label} 
                onChange={e => setNewNode({ ...newNode, label: e.target.value })}
                placeholder="e.g. Sifting, Granulation, LOD Check..."
                className="h-11 border-2 rounded-xl"
              />
            </div>
            <Button onClick={addNode} className="h-11 rounded-xl font-black bg-primary shadow-lg hover:scale-105 transition-transform">
              <Plus className="mr-2 h-5 w-5" /> ADD TO MAP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Column 1: Materials */}
        <div className="space-y-6">
          <div className="text-center pb-4 border-b-2 border-blue-100">
            <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Material Preparation</h4>
            <p className="text-[10px] text-slate-400 font-bold">INPUTS & PRE-PROCESSING</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            {ingredients.length === 0 ? (
              <p className="text-xs text-slate-300 italic py-10">No materials added</p>
            ) : (
              ingredients.map((node) => (
                <div key={node.id} className="w-full flex items-center gap-2">
                  <NodeCard node={node} />
                  <ArrowRight className="text-blue-200 shrink-0" size={16} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Main Process */}
        <div className="space-y-6 bg-slate-50/50 p-4 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-center pb-4 border-b-2 border-slate-200">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manufacturing Flow</h4>
            <p className="text-[10px] text-slate-400 font-bold">CORE PROCESS STEPS</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            {processes.length === 0 ? (
              <p className="text-xs text-slate-300 italic py-10">No process steps added</p>
            ) : (
              processes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <NodeCard node={node} />
                  {idx < processes.length - 1 && (
                    <ArrowDown className="text-slate-300 animate-bounce" size={20} />
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Column 3: IPC */}
        <div className="space-y-6">
          <div className="text-center pb-4 border-b-2 border-amber-100">
            <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest">In-Process Controls</h4>
            <p className="text-[10px] text-slate-400 font-bold">QUALITY CHECKS & IPC</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            {ipcs.length === 0 ? (
              <p className="text-xs text-slate-300 italic py-10">No IPCs added</p>
            ) : (
              ipcs.map((node) => (
                <div key={node.id} className="w-full flex items-center gap-2">
                  <ArrowLeft className="text-amber-200 shrink-0" size={16} />
                  <NodeCard node={node} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 flex items-start gap-4">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Settings size={20} />
        </div>
        <div>
          <h5 className="font-black text-blue-900 text-sm uppercase tracking-tight">Process Mapping Logic</h5>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            This map visualizes the flow from <strong>Materials</strong> (Left) into the <strong>Main Process</strong> (Center), 
            monitored by <strong>Quality Controls</strong> (Right). Use this to identify where risks are most likely to occur 
            before moving to the Risk Identification phases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessFlowchart;