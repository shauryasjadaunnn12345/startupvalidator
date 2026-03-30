import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useStartupsToValidate } from '@/hooks/useStartups';
import { useCreateValidation, useMyValidations, useUpdateValidation } from '@/hooks/useValidations';
import { useMyStartups } from '@/hooks/useStartups';
import { CheckCircle2, Loader2, ExternalLink, Rocket, Mail, Twitter, Github, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

const REQUIRED_VALIDATIONS = 2;
const MIN_CHARS = 100;

function isStartup(obj: any): obj is import('@/types/database').Startup {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj;
}

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

              <li><Link to="/submit" className="hover:text-primary transition-colors">Submit Startup</Link></li>
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

export default function Validate() {
  // 🔹 Hooks (must stay at top)
  const { user, isLoading: authLoading, isEmailVerified } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode') || 'validate';
  const isEditMode = mode === 'edit';
  
  const {
    data: validationResult,
    isLoading: startupsLoading,
  } = useStartupsToValidate();
  const startups = validationResult?.data ?? [];
  const validationMeta = validationResult?.meta;

  const { data: myValidations = [], isLoading: myValidationsLoading } = useMyValidations();
  // ✅ FIX: Extract myStartupsLoading for bootstrapping
  const { data: myStartups = [], isLoading: myStartupsLoading } = useMyStartups();

  const createValidation = useCreateValidation();
  const updateValidation = useUpdateValidation();

  // 🔑 Fix: Add ONE derived flag at the top
  const pendingStartup = myStartups.find(s => s.status === 'pending');
  const isMandatoryValidation = !!pendingStartup;
  const hasCompletedMandatory = isMandatoryValidation && 
    myValidations.filter(
      v => v.submission_cycle === pendingStartup?.submission_cycle
    ).length >= REQUIRED_VALIDATIONS;

  // 🔑 Get active cycle to count only relevant validations
  const activeSubmissionCycle = pendingStartup?.submission_cycle;

  console.log('🧭 [CP-VAL-1] Validation mode', {
    isMandatoryValidation,
    hasCompletedMandatory,
    pendingStartupId: pendingStartup?.id,
    activeSubmissionCycle,
  });

  // 🔹 Validation counters (CYCLE AWARE)
  // Kept for reference/debugging, but NO LONGER used for flow control
  const approvedCount = myValidations.filter(v =>
    v.ai_status === 'approved' &&
    v.submission_cycle === activeSubmissionCycle
  ).length;

  // ✅ FIX 1: ADD submittedCount (NEW SOURCE OF TRUTH for UI)
  const submittedCount = myValidations.filter(
    v => v.submission_cycle === activeSubmissionCycle
  ).length;

  console.log('🧮 [CP-VAL-COUNT] Submitted validations (cycle-based)', {
    submittedCount,
    activeSubmissionCycle,
    totalValidations: myValidations.length,
  });

  const userHasLiveStartup = myStartups.some(s => s.status === 'live');
  const showEditButton =
    !isEditMode && myValidations.length > 0 && !userHasLiveStartup;

  // 🔹 Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');

  // 🔹 Display data - Handling Voluntary vs Mandatory filtering
  // Calculated here but NOT used until after the early return checks below
  const displayData = (() => {
    if (isEditMode) {
      return myValidations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, REQUIRED_VALIDATIONS);
    } else {
      const candidates = startups.slice(0, REQUIRED_VALIDATIONS);
      
      // 🟢 CASE A: Voluntary validation -> Exclude system/demo startups
      if (!isMandatoryValidation) {
        return candidates.filter(s => !s.description?.includes('System-generated'));
      }
      
      // 🔴 CASE C: Mandatory validation -> Show whatever is available (including system)
      return candidates;
    }
  })();

  const currentItem = displayData[currentIndex];
  const currentStartup =
    isEditMode && currentItem && 'startup' in currentItem
      ? currentItem.startup
      : currentItem;

  const existingFeedback =
    isEditMode && currentItem && 'content' in currentItem
      ? currentItem.content
      : '';

  const canSubmit = feedback.length >= MIN_CHARS;

  // 🔁 Initialize feedback correctly
  useEffect(() => {
    if (isEditMode && existingFeedback) {
      setFeedback(existingFeedback);
    } else {
      setFeedback('');
    }
  }, [currentIndex, isEditMode, existingFeedback]);

  // 🔹 Step 1: derive loading state
  const isBootstrapping =
    authLoading ||
    myValidationsLoading ||
    myStartupsLoading ||
    startupsLoading;

  // 🔹 Step 2: ADD THIS GUARD (Wait for data before deciding flow)
  if (isBootstrapping) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // 🔐 Auth guards
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-xl text-center">
            <CardContent className="py-12">
              <Mail className="mx-auto h-12 w-12 text-warning" />
              <h2 className="mt-4 text-xl font-semibold">Email Verification Required</h2>
              <p className="mt-2 text-muted-foreground">
                Please verify your email before validating startups.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild>
                  <Link to="/verify-email">Verify Email</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // ✅ HARD STOP: Mandatory validations already completed
  // Placed here to ensure data is loaded and logic is correct
  if (isMandatoryValidation && hasCompletedMandatory) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 sm:py-12">
          <Card className="mx-auto max-w-xl mt-12 text-center">
            <CardContent className="py-12">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h2 className="mt-4 font-display text-xl font-semibold">
                Validations completed
              </h2>
              <p className="mt-2 text-muted-foreground">
                Check Your Startup status in My Startups.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild>
                  <Link to="/my-startups">Go to My Startups</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // 🔘 Submit handler
  const handleSubmit = async () => {
    // 🔒 SAFETY FIX: Prevent double submission (race condition)
    if (
      createValidation.isPending ||
      updateValidation.isPending
    ) return;

    if (!currentStartup || !canSubmit) return;

    try {
      if (isEditMode) {
        await updateValidation.mutateAsync({
          validationId: currentItem.id,
          content: feedback,
        });
      } else {
        await createValidation.mutateAsync({
          startupId: currentStartup.id,
          content: feedback,
          startupName: currentStartup.name,
        });
      }

      // ✅ Checkpoint 5: Submission logged
      console.log('📝 [CP-VAL-5] Validation submitted', {
        startupId: currentStartup.id,
        isEditMode,
      });

      // ✅ FIX 3: FORCE REDIRECT AFTER 2ND SUBMISSION (THE ONLY EXIT POINT)
      const nextIndex = currentIndex + 1;

      if (isMandatoryValidation && nextIndex >= REQUIRED_VALIDATIONS) {
        toast.success('Feedback submitted. Your startup is under review.');
        navigate('/my-startups', { replace: true });
        return;
      }

      setFeedback('');
      
      if (nextIndex < displayData.length) {
        setCurrentIndex(nextIndex);
      }
    } catch {
      // handled by mutation
    }
  };

  const handleSkip = () => {
    // 🟢 CASE A: Voluntary validation allows skip
    if (isMandatoryValidation) {
      toast.error('You must complete validations to proceed.');
      console.log('⛔ [CP-VAL-2] Skip blocked (mandatory validation)');
      return;
    }

    if (currentIndex < displayData.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  console.log('[Checkpoint] Render return block', {
    displayDataLength: displayData.length,
    currentStartup,
    validationMeta,
    isMandatoryValidation
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Progress Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">
                  {isEditMode ? 'Edit Your Validations' : 'Validate Startups'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  {isEditMode
                    ? 'Review and improve your previous validation feedback'
                    : isMandatoryValidation
                    ? 'You must validate 2 startups to activate your submission'
                    : 'Help fellow founders by providing thoughtful feedback'}
                </p>
                {showEditButton && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/validate?mode=edit')}
                  >
                    Edit My Feedback
                  </Button>
                )}
              </div>
            {!isEditMode && submittedCount >= REQUIRED_VALIDATIONS && (
  <Badge className="bg-success text-success-foreground">
    <CheckCircle2 className="mr-1 h-3 w-3" />
    Eligible to Submit
  </Badge>
)}

            </div>
            
            {/* 🟡 CASE C: Only show progress/warning if Mandatory */}
            {isMandatoryValidation && (
              <>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isEditMode ? 'Editing Progress' : 'Validation Progress'}
                    </span>
                    <span className="font-medium">
                      {isEditMode
        ? `${currentIndex + 1}/${displayData.length} edited`
        : `${submittedCount}/${REQUIRED_VALIDATIONS} submitted`
      }
                    </span>
                  </div>
                  <Progress 
                    value={
                      (() => {
                        const progressValue =
                          validationMeta?.reason === 'NO_AVAILABLE_STARTUPS'
                            ? (submittedCount / Math.max(validationMeta.eligible ?? 1, 1)) * 100
                            : (submittedCount / REQUIRED_VALIDATIONS) * 100;
                        return Math.min(progressValue, 100);
                      })()
                    }
                    className="mt-2 h-2" 
                  />
                </div>

                {/* ✅ FIX 5: FIX WARNING MESSAGE (MANDATORY) */}
                {submittedCount < REQUIRED_VALIDATIONS && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      You must validate <strong>{REQUIRED_VALIDATIONS - submittedCount}</strong> more startup(s)
                      to activate your submission.
                    </AlertDescription>
                  </Alert>
                )}

                {/* 🟢 UX ALERT: Ecosystem Too Small */}
                {validationMeta?.reason === 'NO_AVAILABLE_STARTUPS' && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      There aren’t enough startups available for validation right now.
                      Your submission will remain pending until more startups join the platform.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          {displayData.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                {/* ✅ FIX 6: REMOVE MISLEADING EMPTY STATE TEXT */}
                <h2 className="mt-4 font-display text-xl font-semibold">
                  {isEditMode
                    ? 'No validations to edit'
                    : "Check back later for more startups to validate."}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {isEditMode
                    ? "You haven't provided any validations yet."
                    : "The queue is currently empty."}
                </p>
                {!isEditMode && submittedCount >= REQUIRED_VALIDATIONS && (
                  <Button className="mt-6" asChild>
                    <Link to="/my-startups">Go to My Startups</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : currentStartup ? (
            <Card className="animate-fade-in overflow-hidden">
              <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Logo */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border bg-background sm:h-16 sm:w-16">
                    {isStartup(currentStartup) && currentStartup.logo_url ? (
                      <img 
                        src={currentStartup.logo_url} 
                        alt={currentStartup.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="font-display text-2xl font-bold text-primary">
                          {isStartup(currentStartup) && currentStartup.name ? currentStartup.name.charAt(0) : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display">{isStartup(currentStartup) ? currentStartup.name : ''}</CardTitle>
                        <CardDescription className="mt-1">{isStartup(currentStartup) && 'tagline' in currentStartup ? currentStartup.tagline : ''}</CardDescription>
                      </div>
                      <Badge variant="secondary">{isStartup(currentStartup) && 'category' in currentStartup && currentStartup.category ? currentStartup.category.name : ''}</Badge>
                    </div>
                    {isStartup(currentStartup) && currentStartup.website_url && (
                      <a 
                        href={currentStartup.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="mb-2 text-sm font-semibold sm:text-base">About</h3>
                  <p className="text-sm text-muted-foreground sm:text-base">{isStartup(currentStartup) && currentStartup.description ? currentStartup.description : ''}</p>
                </div>

                {isStartup(currentStartup) && currentStartup.video_url && (
                  <div className="mb-6">
                    <h3 className="mb-2 font-semibold">Product Video</h3>
                    <a 
                      href={currentStartup.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Watch Video
                    </a>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Your Feedback</h3>
                    <span className={`text-sm ${feedback.length >= MIN_CHARS ? 'text-success' : 'text-muted-foreground'}`}>
                      {feedback.length}/{MIN_CHARS} min characters
                    </span>
                  </div>
                  <Textarea
                    placeholder="Share your honest, constructive feedback about this startup. Consider their idea, market potential, execution, and what could be improved..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  {/* Updated logic to use submittedCount */}
                  {submittedCount >= REQUIRED_VALIDATIONS && !isEditMode && (
  <Alert className="mt-4">
    <AlertDescription>
      You’ve completed the required validations. You can now submit your startup.
    </AlertDescription>
  </Alert>
)}

                  <p className="text-xs text-muted-foreground">
                    Quality feedback helps founders improve and ensures your validation gets approved.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
                 <Button
                  onClick={handleSubmit}
                  disabled={
                    (!isEditMode && submittedCount >= REQUIRED_VALIDATIONS) ||
                    !canSubmit ||
                    (isEditMode ? updateValidation.isPending : createValidation.isPending)
                  }
                  className="flex-1"
                >
  {(isEditMode ? updateValidation.isPending : createValidation.isPending) && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  Submit Validation
</Button>

                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isMandatoryValidation || currentIndex >= displayData.length - 1}

                    className="sm:w-auto"
                  >
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Queue indicator */}
          {!isEditMode && displayData.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {currentIndex + 1} of {displayData.length} startups in queue
            </p>
          )}
        </div>
      </div>
      
      {/* Footer Added Here */}
      <Footer />

    </Layout>
  );
}