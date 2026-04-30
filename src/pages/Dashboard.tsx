"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Clock, Users, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchAssessments();
    }
  }, [session]);

  const fetchAssessments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error("Failed to load assessments");
    } else {
      setAssessments(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const startNew = () => {
    navigate('/assessment/new');
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
            <p className="text-slate-500 font-medium">Manage your quality risk assessments and collaborations</p>
          </div>
          <Button onClick={startNew} size="lg" className="rounded-xl font-black h-12 px-8 shadow-xl">
            <Plus className="mr-2 h-5 w-5" /> START NEW ASSESSMENT
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-bold text-lg">No assessments found. Start your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((item) => (
              <Card 
                key={item.id} 
                className="border-2 hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl rounded-2xl overflow-hidden"
                onClick={() => navigate(`/assessment/${item.id}`)}
              >
                <CardHeader className="bg-slate-50/50 border-b group-hover:bg-primary/5 transition-colors">
                  <CardTitle className="text-lg font-black text-slate-800 truncate">
                    {item.product_name || 'Untitled Assessment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center text-sm text-slate-500 font-medium">
                    <Clock className="mr-2 h-4 w-4" />
                    Updated {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 font-medium">
                    <Users className="mr-2 h-4 w-4" />
                    {item.user_id === session?.user.id ? 'Owner' : 'Collaborator'}
                  </div>
                  <Button variant="outline" className="w-full rounded-xl font-bold border-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    Open Assessment
                  </Button>
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