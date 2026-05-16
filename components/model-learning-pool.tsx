'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { forwardRef, useMemo } from 'react'
import { accuracyHistory } from '@/lib/demo-script'
import type { PoolDecision } from '@/lib/types'

const colorVar = (c: 'navy' | 'red' | 'orange') => `var(--lv-${c})`

export const ModelLearningPool = forwardRef<
  HTMLDivElement,
  {
    count: number
    decisions: PoolDecision[]
    progressRef?: React.RefObject<HTMLDivElement | null>
  }
>(function ModelLearningPool({ count, decisions, progressRef }, ref) {
  const reduce = useReducedMotion()
  const pct = Math.min(100, (count / 50) * 100)

  const path = useMemo(() => {
    const w = 180
    const h = 44
    const min = Math.min(...accuracyHistory)
    const max = Math.max(...accuracyHistory)
    const range = max - min || 1
    return accuracyHistory
      .map((v, i) => {
        const x = (i / (accuracyHistory.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
      className="lv-card h-28 px-6 flex items-center relative overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-6 w-full items-center relative z-10">
        {/* Left: progress */}
        <div className="col-span-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="uppercase-label text-[10.5px]">Aprendizaje del modelo</span>
            <span className="text-[9.5px] text-[var(--muted-foreground)]">v2.4 · hace 14 días</span>
          </div>
          <div ref={progressRef as React.RefObject<HTMLDivElement>} className="relative h-1.5 rounded-full bg-[var(--lv-surface-3)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--lv-navy)]"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
            />
          </div>
          <div className="mt-1.5 text-[10.5px] text-[var(--lv-text)]">
            <span className="font-bold tabular-nums">{count}</span>
            <span className="text-[var(--muted-foreground)]"> / 50 etiquetas hasta próximo reentrenamiento</span>
          </div>
        </div>

        {/* Center: sparkline */}
        <div className="col-span-4 flex flex-col">
          <span className="uppercase-label text-[10px] mb-1.5">Precisión (7 ciclos)</span>
          <div className="flex items-center gap-3">
            <svg width="180" height="44" viewBox="0 0 180 44" className="overflow-visible">
              <motion.path
                d={path}
                fill="none"
                stroke="var(--lv-navy)"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              <circle cx={180} cy={44 - ((accuracyHistory[6] - 94.1) / (98.4 - 94.1)) * 44} r={2.5} fill="var(--lv-orange)" />
            </svg>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg text-[var(--lv-navy)] tabular-nums leading-none">
                {accuracyHistory[accuracyHistory.length - 1]}%
              </span>
              <span className="text-[9.5px] text-emerald-600 font-semibold">+4.3% vs v1.0</span>
            </div>
          </div>
        </div>

        {/* Right: recent decisions */}
        <div className="col-span-3 flex flex-col">
          <span className="uppercase-label text-[10px] mb-1.5">Decisiones recientes</span>
          <div className="flex flex-col gap-1">
            {decisions.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-[9.5px]">
                <span
                  className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-[var(--lv-surface-3)] text-[8px] font-bold text-[var(--lv-navy)] shrink-0"
                  aria-hidden="true"
                >
                  {d.initial}
                </span>
                <span className="text-[var(--muted-foreground)] tabular-nums">{d.timestamp}</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full shrink-0" style={{ background: colorVar(d.decisionColor) }} aria-hidden="true" />
                <span className="text-[var(--lv-text)] truncate">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
})
