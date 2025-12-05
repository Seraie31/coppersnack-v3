import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMonthlySales = (selectedYear: number) => {
  return useQuery({
    queryKey: ['monthlySales', selectedYear],
    queryFn: async () => {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      console.log('Fetching monthly sales for year:', selectedYear);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('type', 'purchase')
        .eq('cancelled', false);
        
      if (error) throw error;

      console.log('Monthly sales data:', data);

      const monthlyData = Array(12).fill(0).map((_, index) => ({
        name: new Date(selectedYear, index).toLocaleString('default', { month: 'short' }),
        sales: 0
      }));

      data?.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].sales += Math.abs(Number(transaction.amount));
      });

      return monthlyData;
    },
    refetchInterval: 5000 // Rafraîchir toutes les 5 secondes
  });
};

export const useAverageConsumption = (selectedYear: number) => {
  return useQuery({
    queryKey: ['averageConsumption', selectedYear],
    queryFn: async () => {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      console.log('Fetching average consumption for year:', selectedYear);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, created_at, product_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('type', 'purchase')
        .eq('cancelled', false);
        
      if (error) throw error;

      console.log('Average consumption data:', data);

      const monthlyData = Array(12).fill(0).map((_, index) => ({
        month: new Date(selectedYear, index).toLocaleString('default', { month: 'short' }),
        average: 0
      }));

      const monthlyTransactions = new Array(12).fill(0);
      
      data?.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const monthIndex = date.getMonth();
        monthlyTransactions[monthIndex]++;
      });

      monthlyData.forEach((month, index) => {
        month.average = monthlyTransactions[index];
      });

      return monthlyData;
    },
    refetchInterval: 5000 // Rafraîchir toutes les 5 secondes
  });
};

export const useProductConsumption = () => {
  return useQuery({
    queryKey: ['productConsumption'],
    queryFn: async () => {
      console.log('Fetching product consumption...');
      
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'purchase')
        .eq('cancelled', false);
      
      if (transactionsError) throw transactionsError;

      console.log('Product consumption data:', { products, transactions });

      const productStats = products.map(product => {
        const consumed = transactions
          .filter(t => t.product_id === product.id)
          .length;

        return {
          name: product.name,
          consumed,
          stock: product.stock,
          threshold: Math.ceil(consumed * 0.2)
        };
      });

      return productStats.sort((a, b) => b.consumed - a.consumed);
    },
    refetchInterval: 5000 // Rafraîchir toutes les 5 secondes
  });
};

export const useStockAdjustments = (selectedYear: number) => {
  return useQuery({
    queryKey: ['stockAdjustments', selectedYear],
    queryFn: async () => {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      console.log('Fetching stock adjustments for year:', selectedYear);
      
      const { data, error } = await supabase
        .from('stock_adjustments')
        .select(`
          *,
          products (
            price
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
        
      if (error) throw error;

      console.log('Stock adjustments data:', data);

      const monthlyData = Array(12).fill(0).map((_, index) => ({
        month: new Date(selectedYear, index).toLocaleString('default', { month: 'short' }),
        losses: 0,
        count: 0
      }));

      data?.forEach(adjustment => {
        const date = new Date(adjustment.created_at);
        const monthIndex = date.getMonth();
        monthlyData[monthIndex].count++;
        
        // Calculate the monetary value of the adjustment
        const price = adjustment.products?.price || 0;
        monthlyData[monthIndex].losses += price * Math.abs(adjustment.quantity_change);
      });

      return monthlyData;
    },
    refetchInterval: 5000 // Rafraîchir toutes les 5 secondes
  });
};