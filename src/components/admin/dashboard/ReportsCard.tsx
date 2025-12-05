import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ReportsCard = () => {
  return (
    <Link to="/admin/reports" className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          <CardTitle className="text-lg">Signalements</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            Gérez les signalements de rupture de stock
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};