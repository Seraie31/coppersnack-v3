import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BalanceFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  balanceFilter: string;
  setBalanceFilter: (filter: string) => void;
}

export const BalanceFilters = ({
  searchQuery,
  setSearchQuery,
  balanceFilter,
  setBalanceFilter,
}: BalanceFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <Select value={balanceFilter} onValueChange={setBalanceFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrer par solde" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les soldes</SelectItem>
          <SelectItem value="positive">Soldes positifs</SelectItem>
          <SelectItem value="negative">Soldes négatifs</SelectItem>
          <SelectItem value="zero">Soldes nuls</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};