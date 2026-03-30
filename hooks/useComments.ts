import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, CommentWithProfile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useComments(startupId: string) {
  return useQuery({
    queryKey: ['comments', startupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize into threaded comments
      const commentsMap = new Map<string, CommentWithProfile>();
      const rootComments: CommentWithProfile[] = [];

      (data as unknown as CommentWithProfile[]).forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      commentsMap.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    },
    enabled: !!startupId
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ startupId, content, parentId }: { 
      startupId: string; 
      content: string; 
      parentId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          startup_id: startupId,
          user_id: user.id,
          content,
          parent_id: parentId || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.startupId] });
      toast.success('Comment posted!');
    },
    onError: (error) => {
      toast.error('Failed to post comment: ' + error.message);
    }
  });
}
