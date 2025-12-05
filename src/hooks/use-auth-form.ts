import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true });
      } else if (event === 'USER_UPDATED' && session) {
        toast.success('Email confirmé avec succès !');
        navigate('/', { replace: true });
      }
    });

    // Vérifier si nous avons un token de confirmation dans l'URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      navigate('/', { replace: true });
      return;
    }

    // Gérer les messages d'erreur de Supabase Auth
    const searchParams = new URLSearchParams(window.location.search);
    const errorDescription = searchParams.get('error_description');
    
    if (errorDescription) {
      toast.error(errorDescription);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
};