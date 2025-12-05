import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import type { Balance } from "@/types/balance";

interface UserBalancesListProps {
  balances: Balance[];
  onEditBalance: (user: Balance) => void;
}

export const UserBalancesList = ({ balances, onEditBalance }: UserBalancesListProps) => {
  const getUserDisplayName = (user: Balance): string => {
    if (!user.profiles?.username) {
      const userId = user.user_id.slice(0, 8);
      return `Utilisateur ${userId}`;
    }
    return user.profiles.username;
  };

  return (
    <div className="space-y-2">
      {balances.map((user) => (
        <div
          key={user.user_id}
          className="flex justify-between items-center p-4 bg-card rounded-lg border"
        >
          <div className="flex flex-col">
            <span className="font-medium">
              {getUserDisplayName(user)}
            </span>
            {user.profiles?.role === 'admin' && (
              <span className="text-sm text-muted-foreground">
                Administrateur
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`font-bold ${
                user.amount >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {Number(user.amount).toFixed(2)}€
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditBalance(user)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};