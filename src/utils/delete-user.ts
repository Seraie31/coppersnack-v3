import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteUser = async (userId: string) => {
  try {
    // Delete the specified user
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId }
    });

    if (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      throw error;
    }

    // Reset CSE withdrawal transactions
    const { error: resetError } = await supabase
      .from('transactions')
      .delete()
      .eq('type', 'cse')
      .lt('amount', 0);

    if (resetError) {
      console.error('Error resetting CSE withdrawals:', resetError);
      toast.error('Erreur lors de la réinitialisation des retraits CSE');
      throw resetError;
    }

    toast.success('Utilisateur supprimé avec succès et retraits CSE réinitialisés');
    return data;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    toast.error('Une erreur est survenue lors de l\'opération');
    throw error;
  }
};