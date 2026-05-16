'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
} from 'framer-motion'
import gsap from 'gsap'
import { Upload, Camera, RotateCcw, AlertCircle } from 'lucide-react'
import { colorHex } from '@/lib/mock-data'
import type { ScenarioBox } from '@/lib/types'
import type { Capsule, AIInspectionResult } from '@/lib/schema'
import { classifyImage } from '@/app/actions/classify'

type State = 'empty' | 'analyzing' | 'result'

const DEFECT_COLOR: Record<string, ScenarioBox['color']> = {
  forma: 'orange',
  color: 'orange',
  dano: 'red',
  posicion: 'cyan',
}

function capsulesToBboxes(capsules: Capsule[]): ScenarioBox[] {
  return capsules
    .filter((c) => c.isDefective)
    .map((c) => ({
      id: String(c.id),
      top: `${c.top}%`,
      left: `${c.left}%`,
      width: `${c.width}%`,
      height: `${c.height}%`,
      color: DEFECT_COLOR[c.defectType ?? ''] ?? 'red',
      label: c.defectType ?? 'defecto',
      confidence: 95,
    }))
}

function ConfidenceNumber({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const t = useTransform(mv, (v) => Math.round(v).toString())
  const [d, setD] = useState(reduce ? String(value) : '0')
  useEffect(() => {
    if (reduce) {
      setD(String(value))
      return
    }
    const unsub = t.on('change', (v) => setD(v))
    const c = animate(mv, value, { duration: 0.9, ease: 'easeOut' })
    return () => {
      c.stop()
      unsub()
    }
  }, [value, mv, t, reduce])
  return <span className="tabular-nums">{d}%</span>
}

function BBox({ box, index }: { box: ScenarioBox; index: number }) {
  const color = colorHex[box.color]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.2, type: 'spring', stiffness: 200, damping: 18 }}
      className="absolute pointer-events-none"
      style={{
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        borderWidth: 2,
        borderColor: color,
        borderStyle: 'solid',
        borderRadius: 6,
        boxShadow: `0 0 0 1px ${color}33`,
      }}
    >
      <div
        className="absolute -top-7 left-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-[var(--lv-navy)] text-[11px] font-semibold whitespace-nowrap shadow-md"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <span>{box.label}</span>
        <span className="text-[var(--lv-text)]/70">·</span>
        <ConfidenceNumber value={box.confidence} />
      </div>
    </motion.div>
  )
}

