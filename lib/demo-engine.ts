'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { initialPoolDecisions } from './demo-script'
import type { FeedItem, Phase, PoolDecision, Scenario, UserItemResult } from './types'

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
  userUploadQueue: string[]
  userItemResults: Record<string, UserItemResult>
}

const initialState: DemoState = {
  playState: 'idle',
  scenarioIndex: -1,
  phase: 'idle',
  currentScenarioId: null,
  feed: [],
  queue: [],
  poolCount: 38,
  poolDecisions: initialPoolDecisions,
  kpis: { inspected: 247, autoPct: 98.4, awaitingReview: 0, defectsFlagged: 12 },
  flyingCard: null,
  particleKey: 0,
  retrainToast: false,
  learnedBadge: false,
  oscillationIndex: 0,
  userUploadQueue: [],
  userItemResults: {},
}

type Action =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'IDLE' }
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
  | { type: 'ADD_QUEUE_FROM_DEMO'; entry: QueueEntry }
  | { type: 'ENQUEUE_USER_ITEM'; item: FeedItem }
  | { type: 'USER_ITEM_RESULT_READY'; feedItemId: string; scenario: Scenario }
  | { type: 'USER_ITEM_RESULT_ERROR'; feedItemId: string; error: string }
  | { type: 'START_USER_SCENARIO'; feedItemId: string; scenario: Scenario }

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, playState: 'playing' }
    case 'PAUSE':
      return { ...state, playState: 'paused' }
    case 'IDLE':
      return { ...state, phase: 'idle', currentScenarioId: null, flyingCard: null }
    case 'RESET':
      return {
        ...initialState,
        playState: 'playing',
        userUploadQueue: state.userUploadQueue,
        userItemResults: state.userItemResults,
        feed: state.feed,
        queue: state.queue,
        kpis: state.kpis,
      }
    case 'PHASE': {
      const phase = action.phase
      let feed = state.feed
      if (state.currentScenarioId) {
        let status: FeedItem['status'] = 'queued'
        if (phase === 'flying-to-ai' || phase === 'scanning' || phase === 'barcode' || phase === 'bboxes') status = 'analyzing'
        else if (phase === 'verdict') {
          const sc = state.userItemResults[state.currentScenarioId]?.scenario
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
    case 'DECREMENT_QUEUE': {
      if (state.queue.length === 0) return state
      return { ...state, queue: state.queue.slice(1) }
    }
    case 'INCREMENT_AUTO':
      return { ...state, kpis: { ...state.kpis, autoPct: Math.min(99.5, state.kpis.autoPct + 0.1) } }
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
    case 'ADD_QUEUE_FROM_DEMO':
      return { ...state, queue: [action.entry, ...state.queue] }
    case 'ENQUEUE_USER_ITEM':
      return {
        ...state,
        feed: [action.item, ...state.feed].slice(0, 6),
        userUploadQueue: [...state.userUploadQueue, action.item.scenarioId],
        userItemResults: {
          ...state.userItemResults,
          [action.item.scenarioId]: { feedItemId: action.item.scenarioId, status: 'pending', scenario: null },
        },
      }
    case 'USER_ITEM_RESULT_READY':
      return {
        ...state,
        userItemResults: {
          ...state.userItemResults,
          [action.feedItemId]: { feedItemId: action.feedItemId, status: 'ready', scenario: action.scenario },
        },
      }
    case 'USER_ITEM_RESULT_ERROR':
      return {
        ...state,
        userItemResults: {
          ...state.userItemResults,
          [action.feedItemId]: { feedItemId: action.feedItemId, status: 'error', scenario: null, error: action.error },
        },
      }
    case 'START_USER_SCENARIO':
      return {
        ...state,
        currentScenarioId: action.feedItemId,
        phase: 'arriving',
        userUploadQueue: state.userUploadQueue.filter((id) => id !== action.feedItemId),
        kpis: { ...state.kpis, inspected: state.kpis.inspected + 1 },
        learnedBadge: false,
      }
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

export function nowTimestamp(): string {
  return nowStamp()
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

  const runUserItemRef = useRef<(id: string, attempt?: number) => void>(() => {})

  const advanceQueue = useCallback(() => {
    if (!playingRef.current) return
    const st = stateRef.current
    if (st.userUploadQueue.length > 0) {
      const nextId = st.userUploadQueue[0]
      runUserItemRef.current(nextId, 0)
      return
    }
    dispatch({ type: 'IDLE' })
  }, [])

  const runUserItem = useCallback(
    (feedItemId: string, attempt = 0) => {
      if (!playingRef.current) return

      const result = stateRef.current.userItemResults[feedItemId]
      if (!result || result.status === 'pending') {
        if (attempt >= 33) {
          // 10s timeout — skip silently
          dispatch({ type: 'USER_ITEM_RESULT_ERROR', feedItemId, error: 'Timeout' })
          schedule(200, () => advanceQueue())
          return
        }
        const t = setTimeout(() => runUserItemRef.current(feedItemId, attempt + 1), 300)
        timersRef.current.push(t)
        return
      }
      if (result.status === 'error' || !result.scenario) {
        schedule(200, () => advanceQueue())
        return
      }

      const sc = result.scenario
      dispatch({ type: 'START_USER_SCENARIO', feedItemId, scenario: sc })

      let t = 0
      t += 1400

      schedule(t, () => {
        dispatch({ type: 'PHASE', phase: 'flying-to-ai' })
        dispatch({ type: 'FLYING', from: 'incoming', to: 'ai', scenarioId: feedItemId })
      })
      t += 1100
      schedule(t, () => dispatch({ type: 'CLEAR_FLYING' }))
      schedule(t, () => dispatch({ type: 'PHASE', phase: 'scanning' }))
      t += 2600

      schedule(t, () => dispatch({ type: 'PHASE', phase: 'bboxes' }))
      t += 1500

      schedule(t, () => dispatch({ type: 'PHASE', phase: 'verdict' }))
      t += 2400

      if (sc.type === 'review') {
        schedule(t, () => {
          dispatch({ type: 'PHASE', phase: 'flying-to-queue' })
          dispatch({ type: 'FLYING', from: 'ai', to: 'queue', scenarioId: feedItemId })
          dispatch({ type: 'INCREMENT_REVIEW' })
        })
        t += 1300
        schedule(t, () => {
          dispatch({ type: 'CLEAR_FLYING' })
          dispatch({ type: 'PHASE', phase: 'in-queue' })
          dispatch({
            type: 'ADD_QUEUE_FROM_DEMO',
            entry: {
              id: `upload-${feedItemId}`,
              image: sc.image,
              productName: sc.productName,
              aiSuggestion: sc.verdict.text,
              aiSuggestionColor: 'orange',
              topPredictions: sc.topPredictions,
            },
          })
        })
        t += 500
        // Advance to next upload immediately — operator decides in their own time
        schedule(t, () => advanceQueue())
      } else {
        if (sc.type === 'auto-defect') {
          schedule(t, () => dispatch({ type: 'INCREMENT_DEFECT' }))
        } else {
          schedule(t, () => dispatch({ type: 'INCREMENT_AUTO' }))
        }
        schedule(t, () => dispatch({ type: 'PHASE', phase: 'leaving' }))
        t += 1300
        schedule(t, () => advanceQueue())
      }
    },
    [schedule, advanceQueue],
  )

  runUserItemRef.current = runUserItem

  // Kick off processing whenever a result becomes ready and the engine is idle
  useEffect(() => {
    if (!playingRef.current) return
    if (state.phase !== 'idle') return
    if (state.currentScenarioId !== null) return
    if (state.userUploadQueue.length === 0) return
    const nextId = state.userUploadQueue[0]
    const result = state.userItemResults[nextId]
    if (!result || result.status !== 'ready') return
    runUserItemRef.current(nextId, 0)
  }, [state.phase, state.currentScenarioId, state.userUploadQueue, state.userItemResults, state.playState])

  const play = useCallback(() => {
    if (playingRef.current) return
    playingRef.current = true
    clearTimers()
    dispatch({ type: 'PLAY' })
  }, [clearTimers])

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
  }, [clearTimers])

  const dismissRetrain = useCallback(() => {
    dispatch({ type: 'HIDE_RETRAIN' })
  }, [])

  const dispatchUpload = useCallback((item: FeedItem) => {
    dispatch({ type: 'ENQUEUE_USER_ITEM', item })
  }, [])

  const dispatchUserResult = useCallback((feedItemId: string, scenario: Scenario) => {
    dispatch({ type: 'USER_ITEM_RESULT_READY', feedItemId, scenario })
  }, [])

  const dispatchUserError = useCallback((feedItemId: string, error: string) => {
    dispatch({ type: 'USER_ITEM_RESULT_ERROR', feedItemId, error })
  }, [])

  // Called by operator queue buttons — removes item, emits particle to pool
  const manualDecide = useCallback(
    (decision?: 'confirm' | 'override' | 'reject' | 'skip', feedback?: string) => {
      const s = stateRef.current
      if (s.queue.length === 0) return
      dispatch({ type: 'DECREMENT_QUEUE' })
      dispatch({ type: 'DECREMENT_REVIEW' })

      // Skip doesn't add to the learning pool
      if (decision === 'skip') return

      const decisionColor: PoolDecision['decisionColor'] =
        decision === 'reject' ? 'navy' : decision === 'override' ? 'orange' : 'red'
      const label =
        feedback?.trim()
          ? feedback.trim().slice(0, 60)
          : decision === 'reject'
            ? 'No es defecto'
            : decision === 'override'
              ? 'Otra categoría'
              : 'Defecto confirmado'

      const t1 = setTimeout(() => {
        dispatch({ type: 'EMIT_PARTICLE' })
        const t2 = setTimeout(() => {
          dispatch({
            type: 'INCREMENT_POOL',
            decision: {
              id: `manual-${Date.now()}`,
              initial: 'OP',
              timestamp: nowStamp(),
              decisionColor,
              label,
            },
          })
        }, 1400)
        timersRef.current.push(t2)
      }, 300)
      timersRef.current.push(t1)
    },
    [],
  )

  // Auto-enable on mount so uploads process immediately without pressing play
  useEffect(() => {
    const t = setTimeout(() => {
      playingRef.current = true
      dispatch({ type: 'PLAY' })
    }, 500)
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
    ? (state.userItemResults[state.currentScenarioId]?.scenario ?? null)
    : null

  return {
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
  }
}
