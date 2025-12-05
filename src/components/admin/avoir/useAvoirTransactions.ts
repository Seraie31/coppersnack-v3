import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AvoirTransaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useAvoirTransactions = () => {
  return useQuery({
    queryKey: ['avoir-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avoir_transactions')
        .select('*');

      if (error) {
        console.error('Error fetching avoir transactions:', error);
        throw error;
      }

      // Cast the data to match our AvoirTransaction interface
      return (data || []).map(transaction => ({
        ...transaction,
        type: transaction.type as 'deposit' | 'withdrawal'
      })) as AvoirTransaction[];
    }
  });
};