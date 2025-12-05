import { Navigation } from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Données mockées pour l'exemple
const mockUsers = [
  { id: 1, name: "Jean Dupont", balance: 25.50 },
  { id: 2, name: "Marie Martin", balance: -5.75 },
  { id: 3, name: "Pierre Durant", balance: 12.30 },
  { id: 4, name: "Sophie Bernard", balance: -2.25 },
  { id: 5, name: "Lucas Petit", balance: 8.90 },
];

const Users = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground mt-2">Consultez les soldes des utilisateurs</p>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        user.balance >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {user.balance.toFixed(2)} €
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Users;