import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Rocket, Loader2, Mail, Chrome } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [testLink, setTestLink] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleGoogleSignup = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      setEmailSent(true);
      setTestLink(result?.testLink || null);
      toast.success('Account setup initiated! Please verify your email.', {
        duration: 6000,
      });
    } catch (error: any) {
      setFormError(error.message || 'Failed to create account');
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Create your account</CardTitle>
            <CardDescription>Join the community of startup founders</CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <Alert className="border-success/50 bg-success/10">
                  <Mail className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    <strong>Account setup initiated!</strong> A verification email would be sent to <strong>{email}</strong>.
                    {testLink && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800 mb-2">Test Verification Link:</p>
                        <a href={testLink} className="text-blue-600 hover:text-blue-800 break-all text-sm">
                          {testLink}
                        </a>
                        <p className="text-xs text-blue-600 mt-1">Click this link to verify your account</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• In production, a verification email will be sent from startupvalidator@zohomail.in</p>
                  <p>• The verification link expires in 24 hours</p>
                  <p>• You must verify your email to use all features</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate('/verify-email')} className="w-full">
                    Go to Verification Page
                  </Button>
                  <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Removed variant="outline" to make it highlighted/solid */}
                <Button
                  type="button"
                  className="w-full flex items-center gap-2"
                  onClick={handleGoogleSignup}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <Alert className="border-error/50 bg-error/10">
                      <AlertDescription className="text-error">
                        <strong>Error:</strong> {formError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Gmail only)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Only Gmail addresses are allowed. You'll need to verify your email.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}