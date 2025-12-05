import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MinusCircle } from "lucide-react";
import { Product } from "@/hooks/use-products";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStockAdjustmentForm } from "@/hooks/use-stock-adjustment-form";
import { StockAdjustmentForm } from "./StockAdjustmentForm";

interface StockAdjustmentDialogProps {
  product: Product;
  onAdjustComplete: () => void;
}

export const StockAdjustmentDialog = ({
  product,
  onAdjustComplete,
}: StockAdjustmentDialogProps) => {
  const {
    isOpen,
    setIsOpen,
    newQuantity,
    setNewQuantity,
    reason,
    setReason,
    isLoading,
    handleSubmit
  } = useStockAdjustmentForm(product, onAdjustComplete);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ajuster le stock du frigo (retrait de produits défectueux ou autres raisons)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuster le stock frigo - {product.name}</DialogTitle>
        </DialogHeader>
        <StockAdjustmentForm
          product={product}
          newQuantity={newQuantity}
          setNewQuantity={setNewQuantity}
          reason={reason}
          setReason={setReason}
          onCancel={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};