import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccount = async () => {
      const email = searchParams.get('email');
      const token = searchParams.get('token');

      if (!email || !token) {
        setError('Invalid verification link. Missing email or token.');
        setIsVerifying(false);
        return;
      }

      try {
        // Get stored signup data
        const pendingSignup = localStorage.getItem('pendingSignup');
        if (!pendingSignup) {
          setError('No pending signup found. Please sign up again.');
          setIsVerifying(false);
          return;
        }

        const signupData = JSON.parse(pendingSignup);

        // Verify the data matches
        if (signupData.email !== email || signupData.token !== token) {
          setError('Invalid verification link.');
          setIsVerifying(false);
          return;
        }

        // Check if token is expired
        if (Date.now() > signupData.expires) {
          setError('Verification link has expired. Please sign up again.');
          localStorage.removeItem('pendingSignup');
          setIsVerifying(false);
          return;
        }

        // Create the Supabase user account
        const { data, error: signupError } = await supabase.auth.signUp({
          email: signupData.email,
          password: signupData.password,
          options: {
            data: { full_name: signupData.fullName }
          }
        });

        if (signupError) {
          console.error('Signup error:', signupError);
          setError('Failed to create account. Please try signing up again.');
          setIsVerifying(false);
          return;
        }

        // Note: Email confirmation will be handled by Supabase's built-in system
        // The user will receive a confirmation email and can confirm through that

        // Clear the pending signup data
        localStorage.removeItem('pendingSignup');

        // Auto sign in the user
        try {
          // Try signing in with skip email check for newly verified users
          await signIn(signupData.email, signupData.password, true);
          setIsSuccess(true);
          toast.success('Account created and verified successfully!');
          setTimeout(() => navigate('/'), 2000);
        } catch (signInError) {
          // If still fails, try normal sign in
          try {
            await signIn(signupData.email, signupData.password);
            setIsSuccess(true);
            toast.success('Account created and verified successfully!');
            setTimeout(() => navigate('/'), 2000);
          } catch (retryError) {
            // If still fails, redirect to login with a message
            console.error('Sign in failed:', retryError);
            setIsSuccess(true);
            toast.success('Account verified! Please sign in with your credentials.');
            setTimeout(() => navigate('/login'), 2000);
          }
        }

      } catch (err: unknown) {
        console.error('Verification error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Verification failed. Please try again.';
        setError(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccount();
  }, [searchParams, signIn, navigate]);

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {isVerifying && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-success" />}
              {error && <AlertCircle className="h-5 w-5 text-error" />}
              Email Verification
            </CardTitle>
            <CardDescription>
              {isVerifying && "Verifying your email address..."}
              {isSuccess && "Your email has been verified successfully!"}
              {error && "There was an issue verifying your email."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isVerifying && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {isSuccess && (
              <Alert className="border-success/50 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  <strong>Success!</strong> Your account has been created and verified.
                  You'll be redirected to the homepage shortly.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-error/50 bg-error/10">
                <AlertCircle className="h-4 w-4 text-error" />
                <AlertDescription className="text-error">
                  <strong>Verification Failed:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2 mt-6">
              {error && (
                <Button onClick={() => navigate('/signup')} className="w-full">
                  Sign Up Again
                </Button>
              )}
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}