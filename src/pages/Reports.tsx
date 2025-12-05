import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/use-reports";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Reports = () => {
  const navigate = useNavigate();
  const { data: reports = [], markAsResolved } = useReports();

  const handleMarkAsResolved = async (reportId: string) => {
    await markAsResolved(reportId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Signalements</h1>
        </div>

        <div className="grid gap-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Aucun signalement en attente
                </div>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        {report.product.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Signalé le {format(new Date(report.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsResolved(report.id)}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Marquer comme traité
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stock en réserve</p>
                      <p className="font-medium">{report.product.stock} unités</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stock en frigo</p>
                      <p className="font-medium">{report.product.fridge_stock} unités</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;