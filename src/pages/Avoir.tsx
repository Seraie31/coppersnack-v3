import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const Avoir = () => {
  const navigate = useNavigate();
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  // Récupérer le total des soldes positifs
  const { data: totalPositiveBalance = 0, refetch } = useQuery({
    queryKey: ['total-positive-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balances')
        .select('amount')
        .gt('amount', 0);

      if (error) {
        console.error('Error fetching positive balances:', error);
        throw error;
      }

      return data.reduce((sum, balance) => sum + Number(balance.amount), 0);
    }
  });

  const handleTransferToCse = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (amount > totalPositiveBalance) {
      toast.error("Le montant du transfert ne peut pas être supérieur à la valeur en caisse");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un transfert");
        return;
      }

      // Créer la transaction de retrait pour la caisse avoir
      const { error: avoirError } = await supabase
        .from('avoir_transactions')
        .insert({
          amount: amount,
          type: 'withdrawal',
          description: 'Transfert vers la caisse CSE'
        });

      if (avoirError) {
        console.error('Erreur lors du retrait avoir:', avoirError);
        toast.error("Une erreur est survenue lors du retrait");
        return;
      }

      // Créer la transaction de dépôt pour la caisse CSE
      const { error: cseError } = await supabase
        .from('transactions')
        .insert({
          amount: amount,
          type: 'cse',
          user_id: user.id
        });

      if (cseError) {
        console.error('Erreur lors du dépôt CSE:', cseError);
        toast.error("Une erreur est survenue lors du transfert vers la caisse CSE");
        return;
      }

      await refetch();
      
      toast.success(`Transfert de ${amount.toFixed(2)}€ effectué avec succès`);
      setWithdrawalAmount("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur est survenue lors du transfert");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Caisse Avoir
          </h1>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Valeur en Caisse</h3>
                  <p className="text-2xl font-bold text-green-500">
                    {totalPositiveBalance.toFixed(2)}€
                  </p>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold">Retrait de caisse</h3>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={withdrawalAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setWithdrawalAmount(value);
                        }
                      }}
                      placeholder="Montant à retirer"
                      className="max-w-[200px]"
                    />
                    <Button onClick={handleTransferToCse}>
                      Transférer vers CSE
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Avoir;