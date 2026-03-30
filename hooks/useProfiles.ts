import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export function useProfiles(userIds: string[]) {
  return useQuery({
    queryKey: ['profiles', userIds],
    queryFn: async () => {
      if (!userIds || userIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!userIds && userIds.length > 0,
  });
}
