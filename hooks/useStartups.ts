import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Startup, StartupWithDetails, StartupWithCategory, Category } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const REQUIRED_VALIDATIONS = 2;

// ✅ STEP 1: Define sort types (TOP of file)
export type StartupSort =
  | 'trending'
  | 'new'
  | 'upvotes'
  | 'validated';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    }
  });
}

// ✅ STEP 2: Update useLiveStartups (MAIN CHANGE)
export function useLiveStartups(
  categorySlug?: string,
  sort: StartupSort = 'trending'
) {
  return useQuery({
    queryKey: ['startups', 'live', categorySlug, sort], // ✅ STEP 4: Updated queryKey
    queryFn: async () => {
      // 🔧 STEP 3: Modify the query logic
      let query = supabase
        .from('startups')
        .select(`*, category:categories(*)`)
        .eq('status', 'live'); // Removed default order here

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // ✅ SORTING LOGIC (single source of truth)
      switch (sort) {
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;

        case 'upvotes':
          query = query.order('upvote_count', { ascending: false });
          break;

        case 'validated':
          query = query.order('validation_count', { ascending: false });
          break;

        case 'trending':
        default:
          // 🔥 Simple & effective trending
          query = query
            .order('upvote_count', { ascending: false })
          
            .order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      console.log('useLiveStartups result:', data);
      return data as unknown as StartupWithCategory[];
    }
  });
}

export function useTodaysLaunches() {
  return useQuery({
    queryKey: ['startups', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('status', 'live')
        .eq('launch_date', today)
        .order('upvote_count', { ascending: false });
      
      if (error) throw error;
      return data as unknown as StartupWithCategory[];
    }
  });
}

export function useLeaderboard(period: 'daily' | 'weekly' | 'monthly', categorySlug?: string | null) {
  return useQuery({
    queryKey: ['leaderboard', period, categorySlug],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      let query = supabase
        .from('startups')
        .select(`*,category:categories!category_id(*)`)
        .eq('status', 'live')
        .gte('created_at', startDate.toISOString())
        .order('upvote_count', { ascending: false })
        .limit(10);
      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        if (category) {
          query = query.eq('category_id', category.id);
        } else {
          return [];
        }
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as StartupWithDetails[];
    }
  });
}

export function useStartupDetails(startupId: string) {
  return useQuery({
    queryKey: ['startup', startupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', startupId)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as StartupWithDetails;
    },
    enabled: !!startupId
  });
}

export function useMyStartups() {
  const auth = useAuth();
  const user = auth?.user;
  return useQuery({
    queryKey: ['my-startups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as (Startup & { category: Category })[];
    },
    enabled: !!user
  });
}

export function useCreateStartup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (startup: {
      name: string;
      tagline: string;
      description: string;
      website_url?: string | null;
      logo_url?: string;
      video_url?: string | null;
      category_id: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // 🔐 FIX 5: Hard safety - Prevent multiple pending submissions
      const { data: pending } = await supabase
        .from('startups')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (pending) {
        throw new Error('You already have a startup under review. Please wait for it to go live or be rejected.');
      }

      // 🔑 STEP 1: Get latest cycle
      const { data: lastStartup } = await supabase
        .from('startups')
        .select('submission_cycle')
        .eq('user_id', user.id)
        .order('submission_cycle', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextCycle = (lastStartup?.submission_cycle ?? 0) + 1;

      console.log('🌀 [CP-STARTUP-1] Creating startup with new cycle', nextCycle);

      // 🔑 STEP 2: Insert startup with new cycle
      const { data, error } = await supabase
        .from('startups')
        .insert({
          ...startup,
          user_id: user.id,
          status: 'pending',
          submission_cycle: nextCycle,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Startup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['startups'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create startup');
    },
  });
}

export function useUpvote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      startupId,
      hasUpvoted,
    }: {
      startupId: string;
      hasUpvoted: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      if (hasUpvoted) {
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('startup_id', startupId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('upvotes')
          .insert({ startup_id: startupId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['user-upvotes'] });
    },
  });
}

