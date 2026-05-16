'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { categories } from '@/lib/demo-script'

const colorHex: Record<string, string> = {
  red: 'var(--lv-red)',
  orange: 'var(--lv-orange)',
  cyan: 'var(--lv-cyan)',
  navy: 'var(--lv-navy)',
}

export function CategoriesPills() {
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<string | null>('etiqueta')

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="px-6 md:px-8 py-2"
    >
      <div className="flex items-center gap-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0 pr-3">
          <span
            className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/55"
          >
            Categorías
          </span>
        </div>

        {categories.map((c, i) => {
          const isSelected = selected === c.id
          const color = colorHex[c.color] ?? 'var(--lv-navy)'
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
              whileHover={reduce ? undefined : { scale: 1.04, y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold whitespace-nowrap transition-colors"
              style={{
                background: isSelected ? color : 'rgba(255,255,255,0.08)',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)',
                boxShadow: isSelected ? `0 0 0 3px ${color}33` : undefined,
              }}
              aria-pressed={isSelected}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: isSelected ? 'rgba(255,255,255,0.9)' : color }}
                aria-hidden="true"
              />
              {c.name}
              <span
                className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9.5px] font-bold tabular-nums"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                }}
              >
                {c.count}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
