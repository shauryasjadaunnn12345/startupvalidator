import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // Supabase automatically reads tokens from URL
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus('error');
          setMessage('Verification link is invalid or has expired.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // ✅ Email is verified and session is valid
        setStatus('success');
        setMessage('Email verified successfully! Redirecting…');

        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    completeAuth();
  }, [navigate]);

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h2 className="mt-4 text-xl font-semibold">Verifying Email</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <h2 className="mt-4 text-xl font-semibold">Email Verified</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-semibold">Verification Failed</h2>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
