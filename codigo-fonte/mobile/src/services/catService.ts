import { apiRequest, apiUpload } from './api';
import type { Cat, CatPhoto, CreateCatRequest } from '../types/cat';

export function createCat(request: CreateCatRequest): Promise<Cat> {
  return apiRequest<Cat>('/cats', { method: 'POST', body: request });
}

// `uri` is a local file:// path from expo-image-picker. React Native's fetch/FormData
// understands that shape directly — no need to read the file into memory first.
export function uploadCatPhoto(catId: number, uri: string): Promise<CatPhoto> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return apiUpload<CatPhoto>(`/cats/${catId}/photos`, formData);
}
