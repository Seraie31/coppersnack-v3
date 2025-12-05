export interface Balance {
  user_id: string;
  amount: number;
  profiles?: {
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
  } | null;
}