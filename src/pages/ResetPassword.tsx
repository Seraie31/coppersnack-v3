import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        
        // Récupérer le code depuis l'URL
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");

        // Récupérer le type et le token depuis le hash de l'URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");
        const accessToken = hashParams.get("access_token");

        if (code) {
          console.log("Exchanging code for session...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Error exchanging code:", error);
            toast.error("Lien de réinitialisation invalide ou expiré");
            navigate("/");
            return;
          }
          if (data.session) {
            console.log("Session established successfully");
            setSessionEstablished(true);
          }
        } else if (type === "recovery" && accessToken) {
          console.log("Recovery flow detected with access token");
          setSessionEstablished(true);
        } else {
          console.log("No valid reset token or code found");
          toast.error("Lien de réinitialisation invalide");
          navigate("/");
        }
      } catch (error) {
        console.error("Session initialization error:", error);
        toast.error("Une erreur est survenue lors de l'initialisation");
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [location, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionEstablished) {
      toast.error("Session non initialisée");
      return;
    }

    if (!newPassword) {
      toast.error("Veuillez saisir un nouveau mot de passe");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast.success("Mot de passe mis à jour avec succès");
      navigate("/");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Réinitialisation du mot de passe
          </CardTitle>
          <CardDescription>
            Entrez votre nouveau mot de passe ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
                disabled={loading || !sessionEstablished}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !sessionEstablished}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;