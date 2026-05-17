'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import type { Phase, Scenario } from '@/lib/types'

const colorVar = (c: 'red' | 'orange' | 'cyan' | 'navy') => `var(--lv-${c})`

function verdictEs(t: 'approved' | 'minor' | 'defect' | 'review' | 'learned') {
  switch (t) {
    case 'approved':
      return 'APROBADO'
    case 'minor':
      return 'DEFECTO MENOR'
    case 'defect':
      return 'DEFECTO'
    case 'review':
      return 'REVISIÓN'
    case 'learned':
      return 'APRENDIDO'
  }
}

const verdictStyle = {
  approved: { bg: '#10B981', text: '#fff', icon: '✓' },
  minor: { bg: 'var(--lv-yellow)', text: 'var(--lv-navy)', icon: '⚠' },
  defect: { bg: 'var(--lv-red)', text: '#fff', icon: '!' },
  review: { bg: 'var(--lv-orange)', text: '#fff', icon: '?' },
  learned: { bg: 'var(--lv-red)', text: '#fff', icon: '!' },
}

export function AiClassifying({
  scenario,
  phase,
  oscillationIndex,
  learnedBadge,
}: {
  scenario: Scenario | null
  phase: Phase
  oscillationIndex: number
  learnedBadge: boolean
}) {
  const reduce = useReducedMotion()
  const scanlineRef = useRef<HTMLDivElement>(null)
  const scanTweenRef = useRef<gsap.core.Tween | null>(null)

  const isAnalyzing = phase === 'scanning' || phase === 'barcode' || phase === 'bboxes'
  const showBboxes = phase === 'bboxes' || phase === 'verdict' || phase === 'flying-to-queue'
  const showVerdict = phase === 'verdict' || phase === 'flying-to-queue'
  const showBarcode = phase === 'barcode'
  const shake = scenario?.type === 'review' && phase === 'bboxes'

  // Current confidence value based on phase + oscillation
  let confidence = 0
  if (scenario) {
    if (phase === 'scanning' || phase === 'barcode') {
      confidence = Math.round(scenario.finalConfidence * 0.4)
    } else if (phase === 'bboxes') {
      if (scenario.type === 'review' && scenario.oscillation) {
        confidence = scenario.oscillation[Math.min(oscillationIndex, scenario.oscillation.length - 1)]
      } else {
        confidence = scenario.finalConfidence
      }
    } else if (showVerdict) {
      confidence = scenario.finalConfidence
    }
  }

  const verdictTone = scenario?.verdict.tone
  const confidenceColor = !scenario
    ? 'var(--lv-navy)'
    : verdictTone === 'approved'
    ? '#10B981'
    : verdictTone === 'minor'
    ? 'var(--lv-yellow)'
    : verdictTone === 'defect' || verdictTone === 'learned'
    ? 'var(--lv-red)'
    : verdictTone === 'review'
    ? 'var(--lv-orange)'
    : 'var(--lv-navy)'

  useEffect(() => {
    if (reduce) return
    const el = scanlineRef.current
    if (!el) return
    if (isAnalyzing) {
      scanTweenRef.current?.kill()
      gsap.set(el, { yPercent: -20, opacity: 1 })
      scanTweenRef.current = gsap.to(el, {
        yPercent: 1100,
        duration: 3.2,
        ease: 'power1.inOut',
        repeat: -1,
      })
    } else {
      scanTweenRef.current?.kill()
      scanTweenRef.current = null
      gsap.set(el, { opacity: 0 })
    }
    return () => {
      scanTweenRef.current?.kill()
    }
  }, [isAnalyzing, reduce])

  const v = scenario ? verdictStyle[scenario.verdict.tone] : null

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
      className="lv-card-elevated p-6 h-[600px] flex flex-col relative"
    >
      {/* gentle navy pulse on review */}
      {!reduce && scenario?.verdict.tone === 'review' && showVerdict && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[0.875rem]"
          animate={{ boxShadow: ['0 0 0 0 rgba(36,46,143,0)', '0 0 0 10px rgba(36,46,143,0.08)', '0 0 0 0 rgba(36,46,143,0)'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: isAnalyzing ? 'var(--lv-cyan)' : confidenceColor, transition: 'background 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            aria-hidden="true"
          />
          <span className="uppercase-label text-[12px]">Resultado de inferencia</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
          {scenario?.camera ?? 'CAM 03'} · Etiqueta frontal
        </span>
      </div>

      <motion.div
        className="relative rounded-lg overflow-hidden bg-[var(--lv-surface-3)]"
        style={{ aspectRatio: '16/9' }}
        animate={shake && !reduce ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {scenario && phase !== 'idle' && (
            <motion.img
              key={scenario.id}
              src={scenario.image || '/placeholder.svg'}
              alt={scenario.productName}
              className="absolute inset-0 w-full h-full object-cover"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement
                img.style.display = 'none'
              }}
            />
          )}
        </AnimatePresence>

        {(!scenario || phase === 'idle') && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
            Esperando próxima imagen…
          </div>
        )}

        {/* Scanline */}
        <div
          ref={scanlineRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0"
          style={{
            height: 4,
            background: 'linear-gradient(90deg, transparent 0%, var(--lv-cyan) 50%, transparent 100%)',
            filter: 'blur(2px)',
            boxShadow: '0 0 12px rgba(17,165,214,0.7)',
            opacity: 0,
          }}
        />

        {/* Barcode overlay */}
        <AnimatePresence>
          {showBarcode && scenario?.hasBarcode && (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute"
              style={{ bottom: '14%', left: '14%', width: '36%' }}
            >
              <div className="h-6 rounded-md border-2 border-[var(--lv-cyan)] bg-white/80 backdrop-blur-sm" />
              <motion.div
                className="mt-2 inline-block px-2.5 py-1.5 rounded-md bg-white shadow-sm text-[11px] font-semibold text-[var(--lv-navy)]"
                style={{ border: '1px solid var(--lv-cyan)', boxShadow: '0 2px 8px rgba(17,165,214,0.15)' }}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Leyendo código de barras: {scenario.barcodeText}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bounding boxes */}
        <AnimatePresence>
          {showBboxes &&
            scenario?.bboxes.map((b, i) => (
              <motion.div
                key={b.id}
                className="absolute"
                style={{ top: b.top, left: b.left, width: b.width, height: b.height }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                animate={
                  b.flicker && !reduce
                    ? { opacity: [0.4, 1, 0.6, 1], scale: 1 }
                    : { opacity: 1, scale: 1 }
                }
                exit={{ opacity: 0 }}
                transition={
                  b.flicker
                    ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }
                    : { type: 'spring', stiffness: 160, damping: 22, delay: i * 0.25 }
                }
              >
                <div
                  className="w-full h-full rounded border-2"
                  style={{ borderColor: colorVar(b.color), boxShadow: `inset 0 0 0 1px ${colorVar(b.color)}33` }}
                />
                <div
                  className="absolute -top-7 left-0 px-2 py-0.5 rounded shadow-sm text-[11px] font-semibold whitespace-nowrap"
                  style={{ background: colorVar(b.color), color: '#fff' }}
                >
                  {b.label} <span className="tabular-nums opacity-80">· {b.confidence}%</span>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Learned badge */}
        <AnimatePresence>
          {learnedBadge && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[var(--lv-navy)] text-[10px] font-bold uppercase tracking-wider shadow-sm"
              style={{ background: 'linear-gradient(90deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)' }}
            >
              Aprendido de tu última revisión
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DECISION SUPPORT — confidence dominates */}
      <div className="mt-5 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-[var(--muted-foreground)]">
            Confianza
          </span>
          <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-[var(--muted-foreground)]">
            Veredicto
          </span>
        </div>
        <div className="flex items-end justify-between mb-2.5">
          <div className="flex items-baseline">
            <motion.span
              key={confidence}
              initial={reduce ? false : { opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[44px] leading-none font-extrabold tracking-tight tabular-nums"
              style={{ color: confidenceColor, transition: 'color 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {confidence}
            </motion.span>
            <span
              className="font-display text-xl font-extrabold ml-0.5"
              style={{ color: confidenceColor, opacity: 0.6, transition: 'color 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              %
            </span>
          </div>
          <span
            className="font-display font-extrabold text-sm tracking-[0.12em] uppercase"
            style={{ color: confidenceColor, transition: 'color 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {scenario && showVerdict ? verdictEs(scenario.verdict.tone) : '—'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--lv-surface-3)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: confidenceColor, transition: 'background 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            initial={false}
            animate={{ width: `${confidence}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 22 }}
          />
        </div>

        {/* Verdict banner */}
        <div className="mt-4 h-12 relative">
          <AnimatePresence mode="wait">
            {showVerdict && scenario && v && (
              <motion.div
                key={scenario.id + scenario.verdict.tone}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                className="h-full w-full rounded-lg px-4 flex items-center gap-3"
                style={{ background: v.bg }}
              >
                <span
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.25)', color: v.text }}
                >
                  {v.icon}
                </span>
                <span className="font-display font-extrabold text-sm tracking-wider uppercase" style={{ color: v.text }}>
                  {scenario.verdict.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
