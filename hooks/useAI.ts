import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AIValidationResult {
  approved: boolean;
  score: number;
  feedback: string;
  reasoning: string;
}

export function useAIValidation() {
  return useMutation({
    mutationFn: async (startupData: {
      name: string;
      tagline: string;
      description: string;
      category: string;
      website_url?: string;
    }): Promise<AIValidationResult> => {
      console.log('🧠 [AI] Requesting server-side validation');

      const { data, error } = await supabase.functions.invoke(
        'ai-validate-startup',
        {
          body: startupData,
        }
      );

      if (error) {
        console.error('🧠 [AI] Edge function error:', error);
        throw new Error('AI validation failed');
      }

      if (!data || typeof data.approved !== 'boolean') {
        console.error('🧠 [AI] Invalid AI response:', data);
        throw new Error('Invalid AI response');
      }

      return data as AIValidationResult;
    },
  });
}
