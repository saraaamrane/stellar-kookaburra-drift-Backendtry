"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PharmaNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label as string);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const type = data.type as string;
  const isIPC = type === 'IPC' || type === 'Testing';
  const isIngredient = type === 'Ingredient';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: editValue } };
        }
        return node;
      })
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditValue(data.label as string);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn(
      "min-w-[180px] px-4 py-3 rounded-md shadow-sm transition-all border-2",
      selected ? "ring-2 ring-primary ring-offset-2" : "",
      isIPC ? "bg-red-50 border-red-400" : "bg-white border-slate-200",
      !isIPC && "border-t-blue-400 border-b-red-400 border-x-slate-200"
    )}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-400" />
      
      <div className="text-center" onDoubleClick={handleDoubleClick}>
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
        
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-sm font-bold text-center p-1 min-h-[40px] resize-none bg-slate-50 border-primary"
          />
        ) : (
          <div className={cn(
            "text-sm font-bold leading-tight whitespace-pre-wrap cursor-text min-h-[1.25rem]",
            isIPC ? "text-slate-800" : "text-slate-900"
          )}>
            {data.label as string || 'Double-click to edit'}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-400" />
    </div>
  );
};

export default memo(PharmaNode);