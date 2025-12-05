import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StockReportDialogProps {
  productId: string;
  productName: string;
}

export const StockReportDialog = ({
  productId,
  productName,
}: StockReportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleReport = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour signaler une rupture de stock");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("stock_reports")
        .insert({
          product_id: productId,
          user_id: user.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("Vous avez déjà signalé ce produit");
        } else {
          console.error("Error reporting stock:", error);
          toast.error("Une erreur est survenue lors du signalement");
        }
        return;
      }

      toast.success("Rupture de stock signalée avec succès");
      setIsOpen(false);
    } catch (error) {
      console.error("Error reporting stock:", error);
      toast.error("Une erreur est survenue lors du signalement");
    } finally {
      setIsLoading(false);
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
                <Flag className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Signaler une rupture de stock</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler une rupture de stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p>
            Voulez-vous signaler une rupture de stock pour le produit{" "}
            <span className="font-semibold">{productName}</span> ?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReport} 
              disabled={isLoading}
            >
              {isLoading ? "Signalement..." : "Signaler"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};