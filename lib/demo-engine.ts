'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { scenarios, initialQueue, initialPoolDecisions } from './demo-script'
import type { FeedItem, Phase, PoolDecision, Scenario } from './types'

type QueueEntry = {
  id: string
  image: string
  productName: string
  aiSuggestion: string
  aiSuggestionColor: 'orange' | 'red'
  topPredictions: { label: string; confidence: number; color: 'red' | 'orange' | 'cyan' | 'navy' }[]
  fromDemo?: boolean
}

export type DemoState = {
  playState: 'idle' | 'playing' | 'paused' | 'completed'
  scenarioIndex: number
  phase: Phase
  currentScenarioId: string | null
  feed: FeedItem[]
  queue: QueueEntry[]
  poolCount: number
  poolDecisions: PoolDecision[]
  kpis: {
    inspected: number
    autoPct: number
    awaitingReview: number
    defectsFlagged: number
  }
  flyingCard: null | { scenarioId: string; from: 'incoming' | 'ai'; to: 'ai' | 'queue' }
  particleKey: number
  retrainToast: boolean
  learnedBadge: boolean
  oscillationIndex: number
}

const baseFeed: FeedItem[] = [
  { id: 'f-a', scenarioId: '', shortName: 'Yerba Mate 1kg', image: 'https://placehold.co/120x120/F7F7F4/242E8F?text=Y1', timestamp: '14:30:48', status: 'done' },
  { id: 'f-b', scenarioId: '', shortName: 'Café Molido 500g', image: 'https://placehold.co/120x120/F7F7F4/F58220?text=C5', timestamp: '14:30:32', status: 'done' },
  { id: 'f-c', scenarioId: '', shortName: 'Té caja', image: 'https://placehold.co/120x120/F7F7F4/242E8F?text=TC', timestamp: '14:30:14', status: 'review' },
  { id: 'f-d', scenarioId: '', shortName: 'Yerba Mate 500g', image: 'https://placehold.co/120x120/F7F7F4/F6D300?text=Y5', timestamp: '14:29:51', status: 'defect' },
]

const initialState: DemoState = {
  playState: 'idle',
  scenarioIndex: -1,
  phase: 'idle',
  currentScenarioId: null,
  feed: baseFeed,
  queue: initialQueue,
  poolCount: 38,
  poolDecisions: initialPoolDecisions,
  kpis: { inspected: 247, autoPct: 98.4, awaitingReview: 12, defectsFlagged: 12 },
  flyingCard: null,
  particleKey: 0,
  retrainToast: false,
  learnedBadge: false,
  oscillationIndex: 0,
}

