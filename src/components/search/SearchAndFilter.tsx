import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  showFavorites: boolean;
  onFavoritesChange: (show: boolean) => void;
}

export const SearchAndFilter = ({ 
  onSearch, 
  onCategoryChange,
  showFavorites,
  onFavoritesChange 
}: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { categories, isLoading } = useCategories();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Input
        type="search"
        placeholder="Rechercher un produit..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="flex-1"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categories?.includes("Tous") ? "default" : "outline"}
          onClick={() => handleCategoryChange("Tous")}
          className="text-sm"
          size="sm"
        >
          Tous
        </Button>
        {(categories || []).map((category: string) => (
          <Button
            key={category}
            variant="outline"
            onClick={() => handleCategoryChange(category)}
            className="text-sm"
            size="sm"
          >
            {category}
          </Button>
        ))}
        <Button
          variant={showFavorites ? "default" : "outline"}
          onClick={() => onFavoritesChange(!showFavorites)}
          className="text-sm gap-2"
          size="sm"
        >
          <Heart className="h-4 w-4" />
          Favoris
        </Button>
      </div>
    </div>
  );
};