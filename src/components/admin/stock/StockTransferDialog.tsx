import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";
import { Product } from "@/hooks/use-products";
import { useStockTransfer } from "@/hooks/use-stock-transfer";
import { TransferForm } from "./TransferForm";
import { useAdmin } from "@/hooks/use-admin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockTransferDialogProps {
  product: Product;
  onTransferComplete: () => void;
}

export const StockTransferDialog = ({
  product,
  onTransferComplete,
}: StockTransferDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const { isAdmin } = useAdmin();
  
  const { isLoading, handleTransfer } = useStockTransfer(product, () => {
    setIsOpen(false);
    setQuantity("");
    onTransferComplete();
  });

  if (!isAdmin) return null;

  const onTransfer = async () => {
    const success = await handleTransfer(parseInt(quantity), "toFridge");
    if (success) {
      setIsOpen(false);
      setQuantity("");
    }
  };

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
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Réapprovisionner le frigo depuis le stock</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réapprovisionner le frigo - {product.name}</DialogTitle>
        </DialogHeader>
        <TransferForm
          stockReserve={product.stock}
          stockFridge={product.fridge_stock}
          quantity={quantity}
          isLoading={isLoading}
          onQuantityChange={setQuantity}
          onTransfer={onTransfer}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};