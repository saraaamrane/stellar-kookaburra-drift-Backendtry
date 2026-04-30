"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, FileText, Users, Clock, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AssessmentSummary {
  id: string;
  product_name: string;
  updated_at: string;
  owner_id: string;
}

const Dashboard = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('assessments')
        .select('id, product_name, updated_at, owner_id')
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error("Failed to load assessments");
      } else {
        setAssessments(data || []);
      }
      setLoading(false);
    };

    fetchAssessments();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">IQRAF <span className="text-primary">2.0</span></h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:bg-red-400/10 font-bold">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Assessments</h2>
            <p className="text-slate-500 font-medium">Manage your risk assessment projects and collaborations</p>
          </div>
          <Button onClick={() => navigate('/assessment/new')} size="lg" className="rounded-xl font-black h-12 px-8 shadow-lg">
            <Plus className="mr-2 h-5 w-5" /> NEW ASSESSMENT
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : assessments.length === 0 ? (
          <Card className="border-4 border-dashed border-slate-200 bg-transparent py-20 text-center">
            <CardContent>
              <FileText className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No assessments found</h3>
              <p className="text-slate-500 mb-8">Start your first Quality Risk Assessment to see it here.</p>
              <Button onClick={() => navigate('/assessment/new')} variant="outline" className="border-2 font-bold">
                Create Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <Card 
                key={assessment.id} 
                className="group border-2 hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl rounded-2xl overflow-hidden"
                onClick={() => navigate(`/assessment/${assessment.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                      <FileText className="text-slate-600 group-hover:text-primary" size={20} />
                    </div>
                    {assessment.owner_id !== session?.user.id && (
                      <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Collaborator</span>
                    )}
                  </div>
                  <CardTitle className="text-xl font-black mt-4 line-clamp-1">{assessment.product_name || 'Untitled Project'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Clock size={12} /> Updated {new Date(assessment.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 border-t bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={14} />
                    <span className="text-xs font-bold">Shared Access</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;