type Listener = () => void;

let listeners: Listener[] = [];

export function onUnauthorized(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((registered) => registered !== listener);
  };
}

export function emitUnauthorized(): void {
  listeners.forEach((listener) => listener());
}
