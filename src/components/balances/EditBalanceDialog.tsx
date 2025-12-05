import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserDisplayName } from "@/utils/user-display";
import type { Balance } from "@/types/balance";

interface EditBalanceDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedUser: Balance | null;
  newBalance: string;
  setNewBalance: (value: string) => void;
  onUpdateBalance: (userId: string) => void;
}

export const EditBalanceDialog = ({
  isOpen,
  setIsOpen,
  selectedUser,
  newBalance,
  setNewBalance,
  onUpdateBalance,
}: EditBalanceDialogProps) => {
  const isValidNewBalance = newBalance !== '' && !isNaN(Number(newBalance));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le solde</DialogTitle>
          <DialogDescription>
            Modifiez le solde de {selectedUser ? getUserDisplayName(selectedUser) : "l'utilisateur"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="balance" className="text-sm font-medium">
              Nouveau solde (€)
            </label>
            <Input
              id="balance"
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="Entrez le nouveau solde"
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => onUpdateBalance(selectedUser?.user_id || '')}
              disabled={!isValidNewBalance}
            >
              Mettre à jour
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};