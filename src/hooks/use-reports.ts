import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  stock: number;
  fridge_stock: number;
}

interface Report {
  id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

export const useReports = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      console.log("Fetching reports...");
      const { data: reports, error } = await supabase
        .from("stock_reports")
        .select(`
          id,
          product_id,
          created_at,
          product:products (
            id,
            name,
            stock,
            fridge_stock
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
        toast.error("Erreur lors du chargement des signalements");
        throw error;
      }

      console.log("Fetched reports:", reports);
      return reports as Report[];
    },
  });

  const markAsResolved = useMutation({
    mutationFn: async (reportId: string) => {
      console.log("Deleting report:", reportId);
      const { error } = await supabase
        .from("stock_reports")
        .delete()
        .eq("id", reportId);

      if (error) {
        console.error("Error deleting report:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Successfully deleted report");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Signalement supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting report:", error);
      toast.error("Erreur lors de la suppression du signalement");
    },
  });

  return {
    data,
    isLoading,
    error,
    markAsResolved: (reportId: string) => markAsResolved.mutate(reportId),
  };
};