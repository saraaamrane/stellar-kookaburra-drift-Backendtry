"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskItem } from '@/types/assessment';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Library, Search, Plus, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RiskLibraryDialogProps {
  category: 'Material' | 'Process';
  onImport: (risk: Partial<RiskItem>) => void;
}

const RiskLibraryDialog: React.FC<RiskLibraryDialogProps> = ({ category, onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('risk_library')
      .select('*')
      .eq('category', category)
      .order('item_name', { ascending: true });

    if (!error) setLibraryItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchLibrary();
  }, [isOpen]);

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('risk_library').delete().eq('id', id);
    if (!error) {
      setLibraryItems(prev => prev.filter(item => item.id !== id));
      toast.success("Removed from library");
    }
  };

  const filteredItems = libraryItems.filter(item => 
    item.item_name.toLowerCase().includes(search.toLowerCase()) ||
    item.risk_data.failureMode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-2xl font-bold border-2 h-14 px-6 hover:bg-slate-50">
          <BookOpen className="mr-2 h-5 w-5 text-primary" /> BROWSE LIBRARY
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Library className="text-primary" /> {category} Risk Library
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder={`Search ${category.toLowerCase()}s or failure modes...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl border-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-bold">Loading Library...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
              <p className="text-slate-400 font-bold">No matching risks found in library.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  onImport(item.risk_data);
                  setIsOpen(false);
                  toast.success(`Imported ${item.item_name}`);
                }}
                className="group p-4 bg-slate-50 hover:bg-primary/5 border-2 hover:border-primary/50 rounded-2xl cursor-pointer transition-all relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{item.item_name}</p>
                    <p className="font-bold text-slate-900">{item.risk_data.failureMode}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => deleteItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-opacity"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Effect</p>
                    <p className="text-xs text-slate-600 line-clamp-1">{item.risk_data.effect}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">CQA</p>
                    <p className="text-xs text-primary font-bold line-clamp-1">{item.risk_data.cqa}</p>
                  </div>
                </div>
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="text-primary" size={20} />
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskLibraryDialog;