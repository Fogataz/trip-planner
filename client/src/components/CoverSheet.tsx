import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onChange: () => void
  onReposition: () => void
  onRemove: () => void
  onClose: () => void
}

/** Phones and touch screens: one "Edit cover" button opens this sheet (spec 009). */
export default function CoverSheet({ onChange, onReposition, onRemove, onClose }: Props) {
  const { t } = useTranslation()
  const sheetRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    sheetRef.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      // Keep Tab inside the sheet while it is open
      if (e.key === 'Tab' && sheetRef.current) {
        const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'))
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || !sheetRef.current.contains(active))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (active === last || !sheetRef.current.contains(active))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      className="cover-sheet__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div ref={sheetRef} className="cover-sheet" role="dialog" aria-modal="true" aria-labelledby="cover-sheet-title">
        <h2 id="cover-sheet-title">{t('cover.sheetTitle')}</h2>
        <button type="button" className="cover-sheet__item" onClick={onChange}>
          {t('cover.change')}
        </button>
        <button type="button" className="cover-sheet__item" onClick={onReposition}>
          {t('cover.reposition')}
        </button>
        <button type="button" className="cover-sheet__item cover-sheet__item--danger" onClick={onRemove}>
          {t('cover.remove')}
        </button>
        <button type="button" className="cover-sheet__item" onClick={onClose}>
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
