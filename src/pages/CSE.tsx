import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CseHeader } from "@/components/cse/CseHeader";
import { CseBalance } from "@/components/cse/CseBalance";
import { CseTransactionForm } from "@/components/cse/CseTransactionForm";

const CSE = () => {
  // Récupérer les transactions
  const { data: transactions = [], refetch } = useQuery({
    queryKey: ['cse-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'cse');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculer le total des transactions
  const totalTransactions = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CseHeader />

        <div className="flex flex-col gap-4 sm:gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <CseBalance totalTransactions={totalTransactions} />
                <CseTransactionForm 
                  type="deposit"
                  onSuccess={refetch}
                />
                <CseTransactionForm 
                  type="withdrawal"
                  onSuccess={refetch}
                  totalTransactions={totalTransactions}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CSE;