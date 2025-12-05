import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "./use-products";

export const useStockTransfer = (product: Product, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleTransfer = async (
    quantity: number,
    direction: "toFridge"
  ) => {
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Veuillez entrer une quantité valide");
      return false;
    }

    if (quantity > product.stock) {
      toast.error("Stock insuffisant dans la réserve");
      return false;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return false;
      }

      // Calcul des nouveaux stocks
      const newStock = product.stock - quantity;
      const newFridgeStock = product.fridge_stock + quantity;

      console.log('Début du transfert:', {
        productId: product.id,
        currentStock: product.stock,
        currentFridgeStock: product.fridge_stock,
        quantity,
        newStock,
        newFridgeStock
      });

      // Mise à jour optimiste du cache
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(p => {
          if (p.id === product.id) {
            return {
              ...p,
              stock: newStock,
              fridge_stock: newFridgeStock
            };
          }
          return p;
        });
      });

      const { data, error } = await supabase.rpc('transfer_stock', {
        p_product_id: product.id,
        p_new_stock: newStock,
        p_new_fridge_stock: newFridgeStock
      });

      if (error) {
        console.error('Erreur lors du transfert:', error);
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.error("Erreur lors du transfert");
        return false;
      }

      console.log('Transfert réussi:', data);
      
      await queryClient.invalidateQueries({ 
        queryKey: ['products'],
        refetchType: 'all'
      });

      toast.success("Transfert effectué avec succès");
      onSuccess?.();
      return true;

    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.error("Erreur lors du transfert");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleTransfer
  };
};