interface AuthHeaderProps {
  authView: "sign_in" | "sign_up";
}

export const AuthHeader = ({ authView }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {authView === "sign_up" ? "Créer un compte" : "Connexion"}
      </h1>
      <p className="text-muted-foreground">
        {authView === "sign_up" 
          ? "Rejoignez-nous pour commencer vos achats" 
          : "Connectez-vous pour continuer vos achats"}
      </p>
    </div>
  );
};