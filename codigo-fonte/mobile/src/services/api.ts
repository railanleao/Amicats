import { getToken } from '../storage/authStorage';
import { emitUnauthorized } from './authEvents';
import { parseJsonBody } from './parseBody';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const LOGIN_PATH = '/auth/login';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();

  const response = await fetchOrThrow(path, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return handleResponse<T>(response, path);
}

// Separate from apiRequest because a multipart body can't be JSON.stringify'd
// and must not set its own Content-Type (fetch derives the boundary from the
// FormData automatically).
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST',
  headers?: Record<string, string>,
): Promise<T> {
  const token = getToken();

  const response = await fetchOrThrow(path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: formData,
  });

  return handleResponse<T>(response, path);
}

const REQUEST_TIMEOUT_MS = 30_000;

async function fetchOrThrow(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } catch (error) {
    const reason = controller.signal.aborted
      ? `sem resposta em ${REQUEST_TIMEOUT_MS / 1000}s`
      : error instanceof Error
        ? error.message
        : 'erro desconhecido';
    throw new ApiError(`Falha ao chamar o servidor (${path}: ${reason}).`);
  } finally {
    clearTimeout(timeout);
  }
}

async function handleResponse<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);

    if (response.status === 401 && path !== LOGIN_PATH) {
      emitUnauthorized();
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return parseJsonBody<T>(await response.text());
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível completar a solicitação. Tente novamente.';

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return typeof data?.message === 'string' ? data.message : DEFAULT_ERROR_MESSAGE;
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
}
