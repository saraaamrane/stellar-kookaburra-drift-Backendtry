export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FiveMCategory = 'Material' | 'Method' | 'Machine' | 'Manpower' | 'Measurement' | 'Environment';

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
  stepId: string;
  failureMode: string;
  effect: string;
  causes: {
    description: string;
    category: FiveMCategory;
  }[];
  hazopGuideword?: string;
  severity: number; // 1-3
  occurrence: number; // 1-3
  detection: number; // 1-3
  rpn: number;
  riskLevel: RiskLevel;
  controls: Control[];
  fiveWhys?: FiveWhys;
  residualScoring?: {
    severity: number;
    occurrence: number;
    detection: number;
    rpn: number;
    riskLevel: RiskLevel;
  };
}

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface ProjectData {
  productName: string;
  strength: string;
  dosageForm: string;
  targetMarket: string;
  devStage: string;
  processType: string;
  scope: string;
  steps: ProcessStep[];
  risks: RiskItem[];
}