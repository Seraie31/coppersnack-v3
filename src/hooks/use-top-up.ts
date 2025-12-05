import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export const useTopUp = (user: User | null, onSuccess?: (amount: number) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const topUp = async (amount: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour recharger votre solde");
      return;
    }

    try {
      setIsLoading(true);
      console.log('Début de la recharge pour:', user.id);
      
      // Create transaction first with the correct type
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'topup',
          product_id: null
        });

      if (transactionError) {
        console.error('Erreur lors de la création de la transaction:', transactionError);
        throw transactionError;
      }

      // Then update balance
      const { data: currentBalance, error: balanceError } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (balanceError) {
        console.error('Erreur lors de la récupération du solde:', balanceError);
        throw balanceError;
      }

      const newBalance = Number(currentBalance.amount) + amount;
      console.log('Solde actuel:', currentBalance.amount, 'Nouveau solde:', newBalance);

      const { error: updateError } = await supabase
        .from('balances')
        .update({ amount: newBalance })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du solde:', updateError);
        throw updateError;
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['balance', user.id] });

      toast.success("Solde mis à jour", {
        description: `Nouveau solde : ${newBalance.toFixed(2)}€`
      });

      console.log('Recharge réussie');
      onSuccess?.(amount);
    } catch (error) {
      console.error('Erreur lors de la recharge:', error);
      toast.error("Une erreur est survenue lors de la recharge");
    } finally {
      setIsLoading(false);
    }
  };

  return { topUp, isLoading };
};