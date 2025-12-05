import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StockDisplay } from "./StockDisplay";

interface TransferFormProps {
  stockReserve: number;
  stockFridge: number;
  quantity: string;
  isLoading: boolean;
  onQuantityChange: (value: string) => void;
  onTransfer: () => void;
  onCancel: () => void;
}

export const TransferForm = ({
  stockReserve,
  stockFridge,
  quantity,
  isLoading,
  onQuantityChange,
  onTransfer,
  onCancel,
}: TransferFormProps) => {
  return (
    <div className="space-y-4">
      <StockDisplay stockReserve={stockReserve} stockFridge={stockFridge} />

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité à transférer vers le frigo</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={stockReserve}
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder="Entrez la quantité"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button 
          onClick={onTransfer} 
          disabled={isLoading || !quantity || parseInt(quantity) < 1 || parseInt(quantity) > stockReserve}
        >
          {isLoading ? "Transfert en cours..." : "Transférer"}
        </Button>
      </div>
    </div>
  );
};