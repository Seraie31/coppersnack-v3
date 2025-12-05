import { ProductCard } from "@/components/ProductCard";
import { ProductListSkeleton } from "./product/ProductListSkeleton";
import { ProductListError } from "./product/ProductListError";
import { EmptyProductList } from "./product/EmptyProductList";
import { useProductList } from "@/hooks/use-product-list";

interface ProductListProps {
  searchQuery: string;
  selectedCategory: string;
  showFavorites: boolean;
}

export const ProductList = ({ searchQuery, selectedCategory, showFavorites }: ProductListProps) => {
  const { data: products = [], isLoading, error } = useProductList({
    searchQuery,
    selectedCategory,
    showFavorites,
  });

  console.log("ProductList render state:", { 
    productsCount: products.length, 
    isLoading, 
    hasError: !!error,
    searchQuery,
    selectedCategory,
    showFavorites,
    error: error ? String(error) : null
  });

  if (error) {
    console.error("ProductList render error:", error);
    return <ProductListError />;
  }

  if (isLoading) {
    console.log("ProductList showing loading state");
    return <ProductListSkeleton />;
  }

  if (!products || products.length === 0) {
    console.log("ProductList showing empty state");
    return <EmptyProductList showFavorites={showFavorites} />;
  }

  console.log("ProductList rendering products:", {
    count: products.length,
    firstProduct: products[0]
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard
            id={product.id}
            name={product.name}
            price={product.price}
            quantity={product.fridge_stock}
            stock={product.stock}
            image={product.image_url || "/placeholder.svg"}
          />
        </div>
      ))}
    </div>
  );
};