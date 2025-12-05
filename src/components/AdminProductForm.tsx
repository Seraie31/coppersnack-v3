import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ProductFormFields } from "./admin/product-form/ProductFormFields";
import { ImageUpload } from "./admin/product-form/ImageUpload";
import { SubmitButton } from "./admin/product-form/SubmitButton";

export const AdminProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    image: "",
    category: "Autres",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const calculateStockValue = () => {
    const price = parseFloat(formData.price) || 0;
    const quantity = parseInt(formData.quantity) || 0;
    return `${(price * quantity).toFixed(2)} €`;
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.quantity),
            fridge_stock: 0, // Initialiser le stock frigo à 0
            image_url: formData.image,
            category: formData.category,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Produit ajouté avec succès dans la réserve !");
      setFormData({ name: "", price: "", quantity: "", image: "", category: "Autres" });
      
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      toast.error("Erreur lors de l'ajout du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ajouter un nouveau produit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductFormFields
            formData={formData}
            onChange={handleFieldChange}
            stockValue={calculateStockValue()}
          />
          <ImageUpload
            image={formData.image}
            onImageChange={(url) => handleFieldChange("image", url)}
            productName={formData.name}
          />
          <SubmitButton
            isSubmitting={isSubmitting}
            disabled={isSubmitting || !formData.image}
          />
        </form>
      </CardContent>
    </Card>
  );
};