import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/AuthForm";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProductList } from "@/components/ProductList";
import { QuickActions } from "@/components/QuickActions";

const Index = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    console.log("Index component mounted");
    console.log("Current user state:", user);
  }, [user]);

  if (!user) {
    console.log("No user found, showing AuthForm");
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-4 sm:py-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:gap-6 max-w-5xl mx-auto">
          <QuickActions />
          <DashboardHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            showFavorites={showFavorites}
            setShowFavorites={setShowFavorites}
          />
          <ProductList
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            showFavorites={showFavorites}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;