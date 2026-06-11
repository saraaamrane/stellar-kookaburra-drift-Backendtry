"use client";

import React, { useState } from 'react';
import { ProjectData, RiskItem } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertCircle, Layers, Search, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import RiskForm from './RiskForm';
import RiskLibraryDialog from './RiskLibraryDialog';

interface RiskIdentificationProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  category: 'Material' | 'Process';
}

const RiskIdentification: React.FC<RiskIdentificationProps> = ({ project, updateProject, category }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterOccurrence, setFilterOccurrence] = useState<string>('all');
  const [filterDetection, setFilterDetection] = useState<string>('all');

  const addRisk = (template?: Partial<RiskItem>) => {
    const newRisk: RiskItem = {
      id: crypto.randomUUID(),
      category,
      itemName: template?.itemName || '',
      role: template?.role || '',
      cma: template?.cma || '',
      cpp: template?.cpp || '',
      processDeviation: template?.processDeviation || (category === 'Process' ? 'Above Target' : undefined),
      cqa: template?.cqa || '',
      failureMode: template?.failureMode || '',
      effect: template?.effect || '',
      severity: template?.severity || 1,
      occurrence: template?.occurrence || 1,
      detection: template?.detection || 1,
      rpn: template?.rpn || 1,
      riskLevel: template?.riskLevel || 'LOW',
      primary5MCategory: template?.primary5MCategory || (category === 'Material' ? 'Material' : 'Method'),
      primary5MExplanation: template?.primary5MExplanation || '',
      secondary5MCategory: template?.secondary5MCategory,
      secondary5MExplanation: template?.secondary5MExplanation || '',
      preventiveActions: template?.preventiveActions || '',
      correctiveActions: template?.correctiveActions || ''
    };
    updateProject({ risks: [...project.risks, newRisk] });
  };

  const updateRisk = (id: string, updates: Partial<RiskItem>) => {
    updateProject({
      risks: project.risks.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRisk = (id: string) => {
    updateProject({ risks: project.risks.filter(r => r.id !== id) });
  };

  const duplicateRisk = (risk: RiskItem) => {
    const { id, ...rest } = risk;
    addRisk({
      ...rest,
      cqa: '',
      effect: '',
      severity: 1,
      occurrence: 1,
      detection: 1,
      rpn: 1,
      riskLevel: 'LOW',
      primary5MExplanation: '',
      secondary5MExplanation: '',
      preventiveActions: '',
      correctiveActions: ''
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterSeverity('all');
    setFilterOccurrence('all');
    setFilterDetection('all');
  };

  const filteredRisks = project.risks
    .filter(r => r.category === category)
    .filter(r => {
      const matchesSearch = 
        r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.failureMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cqa.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSeverity = filterSeverity === 'all' || r.severity.toString() === filterSeverity;
      const matchesOccurrence = filterOccurrence === 'all' || r.occurrence.toString() === filterOccurrence;
      const matchesDetection = filterDetection === 'all' || r.detection.toString() === filterDetection;

      return matchesSearch && matchesSeverity && matchesOccurrence && matchesDetection;
    });

  const hasActiveFilters = searchQuery !== '' || filterSeverity !== 'all' || filterOccurrence !== 'all' || filterDetection !== 'all';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border-2 shadow-sm sticky top-4 z-10 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
              category === 'Material' ? "bg-blue-600" : "bg-purple-600"
            )}>
              <AlertCircle className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{category} Risk Identification</h3>
              <p className="text-sm text-slate-500 font-medium">Integrated FMEA + HAZOP Analysis</p>
            </div>
          </div>
          <div className="flex gap-3">
            <RiskLibraryDialog category={category} onImport={addRisk} />
            <Button onClick={() => addRisk()} className="rounded-2xl font-black h-14 px-8 shadow-xl hover:scale-105 transition-transform">
              <Plus className="mr-2 h-6 w-6" /> ADD NEW {category.toUpperCase()} RISK
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input 
              placeholder={`Search ${category.toLowerCase()} risks...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-2 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="h-12 rounded-2xl border-2 bg-slate-50/50">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2 - Moderate</SelectItem>
                <SelectItem value="3">3 - High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={filterOccurrence} onValueChange={setFilterOccurrence}>
              <SelectTrigger className="h-12 rounded-2xl border-2 bg-slate-50/50">
                <SelectValue placeholder="Occurrence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Occurrence</SelectItem>
                <SelectItem value="1">1 - Rare</SelectItem>
                <SelectItem value="2">2 - Occasional</SelectItem>
                <SelectItem value="3">3 - Frequent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={filterDetection} onValueChange={setFilterDetection}>
              <SelectTrigger className="h-12 rounded-2xl border-2 bg-slate-50/50">
                <SelectValue placeholder="Detection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Detection</SelectItem>
                <SelectItem value="1">1 - Easy</SelectItem>
                <SelectItem value="2">2 - Moderate</SelectItem>
                <SelectItem value="3">3 - Difficult</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={cn(
                "h-12 w-full rounded-2xl border-2",
                hasActiveFilters ? "text-red-500 border-red-100 bg-red-50 hover:bg-red-100" : "text-slate-300 border-slate-100"
              )}
            >
              <FilterX size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
            <Layers className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-bold text-xl">
              {hasActiveFilters ? "No matching risks found with current filters." : `No ${category.toLowerCase()} risks identified yet.`}
            </p>
            <p className="text-slate-300 text-sm mt-2">
              {hasActiveFilters ? "Try adjusting your search or filters." : "Click the button above to start your assessment."}
            </p>
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <RiskForm 
              key={risk.id} 
              risk={risk} 
              onUpdate={(updates) => updateRisk(risk.id, updates)}
              onRemove={() => removeRisk(risk.id)}
              onDuplicate={() => duplicateRisk(risk)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RiskIdentification;