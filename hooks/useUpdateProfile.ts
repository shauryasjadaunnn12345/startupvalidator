import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile> & { user_id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', updates.user_id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.user_id] });
    },
  });
}
