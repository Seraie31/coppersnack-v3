import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        console.log('Checking admin status for user:', user.id);

        // Check profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }

        console.log('Profile role:', profile?.role);

        // Check user_roles_table as backup
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles_table')
          .select('role')
          .eq('id', user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error fetching user role:', roleError);
        }

        console.log('User roles table role:', userRole?.role);

        // Determine admin status from all sources
        const isAdminInProfiles = profile?.role === 'admin';
        const isAdminInRoles = userRole?.role === 'admin';
        const isAdminInMetadata = user.user_metadata?.role === 'admin';
        
        const hasAdminRole = isAdminInProfiles || isAdminInRoles || isAdminInMetadata;
        
        console.log('Final admin status check:', {
          userId: user.id,
          profileRole: profile?.role,
          userRole: userRole?.role,
          metadataRole: user.user_metadata?.role,
          isAdminInProfiles,
          isAdminInRoles,
          isAdminInMetadata,
          hasAdminRole
        });

        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error("Erreur lors de la vérification des droits administrateur");
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkAdminStatus();

    // Set up subscription to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in useAdmin:', event, session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
};