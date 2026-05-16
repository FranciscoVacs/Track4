'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { RosterItem } from '@/lib/types'
import { categories } from '@/lib/mock-data'

export function ReviewDrawer({
  item,
  onClose,
}: {
  item: RosterItem | null
  onClose: () => void
}) {
  const cat = item ? categories.find((c) => c.id === item.defectId) : null

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            initial={{ x: 384 }}
            animate={{ x: 0 }}
            exit={{ x: 384 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-[var(--lv-pattern)] z-50 flex flex-col"
            role="dialog"
            aria-label="Revisión del operador"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--lv-pattern)]">
              <span className="font-display font-extrabold text-sm uppercase tracking-wider text-[var(--lv-navy)]">
                Revisión del operador
              </span>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full inline-flex items-center justify-center hover:bg-[var(--lv-light-bg)]"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4 text-[var(--lv-navy)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--lv-light-bg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={`Producto ${item.id}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  background: 'color-mix(in srgb, var(--lv-orange) 10%, white)',
                  borderLeft: '4px solid var(--lv-orange)',
                }}
              >
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--lv-orange)]">
                  Sugerencia IA
                </div>
                <div className="mt-0.5 text-sm font-semibold text-[var(--lv-text)]">
                  {cat?.name ?? 'Etiqueta desalineada'} ({item.confidence}%)
                </div>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-5 py-3 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'var(--lv-navy)' }}
                >
                  Confirmar sugerencia
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-5 py-3 rounded-full text-sm font-semibold"
                  style={{ background: 'var(--lv-yellow)', color: 'var(--lv-navy)' }}
                >
                  Sobreescribir clasificación
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-5 py-3 rounded-full text-sm font-semibold bg-white border"
                  style={{ borderColor: 'var(--lv-navy)', color: 'var(--lv-navy)' }}
                >
                  No es defecto
                </motion.button>
              </div>

              <div>
                <label
                  htmlFor="op-notes"
                  className="block text-[11px] uppercase tracking-wider font-semibold text-[var(--lv-navy)] mb-1.5"
                >
                  Notas del operador
                </label>
                <textarea
                  id="op-notes"
                  rows={4}
                  placeholder="Notas del operador..."
                  className="w-full rounded-xl border border-[var(--lv-pattern)] p-3 text-sm bg-[var(--lv-light-bg)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--lv-navy)]/30"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[var(--lv-pattern)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--lv-text)]/70">
                {item.operator} · Turno tarde
              </span>
              <span className="text-[11px] font-semibold text-[var(--lv-navy)] tabular-nums">
                {item.timestamp}
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
