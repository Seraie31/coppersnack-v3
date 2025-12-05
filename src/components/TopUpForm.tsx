import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTopUp } from "@/hooks/use-top-up";
import { AmountInput } from "./top-up/AmountInput";

interface TopUpFormProps {
  onTopUp: (amount: number) => void;
}

export const TopUpForm = ({ onTopUp }: TopUpFormProps) => {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { topUp, isLoading } = useTopUp(user, onTopUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    await topUp(numAmount);
    setAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réapprovisionner votre solde</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AmountInput value={amount} onChange={setAmount} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Chargement..." : "Ajouter au solde"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};