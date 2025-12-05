interface EmptyProductListProps {
  showFavorites: boolean;
}

export const EmptyProductList = ({ showFavorites }: EmptyProductListProps) => {
  return (
    <div className="text-center py-8 animate-fade-in">
      <p className="text-muted-foreground">
        {showFavorites ? "Vous n'avez pas encore de favoris" : "Aucun produit trouvé"}
      </p>
    </div>
  );
};