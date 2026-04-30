import { ProjectData } from '@/types/assessment';

export const DEMO_PROJECT: ProjectData = {
  productName: 'Paracetamol 500mg Tablets',
  strength: '500mg',
  dosageForm: 'Tablet (Film-coated)',
  targetMarket: 'Global',
  assessor: 'Quality Team A',
  scope: 'Active Ingredient: Paracetamol (500mg)\nExcipients: Maize Starch, Povidone, Magnesium Stearate',
  flowNodes: [
    { id: '1', label: 'Sifting', type: 'Process' },
    { id: '2', label: 'Wet Granulation', type: 'Process' },
    { id: '3', label: 'Drying', type: 'Process' },
    { id: '4', label: 'Compression', type: 'Process' },
    { id: '5', label: 'Film Coating', type: 'Process' }
  ],
  risks: [
    {
      id: 'r1',
      category: 'Material',
      itemName: 'Paracetamol API',
      attribute: 'Particle Size Distribution',
      cqa: 'Content Uniformity',
      failureMode: 'Excessive fines in API lot',
      effect: 'Poor flow and weight variation during compression',
      severity: 3,
      occurrence: 3,
      detection: 1,
      rpn: 9,
      riskLevel: 'HIGH',
      primary5MCategory: 'Material',
      primary5MExplanation: 'Supplier milling process inconsistency',
      secondary5MExplanation: '',
      fiveWhys: [
        'Weight variation in final tablets',
        'Poor flow in the hopper',
        'High percentage of fine particles',
        'Inconsistent milling at supplier site',
        'Lack of particle size specification in procurement'
      ],
      deviations: [],
      deviationNotes: '',
      preventiveControls: 'Tighten API specifications for PSD',
      detectiveControls: 'Incoming material testing for every lot',
      mitigatingControls: 'Adjust granulation parameters if fines are high'
    },
    {
      id: 'r2',
      category: 'Process',
      itemName: 'Compression',
      attribute: 'Compression Force',
      cqa: 'Dissolution',
      failureMode: 'Over-compression',
      effect: 'Hard tablets with slow disintegration',
      severity: 2,
      occurrence: 2,
      detection: 2,
      rpn: 8,
      riskLevel: 'MEDIUM',
      primary5MCategory: 'Machine',
      primary5MExplanation: 'Pressure sensor drift over long runs',
      secondary5MExplanation: '',
      fiveWhys: [
        'Slow dissolution results',
        'High tablet hardness',
        'Excessive compression force applied',
        'Sensor calibration drift',
        'Inadequate mid-run calibration checks'
      ],
      deviations: [],
      deviationNotes: '',
      preventiveControls: 'Automated force control system',
      detectiveControls: 'In-process hardness testing every 30 mins',
      mitigatingControls: 'Reject tablets produced during drift period'
    }
  ],
  integratedResults: {
    criticalMaterials: ['Paracetamol API'],
    criticalParameters: ['Compression Force'],
    criticalAttributes: ['Content Uniformity', 'Dissolution']
  }
};