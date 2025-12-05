import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlySalesChartProps {
  data: Array<{ name: string; sales: number }>;
  selectedYear: number;
}

const MonthlySalesChart = ({ data, selectedYear }: MonthlySalesChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ventes Mensuelles {selectedYear}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}€`} />
            <Tooltip 
              formatter={(value) => [`${value}€`, "Ventes"]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="sales" fill="#8884d8" name="Ventes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlySalesChart;