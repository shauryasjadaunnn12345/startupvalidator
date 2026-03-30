import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Validation, ValidationWithStartup } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ----------------------------------
   Helpers
-----------------------------------*/
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

/* ----------------------------------
   Queries
-----------------------------------*/
export function useMyValidations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-validations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const cycle = await getActiveSubmissionCycle(user.id);
      if (!cycle) return [];

      const { data, error } = await supabase
        .from('validations')
        .select(`*, startup:startups(*)`)
        .eq('user_id', user.id)
        .eq('submission_cycle', cycle)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ValidationWithStartup[];
    },
    enabled: !!user,
  });
}

export function useApprovedValidationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['approved-validation-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const cycle = await getActiveSubmissionCycle(user.id);
      if (!cycle) return 0;

      const { count, error } = await supabase
        .from('validations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('submission_cycle', cycle)
        .eq('ai_status', 'approved');

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });
}

/**
 * ✅ FIX: This hook was missing
 * Used in StartupDetail.tsx
 */
export function useStartupValidations(startupId: string) {
  return useQuery({
    queryKey: ['startup-validations', startupId],
    queryFn: async () => {
      if (!startupId) return [];

      const { data, error } = await supabase
.from('validations')
.select('*')
.eq('startup_id', startupId)
.or('ai_status.eq.approved,admin_status.eq.approved')
.order('created_at', { ascending: false });


      if (error) throw error;
      return data as Validation[];
    },
    enabled: !!startupId,
  });
}

/* ----------------------------------
   Mutations
-----------------------------------*/
export function useCreateValidation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      startupId,
      content,
      startupName,
    }: {
      startupId: string;
      content: string;
      startupName: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const cycle = await getActiveSubmissionCycle(user.id);
      if (!cycle) throw new Error('No active submission cycle found');

      // ❌ Prevent self-validation
      const { data: startup } = await supabase
        .from('startups')
        .select('user_id')
        .eq('id', startupId)
        .single();

      if (startup?.user_id === user.id) {
        throw new Error('You cannot validate your own startup');
      }

      const { data, error } = await supabase
        .from('validations')
        .insert({
          startup_id: startupId,
          user_id: user.id,
          content,
          ai_status: 'pending',
          submission_cycle: cycle,
        })
        .select()
        .single();

      if (error) throw error;

      // 🔔 Trigger AI moderation
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (token) {
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-validation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              validationId: data.id,
              content,
              startupName,
            }),
          }
        ).catch(console.error);
      }

      return data as Validation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-validations'] });
      queryClient.invalidateQueries({ queryKey: ['approved-validation-count'] });
      queryClient.invalidateQueries({ queryKey: ['startup-validations'] });
      toast.success('Validation submitted. AI review in progress.');
    },
  });
}

export function useUpdateValidation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      validationId,
      content,
    }: {
      validationId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('validations')
        .update({ content, ai_status: 'pending' })
        .eq('id', validationId)
        .eq('user_id', user.id);

      if (error) throw error;

      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (token) {
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-validation`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ validationId, content }),
          }
        ).catch(console.error);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-validations'] });
      queryClient.invalidateQueries({ queryKey: ['approved-validation-count'] });
      queryClient.invalidateQueries({ queryKey: ['startup-validations'] });
      toast.success('Validation updated. Re-review started.');
    },
  });
}
