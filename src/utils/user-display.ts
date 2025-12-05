import type { Balance } from "@/types/balance";

export const getUserDisplayName = (user: Balance) => {
  if (!user.profiles || !user.profiles.username) {
    return `Utilisateur ${user.user_id.slice(0, 8)}`;
  }
  
  return user.profiles.username;
};