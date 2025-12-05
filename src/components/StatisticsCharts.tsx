import { useYearSelection } from "@/hooks/useYearSelection";
import { useMonthlySales, useAverageConsumption, useProductConsumption, useStockAdjustments } from "@/hooks/useStatistics";
import YearSelector from "./YearSelector";
import MonthlySalesChart from "./charts/MonthlySalesChart";
import ConsumptionChart from "./charts/ConsumptionChart";
import ProductConsumptionChart from "./charts/ProductConsumptionChart";
import StockAdjustmentsChart from "./charts/StockAdjustmentsChart";

const StatisticsCharts = () => {
  const { selectedYear, setSelectedYear, years } = useYearSelection();
  const { data: monthlySales = [] } = useMonthlySales(selectedYear);
  const { data: averageConsumption = [] } = useAverageConsumption(selectedYear);
  const { data: productConsumption = [] } = useProductConsumption();
  const { data: stockAdjustments = [] } = useStockAdjustments(selectedYear);

  return (
    <div className="grid gap-6">
      <YearSelector
        selectedYear={selectedYear}
        years={years}
        onYearChange={(value) => setSelectedYear(parseInt(value))}
      />
      <MonthlySalesChart data={monthlySales} selectedYear={selectedYear} />
      <ConsumptionChart data={averageConsumption} selectedYear={selectedYear} />
      <ProductConsumptionChart data={productConsumption} />
      <StockAdjustmentsChart data={stockAdjustments} selectedYear={selectedYear} />
    </div>
  );
};

export default StatisticsCharts;