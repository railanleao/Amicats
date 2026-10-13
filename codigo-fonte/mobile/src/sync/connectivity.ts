import NetInfo from '@react-native-community/netinfo';
import { API_URL } from '../services/api';
import { hasNetworkInterface } from './connectivityState';

const PING_TIMEOUT_MS = 8000;

let lastIssue: string | null = null;
let inFlightPing: Promise<boolean> | null = null;

export function lastConnectivityIssue(): string | null {
  return lastIssue;
}

async function ping(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    await fetch(`${API_URL}/error`, { signal: controller.signal });
    lastIssue = null;
    return true;
  } catch (error) {
    lastIssue = controller.signal.aborted
      ? `O servidor ${API_URL} não respondeu em ${PING_TIMEOUT_MS / 1000}s.`
      : `Falha ao acessar ${API_URL}: ${error instanceof Error ? error.message : 'erro desconhecido'}.`;
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function pingServer(): Promise<boolean> {
  if (!inFlightPing) {
    inFlightPing = ping().finally(() => {
      inFlightPing = null;
    });
  }

  return inFlightPing;
}

export async function checkOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();

  if (!hasNetworkInterface(state)) {
    lastIssue = 'O aparelho não está conectado a nenhuma rede.';
    return false;
  }

  return pingServer();
}

export function subscribeToConnectivity(listener: (connected: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => {
    if (!hasNetworkInterface(state)) {
      lastIssue = 'O aparelho não está conectado a nenhuma rede.';
      listener(false);
      return;
    }

    void pingServer().then(listener);
  });
}
