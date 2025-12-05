import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShoppingCart } from "lucide-react";
import { useConsume } from "@/hooks/use-consume";

interface ConsumeButtonProps {
  productId: string;
  price: number;
  disabled?: boolean;
  productName: string;
}

export const ConsumeButton = ({ productId, price, disabled, productName }: ConsumeButtonProps) => {
  const { consume, isConsuming } = useConsume();

  const handleConsume = async () => {
    await consume(productId, price);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                disabled={disabled || isConsuming}
                variant="default"
                className="transition-all duration-200 hover:scale-105"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {price.toFixed(2)} €
              </Button>
            </TooltipTrigger>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la consommation</AlertDialogTitle>
              <AlertDialogDescription>
                Vous êtes sur le point de consommer {productName}. Voulez-vous continuer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConsume}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TooltipContent>
          <p>Cliquez pour consommer ce produit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};