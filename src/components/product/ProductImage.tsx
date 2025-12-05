import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface ProductImageProps {
  image: string;
  name: string;
  quantity: number;
}

export const ProductImage = ({ image, name, quantity }: ProductImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    console.error(`Error loading image for product: ${name}`);
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for product: ${name}`);
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className="p-4 bg-white rounded-t-lg">
      <AspectRatio ratio={4/3} className="relative bg-white">
        {isLoading && (
          <Skeleton className="absolute inset-0 rounded-lg animate-pulse" />
        )}
        {!hasError ? (
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className={`object-contain w-full h-full rounded-lg transition-all duration-300 ${
              isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-lg animate-fade-in gap-2">
            <ImageOff className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Image non disponible</p>
          </div>
        )}
        {quantity === 0 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg animate-fade-in">
            <p className="text-xl font-bold text-foreground">Rupture de stock</p>
          </div>
        )}
      </AspectRatio>
    </div>
  );
};