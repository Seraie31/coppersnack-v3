import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface StockAdjustmentsChartProps {
  data: Array<{ month: string; losses: number; count: number }>;
  selectedYear: number;
}

const StockAdjustmentsChart = ({ data, selectedYear }: StockAdjustmentsChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Ajustements de Stock {selectedYear}
      </h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8"
              label={{ value: 'Pertes (€)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
              label={{ value: 'Nombre d\'ajustements', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "Pertes") return `${value.toFixed(2)}€`;
                return `${value} ajustement${value > 1 ? 's' : ''}`;
              }}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="losses"
              fill="#8884d8"
              name="Pertes"
            />
            <Bar
              yAxisId="right"
              dataKey="count"
              fill="#82ca9d"
              name="Nombre d'ajustements"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Ce graphique montre les pertes dues aux vols, produits défectueux et autres ajustements de stock.</p>
      </div>
    </Card>
  );
};

export default StockAdjustmentsChart;