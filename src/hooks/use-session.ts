import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    console.log('Setting up session management...');
    setIsMounted(true);

    const initSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          toast.error('Erreur de connexion à Supabase');
          if (isMounted) setUser(null);
          return;
        }
        
        if (session?.user && isMounted) {
          console.log('Active session found:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          });
          setUser(session.user);
          
          // Refresh the session if we have a refresh token
          if (session.refresh_token) {
            try {
              const { error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: session.refresh_token,
              });
              if (refreshError) {
                console.error('Session refresh error:', refreshError);
                toast.error('Erreur lors du rafraîchissement de la session');
              }
            } catch (refreshError) {
              console.error('Session refresh failed:', refreshError);
            }
          }
        } else {
          console.log('No active session');
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        toast.error('Erreur lors de l\'initialisation de la session');
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up session management...');
      subscription.unsubscribe();
      setIsMounted(false);
    };
  }, [isMounted]);

  return { user, loading, setUser, setLoading };
};