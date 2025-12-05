import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  // Récupérer les soldes des utilisateurs
  const { data: balances = [] } = useQuery({
    queryKey: ['balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balances')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer les transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer les produits
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Calcul des totaux
  const totalPositive = balances
    .filter((balance) => balance.amount > 0)
    .reduce((sum, balance) => sum + Number(balance.amount), 0);

  const totalNegative = balances
    .filter((balance) => balance.amount < 0)
    .reduce((sum, balance) => sum + Number(balance.amount), 0);

  const totalStockValue = products.reduce((total, product) => {
    return total + (Number(product.price) * product.stock);
  }, 0);

  // Calcul des totaux pour la caisse CSE (type: 'cse')
  const totalCSE = transactions
    .filter(transaction => transaction.type === 'cse')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalCSEWithdrawals = transactions
    .filter(transaction => transaction.type === 'cse' && transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount)), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tableau de bord
            </h1>
          </div>

          <DashboardCards
            totalPositive={totalPositive}
            totalNegative={totalNegative}
            totalStockValue={totalStockValue}
            totalCSE={totalCSE}
            totalCSEWithdrawals={totalCSEWithdrawals}
          />
        </div>
      </main>
    </div>
  );
};

export default Admin;