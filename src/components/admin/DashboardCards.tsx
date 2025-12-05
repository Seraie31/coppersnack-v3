import { Receipt, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFrigoConsumption } from "@/hooks/use-frigo-consumption";
import { ProductCard } from "./dashboard/ProductCard";
import { BalanceCard } from "./dashboard/BalanceCard";
import { StockCard } from "./dashboard/StockCard";
import { CashRegisterCard } from "./CashRegisterCard";
import { AvoirRegisterCard } from "./AvoirRegisterCard";
import { ReportsCard } from "./dashboard/ReportsCard";
import { StatisticsCard } from "./dashboard/StatisticsCard";

interface DashboardCardsProps {
  totalPositive: number;
  totalNegative: number;
  totalStockValue: number;
  totalCSE: number;
  totalCSEWithdrawals: number;
}

export const DashboardCards = ({
  totalPositive,
  totalNegative,
  totalStockValue,
  totalCSE,
}: DashboardCardsProps) => {
  const { data: frigoConsumption = 0 } = useFrigoConsumption();
  const [fridgeStockValue, setFridgeStockValue] = useState(0);
  const [reserveStockValue, setReserveStockValue] = useState(0);

  useEffect(() => {
    const calculateStockValues = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('price, stock, fridge_stock');

      if (products) {
        const reserveValue = products.reduce((total, product) => 
          total + (product.price * product.stock), 0);
        const fridgeValue = products.reduce((total, product) => 
          total + (product.price * product.fridge_stock), 0);

        setReserveStockValue(reserveValue);
        setFridgeStockValue(fridgeValue);
      }
    };

    calculateStockValues();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard />
      <BalanceCard totalPositive={totalPositive} totalNegative={totalNegative} />
      <StockCard reserveStockValue={reserveStockValue} fridgeStockValue={fridgeStockValue} />
      
      <CashRegisterCard
        title="Caisse Frigo"
        icon={<Receipt className="h-5 w-5 sm:h-6 sm:w-6" />}
        to="/admin/consumption"
        description="Gérez la caisse et suivez les consommations"
        values={[
          {
            label: "Valeur en caisse",
            amount: frigoConsumption,
            forcePositiveColor: true
          }
        ]}
      />

      <AvoirRegisterCard />

      <CashRegisterCard
        title="Caisse CSE"
        icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
        to="/admin/cse"
        description="Gérez la caisse CSE"
        values={[
          {
            label: "Valeur en Caisse CSE",
            amount: totalCSE,
          }
        ]}
      />

      <ReportsCard />
      <StatisticsCard />
    </div>
  );
};