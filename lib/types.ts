export type DefectColor = 'red' | 'orange' | 'yellow' | 'cyan' | 'navy' | 'gray'

export type DefectCategory = {
  id: string
  name: string
  color: DefectColor
  count: number
}

export type ScenarioType = 'auto-ok' | 'auto-minor' | 'auto-defect' | 'review' | 'learned-defect'

export type ScenarioBox = {
  id: string
  top: string
  left: string
  width: string
  height: string
  color: 'red' | 'orange' | 'cyan' | 'navy'
  label: string
  confidence: number
  flicker?: boolean
}

export type Scenario = {
  id: string
  image: string
  productName: string
  shortName: string
  camera: string
  type: ScenarioType
  hasBarcode?: boolean
  barcodeText?: string
  topPredictions: { label: string; confidence: number; color: 'red' | 'orange' | 'cyan' | 'navy' }[]
  oscillation?: number[]
  finalConfidence: number
  confidenceTone: 'navy' | 'orange' | 'red' | 'cyan'
  bboxes: ScenarioBox[]
  verdict: {
    text: string
    tone: 'approved' | 'minor' | 'defect' | 'review' | 'learned'
  }
  showLearnedBadge?: boolean
  aiSuggestion?: string
}

export type FeedItemSource = 'demo' | 'upload'

export type FeedItem = {
  id: string
  scenarioId: string
  shortName: string
  image: string
  timestamp: string
  status: 'queued' | 'analyzing' | 'done' | 'defect' | 'review'
  source: FeedItemSource
}

export type UserItemResult = {
  feedItemId: string
  status: 'pending' | 'ready' | 'error'
  scenario: Scenario | null
  error?: string
}

export type Phase =
  | 'idle'
  | 'arriving'
  | 'flying-to-ai'
  | 'scanning'
  | 'barcode'
  | 'bboxes'
  | 'verdict'
  | 'flying-to-queue'
  | 'in-queue'
  | 'operator-decided'
  | 'particle-to-pool'
  | 'leaving'

export type PoolDecision = {
  id: string
  initial: string
  timestamp: string
  decisionColor: 'navy' | 'red' | 'orange'
  label: string
}
