import { useCallback, useEffect, useState } from "react";
import {
  acceptTerms as acceptTermsRequest,
  changePassword as changePasswordRequest,
  login as loginRequest,
} from "../services/authService";
import { onUnauthorized } from "../services/authEvents";
import { clearSession, getSession, saveSession } from "../storage/authStorage";
import type {
  ChangePasswordRequest,
  LoginCredentials,
  LoginResponse,
  User,
} from "../types/auth";

function toUser(response: LoginResponse): User {
  return {
    id: response.id,
    fullName: response.name,
    accessType: response.accessType,
    termsAccepted: response.termsAccepted,
    mustChangePassword: response.mustChangePassword,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => setUser(session?.user ?? null))
      .finally(() => setLoadingSession(false));
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      void clearSession();
      setUser(null);
    });
  }, []);

  const applySession = useCallback(async (response: LoginResponse) => {
    const nextUser = toUser(response);
    await saveSession({ token: response.token, user: nextUser });
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginRequest(credentials);
      await applySession(response);
    },
    [applySession],
  );

  const acceptTerms = useCallback(async () => {
    const response = await acceptTermsRequest();
    await applySession(response);
  }, [applySession]);

  const changePassword = useCallback(
    async (request: ChangePasswordRequest) => {
      const response = await changePasswordRequest(request);
      await applySession(response);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return { user, loadingSession, login, logout, acceptTerms, changePassword };
}