type Action =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' }
  | { type: 'START_SCENARIO'; index: number; scenario: Scenario }
  | { type: 'PHASE'; phase: Phase }
  | { type: 'FLYING'; from: 'incoming' | 'ai'; to: 'ai' | 'queue'; scenarioId: string }
  | { type: 'CLEAR_FLYING' }
  | { type: 'OSCILLATE'; index: number }
  | { type: 'EMIT_PARTICLE' }
  | { type: 'INCREMENT_POOL'; decision: PoolDecision }
  | { type: 'DECREMENT_QUEUE' }
  | { type: 'INCREMENT_AUTO' }
  | { type: 'INCREMENT_DEFECT' }
  | { type: 'INCREMENT_REVIEW' }
  | { type: 'DECREMENT_REVIEW' }
  | { type: 'SHOW_RETRAIN' }
  | { type: 'HIDE_RETRAIN' }
  | { type: 'SHOW_LEARNED'; visible: boolean }
  | { type: 'ADD_QUEUE_FROM_DEMO'; entry: QueueEntry }

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, playState: 'playing' }
    case 'PAUSE':
      return { ...state, playState: 'paused' }
    case 'COMPLETE':
      return { ...state, playState: 'completed', phase: 'idle', currentScenarioId: null, flyingCard: null }
    case 'RESET':
      return { ...initialState, playState: 'playing' }
    case 'START_SCENARIO': {
      const sc = action.scenario
      const ts = nowStamp()
      const newFeed: FeedItem = {
        id: `feed-${sc.id}-${Date.now()}`,
        scenarioId: sc.id,
        shortName: sc.shortName,
        image: sc.image,
        timestamp: ts,
        status: 'queued',
      }
      return {
        ...state,
        scenarioIndex: action.index,
        currentScenarioId: sc.id,
        phase: 'arriving',
        feed: [newFeed, ...state.feed].slice(0, 5),
        kpis: { ...state.kpis, inspected: state.kpis.inspected + 1 },
        learnedBadge: false,
      }
    }
    case 'PHASE': {
      const phase = action.phase
      let feed = state.feed
      if (state.currentScenarioId) {
        let status: FeedItem['status'] = 'queued'
        if (phase === 'flying-to-ai' || phase === 'scanning' || phase === 'barcode' || phase === 'bboxes') status = 'analyzing'
        else if (phase === 'verdict') {
          const sc = scenarios.find((s) => s.id === state.currentScenarioId)
          if (sc?.type === 'auto-defect' || sc?.type === 'learned-defect') status = 'defect'
          else if (sc?.type === 'review') status = 'review'
          else status = 'done'
        } else if (phase === 'flying-to-queue' || phase === 'in-queue') status = 'review'
        else if (phase === 'leaving') status = 'done'
        feed = state.feed.map((f) => (f.scenarioId === state.currentScenarioId ? { ...f, status } : f))
      }
      return { ...state, phase, feed }
    }
    case 'FLYING':
      return { ...state, flyingCard: { from: action.from, to: action.to, scenarioId: action.scenarioId } }
    case 'CLEAR_FLYING':
      return { ...state, flyingCard: null }
    case 'OSCILLATE':
      return { ...state, oscillationIndex: action.index }
    case 'EMIT_PARTICLE':
      return { ...state, particleKey: state.particleKey + 1 }
    case 'INCREMENT_POOL': {
      const newCount = state.poolCount + 1
      const reached = newCount >= 50
      return {
        ...state,
        poolCount: reached ? 0 : newCount,
        poolDecisions: [action.decision, ...state.poolDecisions].slice(0, 3),
        retrainToast: reached ? true : state.retrainToast,
      }
    }
    case 'DECREMENT_QUEUE':
      return { ...state, queue: state.queue.slice(1) }
    case 'INCREMENT_AUTO':
      return {
        ...state,
        kpis: {
          ...state.kpis,
          autoPct: Math.min(99.5, state.kpis.autoPct + 0.05),
        },
      }
    case 'INCREMENT_DEFECT':
      return { ...state, kpis: { ...state.kpis, defectsFlagged: state.kpis.defectsFlagged + 1 } }
    case 'INCREMENT_REVIEW':
      return { ...state, kpis: { ...state.kpis, awaitingReview: state.kpis.awaitingReview + 1 } }
    case 'DECREMENT_REVIEW':
      return { ...state, kpis: { ...state.kpis, awaitingReview: Math.max(0, state.kpis.awaitingReview - 1) } }
    case 'SHOW_RETRAIN':
      return { ...state, retrainToast: true }
    case 'HIDE_RETRAIN':
      return { ...state, retrainToast: false }
    case 'SHOW_LEARNED':
      return { ...state, learnedBadge: action.visible }
    case 'ADD_QUEUE_FROM_DEMO':
      return { ...state, queue: [action.entry, ...state.queue] }
    default:
      return state
  }
}

