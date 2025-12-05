import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceCardProps {
  totalPositive: number;
  totalNegative: number;
}

export const BalanceCard = ({ totalPositive, totalNegative }: BalanceCardProps) => {
  return (
    <Link to="/admin/balances" className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          <CardTitle className="text-lg">Solde Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Soldes Positifs</span>
              <span className="text-green-500 font-bold">
                {totalPositive.toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Soldes Négatifs</span>
              <span className="text-red-500 font-bold">
                {totalNegative.toFixed(2)}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};