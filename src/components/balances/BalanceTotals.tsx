import { Card } from "@/components/ui/card";

interface BalanceTotalsProps {
  totalPositive: number;
  totalNegative: number;
  balanceFilter: string;
}

export const BalanceTotals = ({ totalPositive, totalNegative, balanceFilter }: BalanceTotalsProps) => {
  const shouldShowPositive = balanceFilter === 'all' || balanceFilter === 'positive';
  const shouldShowNegative = balanceFilter === 'all' || balanceFilter === 'negative';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {shouldShowPositive && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Total Soldes Positifs</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalPositive.toFixed(2)}€
          </p>
        </div>
      )}
      {shouldShowNegative && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Total Soldes Négatifs</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {totalNegative.toFixed(2)}€
          </p>
        </div>
      )}
    </div>
  );
};