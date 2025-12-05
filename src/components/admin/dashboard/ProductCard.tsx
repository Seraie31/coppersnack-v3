import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ProductCard = () => {
  return (
    <Link to="/admin/products" className="block transition-transform hover:scale-105">
      <Card className="h-full cursor-pointer hover:border-primary">
        <CardHeader className="flex flex-row items-center gap-2 p-4">
          <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          <CardTitle className="text-lg">Ajouter un produit</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            Ajoutez de nouveaux produits à votre inventaire
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};