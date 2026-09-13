import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Usuario } from "../types/auth";

const TOKEN_KEY = "amicats.auth.token";
const USUARIO_KEY = "amicats.auth.usuario";

export interface Sessao {
  token: string;
  usuario: Usuario;
}

// expo-secure-store não tem implementação na web (usa Keychain/Keystore nativo),
// então caímos para localStorage nesse ambiente.
const store = Platform.OS === "web" ? webStore() : SecureStore;

function webStore() {
  return {
    getItemAsync: async (key: string) => window.localStorage.getItem(key),
    setItemAsync: async (key: string, value: string) =>
      window.localStorage.setItem(key, value),
    deleteItemAsync: async (key: string) => window.localStorage.removeItem(key),
  };
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  await store.setItemAsync(TOKEN_KEY, sessao.token);
  await store.setItemAsync(USUARIO_KEY, JSON.stringify(sessao.usuario));
}

export async function obterSessao(): Promise<Sessao | null> {
  const [token, usuarioJson] = await Promise.all([
    store.getItemAsync(TOKEN_KEY),
    store.getItemAsync(USUARIO_KEY),
  ]);

  if (!token || !usuarioJson) {
    return null;
  }

  return { token, usuario: JSON.parse(usuarioJson) as Usuario };
}

export async function limparSessao(): Promise<void> {
  await store.deleteItemAsync(TOKEN_KEY);
  await store.deleteItemAsync(USUARIO_KEY);
}
