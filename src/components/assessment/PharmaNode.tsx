"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

const PharmaNode = ({ data, selected }: NodeProps) => {
  const type = data.type as string;
  
  // Styles based on the reference image
  const isIPC = type === 'IPC' || type === 'Testing';
  const isIngredient = type === 'Ingredient';
  
  return (
    <div className={cn(
      "min-w-[150px] px-4 py-3 rounded-md shadow-sm transition-all border-2",
      selected ? "ring-2 ring-primary ring-offset-2" : "",
      isIPC ? "bg-red-50 border-red-400" : "bg-white border-slate-200",
      // Gradient border effect for process nodes
      !isIPC && "border-t-blue-400 border-b-red-400 border-x-slate-200"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400" />
      
      <div className="text-center">
        {isIPC && (
          <div className="text-[10px] font-black text-red-600 uppercase mb-1">
            {type === 'Testing' ? 'In process testing:' : 'IPC:'}
          </div>
        )}
        {isIngredient && (
          <div className="text-[10px] font-black text-blue-600 uppercase mb-1">
            {data.groupName || 'Ingredients'}:
          </div>
        )}
        <div className={cn(
          "text-sm font-bold leading-tight whitespace-pre-wrap",
          isIPC ? "text-slate-800" : "text-slate-900"
        )}>
          {data.label as string}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400" />
    </div>
  );
};

export default memo(PharmaNode);