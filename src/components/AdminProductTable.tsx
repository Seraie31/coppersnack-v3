import { useProducts } from "@/hooks/use-products";
import { ProductTable } from "./product/ProductTable";

export const AdminProductTable = () => {
  const { products, isLoading, handleDelete, handleUpdate } = useProducts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-lg p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4">Produits existants</h2>
      <ProductTable
        products={products}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
};