'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Scenario } from '@/lib/types'

export function FlyingCard({
  flying,
  scenario,
  fromRef,
  toRef,
}: {
  flying: { from: 'incoming' | 'ai'; to: 'ai' | 'queue'; scenarioId: string } | null
  scenario: Scenario | null
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
}) {
  const reduce = useReducedMotion()
  const [coords, setCoords] = useState<{ x: number; y: number; tx: number; ty: number } | null>(null)

  useEffect(() => {
    if (!flying || reduce) {
      setCoords(null)
      return
    }
    const fromEl = fromRef.current
    const toEl = toRef.current
    if (!fromEl || !toEl) return
    const f = fromEl.getBoundingClientRect()
    const t = toEl.getBoundingClientRect()
    setCoords({
      x: f.left + f.width / 2 - 80,
      y: f.top + 40,
      tx: t.left + t.width / 2 - 80,
      ty: t.top + 60,
    })
  }, [flying, reduce, fromRef, toRef])

  return (
    <AnimatePresence>
      {flying && scenario && coords && (
        <motion.div
          key={`${flying.scenarioId}-${flying.from}-${flying.to}`}
          initial={{ x: coords.x, y: coords.y, scale: 1, opacity: 1 }}
          animate={{ x: coords.tx, y: coords.ty, scale: flying.to === 'queue' ? 0.7 : 0.9, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: flying.to === 'queue' ? 1 : 0.85, ease: [0.5, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 160,
            height: 90,
            zIndex: 50,
            pointerEvents: 'none',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(36,46,143,0.25)',
            background: '#fff',
          }}
        >
          <img
            src={scenario.image || '/placeholder.svg'}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
