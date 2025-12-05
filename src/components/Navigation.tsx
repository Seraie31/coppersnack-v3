import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DesktopMenu } from "./navigation/DesktopMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export const Navigation = () => {
  const { signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    console.log("Déconnexion demandée");
    try {
      await signOut();
      // No need for toast here as it's handled in AuthContext
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      // Force client-side cleanup even if server-side logout failed
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    console.log('Changement de thème:', newTheme);
    setTheme(newTheme);
  };

  return (
    <nav className="bg-background border-b shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-end">
            <DesktopMenu />
          </div>
          <div className="text-sm font-medium text-primary text-center py-1">
            CopperSnack 2.0
          </div>
        </div>
      </div>
    </nav>
  );
};