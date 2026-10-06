import { ApiError, apiRequest, apiUpload } from '../services/api';
import { buildPhotoFormData } from '../services/multipart';
import { HttpError } from './types';
import type { HttpClient, HttpRequest } from './types';

async function execute<T>(request: HttpRequest): Promise<T> {
  if (request.multipart) {
    const { uri, fieldName, name, type } = request.multipart;

    let formData: FormData;

    try {
      formData = await buildPhotoFormData(uri, fieldName, name, type);
    } catch {
      throw new HttpError('O arquivo da foto não foi encontrado no aparelho.', 400);
    }

    return apiUpload<T>(request.path, formData, request.method === 'POST' ? 'POST' : 'PUT', request.headers);
  }

  return apiRequest<T>(request.path, {
    method: request.method,
    body: request.body,
    headers: request.headers,
  });
}

export const syncHttpClient: HttpClient = {
  async request<T>(request: HttpRequest): Promise<T> {
    try {
      return await execute<T>(request);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new HttpError(error.message, error.status);
      }
      throw error;
    }
  },
};
