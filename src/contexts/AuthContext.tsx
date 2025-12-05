import { createContext, useContext, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSession } from '@/hooks/use-session';
import { useAuthEvents } from '@/hooks/use-auth-events';
import { signIn, signUp, signOut } from '@/utils/auth-methods';
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { username: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, setUser, setLoading } = useSession();
  
  useEffect(() => {
    console.log('AuthProvider mounted, initial state:', { user, loading });

    // Check for password reset flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      console.log('Password reset flow detected');
    }

    return () => {
      console.log('AuthProvider unmounting');
    };
  }, []);

  useAuthEvents(setUser);

  if (loading) {
    console.log('AuthProvider is loading...');
    return <div>Loading...</div>;
  }

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password);
      } catch (error) {
        console.error('Sign in error:', error);
        toast.error('Erreur lors de la connexion');
        throw error;
      }
    },
    signUp,
    signOut,
  };

  console.log('AuthProvider rendering with state:', { user, loading });
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}