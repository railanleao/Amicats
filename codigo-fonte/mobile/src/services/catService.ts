import { apiRequest, apiUpload } from './api';
import type { Cat, CreateCatRequest } from '../types/cat';

export function createCat(request: CreateCatRequest): Promise<Cat> {
  return apiRequest<Cat>('/cats', { method: 'POST', body: request });
}

// `uri` is a local file:// path from expo-image-picker. React Native's fetch/FormData
// understands that shape directly — no need to read the file into memory first.
// A single cover photo per cat (overwritten on re-upload), matching the Room/User pattern —
// unlike what an earlier version of this screen assumed, cats don't have a photo gallery.
export function uploadCatPhoto(catId: number, uri: string): Promise<Cat> {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return apiUpload<Cat>(`/cats/${catId}/photo`, formData, 'PUT');
}
