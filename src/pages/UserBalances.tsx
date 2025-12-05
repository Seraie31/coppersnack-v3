import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BalanceFilters } from "@/components/balances/BalanceFilters";
import { BalanceTotals } from "@/components/balances/BalanceTotals";
import { UserBalancesList } from "@/components/balances/UserBalancesList";
import { EditBalanceDialog } from "@/components/balances/EditBalanceDialog";
import { useBalancesManagement } from "@/hooks/use-balances-management";

const UserBalances = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    balanceFilter,
    setBalanceFilter,
    selectedUser,
    setSelectedUser,
    newBalance,
    setNewBalance,
    isOpen,
    setIsOpen,
    balances,
    isLoading,
    totalPositive,
    totalNegative,
    handleUpdateBalance,
  } = useBalancesManagement();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>Chargement des soldes...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold whitespace-nowrap">
            Soldes Utilisateurs
          </h1>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <BalanceFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                balanceFilter={balanceFilter}
                setBalanceFilter={setBalanceFilter}
              />
              <BalanceTotals
                totalPositive={totalPositive}
                totalNegative={totalNegative}
                balanceFilter={balanceFilter}
              />
              <UserBalancesList
                balances={balances}
                onEditBalance={user => {
                  setSelectedUser(user);
                  setNewBalance(user.amount.toString());
                  setIsOpen(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      <EditBalanceDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedUser={selectedUser}
        newBalance={newBalance}
        setNewBalance={setNewBalance}
        onUpdateBalance={handleUpdateBalance}
      />
    </div>
  );
};

export default UserBalances;