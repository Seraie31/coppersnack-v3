import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled: boolean;
}

export const SubmitButton = ({ isSubmitting, disabled }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full"
      disabled={disabled}
    >
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Ajout en cours...
        </div>
      ) : (
        "Ajouter le produit"
      )}
    </Button>
  );
};