import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBalance } from "@/hooks/use-balance";
import { useAuth } from "@/contexts/AuthContext";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: balance } = useBalance(user);

  // Normaliser le solde (nombre)
  const rawBalance =
    typeof balance === "number"
      ? balance
      : balance && typeof balance === "object"
      ? (balance as any).amount ?? 0
      : 0;

  const displayBalance = Number(rawBalance) || 0;

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <Button
        variant="default"
        onClick={() => navigate("/profile")}
        className="w-full sm:w-auto gap-2"
      >
        <Wallet className="h-4 w-4" />
        <span>Portefeuille: {displayBalance.toFixed(2)}€</span>
      </Button>
    </div>
  );
};
