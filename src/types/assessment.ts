export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FiveMCategory = 'Material' | 'Method' | 'Machine' | 'Manpower' | 'Medium';

export type ProcessDeviation = 'Above Target' | 'Below Target';

export interface RiskItem {
  id: string;
  category: 'Material' | 'Process';
  // Section 1: Identification
  itemName: string; // Material name or Process step
  role?: string; // Role (for material)
  cma?: string; // Critical Material Attribute (for material)
  cpp?: string; // Critical Process Parameter (for process)
  processDeviation?: ProcessDeviation; // HAZOP inspired
  
  // Section 2: Failure Mode & Effect
  failureMode: string; // For Material: Manual entry. For Process: Derived from Deviation.
  effect: string;
  cqa: string; // Affected CQA (Moved here in flow)
  
  // Section 3: Scoring
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  riskLevel: RiskLevel;
  
  // Section 4: Integrated 5M
  primary5MCategory: FiveMCategory;
  primary5MExplanation: string;
  secondary5MCategory?: FiveMCategory;
  secondary5MExplanation: string;
  
  // Section 5: CAPA
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
  flowNodes: FlowNode[];
  risks: RiskItem[];
}