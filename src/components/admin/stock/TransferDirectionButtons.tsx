import { Button } from "@/components/ui/button";

interface TransferDirectionButtonsProps {
  direction: "toFridge";
  onDirectionChange: (direction: "toFridge") => void;
}

export const TransferDirectionButtons = ({
  direction,
  onDirectionChange,
}: TransferDirectionButtonsProps) => {
  return (
    <div>
      <Button
        type="button"
        variant="default"
        className="w-full"
        onClick={() => onDirectionChange("toFridge")}
      >
        Vers le frigo
      </Button>
    </div>
  );
};