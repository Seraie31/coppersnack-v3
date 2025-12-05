import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/error-handler";
import { Product } from "@/hooks/use-products";
import { toast } from "sonner";

interface UseProductListProps {
  searchQuery: string;
  selectedCategory: string;
  showFavorites: boolean;
}

export const useProductList = ({ searchQuery, selectedCategory, showFavorites }: UseProductListProps) => {
  return useQuery({
    queryKey: ["products", searchQuery, selectedCategory, showFavorites],
    queryFn: async () => {
      try {
        console.log("Starting product fetch with params:", {
          showFavorites,
          searchQuery,
          selectedCategory,
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          toast.error("Erreur lors de la récupération de l'utilisateur");
          throw userError;
        }

        console.log("Current user in ProductList:", {
          id: user?.id,
          authenticated: !!user,
        });

        if (showFavorites) {
          if (!user) {
            console.log("No user found for favorites");
            return [];
          }

          console.log("Fetching favorites for user:", user.id);
          const { data: favorites, error: favoritesError } = await supabase
            .from("favorites")
            .select("product_id");

          if (favoritesError) {
            console.error("Error fetching favorites:", favoritesError);
            toast.error("Erreur lors du chargement des favoris");
            throw favoritesError;
          }

          console.log("Found favorites:", favorites);
          const favoriteIds = favorites.map((f) => f.product_id);

          if (favoriteIds.length === 0) {
            console.log("No favorites found");
            return [];
          }

          let query = supabase
            .from("products")
            .select("*")
            .in("id", favoriteIds)
            .order("name");

          if (searchQuery) {
            console.log("Applying search filter:", searchQuery);
            query = query.ilike("name", `%${searchQuery}%`);
          }

          if (selectedCategory !== "Tous") {
            console.log("Applying category filter:", selectedCategory);
            query = query.eq("category", selectedCategory);
          }

          const { data, error } = await query;

          if (error) {
            console.error("Error fetching favorite products:", error);
            toast.error("Erreur lors du chargement des produits favoris");
            throw error;
          }

          console.log("Fetched favorite products:", data);
          return data || [];
        } else {
          console.log("Fetching all products");
          let query = supabase.from("products").select("*").order("name");

          if (searchQuery) {
            console.log("Applying search filter:", searchQuery);
            query = query.ilike("name", `%${searchQuery}%`);
          }

          if (selectedCategory !== "Tous") {
            console.log("Applying category filter:", selectedCategory);
            query = query.eq("category", selectedCategory);
          }

          const { data, error } = await query;

          if (error) {
            console.error("Error fetching products:", error);
            toast.error("Erreur lors du chargement des produits");
            throw error;
          }

          console.log("Fetched products:", {
            count: data?.length || 0,
            firstProduct: data?.[0],
          });
          return data || [];
        }
      } catch (error) {
        console.error("ProductList error:", error);
        handleError(error, "ProductList - fetching products");
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });
};