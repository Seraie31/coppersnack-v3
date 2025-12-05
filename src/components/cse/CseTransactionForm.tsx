import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";

interface CseTransactionFormProps {
  type: "deposit" | "withdrawal";
  onSuccess: (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>;
  totalTransactions?: number;
}

export const CseTransactionForm = ({ type, onSuccess, totalTransactions = 0 }: CseTransactionFormProps) => {
  const [amount, setAmount] = useState("");

  const handleTransaction = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (type === "withdrawal" && numAmount > totalTransactions) {
      toast.error("Le montant du retrait ne peut pas être supérieur à la valeur en caisse");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un retrait");
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          amount: type === "withdrawal" ? -numAmount : numAmount,
          type: 'cse',
          user_id: user.id
        });

      if (transactionError) {
        console.error(`Erreur lors du ${type === "withdrawal" ? "retrait" : "dépôt"}:`, transactionError);
        toast.error(`Une erreur est survenue lors du ${type === "withdrawal" ? "retrait" : "dépôt"}`);
        return;
      }

      await onSuccess();
      
      toast.success(`${type === "withdrawal" ? "Retrait" : "Dépôt"} de ${numAmount.toFixed(2)}€ effectué avec succès`);
      setAmount("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(`Une erreur est survenue lors du ${type === "withdrawal" ? "retrait" : "dépôt"}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">
        {type === "withdrawal" ? "Retrait de caisse" : "Dépôt en caisse"}
      </h3>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              setAmount(value);
            }
          }}
          placeholder={`Montant à ${type === "withdrawal" ? "retirer" : "déposer"}`}
          className="max-w-[200px]"
        />
        <Button 
          onClick={handleTransaction}
          className={type === "deposit" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          Effectuer le {type === "withdrawal" ? "retrait" : "dépôt"}
        </Button>
      </div>
    </div>
  );
};