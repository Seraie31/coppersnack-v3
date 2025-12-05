import { BarChart as BarChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatisticsCard = () => {
  return (
    <Link to="/admin/statistics" className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <BarChartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          <CardTitle className="text-lg">Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            Visualisez les tendances de ventes et la répartition par catégorie
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};