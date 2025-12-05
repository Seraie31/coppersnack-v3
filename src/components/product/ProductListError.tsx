interface ProductListErrorProps {
  message?: string;
}

export const ProductListError = ({ message = "Une erreur est survenue lors du chargement des produits" }: ProductListErrorProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-red-500">{message}</p>
    </div>
  );
};