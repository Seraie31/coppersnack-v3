import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategories = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      // Extraire les catégories uniques
      const categories = [...new Set(products.map(p => p.category))];
      return categories.filter(Boolean).sort();
    }
  });

  return { categories: data, isLoading };
};