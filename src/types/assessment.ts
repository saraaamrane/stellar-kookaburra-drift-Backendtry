export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FiveMCategory = 'Material' | 'Method' | 'Machine' | 'Manpower' | 'Measurement' | 'Environment';

export type DeviationType = 'NO' | 'LESS' | 'MORE' | 'REVERSE' | 'OTHER THAN';

export interface RiskItem {
  id: string;
  category: 'Material' | 'Process';
  // Section 1: Identification
  itemName: string; // Material name or Process step
  itemType?: string; // Material Type or Process Parameter
  attribute: string; // CMA or CPP
  cqa: string; // Affected CQA
  target?: string; // CPP Target (for process)
  
  // Section 2: Failure Mode & Effect
  failureMode: string;
  effect: string;
  
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
  
  // Section 5: Deviations
  deviations: DeviationType[];
  deviationNotes: string;
  
  // Section 6: Control Strategy
  preventiveControls: string;
  detectiveControls: string;
  mitigatingControls: string;
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