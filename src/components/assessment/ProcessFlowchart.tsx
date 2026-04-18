import React, { useState } from 'react';
import { ProjectData, FlowNode } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ArrowDown, Beaker, Settings, Activity, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Node Type</Label>
              <Select value={newNode.type} onValueChange={(v) => setNewNode({ ...newNode, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingredient">Ingredient/Group</SelectItem>
                  <SelectItem value="Process">Process Step</SelectItem>
                  <SelectItem value="IPC">IPC / Testing</SelectItem>
                  <SelectItem value="Output">Final Output</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Label / Name</Label>
              <Input 
                value={newNode.label} 
                onChange={e => setNewNode({ ...newNode, label: e.target.value })}
                placeholder="e.g. Group A Ingredients or Granulation"
              />
            </div>
            <Button onClick={addNode} className="bg-primary shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add to Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        {project.flowNodes.map((node, idx) => (
          <React.Fragment key={node.id}>
            <div className="group relative w-full max-w-md">
              <Card className="border-2 hover:border-primary/50 transition-colors shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {getIcon(node.type)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{node.type}</p>
                      <p className="font-bold text-slate-900">{node.label}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeNode(node.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardContent>
              </Card>
            </div>
            {idx < project.flowNodes.length - 1 && (
              <ArrowDown className="text-slate-300 animate-bounce" size={24} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProcessFlowchart;