import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign in error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const signUp = async (email: string, password: string, metadata: { username: string }) => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign up error:', error);
    toast.error(error.message);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    toast.error(error.message);
    throw error;
  }
};