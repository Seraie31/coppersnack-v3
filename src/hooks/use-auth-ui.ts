import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthUI = (view: "sign_in" | "sign_up" = "sign_in") => {
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">(view);
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  useEffect(() => {
    const handleAuthError = (error: Error) => {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Veuillez confirmer votre email avant de vous connecter');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect');
      } else if (error.message.includes('User already registered')) {
        toast.error('Un compte existe déjà avec cette adresse email');
      } else {
        console.error('Auth error:', error);
        toast.error('Une erreur est survenue. Veuillez réessayer.');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Vérifier si le profil existe déjà
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingProfile) {
            // Créer le profil si il n'existe pas
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: session.user.user_metadata.username || username,
                role: 'user'
              });

            if (profileError) {
              console.error('Error creating profile:', profileError);
              toast.error('Erreur lors de la création du profil');
              return;
            }
          }
          
          toast.success('Connexion réussie !');
        } catch (error) {
          console.error('Profile creation error:', error);
          toast.error('Erreur lors de la création du profil');
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthView('sign_in');
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.success('Les instructions de récupération ont été envoyées à votre email');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [username]);

  const handleViewChange = (newView: "sign_in" | "sign_up") => {
    setAuthView(newView);
    setUsername("");
    setIsUsernameValid(true);
  };

  const checkUsername = async (username: string) => {
    if (!username || username.trim() === '') {
      setIsUsernameValid(false);
      return false;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    const isValid = !data && !error;
    setIsUsernameValid(isValid);
    return isValid;
  };

  const handleBeforeSignUp = async (e: Event) => {
    e.preventDefault();
    console.log('handleBeforeSignUp called with username:', username);
    
    if (!username || username.trim() === '') {
      toast.error('Le nom d\'utilisateur est obligatoire');
      setIsUsernameValid(false);
      return false;
    }
    
    const isValid = await checkUsername(username);
    if (!isValid) {
      toast.error('Ce nom d\'utilisateur est déjà pris ou invalide');
      return false;
    }
    
    return true;
  };

  return {
    authView,
    username,
    isUsernameValid,
    setUsername,
    handleViewChange,
    handleBeforeSignUp
  };
};