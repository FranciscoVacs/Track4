'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, SkipForward, X, RefreshCw } from 'lucide-react'
import { forwardRef } from 'react'

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

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
      className="lv-card p-4 h-[600px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="uppercase-label text-[10.5px]">Cola del operador</span>
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold tabular-nums uppercase tracking-wider"
          style={{ background: 'rgba(245,130,32,0.12)', color: 'var(--lv-orange)' }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lv-orange)]" aria-hidden="true" />
          {awaiting} pendientes
        </span>
      </div>

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
              <img
                src={active.image || '/placeholder.svg'}
                alt={active.productName}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement
                  if (!img.src.includes('picsum.photos')) {
                    img.src = `https://picsum.photos/seed/${active.id}/400/300`
                  }
                }}
                className="h-24 w-full rounded-md object-cover mb-2.5"
                crossOrigin="anonymous"
              />

              <div
                className="rounded px-2.5 py-1.5 border-l-2 mb-2.5"
                style={{
                  background: `${colorVar(active.aiSuggestionColor)}14`,
                  borderLeftColor: colorVar(active.aiSuggestionColor),
                }}
              >
                <div className="text-[9.5px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
                  Clasificación sugerida
                </div>
                <div className="text-[11.5px] font-semibold text-[var(--lv-navy)] mt-0.5">
                  {active.aiSuggestion}
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                {active.topPredictions.map((p) => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="text-[9.5px] text-[var(--lv-text)] w-28 truncate">{p.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-[var(--lv-surface-3)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.confidence}%`, background: colorVar(p.color) }}
                      />
                    </div>
                    <span className="text-[9.5px] font-semibold tabular-nums w-8 text-right" style={{ color: colorVar(p.color) }}>
                      {p.confidence}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-1.5">
                <motion.button
                  type="button"
                  onClick={onDecide}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-9 w-full rounded-full bg-[var(--lv-navy)] text-white text-[11.5px] font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Confirmar (es defecto)
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onDecide}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-9 w-full rounded-full bg-white text-[var(--lv-navy)] text-[11.5px] font-semibold inline-flex items-center justify-center gap-1.5"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--lv-navy)' }}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Otra categoría
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onDecide}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-9 w-full rounded-full bg-white text-[var(--lv-navy)] text-[11.5px] font-semibold inline-flex items-center justify-center gap-1.5"
                  style={{ boxShadow: 'inset 0 0 0 1px var(--lv-navy)' }}
                >
                  <X className="h-3.5 w-3.5" /> No es defecto
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onDecide}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="h-9 w-full rounded-full bg-transparent text-[var(--muted-foreground)] text-[11.5px] font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <SkipForward className="h-3.5 w-3.5" /> Omitir
                </motion.button>
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
    </motion.div>
  )
})
