import { Input } from "@/components/ui/input";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AmountInput = ({ value, onChange }: AmountInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="amount" className="text-sm font-medium">
        Montant à ajouter (€)
      </label>
      <Input
        id="amount"
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={handleChange}
        placeholder="0.00"
        required
      />
    </div>
  );
};