import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalAvoir: number;
  onTransferComplete: () => void;
}

export const TransferDialog = ({
  isOpen,
  onOpenChange,
  totalAvoir,
  onTransferComplete,
}: TransferDialogProps) => {
  const [transferAmount, setTransferAmount] = useState("");
  const queryClient = useQueryClient();

  const handleTransferToCse = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    if (amount > totalAvoir) {
      toast.error("Le montant du transfert ne peut pas être supérieur à la valeur en caisse");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer un transfert");
        return;
      }

      // Créer la transaction de retrait pour la caisse avoir avec un montant négatif
      const { error: avoirError } = await supabase
        .from('avoir_transactions')
        .insert({
          amount: -amount, // Montant négatif pour un retrait
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

      // Invalider les requêtes pour forcer le rafraîchissement des données
      await queryClient.invalidateQueries({ queryKey: ['avoir-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['total-positive-balances'] });

      onTransferComplete();
      toast.success(`Transfert de ${amount.toFixed(2)}€ effectué avec succès`);
      setTransferAmount("");
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Une erreur est survenue lors du transfert");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfert vers la caisse CSE</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Montant à transférer
            </label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={transferAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setTransferAmount(value);
                }
              }}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleTransferToCse}>
              Transférer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};