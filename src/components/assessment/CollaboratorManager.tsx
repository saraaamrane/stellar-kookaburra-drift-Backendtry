"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CollaboratorManagerProps {
  assessmentId: string;
  isOwner: boolean;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({ assessmentId, isOwner }) => {
  const [email, setEmail] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchCollaborators();
    }
  }, [assessmentId]);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('assessment_collaborators')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (!error) setCollaborators(data || []);
  };

  const addCollaborator = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase
      .from('assessment_collaborators')
      .insert({ assessment_id: assessmentId, email });

    if (error) {
      toast.error("Failed to add collaborator");
    } else {
      toast.success("Collaborator added!");
      setEmail('');
      fetchCollaborators();
    }
    setLoading(false);
  };

  const removeCollaborator = async (id: string) => {
    const { error } = await supabase
      .from('assessment_collaborators')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to remove collaborator");
    } else {
      toast.success("Collaborator removed");
      fetchCollaborators();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl font-bold border-2">
          <Users className="mr-2 h-4 w-4" /> Collaborators
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Users className="text-primary" /> Manage Collaboration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {isOwner && (
            <div className="space-y-2">
              <Label className="font-bold text-slate-600">Add Collaborator by Email</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="colleague@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-2"
                />
                <Button onClick={addCollaborator} disabled={loading} className="rounded-xl font-bold">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="font-bold text-slate-600">Current Collaborators</Label>
            <div className="space-y-2">
              {collaborators.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No collaborators added yet.</p>
              ) : (
                collaborators.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{c.email}</span>
                    </div>
                    {isOwner && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCollaborator(c.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaboratorManager;