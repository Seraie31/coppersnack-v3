import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  image: string;
  onImageChange: (url: string) => void;
  productName: string;
}

export const ImageUpload = ({ image, onImageChange, productName }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Vous devez sélectionner une image");
      }

      const file = event.target.files[0];
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Vérification du type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error("Le fichier doit être une image");
      }

      // Vérification de la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("L'image ne doit pas dépasser 5MB");
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        throw new Error("Format d'image non supporté. Utilisez JPG, PNG, GIF ou WEBP");
      }

      // Lecture du fichier en tant que ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Génération d'un nom de fichier unique
      const fileName = `${Math.random()}.${fileExt}`;
      console.log('Generated filename:', fileName, 'with type:', file.type);

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(fileName, uint8Array, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Verify the URL is accessible
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error("L'URL de l'image n'est pas accessible");
      }

      onImageChange(publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Image du produit</Label>
      <div className="flex flex-col gap-4">
        {image && (
          <div className="relative w-full aspect-[16/9] bg-muted rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt={productName} 
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => {
                console.error(`Error loading image preview: ${image}`);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-upload")?.click()}
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
                {image ? "Changer l'image" : "Télécharger une image"}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};