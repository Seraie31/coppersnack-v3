import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/hooks/use-products";

interface StockAdjustmentFormProps {
  product: Product;
  newQuantity: string;
  setNewQuantity: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const StockAdjustmentForm = ({
  product,
  newQuantity,
  setNewQuantity,
  reason,
  setReason,
  onCancel,
  onSubmit,
  isLoading
}: StockAdjustmentFormProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Stock frigo actuel: {product.fridge_stock}</Label>
        <Input
          type="number"
          min="0"
          max="999"
          value={newQuantity}
          onChange={(e) => {
            setNewQuantity(e.target.value);
            // Set reason based on whether we're increasing or decreasing stock
            if (parseInt(e.target.value) > product.fridge_stock) {
              setReason("restock");
            } else if (parseInt(e.target.value) < product.fridge_stock) {
              setReason("defective");
            } else {
              setReason("defective"); // Default to defective when equal
            }
          }}
          placeholder="Nouvelle quantité"
        />
      </div>

      {parseInt(newQuantity) < product.fridge_stock && (
        <div className="space-y-2">
          <Label>Raison du retrait</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une raison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="defective">Produit défectueux</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading || !newQuantity || parseInt(newQuantity) < 0}
        >
          {isLoading ? "Ajustement..." : "Ajuster le stock"}
        </Button>
      </div>
    </div>
  );
};