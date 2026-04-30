"use client";

import React from 'react';
import { ProjectData } from '@/types/assessment';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Beaker, Factory, FlaskConical } from 'lucide-react';

interface ProjectSetupProps {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ project, updateProject }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <Card className="border-2 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
            <Beaker size={18} className="text-primary" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Product Identification</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 font-semibold">Product Name *</Label>
              <Input 
                value={project.productName} 
                onChange={e => updateProject({ productName: e.target.value })} 
                placeholder="e.g. LCE Tablets"
                className="h-11 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500 font-semibold">Dosage Form *</Label>
              <Select value={project.dosageForm} onValueChange={v => updateProject({ dosageForm: v })}>
                <SelectTrigger className="h-11 border-slate-200">
                  <SelectValue placeholder="Select dosage form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet (Film-coated)">Tablet (Film-coated)</SelectItem>
                  <SelectItem value="Capsule (Hard Gelatin)">Capsule (Hard Gelatin)</SelectItem>
                  <SelectItem value="Injectable">Injectable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="border-2 shadow-sm overflow-hidden h-full">
          <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
            <FlaskConical size={18} className="text-primary" />
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">API Composition</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 font-semibold">Active Pharmaceutical Ingredients (APIs) *</Label>
              <Textarea 
                value={project.scope} // Using scope field for API composition as per existing structure or update types if needed
                onChange={e => updateProject({ scope: e.target.value })}
                placeholder="List all APIs with strengths..."
                className="min-h-[200px] border-slate-200 resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectSetup;