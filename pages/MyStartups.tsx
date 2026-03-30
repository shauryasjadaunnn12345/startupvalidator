import { useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStartups } from '@/hooks/useStartups';
import { useMyValidations, useApprovedValidationCount } from '@/hooks/useValidations';
import { 
  Rocket, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Twitter, 
  Github, 
  Linkedin, 
  Mail 
} from 'lucide-react';

const REQUIRED_VALIDATIONS = 2;

const statusConfig = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20'
  },
  queued: {
    label: 'Queued for Launch',
    icon: Clock,
    className: 'bg-primary/10 text-primary border-primary/20'
  },
  live: {
    label: 'Live',
    icon: CheckCircle2,
    className: 'bg-success/10 text-success border-success/20'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20'
  }
};

// ✅ FOOTER COMPONENT
function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Startup Validator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The #1 platform to validate startup ideas and find beta testers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Startup Directory</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Startup Blog</Link></li>
              <li><Link to="/submit" className="hover:text-primary transition-colors">Submit Startup</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/checklist" className="hover:text-primary transition-colors">SaaS Product Launch Checklist</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Startup Validator. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built for beta testing platforms and startup validation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MyStartups() {
  console.log('🔄 [MyStartups] Rendered');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const { data: startups = [], isLoading: startupsLoading } = useMyStartups();
  const { data: myValidations = [], isLoading: validationsLoading } = useMyValidations();

  const isBootstrapping =
    authLoading ||
    startupsLoading ||
    validationsLoading;

  const pendingStartup = startups.find(s => s.status === 'pending');
  const activeSubmissionCycle = pendingStartup?.submission_cycle;

  // Calculate flagged validations
  const flaggedValidations = myValidations.filter(v => 
    v.submission_cycle === activeSubmissionCycle &&
    v.ai_status === 'flagged'
  );
  
  const hasFlaggedValidation = flaggedValidations.length > 0;

  // FIX: COUNT ONLY APPROVED / PENDING (Exclude flagged)
  const submittedValidationsCount = myValidations.filter(v =>
    v.submission_cycle === activeSubmissionCycle &&
    v.ai_status !== 'flagged' &&
    !v.startup?.description?.includes('System-generated')
  ).length;

  const canSubmit = submittedValidationsCount >= REQUIRED_VALIDATIONS && !hasFlaggedValidation;
  
  const validationsByStartup: Record<string, any[]> = {};

  // ✅ FINAL FIX: Populate validationsByStartup
  myValidations.forEach((v) => {
    if (!v.startup_id) return;

    if (!validationsByStartup[v.startup_id]) {
      validationsByStartup[v.startup_id] = [];
    }

    validationsByStartup[v.startup_id].push(v);
  });

  console.log('🧮 [MyStartups] Cycle check', {
    activeSubmissionCycle,
    submittedValidationsCount,
    hasFlaggedValidation,
    required: REQUIRED_VALIDATIONS
  });

  // 1️⃣ KEEP THIS (already correct)
  // REALTIME: AUTO-UPDATE pending → live
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-startups-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'startups',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;

          console.log('📡 Startup status:', oldStatus, '→', newStatus);

          if (oldStatus !== newStatus) {
            queryClient.invalidateQueries({
              queryKey: ['my-startups'],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // 2️⃣ ADD THIS BELOW IT (THIS IS THE FIX)
  // REALTIME: AUTO-UPDATE validation AI status (approved / flagged)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-validations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'validations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['my-validations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // UX FIX: Redirect only for missing validations (not flagged)
  useEffect(() => {
    if (!pendingStartup) return;

    // if (submittedValidationsCount < REQUIRED_VALIDATIONS) {
    //   navigate('/validate', { replace: true });
    // }
    
    // REMOVED Redirect for flagged validations so the user sees the card message
  }, [pendingStartup?.id, submittedValidationsCount, navigate]);

  if (isBootstrapping) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">My Startups</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Manage your submitted startups
            </p>
          </div>
          <Button asChild disabled={!canSubmit} className="w-full sm:w-auto">
            <Link to="/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit New
            </Link>
          </Button>
        </div>

        {/* Global Warning: Only for new users missing validations (no flagged logic here) */}
        {!canSubmit && !pendingStartup && !hasFlaggedValidation && (
          <Card className="mb-6 border-warning/50 bg-warning/5 sm:mb-8">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium sm:text-base">Complete {REQUIRED_VALIDATIONS - submittedValidationsCount} more validation(s) to submit a startup</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Help other founders by validating their startups first.
                </p>
              </div>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/validate">Validate Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {startupsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : startups.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="py-12 text-center">
              <Rocket className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h2 className="mt-4 font-display text-xl font-semibold">No startups yet</h2>
              <p className="mt-2 text-muted-foreground">
                {canSubmit 
                  ? "Ready to share your startup with the world?"
                  : "Complete your validations first, then submit your startup."}
              </p>
              <Button className="mt-6" asChild disabled={!canSubmit}>
                <Link to={canSubmit ? "/submit" : "/validate"}>
                  {canSubmit ? "Submit Your First Startup" : "Start Validating"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {startups.map((startup) => {
              const status = statusConfig[startup.status];
              const StatusIcon = status.icon;
              const validations = validationsByStartup[startup.id] || [];
              
              console.log('🔄 [MyStartups] Rendering startup:', startup.id, 'with', validations.length, 'validations');
              
              return (
                <Card key={startup.id} className="animate-fade-in overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Logo */}
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border bg-muted sm:h-16 sm:w-16">
                        {startup.logo_url ? (
                          <img 
                            src={startup.logo_url} 
                            alt={startup.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="font-display text-2xl font-bold text-primary">
                              {startup.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold truncate">
                              {startup.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {startup.tagline}
                            </p>
                          </div>
                          
                          <Badge className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-4 sm:text-sm">
                          <span>{startup.category?.name}</span>
                          {startup.launch_date && (
                            <span>
                              Launch: {new Date(startup.launch_date).toLocaleDateString()}
                            </span>
                          )}
                          {startup.status === 'live' && (
                            <span className="flex items-center gap-1 text-primary">
                              ▲ {startup.upvote_count} upvotes
                            </span>
                          )}
                        </div>

                        {startup.status === 'rejected' && startup.rejection_reason && (
                          <div className="mt-3 rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">
                              <strong>Reason:</strong> {startup.rejection_reason}
                            </p>
                            <Button size="sm" className="mt-2" asChild>
                              <Link to="/submit">Resubmit</Link>
                            </Button>
                          </div>
                        )}

                        {/* ✅ PENDING STARTUP STATUS - INCLUDING FLAGGED WARNING */}
                        {startup.status === 'pending' && (
                          <>
                            {hasFlaggedValidation ? (
                              <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-destructive">Your feedback was rejected by AI</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Please resubmit a more detailed and constructive validation to continue.
                                  </p>
                                </div>
                                <Button variant="destructive" size="sm" asChild className="w-full sm:w-auto mt-2 sm:mt-0">
                                  <Link to="/submit">submit again</Link>
                                </Button>
                              </div>
                            ) : (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Validations submitted. AI review in progress.
                                Your startup will go live once 2 validations are approved.
                              </p>
                            )}
                          </>
                        )}

                        {startup.status === 'pending' && validations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="text-sm font-medium">Validation Feedback:</h4>
                            {validations.map((validation) => (
                              <div key={validation.id} className="rounded-lg border p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-muted-foreground">
                                    {validation.profile?.full_name || 'Anonymous'}
                                  </span>
                                  <Badge 
                                    variant={validation.ai_status === 'approved' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {validation.ai_status === 'approved' ? 'Approved' : 'Rejected'}
                                  </Badge>
                                </div>
                                <p className="text-sm">{validation.content}</p>
                                {validation.ai_reason && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <strong>Reason:</strong> {validation.ai_reason}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {startup.status === 'live' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/startup/${startup.id}`}>View</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

    </Layout>
  );
}