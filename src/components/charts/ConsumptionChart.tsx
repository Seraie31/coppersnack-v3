import { Card } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ConsumptionChartProps {
  data: Array<{ month: string; average: number }>;
  selectedYear: number;
}

const ConsumptionChart = ({ data, selectedYear }: ConsumptionChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Consommation Moyenne Mensuelle {selectedYear}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              label={{ 
                value: 'Unités consommées', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value) => [`${value} unités`, "Consommation moyenne"]}
              labelFormatter={(label) => `Mois: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#8884d8"
              name="Consommation moyenne"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ConsumptionChart;