import { SearchAndFilter } from "@/components/search/SearchAndFilter";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
}

export const DashboardHeader = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showFavorites,
  setShowFavorites,
}: DashboardHeaderProps) => {
  return (
    <div className="space-y-4">
      <SearchAndFilter
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        showFavorites={showFavorites}
        onFavoritesChange={setShowFavorites}
      />
    </div>
  );
};