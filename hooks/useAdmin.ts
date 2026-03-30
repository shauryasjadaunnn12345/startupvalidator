import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Validation, Startup, Comment, Profile, Category, ValidationStatus, StartupStatus } from '@/types/database';
import { toast } from 'sonner';

interface ValidationWithDetails extends Validation {
  startup: Startup;
  profile: Profile;
}

interface StartupWithCategory extends Startup {
  category: Category;
  profile: Profile;
}

interface CommentWithDetails extends Comment {
  profile: Profile;
  startup: { id: string; name: string };
}

// Fetch all pending/flagged validations for admin review
export function usePendingValidations() {
  return useQuery({
    queryKey: ['admin', 'pending-validations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validations')
        .select(`
          *,
          startup:startups(id, name, tagline)
        `)
        .or('ai_status.eq.flagged,and(ai_status.eq.rejected,admin_status.is.null)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately since there's no FK
      const userIds = [...new Set(data.map(v => v.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(v => ({
        ...v,
        profile: profileMap.get(v.user_id) || null
      })) as unknown as ValidationWithDetails[];
    }
  });
}

// Fetch all validations for history
export function useAllValidations() {
  return useQuery({
    queryKey: ['admin', 'all-validations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('validations')
        .select(`
          *,
          startup:startups(id, name, tagline)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data.map(v => v.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(v => ({
        ...v,
        profile: profileMap.get(v.user_id) || null
      })) as unknown as ValidationWithDetails[];
    }
  });
}

// Update validation status (admin override)
export function useUpdateValidationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      validationId, 
      status, 
      reason 
    }: { 
      validationId: string; 
      status: ValidationStatus; 
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('validations')
        .update({
          admin_status: status,
          admin_reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', validationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['approved-validation-count'] });
      toast.success('Validation status updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    }
  });
}

// Fetch all startups for admin management
export function useAllStartups() {
  return useQuery({
    queryKey: ['admin', 'all-startups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('startups')
        .select(`
          *,
          category:categories(*),
          profile:profiles!startups_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as StartupWithCategory[];
    }
  });
}

// Update startup status
export function useUpdateStartupStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      startupId, 
      status, 
      rejectionReason,
      launchDate
    }: { 
      startupId: string; 
      status: StartupStatus; 
      rejectionReason?: string;
      launchDate?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
      
      if (launchDate) {
        updateData.launch_date = launchDate;
      }
      
      const { error } = await supabase
        .from('startups')
        .update(updateData)
        .eq('id', startupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      toast.success('Startup status updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    }
  });
}

// Fetch all comments for moderation
export function useAllComments() {
  return useQuery({
    queryKey: ['admin', 'all-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          startup:startups(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id) || null
      })) as unknown as CommentWithDetails[];
    }
  });
}

// Delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'all-comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    }
  });
}
import { useAuth } from "@/contexts/AuthContext";

/**
 * Simple admin guard hook
 * Used by BlogEditor, Admin routes, etc.
 */
export function useAdmin() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === "admin",
    user,
  };
}
