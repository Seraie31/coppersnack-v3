import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileMenuButton = ({ 
  isOpen, 
  onToggle
}: MobileMenuButtonProps) => {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="h-8 w-8 transition-colors duration-200 hover:bg-accent"
      size="icon"
      type="button"
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>
  );
};