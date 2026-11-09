import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import {
  COVER_GALLERY,
  COVER_GROUPS,
  MAX_UPLOAD_BYTES,
  TripCoverData,
  prepareCoverImage,
  sniffImageType,
} from '../covers'

interface Props {
  apiUrl: string
  token: string | null
  groupId: string
  cover: TripCoverData | null
  onApplied: (cover: TripCoverData | null) => void
  onClose: () => void
}

type Tab = 'gallery' | 'upload'

export default function CoverPicker({ apiUrl, token, groupId, cover, onApplied, onClose }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('gallery')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  // The parent passes a fresh onClose on every render. Keep it in a ref so this effect runs once:
  // depending on it would abort an in-flight upload whenever the parent re-renders (e.g. when
  // the cover-updated socket event arrives).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      // Keep Tab inside the dialog while it is open
      if (e.key === 'Tab' && dialogRef.current) {
        const items = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([hidden]):not([disabled])')
        )
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      abortRef.current?.abort()
      // Hand focus back to whatever opened the dialog
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  const message = (err: unknown, fallback: string) => {
    const data = (err as any)?.response?.data
    return (typeof data?.error === 'string' && data.error) || (err as any)?.message || fallback
  }

  const applyGallery = async (key: string) => {
    setBusy(true)
    setError(null)
    try {
      const { data } = await axios.put(
        `${apiUrl}/api/trips/${groupId}/cover`,
        { source: 'gallery', key },
        { headers: authHeaders }
      )
      onApplied(data)
      onClose()
    } catch (err) {
      setError(message(err, t('cover.errors.applyFailed')))
      setBusy(false)
    }
  }

  const upload = async (file: File) => {
    setError(null)

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t('cover.errors.tooLarge'))
      return
    }
    if (!(await sniffImageType(file))) {
      setError(t('cover.errors.notImage'))
      return
    }

    setBusy(true)
    setFileName(file.name)
    setProgress(0)

    // Created before the resize so Cancel / closing the sheet also stops that step
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const prepared = await prepareCoverImage(file)
      if (controller.signal.aborted) return

      const params = new URLSearchParams({
        w: String(prepared.width),
        h: String(prepared.height),
        color: prepared.dominantColor,
        focalY: String(cover?.focalY ?? 50),
      })

      const { data } = await axios.post(
        `${apiUrl}/api/trips/${groupId}/cover/upload?${params.toString()}`,
        prepared.blob,
        {
          headers: { ...authHeaders, 'Content-Type': prepared.blob.type },
          signal: controller.signal,
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
          },
        }
      )
      onApplied(data)
      onClose()
    } catch (err) {
      if (controller.signal.aborted) return
      setError(message(err, t('cover.errors.uploadFailed')))
      setBusy(false)
      setProgress(null)
      setFileName(null)
      abortRef.current = null
    }
  }

  const removeCover = async () => {
    setBusy(true)
    setError(null)
    try {
      await axios.delete(`${apiUrl}/api/trips/${groupId}/cover`, { headers: authHeaders })
      onApplied(null)
      onClose()
    } catch (err) {
      setError(message(err, t('cover.errors.removeFailed')))
      setBusy(false)
    }
  }

  const cancelUpload = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
    setProgress(null)
    setFileName(null)
  }

  return (
    <div
      className="cover-picker__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div ref={dialogRef} className="cover-picker" role="dialog" aria-modal="true" aria-label={t('cover.title')}>
        <div className="cover-picker__head">
          <h2>{t('cover.title')}</h2>
          <button ref={closeRef} type="button" className="cover-picker__close" aria-label={t('common.close')} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cover-picker__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className="cover-tab"
            aria-selected={tab === 'gallery'}
            onClick={() => setTab('gallery')}
          >
            {t('cover.gallery')}
          </button>
          <button
            type="button"
            role="tab"
            className="cover-tab"
            aria-selected={tab === 'upload'}
            onClick={() => setTab('upload')}
          >
            {t('cover.upload')}
          </button>
          {/* Generate (AI covers) is hidden until v2 — wireframe review, spec §4.2 */}
        </div>

        <div className="cover-picker__body">
          {tab === 'gallery' && (
            <>
              {COVER_GROUPS.map((group) => (
                <div className="cover-group" key={group}>
                  <h3>{t(`cover.groups.${group}`)}</h3>
                  <div className="cover-grid">
                    {COVER_GALLERY.filter((entry) => entry.group === group).map((entry) => (
                      <button
                        key={entry.key}
                        type="button"
                        className="cover-swatch"
                        aria-label={t(`cover.gallery_${entry.key}`)}
                        aria-pressed={cover?.source === 'gallery' && cover.key === entry.key}
                        disabled={busy}
                        onClick={() => applyGallery(entry.key)}
                        style={
                          entry.kind === 'gradient'
                            ? { background: entry.value }
                            : { backgroundImage: `url(${entry.value})` }
                        }
                      >
                        <span className="cover-swatch__label">{t(`cover.gallery_${entry.key}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'upload' && (
            <>
              {progress === null ? (
                <div
                  className={`cover-drop${dragOver ? ' is-over' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) upload(file)
                  }}
                >
                  <strong>{t('cover.drop')}</strong>
                  <button
                    type="button"
                    className="cover-tab"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('cover.chooseFile')}
                  </button>
                  <small>{t('cover.formats')}</small>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      if (file) upload(file)
                    }}
                  />
                </div>
              ) : (
                <div>
                  <p className="cover-hint">{fileName}</p>
                  <div className="cover-progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span className="cover-hint">{t('cover.resized', { progress })}</span>
                    <button type="button" className="cover-tab" onClick={cancelUpload}>
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
              <p className="cover-hint" style={{ marginTop: 12 }}>
                {t('cover.resizeNote')}
              </p>
            </>
          )}

          {error && <p className="cover-error">{error}</p>}
        </div>

        <div className="cover-picker__foot">
          {cover ? (
            <button type="button" className="cover-tab" disabled={busy} onClick={removeCover}>
              {t('cover.remove')}
            </button>
          ) : (
            <span className="cover-hint">{t('cover.none')}</span>
          )}
          <span className="cover-hint">{t('cover.tapToApply')}</span>
        </div>
      </div>
    </div>
  )
}
