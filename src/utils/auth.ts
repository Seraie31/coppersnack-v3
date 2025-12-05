import { supabase } from "@/integrations/supabase/client";

export const signInWithPassword = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUpWithPassword = async (
  email: string,
  password: string,
  metadata: { username: string }
) => {
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
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw error;
  }
};