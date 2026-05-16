'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import type { FeedItem } from '@/lib/types'
import { validateImage } from '@/lib/image-utils'

const statusMeta: Record<FeedItem['status'], { label: string; bg: string; color: string }> = {
  queued: { label: 'En cola', bg: 'rgba(17,165,214,0.10)', color: 'var(--lv-cyan)' },
  analyzing: { label: 'Analizando', bg: 'rgba(17,165,214,0.10)', color: 'var(--lv-cyan)' },
  done: { label: 'Listo', bg: 'rgba(16,185,129,0.10)', color: '#047857' },
  defect: { label: 'Defecto', bg: 'rgba(229,36,33,0.10)', color: 'var(--lv-red)' },
  review: { label: 'Revisar', bg: 'rgba(245,130,32,0.12)', color: 'var(--lv-orange)' },
  error: { label: 'Error', bg: 'rgba(229,36,33,0.10)', color: 'var(--lv-red)' },
}

function FeedImage({ src, seedId, alt }: { src: string; seedId: string; alt: string }) {
  const [errored, setErrored] = useState(false)
  const finalSrc = errored ? `https://picsum.photos/seed/${seedId}/120/120` : src
  return (
    <img
      src={finalSrc || '/placeholder.svg'}
      alt={alt}
      onError={() => setErrored(true)}
      className="h-10 w-10 rounded-md shrink-0 object-cover"
      crossOrigin="anonymous"
    />
  )
}

type IncomingFeedProps = {
  items: FeedItem[]
  onUpload: (file: File, feedItemId: string, objectUrl: string) => void
}

export function IncomingFeed({ items, onUpload }: IncomingFeedProps) {
  const reduce = useReducedMotion()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      setUploadError(validation.error ?? 'Archivo inválido')
      e.target.value = ''
      return
    }

    setUploadError(null)
    const objectUrl = URL.createObjectURL(file)
    const feedItemId = `upload-${Date.now()}`
    onUpload(file, feedItemId, objectUrl)
    e.target.value = ''
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
      className="lv-card p-4 h-[600px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="uppercase-label text-[10.5px]">Productos entrantes</span>
        <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider font-semibold text-emerald-600">
          <span className="relative flex h-1.5 w-1.5">
            {!reduce && (
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          En vivo
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence initial={false}>
          {items.map((item, idx) => {
            const meta = statusMeta[item.status]
            const fadeOpacity = Math.max(0.55, 1 - idx * 0.12)
            const isActive = idx === 0
            const isUpload = item.source === 'upload'
            return (
              <motion.div
                key={item.id}
                layout
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
                animate={{ opacity: fadeOpacity, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: 'spring', stiffness: 160, damping: 24, delay: idx * 0.03 }}
                className="relative flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md"
                style={{
                  background: isActive ? 'rgba(17,165,214,0.06)' : 'transparent',
                }}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                    style={{ background: 'var(--lv-cyan)' }}
                  />
                )}
                <FeedImage src={item.image} seedId={item.id} alt={item.shortName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-semibold text-[var(--lv-text)] truncate leading-tight">
                      {item.shortName}
                    </span>
                    {isUpload && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold tracking-wide shrink-0"
                        style={{ background: 'rgba(17,165,214,0.12)', color: 'var(--lv-cyan)' }}
                      >
                        <Upload className="h-2 w-2" aria-hidden="true" />
                        Subida
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] text-[var(--muted-foreground)] tabular-nums mt-0.5">{item.timestamp}</div>
                  {item.errorMessage && item.status === 'error' && (
                    <div className="mt-0.5 text-[9px] font-medium leading-tight text-[var(--lv-red)] line-clamp-2">
                      {item.errorMessage}
                    </div>
                  )}
                </div>
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold tracking-wide whitespace-nowrap"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="pt-2 mt-2 lv-divider" />

      <div className="pt-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Agregar imagen a la cola de inspección"
        />
        <button
          type="button"
          onClick={() => {
            setUploadError(null)
            fileInputRef.current?.click()
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-[rgba(17,165,214,0.05)]"
          style={{ borderColor: 'rgba(17,165,214,0.3)', color: 'var(--lv-cyan)' }}
        >
          <Upload className="h-3 w-3" aria-hidden="true" />
          Agregar imagen a la cola
        </button>
        <AnimatePresence>
          {uploadError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 text-[9.5px] font-medium"
              style={{ color: 'var(--lv-red)' }}
            >
              {uploadError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2 text-[9.5px] text-[var(--muted-foreground)] flex items-center justify-between">
        <span className="font-mono">cam-03.lv-factory.local</span>
        <span className="tabular-nums">{items.length}/6</span>
      </div>
    </motion.div>
  )
}
