// ============================================
// CLOUDFLARE R2 — Upload de fotos
// Usado pelo mobile E pelo web (Next.js)
// ============================================

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload de imagem para o Cloudflare R2
 * via presigned URL gerada pelo backend
 */
export async function uploadToR2(
  file: File | Blob,
  folder: "trucks" | "menu" | "avatars",
  getPresignedUrl: (key: string) => Promise<{ uploadUrl: string; publicUrl: string }>
): Promise<UploadResult> {
  const ext = file instanceof File ? file.name.split(".").pop() : "jpg";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { uploadUrl, publicUrl } = await getPresignedUrl(key);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "image/jpeg",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha no upload: ${response.statusText}`);
  }

  return { url: publicUrl, key };
}

/**
 * Converte URI local (React Native) para Blob
 */
export async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

/**
 * Gera URL de thumbnail otimizado via Cloudflare Image Resizing
 */
export function getThumbnailUrl(
  originalUrl: string,
  width: number,
  height: number
): string {
  // Cloudflare Image Resizing transforma na CDN automaticamente
  return `${originalUrl}?width=${width}&height=${height}&fit=cover&format=webp`;
}
