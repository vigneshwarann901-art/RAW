import { uploadApiImage } from './api';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadListingImage(file: File): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Only JPG, PNG or WEBP images are supported.' };
  }
  if (file.size > MAX_BYTES) {
    return { url: null, error: 'Image must be 10 MB or smaller.' };
  }

  try {
    const data = await fileToBase64(file);
    const result = await uploadApiImage({ fileName: file.name, contentType: file.type, data });
    if (result.error || !result.data) return { url: null, error: result.error || 'Upload failed.' };
    return { url: result.data.url, error: null };
  } catch (error) {
    return { url: null, error: error instanceof Error ? error.message : 'Upload failed.' };
  }
}