export function InspectionPanel() {
  const [state, setState] = useState<State>('empty')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<(AIInspectionResult & { model: string; processingMs: number }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const progressW = useTransform(progress, (v) => `${v}%`)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (state !== 'analyzing') return
    let tl: gsap.core.Timeline | undefined
    if (scanRef.current && !reduce) {
      gsap.set(scanRef.current, { y: '-10%' })
      tl = gsap.timeline({ repeat: -1 })
      tl.to(scanRef.current, { y: '110%', duration: 2.4, ease: 'power1.inOut' })
    }
    // Avanza suavemente hasta 90% — se resetea cuando llega el resultado
    const c = animate(progress, 90, { duration: 8, ease: 'easeOut' })
    return () => {
      tl?.kill()
      c.stop()
      progress.set(0)
    }
  }, [state, progress, reduce])

  async function handleAnalyze(file: File) {
    setState('analyzing')
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    const result = await classifyImage(formData)

    if (result.success) {
      setAiResult(result.data)
      setState('result')
    } else {
      setError(result.error)
      setState('empty')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    handleAnalyze(file)
    e.target.value = ''
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setState('empty')
    setPreviewUrl(null)
    setAiResult(null)
    setError(null)
  }

  const bboxes = aiResult ? capsulesToBboxes(aiResult.capsules) : []
  const defectCount = aiResult?.capsules.filter((c) => c.isDefective).length ?? 0
  const isApproved = aiResult?.verdict === 'APPROVED'

  return (
    <div className="lv-card p-6 min-h-[560px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="uppercase-label text-xs">Current Inspection</span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--lv-light-bg)] border border-[var(--lv-pattern)] text-[11px] font-semibold tracking-wider uppercase text-[var(--lv-navy)]">
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          CAM 03 · Front-label
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Seleccionar imagen de producto"
      />

      <AnimatePresence mode="wait">
        {state === 'empty' && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                style={{
                  background: 'color-mix(in srgb, var(--lv-red) 10%, white)',
                  borderLeft: '4px solid var(--lv-red)',
                  color: 'var(--lv-red)',
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </motion.div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors hover:bg-[var(--lv-light-bg)]"
              style={{ borderColor: 'rgba(36,46,143,0.2)' }}
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(36,46,143,0.06)' }}
              >
                <Upload className="h-5 w-5 text-[var(--lv-navy)]" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-[var(--lv-navy)]">
                  Drop product image here
                </p>
                <p className="text-xs text-[var(--lv-text)]/60 mt-0.5">
                  or click to browse · JPEG, PNG, WebP · max 4 MB
                </p>
              </div>
            </button>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                style={{ background: 'var(--lv-navy)' }}
              >
                Upload image
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="px-5 py-2.5 rounded-full text-sm font-semibold border opacity-70 cursor-not-allowed inline-flex items-center gap-2"
                style={{ borderColor: 'var(--lv-navy)', color: 'var(--lv-navy)' }}
                aria-disabled="true"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Take from camera
              </motion.button>
            </div>
          </motion.div>
        )}

        {state !== 'empty' && (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--lv-light-bg)]">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Producto en inspección"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {state === 'analyzing' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/30">
                  <motion.div
                    className="h-full"
                    style={{ width: progressW, background: 'var(--lv-cyan)' }}
                  />
                </div>
              )}

              {state === 'analyzing' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    ref={scanRef}
                    className="absolute left-0 right-0 h-1 blur-sm"
                    style={{
                      background: 'linear-gradient(90deg, transparent, var(--lv-cyan), transparent)',
                      filter: 'drop-shadow(0 0 12px var(--lv-cyan))',
                      top: 0,
                    }}
                  />
                </div>
              )}

              {state === 'analyzing' && (
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: 'var(--lv-cyan)' }}
                    animate={reduce ? {} : { opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--lv-navy)]">
                    Analyzing
                  </span>
                </div>
              )}

              {state === 'result' &&
                bboxes.map((b, i) => (
                  <BBox key={b.id} box={b} index={i} />
                ))}
            </div>

            {state === 'result' && aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 rounded-xl p-4 flex flex-col md:flex-row md:items-start gap-3"
                style={{
                  background: isApproved
                    ? 'color-mix(in srgb, var(--lv-cyan) 10%, white)'
                    : 'color-mix(in srgb, var(--lv-red) 10%, white)',
                  borderLeft: `4px solid ${isApproved ? 'var(--lv-cyan)' : 'var(--lv-red)'}`,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display font-extrabold uppercase tracking-wider text-sm"
                    style={{ color: isApproved ? 'var(--lv-cyan)' : 'var(--lv-red)' }}
                  >
                    {isApproved ? 'Aprobado' : 'Rechazado'}
                  </div>
                  <div className="text-sm text-[var(--lv-text)] mt-0.5">
                    {isApproved
                      ? `${aiResult.totalDetected} cápsulas · todas en orden`
                      : `${defectCount} defecto${defectCount !== 1 ? 's' : ''} detectado${defectCount !== 1 ? 's' : ''} · ${aiResult.totalDetected} cápsulas`}
                  </div>
                  <div className="text-xs text-[var(--lv-text)]/60 mt-1 leading-relaxed">
                    {aiResult.reasoning}
                  </div>
                  <div className="text-[10px] text-[var(--lv-text)]/40 mt-1.5 font-mono">
                    {aiResult.model} · {aiResult.processingMs}ms
                    {aiResult.requiresHumanReview && (
                      <span className="ml-2 text-[var(--lv-orange)]">· revisión humana recomendada</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <PillButton variant="filled">Approve AI</PillButton>
                  <PillButton variant="outline">Override</PillButton>
                  <PillButton variant="outline">Recategorize</PillButton>
                </div>
              </motion.div>
            )}

            <div className="mt-3 flex justify-end">
              {state === 'result' && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lv-navy)] hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Inspect another
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PillButton({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: 'filled' | 'outline'
}) {
  const base = 'px-4 py-2 rounded-full text-xs font-semibold transition-colors'
  if (variant === 'filled') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${base} text-white`}
        style={{ background: 'var(--lv-navy)' }}
      >
        {children}
      </motion.button>
    )
  }
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} bg-white border`}
      style={{ borderColor: 'var(--lv-navy)', color: 'var(--lv-navy)' }}
    >
      {children}
    </motion.button>
  )
}
