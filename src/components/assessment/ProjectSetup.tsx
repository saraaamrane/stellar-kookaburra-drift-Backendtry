import React from 'react';
import { ProjectData } from '@/types/assessment';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Beaker, Globe, Layers, Target } from 'lucide-react';

interface ProjectSetupProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ project, updateProject }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Beaker size={20} />
            <h3>Product Details</h3>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-slate-500">Product Name</Label>
              <Input 
                value={project.productName} 
                onChange={e => updateProject({ productName: e.target.value })} 
                placeholder="e.g. Metformin/Sitagliptin FDC"
                className="bg-white/50 border-slate-200 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500">Strength</Label>
              <Input 
                value={project.strength} 
                onChange={e => updateProject({ strength: e.target.value })} 
                placeholder="e.g. 500mg/50mg"
                className="bg-white/50 border-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Layers size={20} />
            <h3>Formulation</h3>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Dosage Form</Label>
            <Select value={project.dosageForm} onValueChange={v => updateProject({ dosageForm: v })}>
              <SelectTrigger className="bg-white/50 border-slate-200">
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Capsule">Capsule</SelectItem>
                <SelectItem value="Liquid">Liquid</SelectItem>
                <SelectItem value="Injectable">Injectable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Globe size={20} />
            <h3>Market & Scope</h3>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Target Market</Label>
            <Input 
              value={project.targetMarket} 
              onChange={e => updateProject({ targetMarket: e.target.value })} 
              placeholder="e.g. EU/US/Global"
              className="bg-white/50 border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500">Scope Boundaries</Label>
            <Textarea 
              value={project.scope} 
              onChange={e => updateProject({ scope: e.target.value })} 
              placeholder="Define what is included/excluded in this assessment..."
              className="bg-white/50 border-slate-200 min-h-[120px] resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetup;