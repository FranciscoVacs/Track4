'use client'

import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

type KPI = { value: number; label: string; suffix?: string; decimals?: number }

const kpis: KPI[] = [
  { value: 247, label: 'Units inspected today' },
  { value: 12, label: 'Defects flagged' },
  { value: 98.4, label: 'Model accuracy', suffix: '%', decimals: 1 },
  { value: 3, label: 'Pending review' },
]

function Counter({ kpi, delay }: { kpi: KPI; delay: number }) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) =>
    kpi.decimals ? v.toFixed(kpi.decimals) : Math.round(v).toString(),
  )
  const [display, setDisplay] = useState(reduce ? kpi.value.toString() : '0')

  useEffect(() => {
    if (reduce) {
      setDisplay(kpi.decimals ? kpi.value.toFixed(kpi.decimals) : String(kpi.value))
      return
    }
    const unsub = rounded.on('change', (v) => setDisplay(v))
    const controls = animate(mv, kpi.value, {
      duration: 1.2,
      ease: 'easeOut',
      delay,
    })
    return () => {
      controls.stop()
      unsub()
    }
  }, [kpi.value, kpi.decimals, mv, rounded, delay, reduce])

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline">
        <span className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none tabular-nums">
          {display}
        </span>
        {kpi.suffix && (
          <span className="font-display text-2xl md:text-3xl font-extrabold text-white/95 ml-0.5">
            {kpi.suffix}
          </span>
        )}
      </div>
      <span className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.12em] font-semibold text-white/90">
        {kpi.label}
      </span>
    </div>
  )
}

export function HeroKpis() {
  return (
    <section
      className="relative w-full h-36 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)',
      }}
      aria-label="Indicadores de inspección"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 lv-pattern-bg"
        style={{ opacity: 0.1, mixBlendMode: 'overlay' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative h-full px-8 grid grid-cols-2 md:grid-cols-4 items-center gap-6"
      >
        {kpis.map((k, i) => (
          <Counter key={k.label} kpi={k} delay={i * 0.12} />
        ))}
      </motion.div>
    </section>
  )
}
