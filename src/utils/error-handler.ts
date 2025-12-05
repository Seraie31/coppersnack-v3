import { toast } from "sonner";

export const handleError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    toast.error(`Une erreur est survenue: ${error.message}`);
  } else {
    toast.error("Une erreur inattendue est survenue");
  }
};