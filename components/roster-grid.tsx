'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { rosterItems, rosterCounts } from '@/lib/mock-data'
import type { RosterItem } from '@/lib/types'
import { RosterCard } from './roster-card'

type Filter = 'all' | 'flagged' | 'pending' | 'approved'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'flagged', label: 'Flagged' },
  { id: 'pending', label: 'Pending review' },
  { id: 'approved', label: 'Approved' },
]

export function RosterGrid({
  onSelect,
}: {
  onSelect: (item: RosterItem) => void
}) {
  const [active, setActive] = useState<Filter>('all')

  const visible = useMemo(() => {
    if (active === 'all') return rosterItems
    return rosterItems.filter((r) => r.status === active)
  }, [active])

  return (
    <section
      className="relative px-8 py-12 bg-white"
      aria-label="Inspection roster"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, var(--lv-pattern) 0 1px, transparent 1px 14px)',
          opacity: 0.5,
          mixBlendMode: 'multiply',
        }}
      />
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-[var(--lv-navy)]">
              Inspection roster
            </h2>
            <p className="text-sm text-[var(--lv-text)]/60 mt-1">Last 24 hours</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {filters.map((f) => {
            const count = rosterCounts[f.id as keyof typeof rosterCounts]
            const isActive = active === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                className={[
                  'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  isActive
                    ? 'text-white'
                    : 'bg-white text-[var(--lv-navy)] hover:bg-[var(--lv-light-bg)]',
                ].join(' ')}
                style={
                  isActive
                    ? { background: 'var(--lv-navy)', borderColor: 'var(--lv-navy)' }
                    : { borderColor: 'var(--lv-navy)' }
                }
                aria-pressed={isActive}
              >
                {f.label} · {count}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence initial={false}>
            {visible.map((item, i) => (
              <RosterCard
                key={item.id}
                item={item}
                index={i}
                onSelect={onSelect}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
