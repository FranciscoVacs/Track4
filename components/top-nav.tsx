'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function TopNav() {
  const reduce = useReducedMotion()
  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white border-b border-[var(--lv-pattern)]">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="6" fill="var(--lv-navy)" />
            <path
              d="M8 7 L8 25 L15 25 L15 21 L12 21 L12 7 Z"
              fill="var(--lv-yellow)"
            />
            <path
              d="M17 7 L19 19 L21 7 L24 7 L21 25 L17 25 L14 7 Z"
              fill="#fff"
              transform="translate(0,0)"
            />
          </svg>
          <span className="font-display font-extrabold uppercase tracking-[0.12em] text-[var(--lv-navy)] text-sm">
            Quality Vision
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--lv-light-bg)] border border-[var(--lv-pattern)]">
            <span className="relative flex h-2 w-2">
              {!reduce && (
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--lv-navy)]">
              Line 03 · Live
            </span>
          </div>
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-[var(--lv-light-bg)] border border-[var(--lv-pattern)]">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--lv-navy)]">
              Model v2.4
            </span>
          </div>
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--lv-navy)' }}
            aria-label="Operadora M. González"
          >
            MG
          </div>
        </div>
      </div>
    </header>
  )
}
