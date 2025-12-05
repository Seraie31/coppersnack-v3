import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

export const AdminRoute = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAdmin) {
    toast.error("Accès non autorisé");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};