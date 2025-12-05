import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import ProductManagement from "@/pages/ProductManagement";
import StockManagement from "@/pages/StockManagement";
import UserBalances from "@/pages/UserBalances";
import Statistics from "@/pages/Statistics";
import Consumption from "@/pages/Consumption";
import CSE from "@/pages/CSE";
import Avoir from "@/pages/Avoir";
import Reports from "@/pages/Reports";
import ResetPassword from "@/pages/ResetPassword";

// Components
import { AdminRoute } from "@/components/AdminRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<Navigate to="/reset-password" replace />} />
              <Route path="/auth/reset-password" element={<Navigate to="/reset-password" replace />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<ProductManagement />} />
                <Route path="/admin/stock" element={<StockManagement />} />
                <Route path="/admin/balances" element={<UserBalances />} />
                <Route path="/admin/statistics" element={<Statistics />} />
                <Route path="/admin/consumption" element={<Consumption />} />
                <Route path="/admin/cse" element={<CSE />} />
                <Route path="/admin/avoir" element={<Avoir />} />
                <Route path="/admin/reports" element={<Reports />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;