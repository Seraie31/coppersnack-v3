interface ProductInfoProps {
  name: string;
  price: number;
  quantity: number;
}

export const ProductInfo = ({ name, price, quantity }: ProductInfoProps) => (
  <div className="p-4 space-y-2">
    <h3 className="font-semibold truncate">{name}</h3>
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold">{price.toFixed(2)} €</span>
      <span className={`text-sm ${quantity > 0 ? "text-green-500" : "text-red-500"}`}>
        {quantity} en stock
      </span>
    </div>
  </div>
);