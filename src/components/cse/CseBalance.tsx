import { Card, CardContent } from "@/components/ui/card";

interface CseBalanceProps {
  totalTransactions: number;
}

export const CseBalance = ({ totalTransactions }: CseBalanceProps) => {
  return (
    <div className="p-4 bg-primary/10 rounded-lg">
      <h3 className="font-semibold mb-2">Valeur en Caisse</h3>
      <p className="text-2xl font-bold text-green-500">
        {totalTransactions.toFixed(2)}€
      </p>
    </div>
  );
};