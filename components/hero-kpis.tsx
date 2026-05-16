'use client'

import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.0,
  className,
}: {
  value: number
  decimals?: number
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toString()))
  const [display, setDisplay] = useState(reduce ? (decimals ? value.toFixed(decimals) : String(Math.round(value))) : '0')

  useEffect(() => {
    if (reduce) {
      setDisplay(decimals ? value.toFixed(decimals) : String(Math.round(value)))
      return
    }
    const unsub = rounded.on('change', (v) => setDisplay(v))
    const controls = animate(mv, value, { duration, ease: 'easeOut' })
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, decimals, mv, rounded, duration, reduce])

  return <span className={className}>{display}</span>
}

export function HeroKpis({
  inspected,
  autoPct,
  awaitingReview,
  modelProgress,
}: {
  inspected: number
  autoPct: number
  awaitingReview: number
  modelProgress: number
}) {
  const reduce = useReducedMotion()
  const pct = Math.min(100, Math.round((modelProgress / 50) * 100))

  return (
    <motion.section
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 md:px-8 pt-3 pb-1"
      aria-label="Indicadores en vivo"
    >
      <div
        className="flex items-center gap-5 rounded-lg px-5 py-2.5"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        {/* Primary KPI */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-baseline gap-0.5">
            <AnimatedNumber
              value={autoPct}
              decimals={1}
              className="font-display text-2xl font-extrabold tracking-tight text-white tabular-nums"
            />
            <span className="text-base font-bold text-white/60">%</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-white/70 leading-tight">
            Auto-clasif.
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            +1.2%
          </span>
        </div>

        <span className="h-5 w-px bg-white/20" aria-hidden="true" />

        {/* Inspections */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AnimatedNumber
            value={inspected}
            className="font-display text-2xl font-extrabold tracking-tight text-white tabular-nums"
          />
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-white/70 leading-tight">
            Inspeccionadas
          </span>
        </div>

        <span className="h-5 w-px bg-white/20" aria-hidden="true" />

        {/* Awaiting review */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-2xl font-extrabold tracking-tight text-white tabular-nums"
            >
              {awaitingReview}
            </motion.span>
            {!reduce && (
              <motion.span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: 'var(--lv-orange)' }}
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
          </div>
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-white/70 leading-tight">
            Por revisar
          </span>
        </div>

        <span className="h-5 w-px bg-white/20" aria-hidden="true" />

        {/* Model progress */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-display text-2xl font-extrabold tracking-tight text-white tabular-nums">
            {modelProgress}
          </span>
          <span className="text-sm text-white/50 tabular-nums font-semibold">/50</span>
          <div className="w-20 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)',
              }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-white/70 leading-tight hidden md:block">
            Reentrenar
          </span>
        </div>
      </div>
    </motion.section>
  )
}
