import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductData {
  name: string;
  consumed: number;
  stock: number;
  threshold: number;
}

interface ProductConsumptionChartProps {
  data: ProductData[];
}

const ProductConsumptionChart = ({ data }: ProductConsumptionChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Consommation des Produits</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">Consommés: {data.consumed}</p>
                      <p className="text-sm">Stock actuel: {data.stock}</p>
                      <p className="text-sm text-muted-foreground">
                        Seuil critique: {data.threshold} unités
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="consumed" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.stock <= entry.threshold ? "#ef4444" : "#8884d8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8884d8]" />
          <span className="text-sm">Stock normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-sm">Stock critique (≤ {20}% de la consommation moyenne)</span>
        </div>
      </div>
    </Card>
  );
};

export default ProductConsumptionChart;