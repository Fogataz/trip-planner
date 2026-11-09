import type { TFunction } from 'i18next'
import i18n from './i18n'

// Cover gallery and image helpers.
//
// The gallery lives here rather than behind an API call so a cover paints on
// first render with no extra request. The server keeps the matching allowlist
// in server/config/coverGallery.js — the slugs must stay in step.

export interface TripCoverData {
  source: 'gallery' | 'upload'
  key: string
  focalY?: number
  dominantColor?: string | null
  alt?: string
  width?: number | null
  height?: number | null
}

export interface GalleryEntry {
  key: string
  label: string
  group: string
  kind: 'gradient' | 'image'
  value: string
}

export const COVER_GALLERY: GalleryEntry[] = [
  { key: 'gradient-dusk', label: 'Dusk', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
  { key: 'gradient-sunrise', label: 'Sunrise', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { key: 'gradient-sea', label: 'Sea', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)' },
  { key: 'gradient-forest', label: 'Forest', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)' },
  { key: 'gradient-ember', label: 'Ember', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #fb7185 0%, #7c3aed 100%)' },
  { key: 'gradient-slate', label: 'Slate', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)' },
  { key: 'gradient-berry', label: 'Berry', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #e879f9 0%, #7e22ce 100%)' },
  { key: 'gradient-mint', label: 'Mint', group: 'Gradients', kind: 'gradient', value: 'linear-gradient(135deg, #5eead4 0%, #0f766e 100%)' },
  { key: 'art-pod-gathering', label: 'Pod gathering', group: 'Artwork', kind: 'image', value: '/covers/pod-gathering.webp' },
]

export const COVER_GROUPS = ['Gradients', 'Artwork']

// Deterministic fallback so a trip without a cover still looks deliberate.
const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
  'linear-gradient(135deg, #f472b6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  'linear-gradient(135deg, #64748b 0%, #334155 100%)',
]

export function defaultGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return DEFAULT_GRADIENTS[hash % DEFAULT_GRADIENTS.length]
}

export function galleryEntry(key: string): GalleryEntry | undefined {
  return COVER_GALLERY.find((entry) => entry.key === key)
}

/** The <img> src for a cover, or null when the cover paints as a gradient. */
export function coverImageSrc(apiUrl: string, cover?: TripCoverData | null): string | null {
  if (!cover) return null
  if (cover.source === 'upload') return `${apiUrl}/api/covers/${encodeURIComponent(cover.key)}`
  const entry = galleryEntry(cover.key)
  return entry && entry.kind === 'image' ? entry.value : null
}

/** The CSS background for a cover, or the trip's default gradient when there is none. */
export function coverBackground(cover: TripCoverData | null | undefined, seed: string): string {
  if (cover && cover.source === 'gallery') {
    const entry = galleryEntry(cover.key)
    if (entry && entry.kind === 'gradient') return entry.value
  }
  if (cover?.dominantColor) return cover.dominantColor
  return defaultGradient(seed)
}

export function coverAlt(
  cover: TripCoverData | null | undefined,
  tripName: string,
  t: TFunction
): string {
  return cover?.alt?.trim() || t('cover.defaultAlt', { name: tripName })
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const MAX_EDGE = 1600
const TARGET_BYTES = 400 * 1024

const MAGIC: Array<{ type: string; test: (b: Uint8Array) => boolean }> = [
  { type: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    type: 'image/webp',
    test: (b) =>
      String.fromCharCode(b[0], b[1], b[2], b[3]) === 'RIFF' &&
      String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP',
  },
]

/**
 * Identify a file by its bytes, not its name — a PDF renamed to .jpg still
 * reports image/jpeg in file.type on most platforms.
 */
export async function sniffImageType(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (head.length < 12) return null
  return MAGIC.find((m) => m.test(head))?.type ?? null
}

export interface PreparedCover {
  blob: Blob
  width: number
  height: number
  dominantColor: string
}

/**
 * Downscale in the browser so the upload is small and the server needs no
 * image pipeline. Long edge ≤1600px, WebP where the browser can encode it
 * (JPEG otherwise), aiming for <400 KB.
 */
export async function prepareCoverImage(file: File): Promise<PreparedCover> {
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(i18n.t('cover.errors.cannotOpen')))
      img.src = url
    })

    // Browsers that cannot encode WebP silently hand back a PNG, which can be
    // several MB, so check what came out and fall back to JPEG instead.
    const encode = async (canvas: HTMLCanvasElement, quality: number) => {
      const webp = await toBlob(canvas, 'image/webp', quality)
      if (webp && webp.type === 'image/webp') return webp
      return toBlob(canvas, 'image/jpeg', quality)
    }

    let edge = MAX_EDGE
    let attempt = 0
    for (;;) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error(i18n.t('cover.errors.cannotProcess'))
      ctx.drawImage(image, 0, 0, width, height)

      let blob = await encode(canvas, 0.85)
      if (blob && blob.size > TARGET_BYTES) blob = (await encode(canvas, 0.7)) || blob
      if (!blob) throw new Error(i18n.t('cover.errors.cannotProcess'))

      // Still over budget (very detailed photo): shrink and try again, a couple of times at most
      if (blob.size > TARGET_BYTES && attempt < 2) {
        edge = Math.round(edge * 0.75)
        attempt += 1
        continue
      }
      return { blob, width, height, dominantColor: averageColor(ctx, width, height) }
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality))
}

// Average colour, used as the placeholder paint while the image loads
function averageColor(ctx: CanvasRenderingContext2D, width: number, height: number): string {
  try {
    const step = Math.max(1, Math.floor(Math.min(width, height) / 32))
    const { data } = ctx.getImageData(0, 0, width, height)
    let r = 0
    let g = 0
    let b = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4 * step) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count += 1
    }
    if (!count) return '#5b5bd6'
    const hex = (n: number) => Math.round(n / count).toString(16).padStart(2, '0')
    return `#${hex(r)}${hex(g)}${hex(b)}`
  } catch {
    return '#5b5bd6'
  }
}
