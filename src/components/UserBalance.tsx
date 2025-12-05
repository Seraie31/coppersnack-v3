import { cn } from "@/lib/utils";

interface UserBalanceProps {
  balance: number;
}

export const UserBalance = ({ balance }: UserBalanceProps) => {
  return (
    <div className="bg-background border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-semibold">
          Votre solde {balance >= 0 ? "😊" : "😢"}
        </h2>
        <p className={cn(
          "text-2xl font-bold animate-fade-in",
          balance >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {balance.toFixed(2)} €
        </p>
      </div>
    </div>
  );
};