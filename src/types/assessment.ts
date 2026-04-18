export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FiveMCategory = 'Material' | 'Method' | 'Machine' | 'Manpower' | 'Measurement' | 'Environment';

export type DeviationType = 'NO' | 'LESS' | 'MORE' | 'REVERSE' | 'OTHER THAN';

export interface Control {
  id: string;
  type: 'Preventive' | 'Detective' | 'Mitigating';
  description: string;
  responsibility: string;
  deadline: string;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface FiveWhys {
  whys: string[];
  rootCause: string;
  classification: string;
}

export interface RiskItem {
  id: string;
  stepId?: string;
  category: 'Material' | 'Process';
  itemName: string; // Material name or Process step name
  attribute?: string; // CMA for material, Parameter for process
  cqa?: string;
  failureMode: string;
  effect: string;
  causes: {
    description: string;
    category: FiveMCategory;
  }[];
  deviations: DeviationType[];
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  riskLevel: RiskLevel;
  controls: Control[];
  fiveWhys?: FiveWhys;
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