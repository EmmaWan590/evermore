export interface ProcessedImage {
  full: Blob
  thumb: Blob
  width: number
  height: number
  mimeType: string
}

const MAX_EDGE = 1600
const THUMB_EDGE = 320
const QUALITY = 0.82
const THUMB_QUALITY = 0.78

export const MAX_FILE_BYTES = 20 * 1024 * 1024
export const MAX_FILES_PER_ENTRY = 6

type Drawable = ImageBitmap | HTMLImageElement

async function loadDrawable(file: Blob): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Older Safari or an exotic codec: fall back to plain <img> decoding.
    }
  }

  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('decode-failed'))
      image.src = url
    })
  } finally {
    // The bitmap is already decoded by the time onload fires.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

function fit(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const ratio = Math.min(1, maxEdge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

async function draw(
  source: Drawable,
  width: number,
  height: number,
  type: string,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas-unavailable')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(source, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
  if (!blob) throw new Error('encode-failed')
  return blob
}

/** WebP when the browser can encode it, JPEG when it quietly falls back to PNG. */
async function encode(
  source: Drawable,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const webp = await draw(source, width, height, 'image/webp', quality)
  if (webp.type === 'image/webp') return webp
  return draw(source, width, height, 'image/jpeg', quality)
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith('image/')) throw new Error('not-an-image')
  if (file.size > MAX_FILE_BYTES) throw new Error('file-too-large')

  const source = await loadDrawable(file)
  const naturalWidth = 'naturalWidth' in source ? source.naturalWidth : source.width
  const naturalHeight = 'naturalHeight' in source ? source.naturalHeight : source.height

  try {
    const fullSize = fit(naturalWidth, naturalHeight, MAX_EDGE)
    const thumbSize = fit(naturalWidth, naturalHeight, THUMB_EDGE)

    const full = await encode(source, fullSize.width, fullSize.height, QUALITY)
    const thumb = await encode(source, thumbSize.width, thumbSize.height, THUMB_QUALITY)

    return {
      full,
      thumb,
      width: fullSize.width,
      height: fullSize.height,
      mimeType: full.type || 'image/jpeg',
    }
  } finally {
    if ('close' in source && typeof source.close === 'function') source.close()
  }
}

/** Rebuilds only the small preview, used when restoring a backup. */
export async function makeThumb(blob: Blob): Promise<Blob> {
  const source = await loadDrawable(blob)
  const naturalWidth = 'naturalWidth' in source ? source.naturalWidth : source.width
  const naturalHeight = 'naturalHeight' in source ? source.naturalHeight : source.height
  try {
    const size = fit(naturalWidth, naturalHeight, THUMB_EDGE)
    return await encode(source, size.width, size.height, THUMB_QUALITY)
  } finally {
    if ('close' in source && typeof source.close === 'function') source.close()
  }
}
