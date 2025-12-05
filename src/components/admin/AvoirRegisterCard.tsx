import { DollarSign } from "lucide-react";
import { CashRegisterCard } from "./CashRegisterCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const AvoirRegisterCard = () => {
  const { data: totalPositiveBalance = 0, refetch } = useQuery({
    queryKey: ['total-positive-balances'],
    queryFn: async () => {
      console.log('Fetching positive balances total');
      const { data, error } = await supabase
        .from('balances')
        .select('amount')
        .gt('amount', 0);

      if (error) {
        console.error('Error fetching positive balances:', error);
        throw error;
      }

      // Calculer le total des soldes positifs
      const total = data.reduce((sum, balance) => sum + Number(balance.amount), 0);
      console.log('Total positive balances calculated:', total);
      return total;
    }
  });

  useEffect(() => {
    // S'abonner aux changements de la table balances
    const channel = supabase
      .channel('balances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances'
        },
        async (payload) => {
          console.log('Balance change detected:', payload);
          await refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <CashRegisterCard
      title="Caisse Avoir"
      icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
      to="/admin/avoir"
      description="Gestion de la caisse avoir"
      values={[
        {
          label: "Valeur en caisse",
          amount: totalPositiveBalance,
        }
      ]}
    />
  );
};