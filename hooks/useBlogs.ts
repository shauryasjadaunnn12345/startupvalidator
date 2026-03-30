import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Blog } from '@/types/blog';

/* ----------------------------------
   Fetch all blogs (FIXED)
-----------------------------------*/
export function useBlogs() {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        // ❌ removed status + published_at filters (root cause)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
  });
}

/* ----------------------------------
   Fetch single blog by slug
-----------------------------------*/
export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Blog | null;
    },
    enabled: !!slug,
  });
}

/* ----------------------------------
   Create blog (unchanged, correct)
-----------------------------------*/
export function useCreateBlog() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blogs')
        .insert({
          ...payload,
          author_id: user.id,
          status: payload.published ? 'published' : 'draft',
          published_at: payload.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Blog;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}
