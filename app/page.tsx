'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import { TopNav } from '@/components/top-nav'
import { HeroKpis } from '@/components/hero-kpis'
import { CategoriesPills } from '@/components/categories-pills'
import { IncomingFeed } from '@/components/incoming-feed'
import { AiClassifying } from '@/components/ai-classifying'
import { OperatorQueue } from '@/components/operator-queue'
import { ModelLearningPool } from '@/components/model-learning-pool'
import { FlyingCard } from '@/components/flying-card'
import { TrainingParticle } from '@/components/training-particle'
import { StatusStrip } from '@/components/status-strip'
import { useDemoEngine, nowTimestamp } from '@/lib/demo-engine'
import { classifyImage } from '@/app/actions/classify'
import { buildSyntheticScenario } from '@/lib/image-utils'
import type { FeedItem } from '@/lib/types'

export default function Page() {
  const {
    state,
    currentScenario,
    play,
    pause,
    replay,
    dismissRetrain,
    dispatchUpload,
    dispatchUserResult,
    dispatchUserError,
    manualDecide,
  } = useDemoEngine()

  const incomingRef = useRef<HTMLDivElement>(null)
  const classifyingRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef<HTMLDivElement>(null)
  const queueActiveCardRef = useRef<HTMLDivElement>(null)
  const poolProgressRef = useRef<HTMLDivElement>(null)

  const flyingFromRef = state.flyingCard?.from === 'incoming' ? incomingRef : classifyingRef
  const flyingToRef = state.flyingCard?.to === 'ai' ? classifyingRef : queueRef

  const handleDecide = useCallback(
    (decision?: 'confirm' | 'override' | 'reject' | 'skip', feedback?: string) => {
      manualDecide(decision, feedback)
    },
    [manualDecide],
  )

  const handleUpload = useCallback(
    async (file: File, feedItemId: string, objectUrl: string) => {
      const shortName = file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Imagen subida'
      const feedItem: FeedItem = {
        id: `feed-${feedItemId}`,
        scenarioId: feedItemId,
        shortName,
        image: objectUrl,
        timestamp: nowTimestamp(),
        status: 'analyzing',
        source: 'upload',
      }
      dispatchUpload(feedItem)

      const formData = new FormData()
      formData.append('image', file)
      try {
        const result = await classifyImage(formData)
        if (result.success) {
          const scenario = buildSyntheticScenario(feedItemId, objectUrl, shortName, result.data)
          dispatchUserResult(feedItemId, scenario)
        } else {
          dispatchUserError(feedItemId, result.error)
        }
      } catch {
        dispatchUserError(feedItemId, 'Error de red al analizar la imagen')
      }
    },
    [dispatchUpload, dispatchUserResult, dispatchUserError],
  )

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--lv-navy)' }}>
      <TopNav playState={state.playState} onPlay={play} onPause={pause} onReplay={replay} />
      <HeroKpis
        inspected={state.kpis.inspected}
        autoPct={state.kpis.autoPct}
        awaitingReview={state.kpis.awaitingReview}
        modelProgress={state.poolCount}
      />
      <CategoriesPills />

      <section className="px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div ref={incomingRef} className="col-span-12 lg:col-span-3">
            <IncomingFeed items={state.feed} onUpload={handleUpload} />
          </div>
          <div ref={classifyingRef} className="col-span-12 lg:col-span-5">
            <AiClassifying
              scenario={currentScenario}
              phase={state.phase}
              oscillationIndex={state.oscillationIndex}
              learnedBadge={state.learnedBadge}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <OperatorQueue
              ref={queueRef}
              items={state.queue}
              awaiting={state.kpis.awaitingReview}
              onDecide={handleDecide}
              activeCardRef={queueActiveCardRef}
            />
          </div>
        </div>

        <div className="mt-6">
          <ModelLearningPool count={state.poolCount} decisions={state.poolDecisions} progressRef={poolProgressRef} />
        </div>
      </section>

      <FlyingCard
        flying={state.flyingCard}
        scenario={currentScenario}
        fromRef={flyingFromRef}
        toRef={flyingToRef}
      />
      <TrainingParticle
        particleKey={state.particleKey}
        fromRef={queueActiveCardRef}
        toRef={poolProgressRef}
      />

      {/* Retrain toast */}
      <AnimatePresence>
        {state.retrainToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 lv-card px-4 py-3 max-w-sm"
            style={{ border: '1.5px solid var(--lv-cyan)', boxShadow: '0 4px 20px rgba(17,165,214,0.15)' }}
            role="status"
          >
            <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--lv-cyan)]">Modelo reentrenado</div>
            <div className="text-sm font-semibold text-[var(--lv-navy)] mt-0.5">v2.4 → v2.5 · precisión 98.4 → 98.7%</div>
            <button
              type="button"
              onClick={dismissRetrain}
              className="mt-1 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--lv-navy)]"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* +1 NEW LABEL fly-in indicator */}
      <AnimatePresence>
        {state.phase === 'particle-to-pool' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[var(--lv-cyan)] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg"
          >
            +1 Nueva etiqueta
          </motion.div>
        )}
      </AnimatePresence>

      <StatusStrip inspected={state.kpis.inspected} awaiting={state.kpis.awaitingReview} />
    </main>
  )
}
