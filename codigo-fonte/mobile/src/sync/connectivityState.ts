interface ConnectionSnapshot {
  isConnected: boolean | null;
}

export function hasNetworkInterface(state: ConnectionSnapshot): boolean {
  return state.isConnected !== false;
}
