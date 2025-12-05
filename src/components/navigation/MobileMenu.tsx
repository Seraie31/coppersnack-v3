import { Link } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { Coins, LogOut, Home, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const MobileMenu = ({ isOpen, onClose, onSignOut }: MobileMenuProps) => {
  const { isAdmin } = useAdmin();

  return (
    <div 
      className={`sm:hidden fixed inset-x-0 top-12 bg-background/95 backdrop-blur-sm border-b transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      } z-50`}
    >
      <div className="pt-2 pb-3 space-y-1">
        {/* Home Link */}
        <Link
          to="/"
          className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out"
          onClick={onClose}
        >
          <Home className="h-5 w-5 mr-3" />
          Accueil
        </Link>

        {/* Products Link */}
        <Link
          to="/admin/products"
          className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out"
          onClick={onClose}
        >
          <Package className="h-5 w-5 mr-3" />
          Produits
        </Link>
        
        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out"
          onClick={onClose}
        >
          <Coins className="h-5 w-5 mr-3" />
          Mon Solde
        </Link>

        {/* Admin Access */}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center px-4 py-3 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 ease-in-out"
            onClick={onClose}
          >
            <Settings className="h-5 w-5 mr-3" />
            ACCES CSE
          </Link>
        )}

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          onClick={() => {
            onSignOut();
            onClose();
          }}
          className="w-full justify-start px-4 py-3 text-base font-medium text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};