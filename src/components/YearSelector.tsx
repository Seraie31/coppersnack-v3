import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearSelectorProps {
  selectedYear: number;
  years: number[];
  onYearChange: (year: string) => void;
}

const YearSelector = ({ selectedYear, years, onYearChange }: YearSelectorProps) => {
  return (
    <div className="flex justify-end">
      <Select
        value={selectedYear.toString()}
        onValueChange={onYearChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sélectionner une année" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearSelector;