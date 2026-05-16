'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { categories, colorHex } from '@/lib/mock-data'
import type { RosterItem } from '@/lib/types'

export function RosterCard({
  item,
  index,
  onSelect,
}: {
  item: RosterItem
  index: number
  onSelect: (item: RosterItem) => void
}) {
  const reduce = useReducedMotion()
  const cat = categories.find((c) => c.id === item.defectId)!
  const color =
    item.status === 'approved' ? colorHex.cyan : colorHex[cat.color]

  return (
    <motion.button
      type="button"
      onClick={() => item.needsReview && onSelect(item)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        damping: 24,
        stiffness: 200,
      }}
      whileHover={{ y: -2 }}
      className="relative aspect-square rounded-xl overflow-hidden bg-white text-left group focus:outline-none focus:ring-2 focus:ring-[var(--lv-navy)]"
      style={{ borderLeft: `4px solid ${color}` }}
      aria-label={`${item.label} — ${item.timestamp} — ${item.camera}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image || "/placeholder.svg"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Category badge top-left */}
      <div
        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
        style={{
          background: color,
          color:
            cat.color === 'yellow' || (item.status === 'approved' ? false : false)
              ? 'var(--lv-navy)'
              : '#fff',
        }}
      >
        {item.status === 'approved' ? 'Aprobado' : cat.name}
      </div>

      {/* REVISAR badge */}
      {item.needsReview && (
        <motion.div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
          style={{ background: 'var(--lv-yellow)', color: 'var(--lv-navy)' }}
          animate={reduce ? {} : { scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          Revisar
        </motion.div>
      )}

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2.5 py-2 text-[10px] font-semibold text-white"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))',
        }}
      >
        {item.timestamp} · {item.camera}
      </div>
    </motion.button>
  )
}
