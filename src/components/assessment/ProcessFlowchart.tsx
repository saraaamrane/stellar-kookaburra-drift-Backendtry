"use client";

import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  addEdge, 
  Connection, 
  Edge, 
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProjectData } from '@/types/assessment';
import PharmaNode from './PharmaNode';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MousePointer2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProcessFlowchartProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const nodeTypes = {
  pharma: PharmaNode,
};

const ProcessFlowchart: React.FC<ProcessFlowchartProps> = ({ project, updateProject }) => {
  // Ensure nodes and edges exist
  const nodes = useMemo(() => project.nodes || [], [project.nodes]);
  const edges = useMemo(() => project.edges || [], [project.edges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      updateProject({ nodes: updatedNodes });
    },
    [nodes, updateProject]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      updateProject({ edges: updatedEdges });
    },
    [edges, updateProject]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const updatedEdges = addEdge({ ...params, animated: false, style: { stroke: '#64748b', strokeWidth: 2 } }, edges);
      updateProject({ edges: updatedEdges });
    },
    [edges, updateProject]
  );

  const addNode = (type: string) => {
    const id = crypto.randomUUID();
    const newNode: Node = {
      id,
      type: 'pharma',
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { 
        label: type === 'Ingredient' ? 'New Ingredient Group' : 'New Process Step',
        type: type 
      },
    };
    updateProject({ nodes: [...nodes, newNode] });
    toast.success(`Added ${type} node`);
  };

  const deleteSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast.error("Select a node or edge to delete");
      return;
    }

    updateProject({
      nodes: nodes.filter(n => !n.selected),
      edges: edges.filter(e => !e.selected)
    });
    toast.success("Deleted selected elements");
  };

  return (
    <div className="h-[700px] w-full border-4 border-slate-200 rounded-3xl overflow-hidden bg-slate-50 relative shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background color="#cbd5e1" gap={20} />
        <Controls />
        
        <Panel position="top-left" className="flex flex-col gap-2 bg-white p-3 rounded-2xl border-2 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Add Elements</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => addNode('Ingredient')} className="text-[10px] font-bold h-8 border-blue-200 hover:bg-blue-50">
              + Ingredient
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('Process')} className="text-[10px] font-bold h-8 border-slate-200">
              + Process
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('IPC')} className="text-[10px] font-bold h-8 border-red-200 hover:bg-red-50">
              + IPC
            </Button>
            <Button size="sm" variant="outline" onClick={() => addNode('Testing')} className="text-[10px] font-bold h-8 border-red-200 hover:bg-red-50">
              + Testing
            </Button>
          </div>
          <div className="border-t pt-2 mt-1">
            <Button size="sm" variant="destructive" onClick={deleteSelected} className="w-full text-[10px] font-bold h-8">
              <Trash2 size={12} className="mr-1" /> Delete Selected
            </Button>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white/80 backdrop-blur p-4 rounded-2xl border-2 shadow-lg max-w-[200px]">
          <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase mb-2">
            <MousePointer2 size={14} className="text-primary" />
            Editor Guide
          </div>
          <ul className="text-[10px] text-slate-500 space-y-1 font-medium">
            <li>• Drag nodes to reposition</li>
            <li>• Drag from circles to connect</li>
            <li>• Double-click label to edit (coming soon)</li>
            <li>• Select and press Delete to remove</li>
          </ul>
        </Panel>

        <Panel position="bottom-center" className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Interactive Flow Mode</span>
          </div>
          <div className="h-4 w-[1px] bg-white/20" />
          <p className="text-[10px] font-bold text-white/60">Build your process map exactly like the reference image.</p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ProcessFlowchart;