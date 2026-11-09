import { ReactNode, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import CoverPicker from './CoverPicker'
import { TripCoverData, coverAlt, coverBackground, coverImageSrc, defaultGradient } from '../covers'
import './TripCover.css'

interface Props {
  apiUrl: string
  token: string | null
  groupId: string
  tripName: string
  cover: TripCoverData | null
  onChange: (cover: TripCoverData | null) => void
  /** Highlight the add-cover button once, right after the trip is created */
  nudge?: boolean
  children: ReactNode
}

export default function TripCover({
  apiUrl,
  token,
  groupId,
  tripName,
  cover,
  onChange,
  nudge = false,
  children,
}: Props) {
  const { t } = useTranslation()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [repositioning, setRepositioning] = useState(false)
  const [focalY, setFocalY] = useState(cover?.focalY ?? 50)
  const [loaded, setLoaded] = useState(false)
  const [nudged, setNudged] = useState(nudge)
  const [error, setError] = useState<string | null>(null)
  // The asset failed to load (deleted, offline): paint the default gradient instead (N6)
  const [broken, setBroken] = useState(false)
  const bandRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ startY: number; startFocal: number } | null>(null)

  const imageSrc = broken ? null : coverImageSrc(apiUrl, cover)
  const background = broken ? defaultGradient(groupId) : coverBackground(cover, groupId)
  // Gradient-only covers have no <img>, so the band itself carries the alt text (N3)
  const bandLabel = cover && !imageSrc ? coverAlt(cover, tripName, t) : undefined

  useEffect(() => {
    setFocalY(cover?.focalY ?? 50)
    setLoaded(false)
  }, [cover?.key, cover?.focalY])

  useEffect(() => {
    setBroken(false)
  }, [cover?.key])

  // The post-create nudge is one-time: any click or key press, or the end of the pulse, ends it
  useEffect(() => {
    if (!nudged) return
    const dismiss = () => setNudged(false)
    const timer = window.setTimeout(dismiss, 7000)
    window.addEventListener('pointerdown', dismiss)
    window.addEventListener('keydown', dismiss)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('keydown', dismiss)
    }
  }, [nudged])

  // Keyboard path for reposition (N5): land on the slider, where arrow keys move the focal point
  useEffect(() => {
    if (repositioning) sliderRef.current?.focus()
  }, [repositioning])

  useEffect(() => {
    if (!repositioning) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelReposition()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const startDrag = (e: React.PointerEvent) => {
    if (!repositioning) return
    dragRef.current = { startY: e.clientY, startFocal: focalY }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current
    const height = bandRef.current?.clientHeight
    if (!drag || !height) return
    const delta = ((e.clientY - drag.startY) / height) * 100
    setFocalY(Math.min(100, Math.max(0, Math.round(drag.startFocal - delta))))
  }

  const endDrag = () => {
    dragRef.current = null
  }

  const cancelReposition = () => {
    setFocalY(cover?.focalY ?? 50)
    setRepositioning(false)
  }

  const saveFocal = async () => {
    try {
      const { data } = await axios.put(
        `${apiUrl}/api/trips/${groupId}/cover`,
        { focalY },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onChange(data)
      setRepositioning(false)
      setError(null)
    } catch {
      setError(t('cover.positionSaveFailed'))
      cancelReposition()
    }
  }

  const openPicker = () => {
    setNudged(false)
    setPickerOpen(true)
  }

  return (
    <div className={`trip-cover-head${cover ? ' has-cover' : ''}`}>
      <div
        ref={bandRef}
        className={`cover-band${cover ? '' : ' cover-band--empty'}${repositioning ? ' is-repositioning' : ''}`}
        style={{ background }}
        role={bandLabel ? 'img' : undefined}
        aria-label={bandLabel}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {imageSrc && (
          <img
            className={`cover-band__img${loaded ? ' is-loaded' : ''}`}
            src={imageSrc}
            alt={coverAlt(cover, tripName, t)}
            style={{ objectPosition: `50% ${focalY}%` }}
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
            width={cover?.width || undefined}
            height={cover?.height || undefined}
          />
        )}

        {cover && !repositioning && <div className="cover-band__scrim" />}

        {cover && !repositioning && (
          <div className="cover-band__controls">
            <button type="button" className="cover-btn" onClick={openPicker}>
              {t('cover.change')}
            </button>
            <button type="button" className="cover-btn" onClick={() => setRepositioning(true)}>
              {t('cover.reposition')}
            </button>
          </div>
        )}

        {repositioning && (
          <div className="cover-reposition-bar">
            <label>
              {t('cover.verticalPosition')}
              <input
                ref={sliderRef}
                type="range"
                min={0}
                max={100}
                step={1}
                value={focalY}
                onChange={(e) => setFocalY(Number(e.target.value))}
              />
            </label>
            <button type="button" className="cover-btn cover-btn--ghost" onClick={cancelReposition}>
              {t('common.cancel')}
            </button>
            <button type="button" className="cover-btn" onClick={saveFocal}>
              {t('cover.savePosition')}
            </button>
          </div>
        )}
      </div>

      <div className="trip-header">
        {!cover && (
          <div className="cover-add-row">
            <button
              type="button"
              className={`cover-add-btn${nudged ? ' is-nudged' : ''}`}
              onClick={openPicker}
            >
              <span aria-hidden="true">🖼</span> {t('cover.add')}
            </button>
          </div>
        )}

        {error && <p className="cover-error">{error}</p>}

        {children}
      </div>

      {pickerOpen && (
        <CoverPicker
          apiUrl={apiUrl}
          token={token}
          groupId={groupId}
          cover={cover}
          onApplied={onChange}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
