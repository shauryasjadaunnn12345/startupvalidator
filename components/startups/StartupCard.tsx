import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ExternalLink } from 'lucide-react';
import { StartupWithCategory } from '@/types/database';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUpvote, useUserUpvotes } from '@/hooks/useStartups';
import { cn } from '@/lib/utils';

interface StartupCardProps {
  startup: StartupWithCategory;
  rank?: number;
}

export function StartupCard({ startup, rank }: StartupCardProps) {
  // Fetch validation count for this startup
  const { data: validationCount } = useQuery({
    queryKey: ['startup-validation-count', startup.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('validations')
        .select('id', { count: 'exact', head: true })
        .eq('startup_id', startup.id);
      if (error) return 0;
      return count || 0;
    },
  });
  const { user } = useAuth();
  const { data: userUpvotes = [] } = useUserUpvotes();
  const upvoteMutation = useUpvote();
  const hasUpvoted = userUpvotes.includes(startup.id);
  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    upvoteMutation.mutate({ startupId: startup.id, hasUpvoted });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-[1px] animate-fade-in">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Rank & Validations */}
          <div className="flex flex-col items-center shrink-0 text-center min-w-[56px]">
            {rank ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-muted-foreground">
                {rank}
              </div>
            ) : (
              <div className="h-8 w-8" />
            )}
            <span className="mt-1 text-[10px] text-muted-foreground whitespace-nowrap">
              {validationCount ?? 0} validations
            </span>
          </div>

          {/* Main Content */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Logo */}
            <Link to={`/startup/${startup.id}`} className="shrink-0">
              <div className="h-14 w-14 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
                {startup.logo_url ? (
                  <img
                    src={startup.logo_url}
                    alt={startup.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-xl font-bold text-primary">
                    {startup.name.charAt(0)}
                  </span>
                )}
              </div>
            </Link>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <Link
                to={`/startup/${startup.id}`}
                className="inline-flex items-center gap-1 group/link"
              >
                <h3 className="font-display text-base sm:text-lg font-semibold truncate group-hover/link:text-primary transition-colors">
                  {startup.name}
                </h3>
              </Link>

              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {startup.tagline}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {startup.category?.name}
                </Badge>

                {startup.website_url && (
                  <a
                    href={startup.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Upvote */}
          <Button
            variant={hasUpvoted ? 'default' : 'outline'}
            size="sm"
            onClick={handleUpvote}
            disabled={!user || upvoteMutation.isPending}
            className={cn(
              'ml-2 flex flex-col items-center justify-center h-auto px-3 py-2 min-w-[56px] transition-all',
              hasUpvoted && 'bg-primary hover:bg-primary/90'
            )}
          >
            <ChevronUp
              className={cn(
                'h-4 w-4 mb-0.5',
                hasUpvoted && 'animate-bounce-subtle'
              )}
            />
            <span className="text-xs font-semibold leading-none">
              {startup.upvote_count}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
