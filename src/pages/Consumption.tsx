import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFrigoConsumption } from "@/hooks/use-frigo-consumption";

const Consumption = () => {
  const navigate = useNavigate();
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const { data: totalTransactions = 0, refetch } = useFrigoConsumption();

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (amount > totalTransactions) {
      toast.error("Le montant du retrait ne peut pas être supérieur à la valeur en caisse");
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un retrait");
        return;
      }

      // Créer la transaction de retrait pour la caisse frigo
      const { error: withdrawalError } = await supabase
        .from('transactions')
        .insert({
          amount: -amount,
          type: 'withdrawal',
          user_id: user.id
        });

      if (withdrawalError) {
        console.error('Erreur lors du retrait:', withdrawalError);
        toast.error("Une erreur est survenue lors du retrait");
        return;
      }

      // Créer la transaction de dépôt pour la caisse CSE
      const { error: depositError } = await supabase
        .from('transactions')
        .insert({
          amount: amount,
          type: 'cse',
          user_id: user.id
        });

      if (depositError) {
        console.error('Erreur lors du dépôt CSE:', depositError);
        toast.error("Une erreur est survenue lors du transfert vers la caisse CSE");
        return;
      }

      await refetch();
      
      toast.success(`Retrait de ${amount.toFixed(2)}€ effectué avec succès et transféré vers la caisse CSE`);
      setWithdrawalAmount("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur est survenue lors du retrait");
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
            Caisse Frigo
          </h1>
        </div>

        <div className="flex flex-col gap-4 sm:gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold mb-2">Valeur en Caisse</h3>
                  <p className={`text-2xl font-bold ${totalTransactions >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalTransactions.toFixed(2)}€
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
                    <Button onClick={handleWithdrawal}>
                      Effectuer le retrait
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

export default Consumption;