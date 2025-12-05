import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFrigoConsumption = () => {
  return useQuery({
    queryKey: ['frigo-consumption'],
    queryFn: async () => {
      console.log('Fetching frigo consumption...');
      
      // Fetch both purchases and withdrawals for non-cancelled transactions only
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .in('type', ['purchase', 'withdrawal'])
        .eq('cancelled', false);

      if (error) {
        console.error('Error fetching frigo consumption:', error);
        throw error;
      }

      if (!transactions) {
        console.log('No transaction data found');
        return 0;
      }

      // Calculer le total des consommations (purchases) en valeur absolue
      const purchases = transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      // Calculer le total des retraits vers la caisse CSE
      const withdrawals = transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      // La valeur en caisse est la somme des consommations moins les retraits
      const total = purchases - withdrawals;
      
      console.log('Calculated frigo consumption:', {
        purchases,
        withdrawals,
        total
      });
      
      return total;
    },
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
    gcTime: 0 // Ne pas garder les données en cache
  });
};