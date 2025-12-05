import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  fridge_stock: number;
  image_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Erreur lors du chargement des produits");
        throw error;
      }

      console.log('Products fetched:', data);
      return data as Product[];
    },
  });

  const handleDelete = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error("Error deleting product:", error);
      toast.error("Erreur lors de la suppression du produit");
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Produit supprimé avec succès");
  };

  const handleUpdate = async (product: Product): Promise<boolean> => {
    console.log('Updating product:', product);
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        fridge_stock: product.fridge_stock,
        category: product.category,
        image_url: product.image_url,
      })
      .eq("id", product.id);

    if (error) {
      console.error("Error updating product:", error);
      toast.error("Erreur lors de la mise à jour du produit");
      return false;
    }

    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast.success("Produit mis à jour avec succès");
    return true;
  };

  return {
    products,
    isLoading,
    handleDelete,
    handleUpdate,
  };
};