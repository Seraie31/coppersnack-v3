import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameInputProps {
  username: string;
  setUsername: (value: string) => void;
  isUsernameValid: boolean;
}

export const UsernameInput = ({ username, setUsername, isUsernameValid }: UsernameInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="username">Nom d'utilisateur *</Label>
      <Input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={!isUsernameValid ? "border-red-500" : ""}
        required
        placeholder="Choisissez un nom d'utilisateur"
      />
      {!isUsernameValid && (
        <p className="text-sm text-red-500">
          Ce nom d'utilisateur est obligatoire et doit être unique
        </p>
      )}
    </div>
  );
};