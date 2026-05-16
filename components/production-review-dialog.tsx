'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Radio, Video, X } from 'lucide-react'

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
        <Video className="h-2.5 w-2.5" aria-hidden="true" />
        Revisión
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/45"
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
              className="fixed top-1/2 left-1/2 z-50 w-[820px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border"
              style={{
                background: 'linear-gradient(180deg, rgba(36,46,143,0.98) 0%, rgba(19,25,69,0.98) 100%)',
                borderColor: 'rgba(255,255,255,0.14)',
                boxShadow: '0 24px 80px rgba(8, 11, 28, 0.42)',
              }}
            >
              <div
                className="flex items-start justify-between gap-4 border-b px-5 py-4"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-white">Revisión de producción</h2>
                  <p className="mt-1 text-xs text-white/70">
                    Vista de la cámara de línea para revisar el flujo de video enviado desde planta.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75"
                    style={{
                      borderColor: 'rgba(255,255,255,0.16)',
                      background: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Radio className="h-3 w-3 text-[var(--lv-red)]" aria-hidden="true" />
                    Feed local
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                    style={{
                      borderColor: 'rgba(255,255,255,0.16)',
                      background: 'rgba(255,255,255,0.06)',
                    }}
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4 sm:hidden" aria-hidden="true" />
                    <span className="hidden sm:inline">Cerrar</span>
                  </button>
                </div>
              </div>

              <div className="px-5 py-5">
                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'rgba(10,14,38,0.9)',
                  }}
                >
                  <div
                    className="flex items-center justify-between border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <span>Cam 01</span>
                    <span>Feed continuo</span>
                  </div>

                  <div className="flex items-center justify-center bg-black px-3 py-3 sm:px-4">
                    <video
                      className="block h-auto max-h-[48vh] w-auto max-w-full sm:max-h-[56vh]"
                      style={{ background: 'rgba(8,11,28,1)' }}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    >
                      <source src="/media/videofabrica.mp4" type="video/mp4" />
                      Tu navegador no puede reproducir este video.
                    </video>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-1"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}
                  >
                    Reproducción directa desde archivo local
                  </span>
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-1"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}
                  >
                    Uso rápido para supervisor y control de calidad
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
