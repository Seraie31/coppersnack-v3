import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, MinusCircle } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Product } from "@/hooks/use-products";
import { ProductEditForm } from "./ProductEditForm";
import { ProductDeleteDialog } from "./ProductDeleteDialog";
import { StockTransferDialog } from "../admin/stock/StockTransferDialog";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";

interface ProductTableProps {
  products: Product[];
  onUpdate: (product: Product) => Promise<boolean>;
  onDelete: (product: Product) => Promise<void>;
}

export const ProductTable = ({ products, onUpdate, onDelete }: ProductTableProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const calculateStockValue = (price: number, quantity: number) => {
    return (price * quantity).toFixed(2);
  };

  return (
    <div className="w-full">
      <div className="min-w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] min-w-[120px]">Nom</TableHead>
              <TableHead className="w-[10%] min-w-[80px]">Prix</TableHead>
              <TableHead className="w-[10%] min-w-[60px]">Stock Réserve</TableHead>
              <TableHead className="w-[10%] min-w-[60px]">Stock Frigo</TableHead>
              <TableHead className="w-[15%] min-w-[80px]">Valeur Totale</TableHead>
              <TableHead className="w-[25%] min-w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className={`font-medium ${isMobile ? "whitespace-nowrap overflow-hidden relative after:absolute after:right-0 after:top-0 after:h-full after:w-8 after:bg-gradient-to-r after:from-transparent after:to-background" : ""}`}>
                  {product.name}
                </TableCell>
                <TableCell>{product.price.toFixed(2)} €</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.fridge_stock}</TableCell>
                <TableCell>
                  {calculateStockValue(product.price, product.stock + product.fridge_stock)} €
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Sheet open={isOpen && selectedProduct?.id === product.id} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Modifier le produit</SheetTitle>
                      </SheetHeader>
                      {selectedProduct && (
                        <ProductEditForm
                          product={selectedProduct}
                          onSave={onUpdate}
                          onClose={() => {
                            setIsOpen(false);
                            setSelectedProduct(null);
                          }}
                        />
                      )}
                    </SheetContent>
                  </Sheet>
                  <StockTransferDialog 
                    product={product} 
                    onTransferComplete={() => onUpdate(product)}
                  />
                  <StockAdjustmentDialog
                    product={product}
                    onAdjustComplete={() => onUpdate(product)}
                  />
                  <ProductDeleteDialog
                    product={product}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};