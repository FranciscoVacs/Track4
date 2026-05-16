'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function StatusStrip() {
  const reduce = useReducedMotion()
  return (
    <div
      className="sticky bottom-0 z-30 h-10 px-8 flex items-center justify-between text-xs text-white"
      style={{ background: 'var(--lv-navy)' }}
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
        <span className="font-semibold tracking-wide">
          LIVE · Camera 03 connected · Model v2.4
        </span>
      </div>
      <div className="hidden sm:block tabular-nums text-white/90">
        247 inspections today · 12 pending review · Last update 14:32
      </div>
    </div>
  )
}
