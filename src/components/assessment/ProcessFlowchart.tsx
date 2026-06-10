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
  Panel,
  ReactFlowProvider,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ProjectData } from '@/types/assessment';
import PharmaNode from './PharmaNode';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MousePointer2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

interface ProcessFlowchartProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const nodeTypes = {
  pharma: PharmaNode,
};

const FlowInner: React.FC<ProcessFlowchartProps> = ({ project, updateProject }) => {
  const { getNodes } = useReactFlow();
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
        label: type === 'Ingredient' ? 'New Ingredient Group' : 
               type === 'Target Process Parameters' ? 'New Parameters' : 'New Process Step',
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

  const onSaveImage = async () => {
    const nodes = getNodes();
    if (nodes.length === 0) return;

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    const nodesBounds = getNodesBounds(nodes);
    const width = nodesBounds.width + 200;
    const height = nodesBounds.height + 200;
    const { x, y, zoom } = getViewportForBounds(nodesBounds, width, height, 0.5, 2, 0.1);

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#f8fafc',
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        },
      });

      const link = document.createElement('a');
      link.download = `${project.productName || 'flowchart'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Flowchart saved as PNG");
    } catch (error) {
      console.error("Failed to export image:", error);
      toast.error("Failed to save image");
    }
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
            <Button size="sm" variant="outline" onClick={() => addNode('Target Process Parameters')} className="text-[10px] font-bold h-8 border-red-200 hover:bg-red-50">
              + Target Parameters
            </Button>
          </div>
          <div className="border-t pt-2 mt-1 space-y-2">
            <Button size="sm" variant="secondary" onClick={onSaveImage} className="w-full text-[10px] font-bold h-8 bg-slate-100 hover:bg-slate-200">
              <ImageIcon size={12} className="mr-1" /> Save as PNG
            </Button>
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
            <li>• <strong>Double-click label to edit</strong></li>
            <li>• Select and press Delete to remove</li>
          </ul>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const ProcessFlowchart: React.FC<ProcessFlowchartProps> = (props) => (
  <ReactFlowProvider>
    <FlowInner {...props} />
  </ReactFlowProvider>
);

export default ProcessFlowchart;