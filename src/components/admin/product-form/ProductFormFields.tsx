import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormData {
  name: string;
  price: string;
  quantity: string;
  category: string;
}

interface ProductFormFieldsProps {
  formData: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string) => void;
  stockValue: string;
}

export const ProductFormFields = ({ formData, onChange, stockValue }: ProductFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Prix (€)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => onChange("price", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Snacks">Snacks</SelectItem>
            <SelectItem value="Boissons">Boissons</SelectItem>
            <SelectItem value="Autres">Autres</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="stockValue">Valeur du stock</Label>
        <Input
          id="stockValue"
          type="text"
          value={stockValue}
          readOnly
          className="bg-muted"
        />
      </div>
    </>
  );
};