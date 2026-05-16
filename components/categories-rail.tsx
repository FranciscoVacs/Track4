'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { categories, colorHex } from '@/lib/mock-data'

export function CategoriesRail() {
  const [selected, setSelected] = useState<string | null>('etiqueta')

  return (
    <div className="lv-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="uppercase-label text-xs">Categories</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white"
          style={{ background: 'var(--lv-navy)' }}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Add
        </button>
      </div>

      <ul className="flex flex-col">
        {categories.map((c) => {
          const isSelected = selected === c.id
          const color = colorHex[c.color]
          return (
            <li key={c.id}>
              <motion.button
                type="button"
                onClick={() => setSelected(c.id)}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-[var(--lv-light-bg)] transition-colors"
                style={
                  isSelected
                    ? {
                        background: 'var(--lv-light-bg)',
                        borderLeft: `4px solid ${color}`,
                        paddingLeft: 'calc(0.75rem - 4px)',
                      }
                    : undefined
                }
                aria-pressed={isSelected}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm font-medium text-[var(--lv-text)]">
                  {c.name}
                </span>
                <span
                  className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[11px] font-bold tabular-nums"
                  style={{
                    background: c.count === 0 ? 'var(--lv-light-bg)' : `${color}1A`,
                    color: c.count === 0 ? 'var(--lv-text)' : color,
                  }}
                >
                  {c.count}
                </span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
