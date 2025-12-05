import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { UsernameInput } from "./UsernameInput";
import { AuthHeader } from "./AuthHeader";
import { useAuthUI } from "@/hooks/use-auth-ui";
import { toast } from "sonner";

interface AuthUIProps {
  view?: "sign_in" | "sign_up";
}

export const AuthUI = ({ view = "sign_in" }: AuthUIProps) => {
  const {
    authView,
    username,
    isUsernameValid,
    setUsername,
    handleViewChange,
    handleBeforeSignUp
  } = useAuthUI(view);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8 animate-fade-in">
        <AuthHeader authView={authView} />

        {authView === "sign_up" && (
          <UsernameInput
            username={username}
            setUsername={setUsername}
            isUsernameValid={isUsernameValid}
          />
        )}

        <Auth
          supabaseClient={supabase}
          view={authView}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(234 88 12)',
                  brandAccent: 'rgb(249 115 22)',
                  inputBackground: 'transparent',
                  inputText: 'inherit',
                  inputBorder: 'hsl(var(--input))',
                },
              },
            },
            className: {
              container: 'space-y-4',
              label: 'block text-sm font-medium mb-2',
              input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              button: 'w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-md transition-colors',
              anchor: 'text-sm text-center block text-primary hover:text-primary/90',
              message: 'text-sm text-center text-muted-foreground',
            },
          }}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
                loading_button_label: 'Inscription en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: '',
              },
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: '',
              },
              forgotten_password: {
                email_label: 'Adresse email',
                button_label: 'Réinitialiser le mot de passe',
                loading_button_label: 'Envoi en cours...',
                link_text: 'Mot de passe oublié ?',
                confirmation_text: 'Vérifiez vos emails pour réinitialiser votre mot de passe'
              }
            },
          }}
          providers={[]}
          redirectTo="https://fridge-folks-harmony.lovable.app/auth/callback"
          {...(authView === "sign_up" && username ? {
            additionalData: {
              username: username.toLowerCase(),
            },
            beforeSignUp: handleBeforeSignUp,
          } : {})}
        />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {authView === "sign_in" ? "Pas encore de compte ?" : "Déjà un compte ?"}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleViewChange(authView === "sign_in" ? "sign_up" : "sign_in")}
          className="w-full text-sm text-primary hover:text-primary/90 transition-colors"
        >
          {authView === "sign_in" 
            ? "Créer un compte" 
            : "Se connecter"}
        </button>
      </Card>
    </div>
  );
};