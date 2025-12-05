import { Navigation } from "@/components/Navigation";
import StatisticsCharts from "@/components/StatisticsCharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Statistics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Statistiques
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Visualisez les tendances de ventes et la répartition par catégorie
              </p>
            </div>
          </div>
          <StatisticsCharts />
        </div>
      </main>
    </div>
  );
};

export default Statistics;