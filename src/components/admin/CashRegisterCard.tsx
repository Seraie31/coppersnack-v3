import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface CashRegisterCardProps {
  title: string;
  icon: React.ReactNode;
  to: string;
  description: string;
  values: {
    label: string;
    amount: number;
    isNegative?: boolean;
    forcePositiveColor?: boolean;
  }[];
}

export const CashRegisterCard = ({
  title,
  icon,
  to,
  description,
  values,
}: CashRegisterCardProps) => {
  return (
    <Link to={to} className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
            <div className="flex flex-col gap-2">
              {values.map((value, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{value.label}</span>
                  <span className={`font-bold ${
                    value.forcePositiveColor ? "text-green-500" :
                    value.isNegative ? "text-red-500" : "text-green-500"
                  }`}>
                    {value.amount.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};