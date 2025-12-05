import { ProductImage } from "./product/ProductImage";
import { ProductInfo } from "./product/ProductInfo";
import { ConsumeButton } from "./product/ConsumeButton";
import { StockTransferDialog } from "./admin/stock/StockTransferDialog";
import { StockAdjustmentDialog } from "./product/StockAdjustmentDialog";
import { StockReportDialog } from "./product/StockReportDialog";
import { useAdmin } from "@/hooks/use-admin";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product } from "@/hooks/use-products";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
}

export const ProductCard = ({ id, name, price, quantity, image, stock = 0 }: ProductCardProps) => {
  const { isAdmin } = useAdmin();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const product = {
    id,
    name,
    price,
    stock,
    fridge_stock: quantity,
    image_url: image,
    description: null,
    category: 'Autres',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', id);

      if (error) {
        console.error('Error checking favorite:', error);
        return;
      }

      setIsFavorite(data.length > 0);
    };

    checkFavorite();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter des favoris");
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);

        if (error) throw error;
        toast.success("Retiré des favoris");
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: id
          });

        if (error) throw error;
        toast.success("Ajouté aux favoris");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      <ProductImage
        image={image}
        name={name}
        quantity={quantity}
      />
      <ProductInfo name={name} price={price} quantity={quantity} />
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between gap-2">
          {isAdmin ? (
            <StockTransferDialog
              product={product}
              onTransferComplete={() => {}}
            />
          ) : (
            <StockReportDialog
              productId={id}
              productName={name}
            />
          )}
          
          <div className="flex-1 flex justify-center mx-2">
            <ConsumeButton
              productId={id}
              price={price}
              disabled={quantity <= 0}
              productName={name}
            />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <StockAdjustmentDialog
                product={product}
                onAdjustComplete={() => {}}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="w-8"
              onClick={toggleFavorite}
              disabled={isLoading}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};