import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const DesktopMenu = () => {
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(error?.message || "Une erreur est survenue lors de la déconnexion");
    }
  };

  return (
    <div className="flex items-center space-x-2 py-2">
      <Link to="/">
        <Button variant="ghost" size="sm" className="text-sm">Produits</Button>
      </Link>
      {isAdmin && (
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="text-sm">ACCES CSE</Button>
        </Link>
      )}
      <Link to="/profile">
        <Button variant="ghost" size="sm" className="text-sm">Profil</Button>
      </Link>
      
      <div className="flex items-center space-x-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};