import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useBalance = (user: User | null) => {
  return useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      try {
        console.log('Fetching balance for user:', user.id);
        
        // Try to get the existing balance
        const { data: balances, error: selectError } = await supabase
          .from('balances')
          .select('amount')
          .eq('user_id', user.id);

        if (selectError) {
          console.error("Erreur lors de la récupération des données :", selectError);
          throw selectError;
        }

        // If no balance exists or multiple balances found
        if (!balances || balances.length === 0) {
          console.warn("Aucun solde trouvé pour l'utilisateur, création d'un nouveau solde");
          
          // Create a new balance
          const { data: newBalance, error: createError } = await supabase
            .from('balances')
            .insert({ user_id: user.id, amount: 0 })
            .select('amount')
            .single();
            
          if (createError) {
            console.error("Erreur lors de la création du solde :", createError);
            throw createError;
          }
          
          console.log("Nouveau solde créé :", newBalance);
          return newBalance.amount;
        }

        // Return the first balance if multiple exist (shouldn't happen due to RLS)
        console.log("Solde récupéré :", balances[0]);
        return balances[0].amount;
      } catch (error) {
        console.error('Error in balance query:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
  });
};