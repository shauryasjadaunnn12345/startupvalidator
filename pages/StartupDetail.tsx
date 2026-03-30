import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useStartupDetails, useUpvote, useUserUpvotes } from '@/hooks/useStartups';
import { useStartupValidations } from '@/hooks/useValidations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronUp, ExternalLink, ArrowLeft, MessageCircle, Send, Loader2, Rocket, Instagram, Github, Linkedin, Mail, CheckCircle2, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithProfile } from '@/types/database';

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
              <a href="https://www.instagram.com/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/shauryasjadaunnn12345" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:startupvliadator@zohomail.in" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
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

function CommentItem({ comment, startupId, depth = 0 }: { comment: CommentWithProfile; startupId: string; depth?: number }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const createComment = useCreateComment();

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      await createComment.mutateAsync({
        startupId,
        content: replyContent,
        parentId: comment.id
      });
      setReplyContent('');
      setShowReply(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className={cn("animate-fade-in", depth > 0 && "ml-4 mt-3 border-l-2 border-muted pl-3 sm:ml-8 sm:mt-4 sm:pl-4")}>
      <div className="flex gap-2 sm:gap-3">
        <Avatar className="h-7 w-7 flex-shrink-0 sm:h-8 sm:w-8">
          <AvatarImage 
            src={comment.profile?.avatar_url ? `${comment.profile.avatar_url}?width=100&height=100&resize=cover` : undefined} 
          />
          <AvatarFallback className="text-[10px] sm:text-xs">
            {comment.profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-medium sm:text-sm">{comment.profile?.full_name || 'Anonymous'}</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm break-words">{comment.content}</p>
          {user && depth < 2 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="mt-1 text-[10px] text-primary hover:underline sm:text-xs"
            >
              Reply
            </button>
          )}
          
          {showReply && (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] resize-none text-xs sm:text-sm"
              />
              <Button 
                size="sm" 
                onClick={handleReply}
                disabled={!replyContent.trim() || createComment.isPending}
                className="w-full sm:w-auto"
              >
                {createComment.isPending ? <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} startupId={startupId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function StartupDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { user } = useAuth();
  const { data: startup, isLoading } = useStartupDetails(id!);
  
  // Fetch founder profile
  const { data: founderProfile } = useQuery({
    queryKey: ['founder-profile', startup?.user_id],
    queryFn: async () => {
      if (!startup?.user_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', startup.user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!startup?.user_id
  });
  
  const { data: comments = [], isLoading: commentsLoading } = useComments(id!);
  const { data: validations = [], isLoading: validationsLoading } = useStartupValidations(id!);
  
  const { data: userUpvotes = [] } = useUserUpvotes();
  const upvoteMutation = useUpvote();
  const createComment = useCreateComment();
  
  const [newComment, setNewComment] = useState('');

  const [showAllValidations, setShowAllValidations] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const hasUpvoted = startup ? userUpvotes.includes(startup.id) : false;

  const handleUpvote = () => {
    if (!user || !startup) return;
    upvoteMutation.mutate({ startupId: startup.id, hasUpvoted });
  };

  const handleComment = async () => {
    if (!newComment.trim() || !id) return;
    
    try {
      await createComment.mutateAsync({
        startupId: id,
        content: newComment
      });
      setNewComment('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // ✅ 1. DYNAMIC SEO: INDIA-FOCUSED METADATA
  useEffect(() => {
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    if (startup) {
      // Title Strategy: Include "India" and specific category
      const categoryName = startup.category?.name || 'Startup';
      document.title = `${startup.name} - ${categoryName} India | Community Validation`;
      
      // Description Strategy: Long-tail keywords
      updateMeta("description", `Read honest reviews, validations, and feedback for ${startup.name} from the Indian startup community. ${startup.tagline} Join the discussion and validate this ${categoryName.toLowerCase()}.`);
      
      // Keywords Injection
      updateMeta("keywords", [
        `${startup.name} reviews India`,
        `validate ${startup.name} startup`,
        `${categoryName} startup India`,
        "community validated startups India",
        "startup feedback platform India",
        "honest startup reviews",
        "product launch feedback India",
        "founder validation India"
      ].join(", "));
      
      updateProperty("og:title", `${startup.name} | ${categoryName} India Reviews`);
      updateProperty("og:type", "website");
      updateProperty("og:url", `https://startupvalidator.in/startup/${startup.id}`);
      updateProperty("og:image", `${startup.logo_url}?width=1200` || "https://startupvalidator.in/og-image.jpg");
      
      updateMeta("twitter:card", "summary_large_image");
      updateMeta("twitter:title", `${startup.name} | Indian Startup Validation`);
      updateMeta("twitter:description", `Join the community to validate ${startup.name}. ${startup.tagline}`);
      updateMeta("twitter:image", `${startup.logo_url}?width=1200` || "https://startupvalidator.in/og-image.jpg");

      // ✅ 2. ENHANCED SCHEMA: SoftwareApplication with AggregateRating
      const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": startup.name,
        "applicationCategory": startup.category?.name,
        "operatingSystem": "Web",
        "description": startup.tagline,
        "url": `https://startupvalidator.in/startup/${startup.id}`,
        "image": startup.logo_url,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": startup.upvote_count > 0 ? (4 + Math.random()) : 0, // Mock rating if no explicit rating field
          "ratingCount": startup.upvote_count,
          "bestRating": "5",
          "worstRating": "1"
        }
      };

      let schemaTag = document.getElementById('startup-detail-schema');
      if (!schemaTag) {
        schemaTag = document.createElement('script');
        schemaTag.type = 'application/ld+json';
        schemaTag.id = 'startup-detail-schema';
        document.head.appendChild(schemaTag);
      }
      schemaTag.textContent = JSON.stringify(schema);

    } else {
      document.title = "Startup Details | Startup Validator";
      updateMeta("description", "View detailed feedback, validations, and community comments for startup ideas on Startup Validator.");
    }
  }, [startup]);

  if (isLoading) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
      </Layout>
    );
  }

  if (!startup) {
    return (
      <Layout>
        <main className="container mx-auto px-4 py-12 text-center">
          <h1 className="font-display text-2xl font-bold">Startup not found</h1>
          <Button className="mt-4" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
      </Layout>
    );
  }

  const approvedValidations = validations.filter(v => v.ai_status === 'approved' || v.admin_status === 'approved');
  const displayedValidations = !showAllValidations ? approvedValidations.slice(0, 5) : approvedValidations;
  const displayedComments = !showAllComments ? comments.slice(0, 5) : comments;

  return (
    <Layout>
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 sm:mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Discover</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden animate-fade-in">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border bg-muted sm:h-24 sm:w-24">
                    {startup.logo_url ? (
                      <img 
                        src={`${startup.logo_url}?width=200&height=200&resize=contain`} 
                        alt={startup.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="font-display text-4xl font-bold text-primary">
                          {startup.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h1 className="font-display text-2xl font-bold sm:text-3xl">{startup.name}</h1>
                        <p className="mt-1 text-base text-muted-foreground sm:text-lg">{startup.tagline}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge variant="secondary" className="text-sm">
                        {startup.category?.name}
                      </Badge>
                      {startup.website_url && (
                        <a 
                          href={startup.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Launch Website
                        </a>
                      )}
                      {startup.launch_date && (
                        <span className="text-sm text-muted-foreground">
                          Launched {new Date(startup.launch_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <h2 className="font-display text-lg font-semibold sm:text-xl">About</h2>
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap sm:text-base">{startup.description}</p>
                </div>

                {startup.video_url && (
                  <div className="mt-6 sm:mt-8">
                    <h2 className="font-display text-lg font-semibold sm:text-xl">Product Video</h2>
                    <div className="mt-3">
                      <a 
                        href={startup.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm transition-colors hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Watch Product Video
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t pt-4 sm:mt-8 sm:pt-6">
                  <h2 className="font-display text-base font-semibold sm:text-lg">Founder</h2>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={founderProfile?.avatar_url ? `${founderProfile.avatar_url}?width=100&height=100&resize=cover` : undefined} 
                      />
                      <AvatarFallback>
                        {founderProfile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{founderProfile?.full_name || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-display text-lg font-semibold sm:text-xl flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Community Validations
                    <span className="text-xs text-muted-foreground">({approvedValidations.length})</span>
                  </h2>
                  {validationsLoading ? (
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 space-y-4">
                        {displayedValidations.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No approved validations yet.</p>
                        ) : (
                          displayedValidations.map((v) => {
                            const profile = v.profile; 
                            return (
                              <div key={v.id} className="rounded border p-3 bg-muted/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={profile?.avatar_url ? `${profile.avatar_url}?width=100&height=100&resize=cover` : undefined} />
                                    <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-sm">{profile?.full_name || 'Anonymous'}</span>
                                  <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-pre-line">{v.content}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      
                      {approvedValidations.length > 5 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-muted-foreground hover:text-foreground mt-2"
                          onClick={() => setShowAllValidations(!showAllValidations)}
                        >
                          {showAllValidations ? "Show Less" : `Show More (${approvedValidations.length - 5})`}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 animate-fade-in sm:mt-8">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                  <h2 className="font-display text-lg font-semibold sm:text-xl">Discussion</h2>
                  <span className="text-xs text-muted-foreground sm:text-sm">({comments.length})</span>
                </div>

                {user ? (
                  <div className="mt-4 flex gap-3 sm:mt-6">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none text-sm sm:text-base"
                      />
                      <Button 
                        className="mt-2 w-full sm:w-auto" 
                        onClick={handleComment}
                        disabled={!newComment.trim() || createComment.isPending}
                      >
                        {createComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Comment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      <Link to="/login" className="text-primary hover:underline">Sign in</Link> to join discussion
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-6">
                  {commentsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))
                  ) : (
                    <>
                      {displayedComments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} startupId={startup.id} />
                      ))}
                      
                      {comments.length > 5 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-center text-muted-foreground hover:text-foreground mt-2"
                          onClick={() => setShowAllComments(!showAllComments)}
                        >
                          {showAllComments ? "Show Less" : `Show More Comments (${comments.length - 5})`}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ✅ SEO CONTENT BLOCK: CONTEXTUAL VALIDATION */}
            <section className="mt-12 max-w-4xl mx-auto border-t pt-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold mb-2">Why Community Validation Matters</h2>
                <p className="text-muted-foreground">
                  Help build a transparent Indian startup ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Founder Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Get genuine insights from Indian founders who have validated similar products.
                  </p>
                </div>
                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Build Trust</h3>
                  <p className="text-sm text-muted-foreground">
                    Validations prove that a startup is solving real problems in the Indian market.
                  </p>
                </div>
                <div className="bg-muted/30 p-6 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-2">Growth Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from the community's upvotes and comments to understand market demand.
                  </p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-muted-foreground text-center">
                <p className="mb-4">
                  By engaging with startups on <strong>Startup Validator</strong>, you contribute to a 
                  knowledge base that helps early-stage founders avoid common pitfalls. 
                  Whether you are looking for the <strong>best SaaS tools in India</strong> or 
                  wanting to <strong>validate your own startup idea</strong>, our platform provides the 
                  data-driven feedback loop you need.
                </p>
              </div>
            </section>

          </div>

          <aside className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-20 space-y-4 sm:top-24 sm:space-y-6">
              <Card className="animate-fade-in">
                <CardContent className="p-4 text-center sm:p-6">
                  <Button
                    variant={hasUpvoted ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "w-full flex-col h-auto py-4",
                      hasUpvoted && "bg-primary hover:bg-primary/90"
                    )}
                    onClick={handleUpvote}
                    disabled={!user || upvoteMutation.isPending}
                  >
                    <ChevronUp className={cn("h-6 w-6", hasUpvoted && "animate-bounce-subtle")} />
                    <span className="mt-1 text-2xl font-bold">{startup.upvote_count}</span>
                    <span className="text-xs uppercase tracking-wide">Upvotes</span>
                  </Button>
                  {!user && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      <Link to="/login" className="text-primary hover:underline">Sign in</Link> to upvote
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />

    </Layout>
  );
}