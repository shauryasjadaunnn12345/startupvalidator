import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole } from '@/types/database';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string, skipEmailCheck?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    setProfile(data as Profile | null);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    setRoles((data?.map(r => r.role) as AppRole[]) || []);
  };

  const refreshProfile = async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchRoles(user.id)]);
    }
  };

  useEffect(() => {
    // Handle email confirmation callback
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if this is from email confirmation
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('type') === 'email') {
          toast.success('Email verified successfully!');
        }
      }
    });

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(async () => {
            await Promise.all([
              fetchProfile(session.user.id),
              fetchRoles(session.user.id)
            ]);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setIsLoading(false);
      }
    );

    // Then check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchRoles(session.user.id)
        ]).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Check if we recently attempted signup (rate limiting)
    const lastSignupAttempt = localStorage.getItem('lastSignupAttempt');
    const now = Date.now();
    const signupCooldownPeriod = 30000; // 30 second cooldown between signup attempts

    if (lastSignupAttempt && (now - parseInt(lastSignupAttempt)) < signupCooldownPeriod) {
      const remainingTime = Math.ceil((signupCooldownPeriod - (now - parseInt(lastSignupAttempt))) / 1000);
      throw new Error(`Please wait ${remainingTime} seconds before trying to sign up again.`);
    }

    // Password strength validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('Password must be at least 8 characters, include a number and an uppercase letter.');
    }

    // Prevent duplicate pending signups for same email
    const pendingSignup = localStorage.getItem('pendingSignup');
    if (pendingSignup) {
      try {
        const pending = JSON.parse(pendingSignup);
        if (pending.email === email && Date.now() < pending.expires) {
          throw new Error('A signup for this email is already pending verification. Please check your email or verify your account.');
        }
      } catch {}
    }

    // Client-side Supabase cannot check for existing email in Auth directly.
    // Instead, we attempt signup and catch duplicate email errors below.
    try {
      // Generate a temporary verification token
      const tempToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // For testing purposes, simulate email sending
      console.log("Would send verification email to:", email);
      console.log("Verification link would be:", `${window.location.origin}/verify-account?email=${encodeURIComponent(email)}&token=${tempToken}`);

      // Store signup data temporarily until email is verified
      const signupData = {
        email,
        password,
        fullName,
        token: tempToken,
        expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        created: now
      };
      localStorage.setItem('pendingSignup', JSON.stringify(signupData));

      // Store the timestamp of when we attempted signup
      localStorage.setItem('lastSignupAttempt', now.toString());

      // Try to create the user in Supabase Auth (will fail if email exists)
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (signupError) {
        if (signupError.message && signupError.message.toLowerCase().includes('email')) {
          throw new Error('This email is already registered. Please sign in or use a different email.');
        }
        throw signupError;
      }

      // Return success - user needs to verify email
      return { requiresVerification: true, testLink: `${window.location.origin}/verify-account?email=${encodeURIComponent(email)}&token=${tempToken}` };

    } catch (error: unknown) {
      // If it's a rate limit error, update the local storage to prevent immediate retries
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        localStorage.setItem('lastSignupAttempt', now.toString());
      }
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('No user email found');
    }

    // Check if we recently sent an email (rate limiting)
    const lastSent = localStorage.getItem('lastVerificationEmailSent');
    const now = Date.now();
    const cooldownPeriod = 60000; // 1 minute cooldown

    if (lastSent && (now - parseInt(lastSent)) < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastSent))) / 1000);
      throw new Error(`Please wait ${remainingTime} seconds before requesting another verification email.`);
    }

    try {
      // Generate new verification token
      const { data: tokenData, error: tokenError } = await supabase.rpc('generate_verification_token', {
        _user_id: user.id,
        _email: user.email
      });

      if (tokenError) {
        throw new Error('Failed to generate verification token');
      }

      // Send custom verification email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          to: user.email,
          subject: 'Verify your Startup Validator account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Startup Validator!</h2>
              <p>Please verify your email address to complete your account setup.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}/functions/v1/verify-email?token=${tokenData}"
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 24 hours.
              </p>
            </div>
          `,
          text: `Welcome to Startup Validator! Please verify your email address by clicking this link: ${window.location.origin}/functions/v1/verify-email?token=${tokenData}`
        }
      });

      if (emailError) {
        // Handle rate limit errors specifically
        if (emailError.message.includes('rate limit') || emailError.message.includes('too many requests')) {
          throw new Error('Email rate limit exceeded. Please wait a few minutes before trying again.');
        }
        throw emailError;
      }

      // Store the timestamp of when we sent the email
      localStorage.setItem('lastVerificationEmailSent', now.toString());

    } catch (error: unknown) {
      // If it's a rate limit error, update the local storage to prevent immediate retries
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        localStorage.setItem('lastVerificationEmailSent', now.toString());
      }
      throw error;
    }
  };

const signIn = async (email: string, password: string, skipEmailCheck = false) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (
      error.message.includes('Email not confirmed') ||
      error.message.includes('email_not_confirmed')
    ) {
      throw new Error(
        'Please verify your email address before signing in.'
      );
    }
    throw error;
  }

  // ✅ IMPORTANT: return data so Login.tsx can read it
  return { data, error: null };
};


  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAdmin = roles.includes('admin');
  const isEmailVerified = user ? (user.email_confirmed_at !== null) : false;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      roles,
      isLoading,
      isAdmin,
      isEmailVerified,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
