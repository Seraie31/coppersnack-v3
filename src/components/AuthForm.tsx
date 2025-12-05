import { AuthUI } from "./auth/AuthUI";
import { useAuthForm } from "@/hooks/use-auth-form";

export const AuthForm = () => {
  useAuthForm();
  return <AuthUI />;
};