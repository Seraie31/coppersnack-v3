interface StockDisplayProps {
  stockReserve: number;
  stockFridge: number;
}

export const StockDisplay = ({ stockReserve, stockFridge }: StockDisplayProps) => {
  return (
    <div className="flex justify-between text-sm">
      <div>
        <span className="font-semibold">Stock réserve:</span> {stockReserve}
      </div>
      <div>
        <span className="font-semibold">Stock frigo:</span> {stockFridge}
      </div>
    </div>
  );
};