"use client";

import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/components/auth/SessionProvider';
import { toast } from 'sonner';

const Login = () => {
  const { session, loading } = useSession();
  const location = useLocation();

  useEffect(() => {
    // Check for error parameters in the URL hash (common with Supabase auth redirects)
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      
      if (errorDescription) {
        toast.error(errorDescription.replace(/\+/g, ' '), {
          description: errorCode === 'otp_expired' ? "The link may have expired or was already used. Please try signing up again or check your Supabase 'Site URL' settings." : undefined,
          duration: 6000,
        });
        // Clear the hash to prevent repeated toasts
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (session) return <Navigate to="/" replace />;

  const redirectTo = window.location.origin;

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
        <CardContent className="space-y-4">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            redirectTo={redirectTo}
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
          
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={18} />
            <div className="text-[11px] text-amber-800 leading-relaxed">
              <p className="font-bold mb-1">Trouble verifying email?</p>
              <p>Ensure your Supabase <strong>Site URL</strong> is set to <code className="bg-white px-1 rounded">{redirectTo}</code> in the Supabase Dashboard (Authentication {'>'} URL Configuration).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;