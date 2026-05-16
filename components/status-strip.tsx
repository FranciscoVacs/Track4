'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function StatusStrip({
  inspected,
  awaiting,
}: {
  inspected: number
  awaiting: number
}) {
  const reduce = useReducedMotion()
  return (
    <div
      className="sticky bottom-0 z-30 h-10 px-8 flex items-center justify-between text-[11px] text-white"
      style={{ background: 'var(--lv-navy)', borderTop: '1px solid rgba(246,211,0,0.3)' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-flex h-2 w-2">
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.4], opacity: [1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span className="relative inline-block h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="font-semibold tracking-wide text-white/95">
          EN VIVO
          <span className="text-white/50"> · </span>
          Cámara 03
          <span className="text-white/50"> · </span>
          <span className="text-white/75">cam-03.lv-factory.local</span>
          <span className="text-white/50"> · </span>
          Modelo v2.4
        </span>
      </div>
      <div className="hidden sm:block tabular-nums text-white/90">
        <span className="font-semibold">{inspected}</span> inspecciones hoy
        <span className="text-white/50"> · </span>
        <span className="font-semibold">{awaiting}</span> pendientes de revisión
        <span className="text-white/50"> · </span>
        Última actualización <span className="font-semibold">14:32</span>
      </div>
    </div>
  )
}
