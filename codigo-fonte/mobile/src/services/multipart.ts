const DEFAULT_FIELD_NAME = 'file';
const DEFAULT_FILE_NAME = 'photo.jpg';
const DEFAULT_MIME_TYPE = 'image/jpeg';

export async function buildPhotoFormData(
  uri: string,
  fieldName: string = DEFAULT_FIELD_NAME,
  fileName: string = DEFAULT_FILE_NAME,
  mimeType: string = DEFAULT_MIME_TYPE,
): Promise<FormData> {
  const response = await fetch(uri);
  const source = await response.blob();
  const blob = new Blob([source], { type: mimeType });

  const formData = new FormData();
  formData.append(fieldName, blob, fileName);

  return formData;
}
