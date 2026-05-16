export type DefectColor = 'red' | 'orange' | 'yellow' | 'cyan' | 'navy' | 'gray'

export type DefectCategory = {
  id: string
  name: string
  color: DefectColor
  count: number
}

export type RosterStatus = 'flagged' | 'pending' | 'approved'

export type RosterItem = {
  id: string
  image: string
  label: string
  defectId: string
  status: RosterStatus
  camera: string
  timestamp: string
  operator: string
  confidence: number
  needsReview: boolean
}

export type Bbox = {
  id: string
  top: string
  left: string
  width: string
  height: string
  color: DefectColor
  label: string
  confidence: number
}

export type InspectionResult = {
  image: string
  bboxes: Bbox[]
  verdict: string
}
