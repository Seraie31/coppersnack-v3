import { Archive } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockCardProps {
  reserveStockValue: number;
  fridgeStockValue: number;
}

export const StockCard = ({ reserveStockValue, fridgeStockValue }: StockCardProps) => {
  return (
    <Link to="/admin/stock" className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <Archive className="h-5 w-5 sm:h-6 sm:w-6" />
          <CardTitle className="text-lg">Stock Réserve</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm text-muted-foreground mb-4">
              Consultez et gérez votre inventaire
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Valeur stock réserve</span>
                <span className="text-green-500 font-bold">
                  {reserveStockValue.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Valeur stock frigo</span>
                <span className="text-blue-500 font-bold">
                  {fridgeStockValue.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};