function nowStamp(): string {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function useDemoEngine() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const playingRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const schedule = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      if (!playingRef.current) return
      fn()
    }, ms)
    timersRef.current.push(t)
  }, [])

  const runScenario = useCallback(
    (i: number) => {
      if (!playingRef.current) return
      const sc = scenarios[i]
      if (!sc) return

      dispatch({ type: 'START_SCENARIO', index: i, scenario: sc })

      let t = 0
      // Arriving — image lands in feed (already added in START). Hold so audience sees it.
      t += 1400

      // Fly from incoming to AI
      schedule(t, () => {
        dispatch({ type: 'PHASE', phase: 'flying-to-ai' })
        dispatch({ type: 'FLYING', from: 'incoming', to: 'ai', scenarioId: sc.id })
      })
      t += 1100
      schedule(t, () => dispatch({ type: 'CLEAR_FLYING' }))

      // Scanning — slowed down so the audience can see the scan line sweep
      schedule(t, () => dispatch({ type: 'PHASE', phase: 'scanning' }))
      t += sc.hasBarcode ? 1100 : 2600

      // Barcode overlay
      if (sc.hasBarcode) {
        schedule(t, () => dispatch({ type: 'PHASE', phase: 'barcode' }))
        t += 1800
        schedule(t, () => dispatch({ type: 'PHASE', phase: 'scanning' }))
        t += 1100
      }

      // Bboxes
      schedule(t, () => dispatch({ type: 'PHASE', phase: 'bboxes' }))

      // Oscillation for review type — much slower so audience sees the competing predictions
      if (sc.type === 'review' && sc.oscillation) {
        sc.oscillation.forEach((_, idx) => {
          schedule(t + idx * 750, () => dispatch({ type: 'OSCILLATE', index: idx }))
        })
        t += sc.oscillation.length * 750
      } else {
        t += 1500
      }

      // Show learned badge for s5
      if (sc.showLearnedBadge) {
        schedule(t, () => dispatch({ type: 'SHOW_LEARNED', visible: true }))
        schedule(t + 2800, () => dispatch({ type: 'SHOW_LEARNED', visible: false }))
      }

      // Verdict — hold longer so the audience can read it
      schedule(t, () => dispatch({ type: 'PHASE', phase: 'verdict' }))
      t += 2400

      if (sc.type === 'review') {
        // Fly card from AI to operator queue
        schedule(t, () => {
          dispatch({ type: 'PHASE', phase: 'flying-to-queue' })
          dispatch({ type: 'FLYING', from: 'ai', to: 'queue', scenarioId: sc.id })
          dispatch({ type: 'INCREMENT_REVIEW' })
        })
        t += 1300
        schedule(t, () => {
          dispatch({ type: 'CLEAR_FLYING' })
          dispatch({ type: 'PHASE', phase: 'in-queue' })
          dispatch({
            type: 'ADD_QUEUE_FROM_DEMO',
            entry: {
              id: `demo-${sc.id}`,
              image: sc.image,
              productName: sc.productName,
              aiSuggestion: sc.aiSuggestion ?? 'Etiqueta desalineada (58%)',
              aiSuggestionColor: 'orange',
              topPredictions: sc.topPredictions,
              fromDemo: true,
            },
          })
        })
        // Auto-decide after 3.8s so audience sees the operator card sit there
        t += 3800
        schedule(t, () => {
          dispatch({ type: 'PHASE', phase: 'operator-decided' })
          dispatch({ type: 'DECREMENT_QUEUE' })
          dispatch({ type: 'DECREMENT_REVIEW' })
        })
        t += 500
        // Training particle
        schedule(t, () => {
          dispatch({ type: 'PHASE', phase: 'particle-to-pool' })
          dispatch({ type: 'EMIT_PARTICLE' })
        })
        t += 1400
        schedule(t, () => {
          dispatch({
            type: 'INCREMENT_POOL',
            decision: {
              id: `pd-${sc.id}-${Date.now()}`,
              initial: 'M.G',
              timestamp: nowStamp(),
              decisionColor: 'red',
              label: 'Etiqueta desalineada',
            },
          })
        })
        t += 1000
      } else {
        // Auto-classify path — hold the verdict, then leave
        if (sc.type === 'auto-defect' || sc.type === 'learned-defect') {
          schedule(t, () => dispatch({ type: 'INCREMENT_DEFECT' }))
        } else {
          schedule(t, () => dispatch({ type: 'INCREMENT_AUTO' }))
        }
        schedule(t, () => dispatch({ type: 'PHASE', phase: 'leaving' }))
        t += 1300
      }

      // Next scenario or loop
      schedule(t, () => {
        if (i < scenarios.length - 1) {
          runScenario(i + 1)
        } else {
          dispatch({ type: 'COMPLETE' })
          // pause 4s and loop
          schedule(4000, () => {
            if (!playingRef.current) return
            dispatch({ type: 'RESET' })
            // small delay to let reset render
            schedule(200, () => runScenario(0))
          })
        }
      })
    },
    [schedule],
  )

  const play = useCallback(() => {
    if (playingRef.current) return
    playingRef.current = true
    clearTimers()
    if (stateRef.current.playState === 'completed' || stateRef.current.scenarioIndex >= scenarios.length - 1) {
      dispatch({ type: 'RESET' })
      schedule(200, () => runScenario(0))
    } else {
      dispatch({ type: 'PLAY' })
      const nextIdx = Math.max(0, stateRef.current.scenarioIndex)
      runScenario(nextIdx === -1 ? 0 : nextIdx)
    }
  }, [clearTimers, runScenario, schedule])

  const pause = useCallback(() => {
    playingRef.current = false
    clearTimers()
    dispatch({ type: 'PAUSE' })
  }, [clearTimers])

  const replay = useCallback(() => {
    playingRef.current = false
    clearTimers()
    dispatch({ type: 'RESET' })
    playingRef.current = true
    setTimeout(() => runScenario(0), 200)
  }, [clearTimers, runScenario])

  const dismissRetrain = useCallback(() => {
    dispatch({ type: 'HIDE_RETRAIN' })
  }, [])

  // Auto-play on mount after 1s
  useEffect(() => {
    const t = setTimeout(() => {
      playingRef.current = true
      dispatch({ type: 'PLAY' })
      runScenario(0)
    }, 1000)
    return () => {
      clearTimeout(t)
      playingRef.current = false
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-dismiss retrain toast
  useEffect(() => {
    if (state.retrainToast) {
      const t = setTimeout(() => dispatch({ type: 'HIDE_RETRAIN' }), 4000)
      return () => clearTimeout(t)
    }
  }, [state.retrainToast])

  const currentScenario: Scenario | null = state.currentScenarioId
    ? scenarios.find((s) => s.id === state.currentScenarioId) ?? null
    : null

  return {
    state,
    currentScenario,
    play,
    pause,
    replay,
    dismissRetrain,
  }
}
