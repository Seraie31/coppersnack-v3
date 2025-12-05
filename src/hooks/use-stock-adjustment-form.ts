import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/hooks/use-products";
import { useStockAdjustment } from "./use-stock-adjustment";

export const useStockAdjustmentForm = (
  product: Product,
  onSuccess?: () => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("defective");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { handleAdjustment } = useStockAdjustment(product, onSuccess);

  const resetForm = () => {
    setNewQuantity("");
    setReason("defective");
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!newQuantity || parseInt(newQuantity) < 0) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }

      const quantityChange = parseInt(newQuantity) > product.fridge_stock 
        ? parseInt(newQuantity) - product.fridge_stock  // Pour un ajout
        : product.fridge_stock - parseInt(newQuantity); // Pour un retrait

      // Ensure reason is set correctly based on the operation type
      const adjustmentReason = parseInt(newQuantity) > product.fridge_stock ? "restock" : reason;

      const { error: adjustmentError } = await supabase
        .from('stock_adjustments')
        .insert({
          product_id: product.id,
          admin_id: user.id,
          quantity_change: quantityChange,
          reason: adjustmentReason
        });

      if (adjustmentError) {
        console.error('Error recording stock adjustment:', adjustmentError);
        throw adjustmentError;
      }
      
      const success = await handleAdjustment(parseInt(newQuantity), adjustmentReason);
      if (success) {
        await queryClient.invalidateQueries({ 
          queryKey: ['products']
        });
        toast.success("Stock ajusté avec succès");
        resetForm();
      }
    } catch (error) {
      console.error('Error during stock adjustment:', error);
      toast.error("Erreur lors de l'ajustement du stock");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    newQuantity,
    setNewQuantity,
    reason,
    setReason,
    isLoading,
    handleSubmit,
    resetForm
  };
};