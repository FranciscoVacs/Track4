'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, X, RefreshCw, MessageSquare, Send, ZoomIn } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useState, useRef } from 'react'

type QueueEntry = {
  id: string
  image: string
  productName: string
  aiSuggestion: string
  aiSuggestionColor: 'orange' | 'red'
  topPredictions: { label: string; confidence: number; color: 'red' | 'orange' | 'cyan' | 'navy' }[]
}

const colorVar = (c: 'red' | 'orange' | 'cyan' | 'navy') => `var(--lv-${c})`

export const OperatorQueue = forwardRef<
  HTMLDivElement,
  {
    items: QueueEntry[]
    awaiting: number
    onDecide: () => void
    activeCardRef?: React.RefObject<HTMLDivElement | null>
  }
>(function OperatorQueue({ items, awaiting, onDecide, activeCardRef }, ref) {
  const reduce = useReducedMotion()
  const active = items[0]
  const next = items.slice(1, 3)
  const [flashKey, setFlashKey] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!lightboxImage) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxImage])

  const handleConfirm = useCallback(() => {
    setShowFeedback(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleSendAndConfirm = useCallback(() => {
    setFlashKey((k) => k + 1)
    setShowFeedback(false)
    setFeedbackText('')
    if (feedbackText.trim()) {
      setFeedbackSent(true)
      setTimeout(() => setFeedbackSent(false), 2000)
    }
    onDecide()
  }, [onDecide, feedbackText])

  const handleSkipFeedback = useCallback(() => {
    setFlashKey((k) => k + 1)
    setShowFeedback(false)
    setFeedbackText('')
    onDecide()
  }, [onDecide])

  const handleDecideWithFeedback = useCallback(() => {
    setFlashKey((k) => k + 1)
    setShowFeedback(false)
    setFeedbackText('')
    onDecide()
  }, [onDecide])

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
      className="lv-card p-4 h-[600px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="uppercase-label text-[12px]">Cola del operador</span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tabular-nums uppercase tracking-wider"
          style={{ background: 'rgba(245,130,32,0.12)', color: 'var(--lv-orange)' }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lv-orange)]" aria-hidden="true" />
          {awaiting} pendientes
        </span>
      </div>

      {/* Feedback sent confirmation */}
      <AnimatePresence>
        {feedbackSent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-white flex items-center gap-2"
            style={{ background: 'var(--lv-cyan)' }}
          >
            <Check className="h-3.5 w-3.5" />
            Feedback enviado al equipo de IA
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative">
        {/* Background stacked cards */}
        {next.map((it, idx) => {
          const depth = idx + 1
          return (
            <div
              key={`bg-${it.id}`}
              className="absolute inset-x-0 top-0 rounded-lg"
              style={{
                background: '#fff',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                transform: `scale(${1 - depth * 0.04}) translateY(${depth * 8}px)`,
                opacity: 1 - depth * 0.45,
                zIndex: 10 - depth,
                height: 'calc(100% - 8px)',
              }}
              aria-hidden="true"
            />
          )
        })}

        {/* Active card */}
        <AnimatePresence mode="popLayout">
          {active && (
            <motion.div
              key={active.id}
              ref={activeCardRef as React.RefObject<HTMLDivElement>}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { x: 400, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="absolute inset-x-0 top-0 rounded-lg p-3 flex flex-col"
              style={{
                background: '#fff',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 12px 30px -16px rgba(36,46,143,0.18)',
                zIndex: 20,
                height: '100%',
              }}
            >
              <button
                type="button"
                onClick={() => setLightboxImage(active.image)}
                className="group relative h-40 w-full rounded-md mb-2.5 overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(15,23,42,0.06)' }}
                aria-label="Ver imagen completa"
              >
                <img
                  src={active.image || '/placeholder.svg'}
                  alt={active.productName}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    if (!img.src.includes('picsum.photos')) {
                      img.src = `https://picsum.photos/seed/${active.id}/400/300`
                    }
                  }}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  crossOrigin="anonymous"
                />
                <span
                  className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9.5px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(15,23,42,0.75)' }}
                >
                  <ZoomIn className="h-2.5 w-2.5" aria-hidden="true" />
                  Ampliar
                </span>
              </button>

              <div
                className="rounded-md px-3 py-2 mb-2.5"
                style={{
                  background: `${colorVar(active.aiSuggestionColor)}14`,
                  border: `1px solid ${colorVar(active.aiSuggestionColor)}30`,
                }}
              >
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
                  Clasificación sugerida
                </div>
                <div className="text-[12px] font-semibold text-[var(--lv-navy)] mt-0.5">
                  {active.aiSuggestion}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {active.topPredictions.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--lv-text)] w-28 truncate">{p.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--lv-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.confidence}%`, background: colorVar(p.color) }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums w-8 text-right" style={{ color: colorVar(p.color) }}>
                      {p.confidence}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <AnimatePresence mode="wait">
                  {showFeedback ? (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-[var(--lv-navy)]">
                        <MessageSquare className="h-3 w-3" />
                        Feedback para el equipo de IA
                      </div>
                      <textarea
                        ref={inputRef}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Ej: la etiqueta estaba doblada, revisar ángulo de cámara..."
                        className="w-full h-16 rounded-lg px-3 py-2 text-[11px] text-[var(--lv-text)] resize-none outline-none border-2 border-transparent focus:border-[var(--lv-navy)]"
                        style={{ background: 'var(--lv-surface-3)' }}
                      />
                      <div className="flex gap-2">
                        <motion.button
                          type="button"
                          onClick={handleSendAndConfirm}
                          whileHover={reduce ? undefined : { scale: 1.015 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="h-10 flex-1 rounded-lg bg-[var(--lv-navy)] text-white text-[12px] font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                          <AnimatePresence>
                            {flashKey > 0 && (
                              <motion.span
                                key={flashKey}
                                className="absolute inset-0 bg-white/25 rounded-lg pointer-events-none"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              />
                            )}
                          </AnimatePresence>
                          <Send className="h-3.5 w-3.5" />
                          {feedbackText.trim() ? 'Confirmar y enviar' : 'Confirmar sin feedback'}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => { setShowFeedback(false); setFeedbackText('') }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          className="h-10 px-3 rounded-lg text-[var(--muted-foreground)] text-[11px] font-semibold"
                          style={{ background: 'var(--lv-surface-3)' }}
                        >
                          Cancelar
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2"
                    >
                      {/* Primary action */}
                      <motion.button
                        type="button"
                        onClick={handleConfirm}
                        whileHover={reduce ? undefined : { scale: 1.015 }}
                        whileTap={reduce ? undefined : { scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="h-11 w-full rounded-lg bg-[var(--lv-navy)] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 relative overflow-hidden"
                      >
                        <Check className="h-4 w-4" /> Confirmar defecto
                      </motion.button>
                      {/* Secondary actions */}
                      <div className="flex gap-2">
                        <motion.button
                          type="button"
                          onClick={handleDecideWithFeedback}
                          whileHover={reduce ? undefined : { scale: 1.015 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="h-9 flex-1 rounded-lg text-[var(--lv-navy)] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                          style={{ background: 'var(--lv-surface-3)' }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Otra categoría
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleSkipFeedback}
                          whileHover={reduce ? undefined : { scale: 1.015 }}
                          whileTap={reduce ? undefined : { scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="h-9 flex-1 rounded-lg text-[var(--lv-navy)] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                          style={{ background: 'var(--lv-surface-3)' }}
                        >
                          <X className="h-3.5 w-3.5" /> No es defecto
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!active && (
          <div className="h-full flex items-center justify-center text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
            Cola vacía
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: 'rgba(8,11,28,0.85)' }}
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Imagen ampliada"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-full text-white hover:bg-white/10"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              src={lightboxImage}
              alt="Imagen ampliada del producto"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              crossOrigin="anonymous"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
