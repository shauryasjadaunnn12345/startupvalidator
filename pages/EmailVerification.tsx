import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailVerification() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // If user is verified, redirect to home
    if (isEmailVerified && user) {
      navigate('/');
    }
  }, [isEmailVerified, user, navigate]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-warning" />
              <h2 className="mt-4 font-display text-xl font-semibold">No account found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Please sign up or sign in to continue.
              </p>
              <Button className="mt-6" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isEmailVerified) {
    return (
      <Layout>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h2 className="mt-4 font-display text-xl font-semibold">Email Verified!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your email has been verified. Redirecting...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We need to verify your email address to ensure it's real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We've sent a verification email to <strong>{user.email}</strong>. 
                Please check your inbox and click the verification link.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Check your spam/junk folder if you don't see the email</p>
              <p>• The verification link will expire in 24 hours</p>
              <p>• You must verify your email to use all features</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleResend} 
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Verification Email
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                variant="ghost"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
