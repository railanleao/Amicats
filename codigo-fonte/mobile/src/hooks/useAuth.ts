import { useCallback, useEffect, useState } from "react";
import { login as loginRequest } from "../services/authService";
import { clearSession, getSession, saveSession } from "../storage/authStorage";
import type { LoginCredentials, User } from "../types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => setUser(session?.user ?? null))
      .finally(() => setLoadingSession(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginRequest(credentials);
    await saveSession({ token: response.token, user: response.user });
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return { user, loadingSession, login, logout };
}