export function useUserUpvotes() {
  const auth = useAuth();
  const user = auth?.user;
  return useQuery({
    queryKey: ['user-upvotes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('upvotes')
        .select('startup_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(u => u.startup_id);
    },
    enabled: !!user
  });
}

// Helper function to find active submission cycle
async function getActiveSubmissionCycle(userId: string) {
  const { data } = await supabase
    .from('startups')
    .select('submission_cycle')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('submission_cycle', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.submission_cycle ?? null;
}

export function useStartupsToValidate() {
  const auth = useAuth();
  const user = auth?.user;

  return useQuery({
    queryKey: ['startups-to-validate', user?.id],
    queryFn: async () => {
      if (!user) {
        return { data: [], meta: { reason: 'NO_USER' as const, required: REQUIRED_VALIDATIONS, validated: 0, eligible: 0 } };
      }

      // 🔑 1. Get active submission cycle
      const activeCycle = await getActiveSubmissionCycle(user.id);

      console.log('🌀 [CP-VALIDATE-1] Active cycle:', activeCycle);

      if (!activeCycle) {
        console.log('🟡 No active submission → optional validation mode');
        return { data: [], meta: { reason: 'NO_ACTIVE_CYCLE' as const, required: REQUIRED_VALIDATIONS, validated: 0, eligible: 0 } };
      }

      // 🔑 2. Fetch eligible startups (live + pending, not own)
      const { data: eligibleStartups, error: startupError } = await supabase
        .from('startups')
        .select('id')
        .in('status', ['live', 'pending'])
        .neq('user_id', user.id);

      if (startupError) throw startupError;

      const eligibleCount = eligibleStartups?.length || 0;

      if (eligibleCount === 0) {
        console.log('⚠️ No eligible startups exist');
        return { 
          data: [], 
          meta: { 
            reason: 'NO_AVAILABLE_STARTUPS', 
            required: REQUIRED_VALIDATIONS, 
            validated: 0, 
            eligible: 0 
          } 
        };
      }

      // 🔑 3. Fetch validations for THIS cycle only
      const { data: myValidations, error: validationError } = await supabase
        .from('validations')
        .select('startup_id')
        .eq('user_id', user.id)
        .eq('submission_cycle', activeCycle);

      if (validationError) throw validationError;

      const validatedIds = new Set(myValidations?.map(v => v.startup_id));
      const validatedCount = validatedIds.size;

      // 🔑 4. Filter unvalidated startups
      const unvalidated = eligibleStartups.filter(
        s => !validatedIds.has(s.id)
      );

      console.log('🧮 [CP-VALIDATE-2]', {
        eligible: eligibleCount,
        validated: validatedCount,
        unvalidated: unvalidated.length,
      });

      // 🔧 FIX 1 & 2: Ecosystem-aware empty state
      if (unvalidated.length === 0) {
        if (validatedCount >= REQUIRED_VALIDATIONS) {
          console.log('🟢 Validation complete for this cycle');
          return { 
            data: [], 
            meta: { 
              reason: 'OK', 
              required: REQUIRED_VALIDATIONS, 
              validated: validatedCount, 
              eligible: eligibleCount 
            } 
          };
        } else {
          // Not enough validations performed, but also no startups left to validate
          console.log('🟡 Ecosystem too small for required validations');
          return { 
            data: [], 
            meta: { 
              reason: 'NO_AVAILABLE_STARTUPS', 
              required: REQUIRED_VALIDATIONS, 
              validated: validatedCount, 
              eligible: eligibleCount 
            } 
          };
        }
      }

      // 🔑 5. Fetch full startup data
      const { data, error } = await supabase
        .from('startups')
        .select(`*, category:categories(*)`)
        .in('id', unvalidated.map(s => s.id))
        .order('created_at', { ascending: true })
        .limit(REQUIRED_VALIDATIONS);

      if (error) throw error;

      return { 
        data: data as StartupWithCategory[], 
        meta: { 
          reason: 'OK', 
          required: REQUIRED_VALIDATIONS, 
          validated: validatedCount, 
          eligible: eligibleCount 
        } 
      };
    },
    enabled: !!user,
  });
}

export function useTotalStartupCount() {
  return useQuery({
    queryKey: ['total-startup-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('startups')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });
}

export function useUpdateStartupStatus() {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const user = auth?.user;
  
  return useMutation({
    mutationFn: async ({ startupId, status, rejectionReason }: { startupId: string; status: 'live' | 'rejected'; rejectionReason?: string }) => {
      if (!startupId) throw new Error('startupId is required');
      console.log('🔄 useUpdateStartupStatus: Starting update for startup', startupId, 'to status', status);
      console.log('🔄 useUpdateStartupStatus: Current user:', user?.id);

      // Try Edge Function only
      try {
        console.log('🔄 useUpdateStartupStatus: Attempting Edge Function call...');
        const { data, error } = await supabase.functions.invoke('update-startup-status', {
          body: {
            startupId,
            status,
            rejectionReason
          }
        });

        if (error) {
          console.warn('🔄 useUpdateStartupStatus: Edge Function failed:', error);
          throw error;
        }

        if (data?.error) {
          console.warn('🔄 useUpdateStartupStatus: Edge Function returned error:', data.error);
          throw new Error(data.error);
        }

        console.log('🔄 useUpdateStartupStatus: Edge Function succeeded:', data.data);
        return data.data as Startup;
      } catch (functionError) {
        // SECURITY FIX: Do not fall back to direct DB update to prevent privilege escalation
        throw new Error('Moderation service unavailable. Please try again later.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['startups', 'live'] });
    },
    onError: (error) => {
      console.error('useUpdateStartupStatus: Mutation error:', error);
      toast.error('Failed to update startup status: ' + error.message);
    }
  });
}