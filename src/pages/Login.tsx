"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/components/auth/SessionProvider';

const Login = () => {
  const { session, loading } = useSession();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">IQRAF 2.0 Login</CardTitle>
          <p className="text-sm text-slate-500">Sign in to manage your risk assessments</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  },
                },
              },
            }}
            theme="light"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;