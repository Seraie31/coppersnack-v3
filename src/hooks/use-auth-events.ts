import { useEffect } from 'react';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuthEvents = (setUser: (user: any) => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session?.user);
      
      if (session?.user) {
        setUser(session.user);
        console.log('User session updated:', session.user);
      } else {
        setUser(null);
        console.log('User signed out or session ended');
      }

      switch (event) {
        case 'SIGNED_IN':
          toast.success('Connexion réussie');
          navigate('/', { replace: true });
          break;
        case 'SIGNED_OUT':
          toast.success('Déconnexion réussie');
          navigate('/', { replace: true });
          break;
        case 'USER_UPDATED':
          toast.success('Profil mis à jour');
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed successfully');
          break;
        case 'INITIAL_SESSION':
          // Ne rien faire ici, la session est déjà gérée par initSession
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setUser]);
};