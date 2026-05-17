'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { ProductionReviewDialog } from '@/components/production-review-dialog'

export function TopNav({
  playState,
  onPlay,
  onPause,
  onReplay,
}: {
  playState: 'idle' | 'playing' | 'paused' | 'completed'
  onPlay: () => void
  onPause: () => void
  onReplay: () => void
}) {
  const reduce = useReducedMotion()

  const handleDemoClick = () => {
    if (playState === 'playing') onPause()
    else if (playState === 'completed') onReplay()
    else onPlay()
  }

  const demoLabel =
    playState === 'playing' ? 'Pausar demo' : playState === 'completed' ? 'Repetir' : 'Reproducir demo'
  const DemoIcon = playState === 'playing' ? Pause : playState === 'completed' ? RotateCcw : Play

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-40 h-10 w-full"
      style={{
        background: 'var(--lv-navy)',
        // Thin yellow gradient accent line at the bottom
        backgroundImage:
          'linear-gradient(var(--lv-navy), var(--lv-navy)), linear-gradient(90deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)',
        backgroundOrigin: 'padding-box, border-box',
        backgroundClip: 'padding-box, border-box',
        borderBottom: '1px solid transparent',
      }}
    >
      <div
        className="h-full px-5 flex items-center justify-between relative"
        style={{
          boxShadow: 'inset 0 -1px 0 0 rgba(246, 211, 0, 0.4)',
        }}
      >
        {/* Left: ultra-compact wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-display text-[15px] font-extrabold italic tracking-tight leading-none text-white">
            LV
          </span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span
            className="text-[9.5px] uppercase font-semibold leading-none text-white/80"
            style={{ letterSpacing: '0.22em' }}
          >
            Quality Vision
          </span>
        </div>

        {/* Right: production review + play demo + avatar */}
        <div className="flex items-center gap-2">
          <ProductionReviewDialog />
          <motion.button
            type="button"
            onClick={handleDemoClick}
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-semibold text-[10.5px] leading-none"
            style={{
              background: 'linear-gradient(90deg, var(--lv-yellow) 0%, var(--lv-orange) 100%)',
              color: 'var(--lv-navy)',
            }}
          >
            <DemoIcon className="h-2.5 w-2.5" aria-hidden="true" />
            {demoLabel}
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
