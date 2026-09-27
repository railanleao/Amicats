import { API_URL, apiRequest, apiUpload } from './api';
import { getToken } from '../storage/authStorage';
import type { PagedResult } from '../types/common';
import type { Cat, CreateCatRequest, GeneralStatus } from '../types/cat';

export function createCat(request: CreateCatRequest): Promise<Cat> {
  return apiRequest<Cat>('/cats', { method: 'POST', body: request });
}

export function getCat(catId: number): Promise<Cat> {
  return apiRequest<Cat>(`/cats/${catId}`);
}

// Same request shape as create — the backend's UpdateCatInput mirrors CreateCatInput field
// for field (only the clinical exam fields, set through separate use cases, differ).
export function updateCat(catId: number, request: CreateCatRequest): Promise<Cat> {
  return apiRequest<Cat>(`/cats/${catId}`, { method: 'PUT', body: request });
}

interface ListCatsParams {
  search?: string;
  generalStatus?: GeneralStatus;
}

export async function listCats(params: ListCatsParams = {}): Promise<Cat[]> {
  const query = new URLSearchParams();
  query.set('page', '0');
  query.set('size', '50');
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.generalStatus) {
    query.set('generalStatus', params.generalStatus);
  }

  const result = await apiRequest<PagedResult<Cat>>(`/cats?${query.toString()}`);
  return result.content;
}

// `Image`'s `source.headers` lets us attach the bearer token to an otherwise plain
// authenticated GET, the same way apiRequest does for JSON calls. Native iOS/Android
// honor this; Expo's web target renders `Image` as a plain <img>, which the browser
// never lets carry custom headers, so cover photos silently fall back to the
// placeholder there (a preview-only gap, not a native bug).
export function catPhotoSource(catId: number): { uri: string; headers?: Record<string, string> } {
  const token = getToken();
  return {
    uri: `${API_URL}/cats/${catId}/photo`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  };
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
