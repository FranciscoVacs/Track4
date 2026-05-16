export const MAX_FILE_SIZE = 4_000_000 // 4 MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AllowedMimeType = (typeof ALLOWED_TYPES)[number]

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `Formato no soportado: ${file.type}. Usá JPEG, PNG o WebP.`,
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / 1_000_000).toFixed(1)
    return {
      valid: false,
      error: `La imagen pesa ${mb} MB. El máximo permitido es 4 MB.`,
    }
  }
  return { valid: true }
}

export function getMimeType(file: File): AllowedMimeType {
  if (!ALLOWED_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(`Tipo de imagen no soportado: ${file.type}`)
  }
  return file.type as AllowedMimeType
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}
