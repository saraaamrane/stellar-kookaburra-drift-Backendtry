"use client";

import React from 'react';
import { ProjectData } from '@/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRiskColor } from '@/lib/risk-utils';
import { ShieldCheck, Beaker, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentReportProps {
  project: ProjectData;
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({ project }) => {
  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Quality Risk Assessment Report</h1>
          <p className="text-slate-500 font-bold">ICH Q9(R1) Compliant Documentation</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-primary font-black mb-1">
            <ShieldCheck size={20} />
            <span>IQRAF 2.0</span>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase">Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 shadow-none">
          <CardHeader className="bg-slate-50 py-3 border-b">
            <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
              <Beaker size={14} className="text-blue-600" /> Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Product Name:</span>
              <span className="font-bold">{project.productName || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Dosage Form:</span>
              <span className="font-bold">{project.dosageForm || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-none">
          <CardHeader className="bg-slate-50 py-3 border-b">
            <CardTitle className="text-xs font-black uppercase flex items-center gap-2">
              <Settings size={14} className="text-purple-600" /> API Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{project.scope || 'No API details provided.'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Register Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" /> Risk Register
        </h3>
        
        <div className="border-2 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="hover:bg-slate-900">
                <TableHead className="text-white font-bold text-[10px] uppercase">Category</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase">Item/Step</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase">Role / CCP</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase">CMA / Deviation</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase">Failure Mode</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase">CQA Impact</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase text-center">RPN</TableHead>
                <TableHead className="text-white font-bold text-[10px] uppercase text-center">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.risks.length > 0 ? (
                project.risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="text-[10px] font-bold uppercase text-slate-500">{risk.category}</TableCell>
                    <TableCell className="font-bold text-sm">{risk.itemName}</TableCell>
                    <TableCell className="text-sm">{risk.category === 'Material' ? risk.role : risk.ccp}</TableCell>
                    <TableCell className="text-sm">
                      {risk.category === 'Material' ? risk.cma : risk.processDeviation}
                    </TableCell>
                    <TableCell className="text-sm italic">{risk.failureMode}</TableCell>
                    <TableCell className="text-sm font-bold text-primary">{risk.cqa}</TableCell>
                    <TableCell className="text-center font-black">{risk.rpn}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("font-black text-[10px]", getRiskColor(risk.riskLevel))}>
                        {risk.riskLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 italic">
                    No risks identified in this assessment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* CAPA Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
        <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-xl">
          <h4 className="text-[10px] font-black uppercase text-emerald-700 mb-2">Preventive Actions Summary</h4>
          <p className="text-xs text-emerald-900 leading-relaxed">
            {project.risks.filter(r => r.preventiveActions).length} active preventive measures identified across the assessment.
          </p>
        </div>
        <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-xl">
          <h4 className="text-[10px] font-black uppercase text-amber-700 mb-2">Corrective Actions Summary</h4>
          <p className="text-xs text-amber-900 leading-relaxed">
            {project.risks.filter(r => r.correctiveActions).length} contingency plans defined for potential failures.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-12 border-t-2 border-dashed border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          End of Quality Risk Assessment Report - Confidential
        </p>
      </div>
    </div>
  );
};

export default AssessmentReport;