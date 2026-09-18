import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types/auth";

const TOKEN_KEY = "amicats.auth.token";
const USER_KEY = "amicats.auth.user";

export interface Session {
  token: string;
  user: User;
}

// expo-secure-store has no web implementation (it wraps native Keychain/Keystore),
// so we fall back to localStorage in that environment.
const store = Platform.OS === "web" ? webStore() : SecureStore;

function webStore() {
  return {
    getItemAsync: async (key: string) => window.localStorage.getItem(key),
    setItemAsync: async (key: string, value: string) =>
      window.localStorage.setItem(key, value),
    deleteItemAsync: async (key: string) => window.localStorage.removeItem(key),
  };
}

// Kept in memory so apiRequest can attach the Authorization header synchronously,
// since SecureStore/localStorage access is always async.
let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export async function saveSession(session: Session): Promise<void> {
  currentToken = session.token;
  await store.setItemAsync(TOKEN_KEY, session.token);
  await store.setItemAsync(USER_KEY, JSON.stringify(session.user));
}

export async function getSession(): Promise<Session | null> {
  const [token, userJson] = await Promise.all([
    store.getItemAsync(TOKEN_KEY),
    store.getItemAsync(USER_KEY),
  ]);

  if (!token || !userJson) {
    return null;
  }

  currentToken = token;
  return { token, user: JSON.parse(userJson) as User };
}

export async function clearSession(): Promise<void> {
  currentToken = null;
  await store.deleteItemAsync(TOKEN_KEY);
  await store.deleteItemAsync(USER_KEY);
}
