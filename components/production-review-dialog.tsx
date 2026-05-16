'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ClipboardCheck, X } from 'lucide-react'

export function ProductionReviewDialog() {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={reduce ? undefined : { scale: 1.04 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-semibold text-[10.5px] leading-none border border-white/20 text-white/90 hover:bg-white/10"
        aria-label="Revisión de producción"
      >
        <ClipboardCheck className="h-2.5 w-2.5" aria-hidden="true" />
        Revisión
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] max-w-[92vw] lv-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-display font-extrabold text-[var(--lv-navy)] text-base">
                    Revisión de producción
                  </h2>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Estado actual de la línea 03
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--lv-navy)]"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 text-[12px] text-[var(--lv-text)]">
                <p>
                  Subí imágenes en <strong>Productos entrantes</strong> para que el sistema las
                  analice automáticamente con la IA.
                </p>
                <p>
                  Los productos con veredicto de revisión van a la cola del operador para que
                  decidas el siguiente paso.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-[var(--lv-navy)] text-white text-[11px] font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
