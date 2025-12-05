import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopUpForm } from "@/components/TopUpForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/hooks/use-balance";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: balance = 0 } = useBalance(user);
  const [userProfile, setUserProfile] = useState<{ username: string | null } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        console.log('Fetching profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          if (error.code === 'PGRST116') {
            console.log('Profile not found');
            setUserProfile(null);
          } else {
            toast.error('Erreur lors du chargement du profil');
          }
          return;
        }

        console.log('Profile data:', data);
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Erreur lors du chargement du profil');
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleTopUp = async (amount: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour recharger votre compte");
      return;
    }

    try {
      console.log('Top-up requested:', amount);

      // Créer une transaction pour le rechargement
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'topup'
        });

      if (transactionError) throw transactionError;

      // Mettre à jour le solde
      const { error: balanceError } = await supabase
        .from('balances')
        .update({
          amount: balance + amount
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Invalider le cache pour forcer le rafraîchissement
      await queryClient.invalidateQueries({ queryKey: ['balance', user.id] });

      toast.success(`Compte rechargé de ${amount.toFixed(2)}€`);
    } catch (error) {
      console.error('Error during top-up:', error);
      toast.error("Une erreur est survenue lors du rechargement");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Carte du profil utilisateur */}
          <Card className="md:col-span-2 animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Informations du profil</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vos informations personnelles
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Nom d'utilisateur
                </h3>
                <p className="text-lg font-semibold">
                  {userProfile?.username || 'Chargement...'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Carte du solde */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Votre solde</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solde actuel de votre compte
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-4xl font-bold",
                balance >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {balance.toFixed(2)} €
              </p>
            </CardContent>
          </Card>

          {/* Formulaire de rechargement */}
          <TopUpForm onTopUp={handleTopUp} />
        </div>
      </main>
    </div>
  );
};

export default Profile;