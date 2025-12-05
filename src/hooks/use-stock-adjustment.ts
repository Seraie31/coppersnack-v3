import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "./use-products";

export const useStockAdjustment = (
  product: Product,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdjustment = async (newQuantity: number, reason: string) => {
    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from('products')
        .update({
          fridge_stock: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) {
        console.error('Error updating product stock:', updateError);
        throw updateError;
      }

      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error in handleAdjustment:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAdjustment
  };
};