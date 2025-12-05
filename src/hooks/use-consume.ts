import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useConsume = () => {
  const [isConsuming, setIsConsuming] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const consume = async (productId: string, price: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour consommer un produit");
      return { success: false };
    }

    try {
      setIsConsuming(true);
      
      // Vérifier le stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('fridge_stock')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        console.error('Erreur lors de la vérification du stock:', productError);
        toast.error("Erreur lors de la vérification du stock");
        return { success: false };
      }

      if (product.fridge_stock <= 0) {
        toast.error("Produit en rupture de stock");
        return { success: false };
      }

      // Récupérer le solde actuel (pour le calcul du nouveau solde)
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (balanceError) {
        console.error('Erreur lors de la vérification du solde:', balanceError);
        toast.error("Erreur lors de la vérification de votre solde");
        return { success: false };
      }

      // Démarrer une transaction Supabase
      // 1. Mettre à jour le stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ fridge_stock: product.fridge_stock - 1 })
        .eq('id', productId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du stock:', updateError);
        toast.error("Erreur lors de la mise à jour du stock");
        return { success: false };
      }

      // 2. Créer la transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          product_id: productId,
          user_id: user.id,
          type: 'purchase',
          amount: -price,
        });

      if (transactionError) {
        console.error('Erreur lors de la création de la transaction:', transactionError);
        // Annuler la mise à jour du stock
        await supabase
          .from('products')
          .update({ fridge_stock: product.fridge_stock })
          .eq('id', productId);
        toast.error("Erreur lors de la création de la transaction");
        return { success: false };
      }

      // 3. Mettre à jour le solde
      const currentBalance = Number(balanceData.amount);
      const newBalance = currentBalance - price;
      const { error: updateBalanceError } = await supabase
        .from('balances')
        .update({ amount: newBalance })
        .eq('user_id', user.id);

      if (updateBalanceError) {
        console.error('Erreur lors de la mise à jour du solde:', updateBalanceError);
        // Annuler les opérations précédentes
        await supabase
          .from('products')
          .update({ fridge_stock: product.fridge_stock })
          .eq('id', productId);
        await supabase
          .from('transactions')
          .delete()
          .eq('product_id', productId)
          .eq('user_id', user.id)
          .eq('type', 'purchase')
          .gt('created_at', new Date(Date.now() - 1000).toISOString());
        
        toast.error("Erreur lors de la mise à jour du solde");
        return { success: false };
      }

      // Invalider les queries pour rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['balance', user.id] });
      
      toast.success("Produit consommé avec succès");
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la consommation:', error);
      toast.error("Une erreur est survenue lors de la consommation du produit");
      return {
        success: false
      };
    } finally {
      setIsConsuming(false);
    }
  };

  return { consume, isConsuming };
};