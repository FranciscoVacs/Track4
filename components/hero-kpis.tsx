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

function MiniKpi({
  index,
  label,
  children,
}: {
  index: number
  label: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 * index }}
      className="flex flex-col justify-center"
    >
      {children}
      <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--muted-foreground)]">
        {label}
      </span>
    </motion.div>
  )
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
    <section className="px-6 md:px-8 pt-5 pb-3" aria-label="Indicadores en vivo">
      <div className="grid grid-cols-12 gap-4">
        {/* PRIMARY KPI — dominant, command-center vibe */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="col-span-12 md:col-span-5 relative rounded-2xl overflow-hidden"
          style={{
            background: '#fff',
            boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 24px 60px -32px rgba(36,46,143,0.35)',
          }}
        >
          {/* radial gradient glow inside (yellow→orange) — energy without a yellow block */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 100% 100%, rgba(246,211,0,0.18) 0%, rgba(245,130,32,0.08) 30%, transparent 60%)',
            }}
          />
          <div className="relative px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-[var(--lv-navy)]/65 mb-1.5">
                Tasa de auto-clasificación
              </span>
              <div className="flex items-baseline">
                <AnimatedNumber
                  value={autoPct}
                  decimals={1}
                  className="font-display text-[64px] leading-[0.95] font-extrabold tracking-tight text-[var(--lv-navy)] tabular-nums"
                />
                <span className="font-display text-3xl font-extrabold text-[var(--lv-navy)]/55 ml-1">%</span>
              </div>
              <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="tabular-nums">+1.2%</span>
                <span className="text-[var(--muted-foreground)] font-medium">vs ayer · sin intervención humana</span>
              </span>
            </div>
            {/* Subtle ring indicator on the right */}
            <div className="hidden md:flex shrink-0 items-center justify-center" aria-hidden="true">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx={36} cy={36} r={30} stroke="var(--lv-surface-3)" strokeWidth={6} fill="none" />
                <motion.circle
                  cx={36}
                  cy={36}
                  r={30}
                  stroke="url(#kpiGrad)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: autoPct / 100 }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px' }}
                />
                <defs>
                  <linearGradient id="kpiGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--lv-yellow)" />
                    <stop offset="100%" stopColor="var(--lv-orange)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* SECONDARY KPIs — single bare card, no per-cell borders, divided by hairlines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          className="col-span-12 md:col-span-7 rounded-2xl bg-white"
          style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
        >
          <div className="grid grid-cols-3 divide-x divide-[var(--lv-hairline)] h-full px-2">
            <div className="px-4 py-4">
              <MiniKpi index={1} label="Inspecciones última hora">
                <AnimatedNumber
                  value={inspected}
                  className="font-display text-3xl font-extrabold tracking-tight text-[var(--lv-navy)] leading-none tabular-nums"
                />
              </MiniKpi>
            </div>
            <div className="px-4 py-4">
              <MiniKpi index={2} label="Esperan tu revisión">
                <div className="flex items-baseline gap-2">
                  <motion.span
                    animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="font-display text-3xl font-extrabold tracking-tight text-[var(--lv-navy)] leading-none tabular-nums"
                  >
                    {awaitingReview}
                  </motion.span>
                  {!reduce && (
                    <motion.span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: 'var(--lv-orange)' }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              </MiniKpi>
            </div>
            <div className="px-4 py-4">
              <MiniKpi index={3} label={`v2.4 · ${modelProgress}/50 al reentrenar`}>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-[var(--lv-navy)] leading-none tabular-nums">
                    {modelProgress}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] tabular-nums">/50</span>
                </div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-[var(--lv-surface-3)] overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)',
                    }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  />
                </div>
              </MiniKpi>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
