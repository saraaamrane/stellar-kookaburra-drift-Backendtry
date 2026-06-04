import { Node, Edge } from '@xyflow/react';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FiveMCategory = 'Material' | 'Method' | 'Machine' | 'Manpower' | 'Medium';

export type ProcessDeviation = 'Above Target' | 'Below Target' | 'Other than';

export interface RiskItem {
  id: string;
  category: 'Material' | 'Process';
  itemName: string;
  role?: string;
  cma?: string;
  cpp?: string;
  processDeviation?: ProcessDeviation;
  failureMode: string;
  effect: string;
  cqa: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  riskLevel: RiskLevel;
  primary5MCategory: FiveMCategory;
  primary5MExplanation: string;
  secondary5MCategory?: FiveMCategory;
  secondary5MExplanation: string;
  preventiveActions: string;
  correctiveActions: string;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'Ingredient' | 'Process' | 'IPC' | 'Output';
  details?: string;
}

export interface ProjectData {
  productName: string;
  strength: string;
  dosageForm: string;
  targetMarket: string;
  assessor: string;
  scope: string;
  // Flowchart data
  nodes: Node[];
  edges: Edge[];
  // Legacy support
  flowNodes: FlowNode[];
  risks: RiskItem[];
}