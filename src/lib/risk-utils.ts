import { RiskLevel } from '../types/assessment';

export const calculateRPN = (s: number, o: number, d: number): number => s * o * d;

export const getRiskLevel = (s: number, o: number, d: number): RiskLevel => {
  const rpn = s * o * d;
  if (rpn >= 18 || (s === 3 && d === 3)) return 'HIGH';
  if (rpn >= 8) return 'MEDIUM';
  return 'LOW';
};

export const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'HIGH': return 'bg-red-500 text-white';
    case 'MEDIUM': return 'bg-amber-500 text-white';
    case 'LOW': return 'bg-emerald-500 text-white';
    default: return 'bg-slate-200';
  }
};

export const HAZOP_GUIDEWORDS = [
  'More', 'Less', 'No', 'Part of', 'Reverse', 'Other than'
];

export const FIVE_M_CATEGORIES = [
  'Material', 'Method', 'Machine', 'Manpower', 'Medium'
];