import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductEditFormProps {
  product: Product;
  onSave: (product: Product) => Promise<boolean>;
  onClose: () => void;
}

export const ProductEditForm = ({ product, onSave, onClose }: ProductEditFormProps) => {
  const [editedName, setEditedName] = useState(product.name);
  const [editedPrice, setEditedPrice] = useState(product.price.toString());
  const [editedQuantity, setEditedQuantity] = useState(product.stock.toString());
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(product.category || "Autres");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${product.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const success = await onSave({
      ...product,
      name: editedName,
      price: parseFloat(editedPrice),
      stock: parseInt(editedQuantity),
      image_url: imageUrl,
      category: category,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Product Details */}
        <div className="col-span-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input
            id="name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Nom du produit"
            className="mt-1.5"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Snacks">Snacks</SelectItem>
              <SelectItem value="Boissons">Boissons</SelectItem>
              <SelectItem value="Autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1">
          <Label htmlFor="price">Prix (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
            placeholder="0.00"
            className="mt-1.5"
          />
        </div>

        <div className="col-span-1">
          <Label htmlFor="quantity">Stock</Label>
          <Input
            id="quantity"
            type="number"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(e.target.value)}
            placeholder="0"
            className="mt-1.5"
          />
        </div>

        {/* Upload Button */}
        <div className="col-span-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image")?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Téléchargement...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Changer l'image
              </div>
            )}
          </Button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Annuler
        </Button>
        <Button className="w-full" onClick={handleSave}>
          Sauvegarder
        </Button>
      </div>

      {/* Image Preview - Now below the save button */}
      {imageUrl && (
        <div className="col-span-2 relative aspect-video bg-muted rounded-lg overflow-hidden mt-4">
          <img 
            src={imageUrl} 
            alt={editedName} 
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};