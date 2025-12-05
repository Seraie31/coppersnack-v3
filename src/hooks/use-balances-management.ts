import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Balance } from "@/types/balance";

export const useBalancesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<Balance | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      console.log('Fetching balances with profiles...');
      const { data, error } = await supabase
        .from('balances')
        .select(`
          amount,
          user_id,
          profiles!inner (
            username,
            first_name,
            last_name,
            role
          )
        `);
      
      if (error) {
        console.error('Erreur lors de la récupération des soldes:', error);
        throw error;
      }
      
      console.log('Balances with profiles fetched:', data);
      return data as Balance[];
    },
  });

  useEffect(() => {
    console.log('Setting up realtime subscription...');
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['balances'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleUpdateBalance = async (userId: string) => {
    try {
      const numericBalance = Number(newBalance);
      
      if (isNaN(numericBalance)) {
        toast.error("Le montant doit être un nombre valide");
        return;
      }

      console.log('Updating balance for user:', userId, 'to:', numericBalance);

      // Mettre à jour le solde
      const { error: updateError } = await supabase
        .from('balances')
        .update({ amount: numericBalance })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du solde:', updateError);
        throw updateError;
      }

      // Enregistrer l'ajustement dans l'historique
      const { error: adjustmentError } = await supabase
        .from('balance_adjustments')
        .insert({
          user_id: userId,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          previous_amount: selectedUser?.amount || 0,
          new_amount: numericBalance,
          reason: "Ajustement manuel du solde"
        });

      if (adjustmentError) {
        console.error('Erreur lors de l\'enregistrement de l\'ajustement:', adjustmentError);
      }

      // Forcer une mise à jour immédiate des données
      await queryClient.invalidateQueries({ queryKey: ['balances'] });
      
      toast.success("Le solde a été mis à jour avec succès");
      setIsOpen(false);
      setNewBalance("");
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour du solde");
    }
  };

  const filteredBalances = balances.filter((balance) => {
    const userDisplayName = balance.profiles?.username?.toLowerCase() || '';
    const searchMatch = userDisplayName.includes(searchQuery.toLowerCase());
    
    let balanceMatch = true;
    if (balanceFilter === "positive") {
      balanceMatch = balance.amount > 0;
    } else if (balanceFilter === "negative") {
      balanceMatch = balance.amount < 0;
    } else if (balanceFilter === "zero") {
      balanceMatch = balance.amount === 0;
    }
    
    return searchMatch && balanceMatch;
  });

  const totalPositive = filteredBalances
    .filter((user) => user.amount > 0)
    .reduce((sum, user) => sum + Number(user.amount), 0);

  const totalNegative = filteredBalances
    .filter((user) => user.amount < 0)
    .reduce((sum, user) => sum + Number(user.amount), 0);

  return {
    searchQuery,
    setSearchQuery,
    balanceFilter,
    setBalanceFilter,
    selectedUser,
    setSelectedUser,
    newBalance,
    setNewBalance,
    isOpen,
    setIsOpen,
    balances: filteredBalances,
    isLoading,
    totalPositive,
    totalNegative,
    handleUpdateBalance,
  };
};